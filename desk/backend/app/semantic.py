"""Meaning-based search: embeddings from a small open-source model, stored and searched in pgvector.

- Model: BAAI/bge-small-en-v1.5 through fastembed (ONNX, CPU, about 65 MB, 384 dimensions).
  About 210 MB of memory once loaded.
  The Docker image bakes it in, so the server never downloads it.
- Every searchable row is split into chunks and embedded into search_chunks. That table is a cache
  derived from the rows: reindex() embeds what is new or changed (by content hash) and removes what
  is gone. It runs in the background every few minutes, and from `python -m app.cli reindex`.
- nearest() finds the chunks closest in meaning to a query (cosine distance, HNSW index).

If the model cannot load, meaning-based search switches itself off and keyword search carries on.
"""

import asyncio
import hashlib
import logging
from dataclasses import dataclass

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .models import SearchChunk

log = logging.getLogger("desk.semantic")

# Measured on bge-small: batches of 8 on 2 threads keep the extra memory near 210 MB (32 on all
# cores peaked near 370 MB) at about 5 s per 150 documents, and leave CPU for the web server.
EMBED_BATCH = 8
EMBED_THREADS = 2
CHUNK_CHARS = 1000
MAX_CHUNKS = 20
BATCH = 64
# bge models are trained to find passages for queries that carry this instruction.
QUERY_PREFIX = "Represent this sentence for searching relevant passages: "


class Embedder:
    def __init__(self, model: str, cache_dir: str | None = None) -> None:
        from fastembed import TextEmbedding  # heavy import; only when meaning search is on

        self.model = model
        self._m = TextEmbedding(model, cache_dir=cache_dir, threads=EMBED_THREADS)

    def passages(self, texts: list[str]) -> list[list[float]]:
        return [v.tolist() for v in self._m.passage_embed(texts, batch_size=EMBED_BATCH)]

    def query(self, text: str) -> list[float]:
        prefix = QUERY_PREFIX if "bge" in self.model.lower() else ""
        return next(iter(self._m.query_embed([prefix + text]))).tolist()


_embedder: Embedder | None = None
_failed = False


def get_embedder() -> Embedder | None:
    """The shared embedder, loaded on first use; None when switched off or when it failed to load."""
    global _embedder, _failed
    s = get_settings()
    if not s.semantic or _failed:
        return None
    if _embedder is None:
        try:
            _embedder = Embedder(s.embed_model, str(s.embed_cache) if s.embed_cache else None)
        except Exception:
            _failed = True
            log.exception("meaning-based search is off: the embedding model could not load")
            return None
    return _embedder


# --------------------------------------------------------------------------- chunks


def chunk(title: str, text: str, limit: int = CHUNK_CHARS) -> list[str]:
    """Paragraph-sized pieces of a document, each starting with its title so it stands alone."""
    paragraphs = [" ".join(p.split()) for p in (text or "").replace("\r\n", "\n").split("\n\n")]
    paragraphs = [p for p in paragraphs if p]
    pieces: list[str] = []
    current = ""
    for p in paragraphs:
        while len(p) > limit:  # a very long paragraph is cut at a word boundary
            cut = p[:limit].rsplit(" ", 1)[0] or p[:limit]
            if current:
                pieces.append(current)
                current = ""
            pieces.append(cut)
            p = p[len(cut):].strip()
        if current and len(current) + len(p) + 1 > limit:
            pieces.append(current)
            current = p
        else:
            current = f"{current}\n{p}" if current else p
    if current:
        pieces.append(current)
    return [f"{title}\n{piece}" for piece in pieces[:MAX_CHUNKS]] or [title]


def content_hash(model: str, title: str, text: str) -> str:
    return hashlib.sha256(f"{model}\x00{title}\x00{text}".encode()).hexdigest()


# --------------------------------------------------------------------------- indexing


async def reindex(db: AsyncSession, embedder: Embedder) -> dict[str, int]:
    """Brings search_chunks in line with the rows. Returns what it did."""
    from .search import all_docs  # search imports this module

    docs = await all_docs(db)
    wanted = {(d.kind, d.id): (d, content_hash(embedder.model, d.title, d.text)) for d in docs}
    stored = {
        (k, r): h for k, r, h in (await db.execute(
            select(SearchChunk.kind, SearchChunk.ref_id, SearchChunk.content_hash).where(SearchChunk.chunk_no == 0)
        )).all()
    }
    gone = [key for key in stored if key not in wanted]
    todo = [(key, doc, h) for key, (doc, h) in wanted.items() if stored.get(key) != h]

    for kind, ref in gone:
        await db.execute(delete(SearchChunk).where(SearchChunk.kind == kind, SearchChunk.ref_id == ref))
    await db.commit()

    for start in range(0, len(todo), BATCH):
        batch = todo[start:start + BATCH]
        pieces = [(key, h, n, text) for key, doc, h in batch for n, text in enumerate(chunk(doc.title, doc.text))]
        vectors = await asyncio.to_thread(embedder.passages, [p[3] for p in pieces])
        for (kind, ref), _, _ in batch:
            await db.execute(delete(SearchChunk).where(SearchChunk.kind == kind, SearchChunk.ref_id == ref))
        db.add_all(SearchChunk(kind=key[0], ref_id=key[1], chunk_no=n, text=text, content_hash=h,
                               model=embedder.model, embedding=vec)
                   for (key, h, n, text), vec in zip(pieces, vectors))
        await db.commit()
    return {"documents": len(docs), "embedded": len(todo), "removed": len(gone)}


async def run_forever(sessionmaker, interval_minutes: int) -> None:
    """Background indexing inside the desk process. First run shortly after start-up."""
    await asyncio.sleep(30)
    while True:
        embedder = await asyncio.to_thread(get_embedder)
        if embedder is None:
            return
        try:
            async with sessionmaker() as db:
                result = await reindex(db, embedder)
            if result["embedded"] or result["removed"]:
                log.info("desk meaning index: %s", result)
        except Exception:
            log.exception("desk meaning index failed; keyword search is unaffected")
        await asyncio.sleep(interval_minutes * 60)


# --------------------------------------------------------------------------- searching


@dataclass
class Near:
    kind: str
    ref_id: str
    similarity: float
    text: str


async def nearest(db: AsyncSession, embedder: Embedder, q: str, limit: int = 60) -> list[Near]:
    """Documents closest in meaning to q, best chunk per document, most similar first."""
    vector = await asyncio.to_thread(embedder.query, q)
    distance = SearchChunk.embedding.cosine_distance(vector)
    rows = (await db.execute(
        select(SearchChunk.kind, SearchChunk.ref_id, SearchChunk.text, distance)
        .where(SearchChunk.model == embedder.model).order_by(distance).limit(limit)
    )).all()
    best: dict[tuple[str, str], Near] = {}
    for kind, ref, text, d in rows:
        if (kind, ref) not in best:
            best[(kind, ref)] = Near(kind, ref, 1.0 - float(d), text)
    return list(best.values())
