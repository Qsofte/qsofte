"""Tables. Portable types only (Postgres in production, SQLite in tests)."""

from datetime import date, datetime, timezone

from sqlalchemy import JSON, Column, Computed, Date, DateTime, ForeignKey, Index, Integer, String, Table, Text, UniqueConstraint
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base

# Full-text search: each searchable table carries a stored tsvector that Postgres keeps in step
# with the row, indexed with GIN. 'desk' is a text search configuration (migration 0003): English
# stemming with accents removed. Weights rank title (A) over summary (B) over body (C).
SEARCH_CONFIG = "desk"
SEARCH_WEIGHTS = {
    "domains": {"A": ["name"], "B": ["summary", "position"], "C": ["open_questions", "capability_evidence"]},
    "initiatives": {"A": ["name", "aliases"], "B": ["summary", "lead"], "C": ["participants"]},
    "notes": {"A": ["title"], "B": ["so_what"], "C": ["body"]},
    "guides": {"A": ["title"], "B": ["summary"], "C": ["body"]},
    "events": {"A": ["name"], "B": ["why", "goal"], "C": ["organiser", "city"]},
    "feed_items": {"A": ["title"], "C": ["summary"]},
}


def search_expression(table: str) -> str:
    parts = []
    for weight, columns in SEARCH_WEIGHTS[table].items():
        # || and coalesce, not concat_ws: a generated column only accepts immutable functions.
        text = " || ' ' || ".join(f"coalesce({c}, '')" for c in columns)
        parts.append(f"setweight(to_tsvector('{SEARCH_CONFIG}', {text}), '{weight}')")
    return " || ".join(parts)


def search_column(table: str):
    return mapped_column(TSVECTOR, Computed(search_expression(table), persisted=True), deferred=True)


def search_index(table: str) -> Index:
    return Index(f"ix_{table}_search", "search_vector", postgresql_using="gin")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(100))
    # Bumped on password change or "sign out everywhere"; older tokens stop working.
    token_version: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Domain(Base):
    """One of the six watch areas. Holds our current position and capability level."""

    __tablename__ = "domains"
    __table_args__ = (search_index("domains"),)
    search_vector: Mapped[str | None] = search_column("domains")

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True)
    code: Mapped[str] = mapped_column(String(4))  # D1..D6
    name: Mapped[str] = mapped_column(String(120))
    summary: Mapped[str] = mapped_column(Text, default="")
    position: Mapped[str] = mapped_column(Text, default="")
    position_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    owner: Mapped[str] = mapped_column(String(120), default="")
    open_questions: Mapped[str] = mapped_column(Text, default="")
    capability_level: Mapped[int] = mapped_column(Integer, default=0)
    capability_evidence: Mapped[str] = mapped_column(Text, default="")
    sort: Mapped[int] = mapped_column(Integer, default=0)

    initiatives: Mapped[list["Initiative"]] = relationship(back_populates="domain", order_by="Initiative.sort")


class Initiative(Base):
    """A named programme, rail, scheme or rulebook: Nexus, Agorá, UPI, SGQR, MiCA ..."""

    __tablename__ = "initiatives"
    __table_args__ = (search_index("initiatives"),)
    search_vector: Mapped[str | None] = search_column("initiatives")

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    domain_id: Mapped[int] = mapped_column(ForeignKey("domains.id"))
    summary: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="research")
    url: Mapped[str] = mapped_column(String(500), default="")
    sort: Mapped[int] = mapped_column(Integer, default=0)
    # What sort of thing it is (vocab.InitiativeKind), where, who runs it, who takes part.
    kind: Mapped[str] = mapped_column(String(30), default="industry")
    regions: Mapped[list[str]] = mapped_column(JSON, default=list)
    lead: Mapped[str] = mapped_column(String(200), default="")
    participants: Mapped[str] = mapped_column(Text, default="")
    started: Mapped[int | None] = mapped_column(Integer)
    # Extra words that identify it in news headlines, comma-separated ("Agora, Agorá").
    aliases: Mapped[str] = mapped_column(String(300), default="")

    domain: Mapped[Domain] = relationship(back_populates="initiatives")


note_initiatives = Table(
    "note_initiatives",
    Base.metadata,
    Column("note_id", ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
    Column("initiative_id", ForeignKey("initiatives.id", ondelete="CASCADE"), primary_key=True),
)


class Note(Base):
    """A journal entry: signal, brief, thesis, meeting or debrief. Always carries a 'so what'."""

    __tablename__ = "notes"
    __table_args__ = (search_index("notes"),)
    search_vector: Mapped[str | None] = search_column("notes")

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(20), index=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text, default="")
    so_what: Mapped[str] = mapped_column(Text)
    source_url: Mapped[str] = mapped_column(String(500), default="")
    occurred_on: Mapped[date] = mapped_column(Date, index=True)
    domain_id: Mapped[int] = mapped_column(ForeignKey("domains.id"), index=True)
    regions: Mapped[list[str]] = mapped_column(JSON, default=list)
    horizon: Mapped[str] = mapped_column(String(10), default="12m")
    stance: Mapped[str] = mapped_column(String(10), default="watch")
    event_id: Mapped[int | None] = mapped_column(ForeignKey("events.id", ondelete="SET NULL"))
    # Theses only: when we check whether we still believe it.
    review_on: Mapped[date | None] = mapped_column(Date)
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    domain: Mapped[Domain] = relationship()
    initiatives: Mapped[list[Initiative]] = relationship(secondary=note_initiatives, order_by="Initiative.sort")
    created_by: Mapped[User] = relationship()


