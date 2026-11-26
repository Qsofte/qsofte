"""Tables. Portable types only (Postgres in production, SQLite in tests)."""

from datetime import date, datetime, timezone

from sqlalchemy import JSON, Column, Date, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


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
    """A named programme: Nexus, Mandala, Agorá, Acacia, ISO 20022 ..."""

    __tablename__ = "initiatives"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    domain_id: Mapped[int] = mapped_column(ForeignKey("domains.id"))
    summary: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="research")
    url: Mapped[str] = mapped_column(String(500), default="")
    sort: Mapped[int] = mapped_column(Integer, default=0)

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
