"""Search across everything in the Desk with Postgres full-text search. Also feeds Ask its sources.

- Each table has a stored, GIN-indexed tsvector (models.SEARCH_WEIGHTS, migration 0003) using the
  'desk' configuration: English stemming with accents removed.
- The query is expanded first (rules.expand): British/US spelling, acronyms, initiative aliases.
- A row matches if it contains any group; it ranks by ts_rank_cd, doubled when it matches every
  group. Snippets come from ts_headline, with matches between \\x02 and \\x03 for the UI to mark.
- A word that matches nothing is corrected against the Desk's own vocabulary with trigram
  similarity (pg_trgm): "remitance" becomes "remittance", and the page says so.
- When exact matching still finds little, titles are matched by trigram similarity too.
"""

import re
from dataclasses import dataclass, field
from functools import reduce
from typing import Any, Callable

from sqlalchemy import Float, case, cast, func, literal_column, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import Domain, Event, FeedItem, Guide, Initiative, Note
from .rules import Query, expand, fold
from .schemas import SearchHit

CONFIG = literal_column("'desk'::regconfig")
PER_TABLE = 30
FUZZY_BELOW = 3        # run the typo-tolerant pass when exact matching finds fewer hits than this
FUZZY_SIMILARITY = 0.5
MARK_START, MARK_END = "\x02", "\x03"
HEADLINE = (f"StartSel={MARK_START}, StopSel={MARK_END}, MaxWords=32, MinWords=12, "
            'MaxFragments=2, FragmentDelimiter=" … "')


@dataclass
class Doc:
    kind: str
    id: str
    title: str
    text: str
    href: str
    date: str | None = None
    label: str = ""  # a word or two Ask shows the model, e.g. "draft guide (unchecked)"
    score: float = 0.0
    snippet: str = ""
    fuzzy: bool = False

    def hit(self) -> SearchHit:
        return SearchHit(kind=self.kind, id=self.id, title=self.title, snippet=self.snippet,
                         href=self.href, date=self.date, score=round(self.score, 4))


def plain(text: str) -> str:
    """Markdown to plain text for snippets: links keep their label, marks and heading hashes go."""
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text or "")
    text = re.sub(r"(?m)^\s*(#{1,6}|[-*]|\d+[.)])\s+", "", text)
    return re.sub(r"[*`]", "", text)


def snippet(text: str, width: int = 220) -> str:
    flat = " ".join(plain(text).split())
    return flat if len(flat) <= width else flat[: width - 1].rsplit(" ", 1)[0] + "…"


def clean_headline(raw: str) -> str:
    return " ".join(plain(raw or "").split())


# --------------------------------------------------------------------------- the tables


@dataclass
class Source:
    model: Any
    title: Any                      # column used for typo-tolerant title matching
    headline: list                  # columns ts_headline picks the snippet from
    to_doc: Callable[[Any], Doc]
    where: list = field(default_factory=list)
    options: list = field(default_factory=list)


def _domain(d: Domain) -> Doc:
    text = "\n".join(x for x in (d.summary, f"Our position: {d.position}" if d.position else "",
                                 f"Open questions: {d.open_questions}" if d.open_questions else "",
                                 f"Capability proof: {d.capability_evidence}" if d.capability_evidence else "") if x)
    return Doc("domain", d.slug, f"{d.code} {d.name}", text, f"/domains/{d.slug}", label="domain position")


def _initiative(i: Initiative) -> Doc:
    text = "\n".join(x for x in (i.summary, f"Led by: {i.lead}" if i.lead else "",
                                 f"Participants: {i.participants}" if i.participants else "",
                                 f"Status: {i.status}" + (f", since {i.started}" if i.started else ""),
                                 f"Also known as: {i.aliases}" if i.aliases else "") if x)
    return Doc("initiative", i.slug, i.name, text, f"/landscape/{i.slug}", label="landscape entry")


