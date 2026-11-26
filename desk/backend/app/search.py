"""Search across everything in the Desk, ranked by rules.score. Also feeds Ask its sources.

Data volumes are small (hundreds to low thousands of rows), so each table is pre-filtered in SQL
with ILIKE on the terms and ranked in Python. Works the same on Postgres and SQLite.
"""

import re
from dataclasses import dataclass

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import Domain, Event, FeedItem, Guide, Initiative, Note
from .rules import query_terms, score
from .schemas import SearchHit

PER_TABLE = 400


@dataclass
class Doc:
    kind: str
    id: str
    title: str
    text: str
    href: str
    date: str | None = None
    label: str = ""  # a word or two Ask shows the model, e.g. "draft guide"
    score: float = 0.0

    def hit(self, terms: list[str]) -> SearchHit:
        return SearchHit(kind=self.kind, id=self.id, title=self.title, snippet=snippet(self.text, terms),
                         href=self.href, date=self.date, score=round(self.score, 2))


def plain(text: str) -> str:
    """Markdown to plain text for snippets: links keep their label, marks and heading hashes go."""
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text or "")
    text = re.sub(r"(?m)^\s*(#{1,6}|[-*]|\d+[.)])\s+", "", text)
    return re.sub(r"[*`]", "", text)


def snippet(text: str, terms: list[str], width: int = 220) -> str:
    flat = " ".join(plain(text).split())
    low = flat.lower()
    at = min((p for p in (low.find(t) for t in terms) if p >= 0), default=0)
    start = max(0, at - width // 3)
    piece = flat[start:start + width]
    return ("…" if start else "") + piece + ("…" if start + width < len(flat) else "")


def _any(terms: list[str], *columns):
    return or_(*[c.ilike(f"%{t}%") for t in terms for c in columns])


async def collect(db: AsyncSession, terms: list[str]) -> list[Doc]:
    docs: list[Doc] = []

    for d in (await db.scalars(select(Domain).where(
            _any(terms, Domain.name, Domain.summary, Domain.position, Domain.open_questions,
                 Domain.capability_evidence)).limit(PER_TABLE))).all():
        text = "\n".join(x for x in (d.summary, f"Our position: {d.position}" if d.position else "",
                                     f"Open questions: {d.open_questions}" if d.open_questions else "",
                                     f"Capability proof: {d.capability_evidence}" if d.capability_evidence else "") if x)
        docs.append(Doc("domain", d.slug, f"{d.code} {d.name}", text, f"/domains/{d.slug}", label="domain position"))

    for i in (await db.scalars(select(Initiative).where(
            _any(terms, Initiative.name, Initiative.summary, Initiative.aliases, Initiative.lead,
                 Initiative.participants)).limit(PER_TABLE))).all():
        text = "\n".join(x for x in (i.summary, f"Led by: {i.lead}" if i.lead else "",
                                     f"Participants: {i.participants}" if i.participants else "",
                                     f"Status: {i.status}" + (f", since {i.started}" if i.started else ""),
                                     f"Also known as: {i.aliases}" if i.aliases else "") if x)
        docs.append(Doc("initiative", i.slug, i.name, text, f"/landscape/{i.slug}", label="landscape entry"))

    for n in (await db.scalars(select(Note).options(selectinload(Note.domain)).where(
            _any(terms, Note.title, Note.body, Note.so_what)).limit(PER_TABLE))).all():
        text = f"{n.body}\nSo what for Qsofte: {n.so_what}".strip()
        docs.append(Doc("note", str(n.id), n.title, text, f"/notes/{n.id}", n.occurred_on.isoformat(),
                        label=f"{n.type} note"))

    for g in (await db.scalars(select(Guide).where(
            _any(terms, Guide.title, Guide.summary, Guide.body)).limit(PER_TABLE))).all():
        docs.append(Doc("guide", g.slug, g.title, f"{g.summary}\n{g.body}", f"/library/{g.slug}",
                        g.updated_at.date().isoformat() if g.updated_at else None,
                        label="draft guide (unchecked)" if g.status == "draft" else "reviewed guide"))

    for e in (await db.scalars(select(Event).where(
            _any(terms, Event.name, Event.why, Event.goal, Event.city, Event.organiser)).limit(PER_TABLE))).all():
        text = "\n".join(x for x in (e.why, f"Goal: {e.goal}" if e.goal else "", f"Where: {e.city}" if e.city else "",
                                     f"How we show up: {e.level}") if x)
        docs.append(Doc("event", str(e.id), e.name, text, f"/events/{e.id}/edit",
                        e.starts_on.isoformat() if e.starts_on else None, label="event"))

    for f in (await db.scalars(select(FeedItem).options(selectinload(FeedItem.feed)).where(
            FeedItem.state != "dismissed", _any(terms, FeedItem.title, FeedItem.summary)).limit(PER_TABLE))).all():
        docs.append(Doc("feed", str(f.id), f.title, f"{f.feed.name}: {f.summary}", f.link or f"/feeds?item={f.id}",
                        f.published_at.date().isoformat(), label=f"news from {f.feed.name}"))
    return docs


async def search(db: AsyncSession, q: str, limit: int = 40) -> tuple[list[str], list[Doc]]:
    terms = query_terms(q)
    if not terms:
        return [], []
    docs = await collect(db, terms)
    for d in docs:
        d.score = score(terms, d.title, d.text)
    ranked = sorted((d for d in docs if d.score > 0), key=lambda d: (-d.score, d.kind, d.title))
    return terms, ranked[:limit]