class Event(Base):
    """A conference or forum and how Qsofte shows up at it."""

    __tablename__ = "events"
    __table_args__ = (search_index("events"),)
    search_vector: Mapped[str | None] = search_column("events")

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    organiser: Mapped[str] = mapped_column(String(160), default="")
    city: Mapped[str] = mapped_column(String(120), default="")
    # Exact dates once confirmed; until then the month it usually runs (1-12).
    starts_on: Mapped[date | None] = mapped_column(Date, index=True)
    ends_on: Mapped[date | None] = mapped_column(Date)
    typical_month: Mapped[int | None] = mapped_column(Integer)
    level: Mapped[str] = mapped_column(String(10), default="watch")
    status: Mapped[str] = mapped_column(String(15), default="considering")
    goal: Mapped[str] = mapped_column(Text, default="")
    why: Mapped[str] = mapped_column(Text, default="")
    url: Mapped[str] = mapped_column(String(500), default="")
    domain_codes: Mapped[list[str]] = mapped_column(JSON, default=list)


class Guide(Base):
    """Education material: a primer or deep dive, written in Markdown."""

    __tablename__ = "guides"
    __table_args__ = (search_index("guides"),)
    search_vector: Mapped[str | None] = search_column("guides")

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    title: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str] = mapped_column(Text, default="")
    body: Mapped[str] = mapped_column(Text, default="")
    level: Mapped[str] = mapped_column(String(10), default="primer")
    # draft until someone has checked it; seeded guides start as drafts.
    status: Mapped[str] = mapped_column(String(10), default="draft")
    domain_id: Mapped[int | None] = mapped_column(ForeignKey("domains.id", ondelete="SET NULL"))
    initiative_slugs: Mapped[list[str]] = mapped_column(JSON, default=list)
    sort: Mapped[int] = mapped_column(Integer, default=0)
    updated_by: Mapped[str] = mapped_column(String(120), default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    domain: Mapped[Domain | None] = relationship()


class Feed(Base):
    """An RSS or Atom source the Desk reads on a schedule."""

    __tablename__ = "feeds"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    url: Mapped[str] = mapped_column(String(500), unique=True)
    kind: Mapped[str] = mapped_column(String(20), default="regulator")
    active: Mapped[bool] = mapped_column(default=True)
    # Only keep items that match a domain or initiative (busy general sources).
    relevant_only: Mapped[bool] = mapped_column(default=False)
    last_fetched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_error: Mapped[str] = mapped_column(Text, default="")
    item_count: Mapped[int] = mapped_column(Integer, default=0)


class FeedItem(Base):
    """One article from a feed, tagged to domains and initiatives by keyword."""

    __tablename__ = "feed_items"
    __table_args__ = (UniqueConstraint("feed_id", "guid"), search_index("feed_items"))
    search_vector: Mapped[str | None] = search_column("feed_items")

    id: Mapped[int] = mapped_column(primary_key=True)
    feed_id: Mapped[int] = mapped_column(ForeignKey("feeds.id", ondelete="CASCADE"), index=True)
    guid: Mapped[str] = mapped_column(String(500))
    title: Mapped[str] = mapped_column(String(500))
    link: Mapped[str] = mapped_column(String(1000), default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    domain_codes: Mapped[list[str]] = mapped_column(JSON, default=list)
    initiative_slugs: Mapped[list[str]] = mapped_column(JSON, default=list)
    # new -> starred / dismissed; noted once a note was written from it.
    state: Mapped[str] = mapped_column(String(10), default="new", index=True)
    note_id: Mapped[int | None] = mapped_column(ForeignKey("notes.id", ondelete="SET NULL"))

    feed: Mapped[Feed] = relationship()


EMBED_DIM = 384  # BAAI/bge-small-en-v1.5; changing the model's size needs a migration


class SearchChunk(Base):
    """A piece of a searchable row with its embedding, for meaning-based search.

    A cache derived from the source rows by app.semantic.reindex, never written by hand: rows are
    re-embedded when their content hash (or the model) changes, and removed when the row goes.
    """

    __tablename__ = "search_chunks"
    __table_args__ = (
        UniqueConstraint("kind", "ref_id", "chunk_no"),
        Index("ix_search_chunks_ref", "kind", "ref_id"),
        Index("ix_search_chunks_embedding", "embedding", postgresql_using="hnsw",
              postgresql_with={"m": 16, "ef_construction": 64},
              postgresql_ops={"embedding": "vector_cosine_ops"}),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(20))
    ref_id: Mapped[str] = mapped_column(String(80))
    chunk_no: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    content_hash: Mapped[str] = mapped_column(String(64))
    model: Mapped[str] = mapped_column(String(100))
    embedding: Mapped[list[float]] = mapped_column(Vector(EMBED_DIM))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