def _note(n: Note) -> Doc:
    return Doc("note", str(n.id), n.title, f"{n.body}\nSo what for Qsofte: {n.so_what}".strip(), f"/notes/{n.id}",
               n.occurred_on.isoformat(), label=f"{n.type} note")


def _guide(g: Guide) -> Doc:
    return Doc("guide", g.slug, g.title, f"{g.summary}\n{g.body}", f"/library/{g.slug}",
               g.updated_at.date().isoformat() if g.updated_at else None,
               label="draft guide (unchecked)" if g.status == "draft" else "reviewed guide")


def _event(e: Event) -> Doc:
    text = "\n".join(x for x in (e.why, f"Goal: {e.goal}" if e.goal else "", f"Where: {e.city}" if e.city else "",
                                 f"How we show up: {e.level}") if x)
    return Doc("event", str(e.id), e.name, text, f"/events/{e.id}/edit",
               e.starts_on.isoformat() if e.starts_on else None, label="event")


def _feed(f: FeedItem) -> Doc:
    return Doc("feed", str(f.id), f.title, f"{f.feed.name}: {f.summary}", f.link or f"/feeds?item={f.id}",
               f.published_at.date().isoformat(), label=f"news from {f.feed.name}")


SOURCES = [
    Source(Domain, Domain.name, [Domain.position, Domain.summary, Domain.open_questions], _domain),
    Source(Initiative, Initiative.name, [Initiative.summary, Initiative.lead, Initiative.participants], _initiative),
    Source(Note, Note.title, [Note.so_what, Note.body], _note),
    Source(Guide, Guide.title, [Guide.summary, Guide.body], _guide),
    Source(Event, Event.name, [Event.why, Event.goal], _event),
    Source(FeedItem, FeedItem.title, [FeedItem.summary], _feed,
           where=[FeedItem.state != "dismissed"], options=[selectinload(FeedItem.feed)]),
]


# --------------------------------------------------------------------------- queries


def _phrase(text: str):
    return func.phraseto_tsquery(CONFIG, text)


def _any(phrases: list[str]):
    return reduce(lambda a, b: a.op("||")(b), [_phrase(p) for p in phrases])


def tsqueries(q: Query):
    """(matches any group or extra, matches every group)."""
    groups = [_any(g) for g in q.groups]
    every = reduce(lambda a, b: a.op("&&")(b), groups) if groups else _any(q.extra)
    anything = reduce(lambda a, b: a.op("||")(b), groups + ([_any(q.extra)] if q.extra else []))
    return anything, every


async def alias_groups(db: AsyncSession) -> list[list[str]]:
    rows = (await db.execute(select(Initiative.name, Initiative.aliases))).all()
    groups = []
    for name, aliases in rows:
        names = [fold(name), fold(re.sub(r"^project\s+", "", name, flags=re.I))]
        names += [fold(a).strip() for a in (aliases or "").split(",") if a.strip()]
        groups.append(list(dict.fromkeys(n for n in names if len(n) >= 2)))
    return groups


async def _exact(db: AsyncSession, q: Query) -> list[Doc]:
    anything, every = tsqueries(q)
    docs = []
    for s in SOURCES:
        vector = s.model.search_vector
        rank = func.ts_rank_cd(vector, anything, 1) * case((vector.op("@@")(every), 2.0), else_=1.0)
        text = func.concat_ws(" ", *s.headline)
        headline = func.ts_headline(CONFIG, text, anything, HEADLINE)
        stmt = (select(s.model, cast(rank, Float), headline).options(*s.options)
                .where(vector.op("@@")(anything), *s.where).order_by(rank.desc()).limit(PER_TABLE))
        for row, r, hl in (await db.execute(stmt)).all():
            doc = s.to_doc(row)
            doc.score = float(r)
            doc.snippet = clean_headline(hl) if MARK_START in (hl or "") else snippet(doc.text)
            docs.append(doc)
    return docs


