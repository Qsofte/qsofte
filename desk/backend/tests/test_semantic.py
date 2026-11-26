"""Meaning-based search: chunks, the index as a cache of the rows, and hybrid ranking."""

import math
import os

import pytest
from sqlalchemy import func, select

from app import db as dbmod
from app import semantic
from app.models import SearchChunk
from app.rules import fuse
from app.semantic import chunk

from .conftest import WRITE

DIM = 384


class FakeEmbedder:
    """Puts anything about marsupials (kangaroo, wallaby, marsupial) on one axis, everything else on
    another, so 'marsupial' finds 'Kangaroo payments' by meaning and shares no words with it."""

    model = "fake-embedder"

    def __init__(self):
        self.calls = 0

    def _vec(self, text: str) -> list[float]:
        v = [0.0] * DIM
        animal = any(w in text.lower() for w in ("kangaroo", "wallaby", "marsupial"))
        v[0 if animal else 1] = 1.0
        v[2] = 0.05  # keep vectors from being identical
        n = math.sqrt(sum(x * x for x in v))
        return [x / n for x in v]

    def passages(self, texts):
        self.calls += len(texts)
        return [self._vec(t) for t in texts]

    def query(self, text):
        return self._vec(text)


@pytest.fixture
def fake(monkeypatch):
    e = FakeEmbedder()
    monkeypatch.setattr(semantic, "get_embedder", lambda: e)
    return e


async def reindex(e):
    async with dbmod.sessionmaker()() as db:
        return await semantic.reindex(db, e)


async def chunk_count(kind=None, ref=None):
    async with dbmod.sessionmaker()() as db:
        q = select(func.count()).select_from(SearchChunk)
        if kind:
            q = q.where(SearchChunk.kind == kind, SearchChunk.ref_id == ref)
        return await db.scalar(q)


def test_chunks_are_paragraph_sized_and_carry_the_title():
    text = "\n\n".join(f"Paragraph {i} " + "word " * 60 for i in range(8))
    pieces = chunk("Guide title", text, limit=700)
    assert len(pieces) > 1 and all(p.startswith("Guide title\n") for p in pieces)
    assert all(len(p) <= 700 + len("Guide title\n") for p in pieces)
    assert chunk("Only a title", "") == ["Only a title"]
    long = chunk("T", "x" * 2500, limit=1000)
    assert [len(p) for p in long] == [1002, 1002, 502]


def test_reciprocal_rank_fusion_rewards_agreement():
    scores = fuse([["a", "b", "c"], ["c", "a"]])
    assert max(scores, key=scores.get) == "a"
    assert scores["c"] > scores["b"]


async def test_index_is_a_cache_of_the_rows(client, fake):
    first = await reindex(fake)
    assert first["embedded"] == first["documents"] > 60 and first["removed"] == 0
    assert (await reindex(fake))["embedded"] == 0  # nothing changed, nothing embedded

    note = {"type": "signal", "title": "Kangaroo payments", "so_what": "Matters.", "occurred_on": "2026-11-20",
            "domain_slug": "innovation"}
    n = (await client.post("/api/notes", json=note, headers=WRITE)).json()
    assert (await reindex(fake))["embedded"] == 1
    await client.put(f"/api/notes/{n['id']}", json={**note, "title": "Wallaby payments"}, headers=WRITE)
    assert (await reindex(fake))["embedded"] == 1
    assert await chunk_count("note", str(n["id"])) == 1

    await client.delete(f"/api/notes/{n['id']}", headers=WRITE)
    assert (await reindex(fake))["removed"] == 1
    assert await chunk_count("note", str(n["id"])) == 0


async def test_meaning_finds_what_words_cannot(client, fake):
    note = {"type": "signal", "title": "Kangaroo payments", "so_what": "A pilot in Queensland.",
            "occurred_on": "2026-11-20", "domain_slug": "innovation"}
    n = (await client.post("/api/notes", json=note, headers=WRITE)).json()
    await reindex(fake)
    r = (await client.get("/api/search", params={"q": "marsupial"})).json()
    hit = next(h for h in r["hits"] if h["id"] == str(n["id"]))
    assert hit["match"] == "meaning" and hit["kind"] == "note"
    assert "Queensland" in hit["snippet"]
    # Unrelated documents sit on the other axis, below the similarity floor.
    assert all(h["match"] != "meaning" or h["id"] == str(n["id"]) for h in r["hits"])


async def test_found_by_both_ranks_above_found_by_one(client, fake):
    for title in ("Kangaroo payments", "Kangaroo crossing signs", "Wallaby wallets"):
        note = {"type": "signal", "title": title, "so_what": "Matters.", "occurred_on": "2026-11-20",
                "domain_slug": "innovation"}
        await client.post("/api/notes", json=note, headers=WRITE)
    await reindex(fake)
    r = (await client.get("/api/search", params={"q": "kangaroo payments"})).json()
    top = r["hits"][0]
    assert top["title"] == "Kangaroo payments" and top["match"] == "both"
    assert "meaning" in {h["match"] for h in r["hits"]}  # Wallaby wallets: no shared words


async def test_search_works_when_the_model_cannot_load(client, monkeypatch):
    monkeypatch.setattr(semantic, "get_embedder", lambda: None)
    r = (await client.get("/api/search", params={"q": "QRIS"})).json()
    assert r["hits"][0]["href"] == "/landscape/qris" and r["hits"][0]["match"] == "words"


@pytest.mark.skipif(not os.environ.get("DESK_EMBED_CACHE"), reason="real model not downloaded (set DESK_EMBED_CACHE)")
async def test_real_model_relates_meaning(client):
    e = semantic.Embedder("BAAI/bge-small-en-v1.5", os.environ["DESK_EMBED_CACHE"])
    await reindex(e)
    async with dbmod.sessionmaker()() as db:
        near = await semantic.nearest(db, e, "how do banks move money across borders faster?")
    assert near[0].similarity > 0.7
    assert ("guide", "cross-border-primer") in [(n.kind, n.ref_id) for n in near[:3]]