async def _fuzzy(db: AsyncSession, q: Query) -> list[Doc]:
    terms = [t for t in q.terms if len(t) >= 4]
    if not terms:
        return []
    docs = []
    for s in SOURCES:
        title = func.unaccent(s.title)
        sim = func.greatest(*[func.word_similarity(t, title) for t in terms]) if len(terms) > 1 \
            else func.word_similarity(terms[0], title)
        stmt = (select(s.model, cast(sim, Float)).options(*s.options)
                .where(sim >= FUZZY_SIMILARITY, *s.where).order_by(sim.desc()).limit(5))
        for row, score in (await db.execute(stmt)).all():
            doc = s.to_doc(row)
            doc.score, doc.snippet, doc.fuzzy = float(score) / 10, snippet(doc.text), True
            docs.append(doc)
    return docs


# Every word in the Desk's titles, summaries, notes and guides, accents removed. Small enough to scan on the rare
# query with a word nothing contains.
VOCABULARY = """
    SELECT w FROM (
      SELECT regexp_split_to_table(lower(unaccent(name || ' ' || summary)), '[^a-z0-9]+') AS w FROM domains
      UNION SELECT regexp_split_to_table(lower(unaccent(name || ' ' || aliases || ' ' || summary || ' ' || lead)), '[^a-z0-9]+') FROM initiatives
      UNION SELECT regexp_split_to_table(lower(unaccent(title || ' ' || so_what || ' ' || body)), '[^a-z0-9]+') FROM notes
      UNION SELECT regexp_split_to_table(lower(unaccent(title || ' ' || summary || ' ' || body)), '[^a-z0-9]+') FROM guides
      UNION SELECT regexp_split_to_table(lower(unaccent(name || ' ' || why)), '[^a-z0-9]+') FROM events
      UNION SELECT regexp_split_to_table(lower(unaccent(title || ' ' || summary)), '[^a-z0-9]+') FROM feed_items
    ) words WHERE length(w) >= 3
"""
CORRECT = text(f"SELECT w, similarity(w, :t) AS s FROM ({VOCABULARY}) v WHERE w % :t ORDER BY s DESC, w LIMIT 1")
CORRECT_SIMILARITY = 0.45


async def _matches_anything(db: AsyncSession, group: list[str]) -> bool:
    q = _any(group)
    checks = [select(s.model.id).where(s.model.search_vector.op("@@")(q)).exists() for s in SOURCES]
    return bool(await db.scalar(select(reduce(lambda a, b: a | b, checks))))


async def correct(db: AsyncSession, query: Query) -> dict[str, str]:
    """Words that match nothing, each mapped to the closest word the Desk does contain."""
    fixes = {}
    for group in query.groups:
        term = group[0]
        if len(term) < 4 or not term.isalpha() or await _matches_anything(db, group):
            continue
        row = (await db.execute(CORRECT, {"t": term})).first()
        if row and row.s >= CORRECT_SIMILARITY and row.w != term:
            fixes[term] = row.w
    return fixes


@dataclass
class Result:
    query: Query
    docs: list[Doc]
    fuzzy: bool = False             # close title matches were added
    corrected: str | None = None    # the query as searched, when misspelt words were corrected


async def search(db: AsyncSession, q: str, limit: int = 40) -> Result:
    aliases = await alias_groups(db)
    query = expand(q, aliases)
    if not query.groups and not query.extra:
        return Result(query, [])
    corrected = None
    fixes = await correct(db, query)
    if fixes:
        corrected = " ".join(fixes.get(t, t) for t in query.terms)
        query = expand(corrected, aliases)
    docs = sorted(await _exact(db, query), key=lambda d: (-d.score, d.kind, d.title))
    fuzzy = False
    if len(docs) < FUZZY_BELOW:
        seen = {(d.kind, d.id) for d in docs}
        extra = [d for d in await _fuzzy(db, query) if (d.kind, d.id) not in seen]
        extra.sort(key=lambda d: -d.score)
        fuzzy = bool(extra)
        docs += extra
    return Result(query, docs[:limit], fuzzy, corrected)
