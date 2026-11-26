"""Request and response shapes. One serialiser per entity, used by every route that returns it."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from .models import Domain, Event, Feed, FeedItem, Guide, Initiative, Note, User
from .vocab import (
    CAPABILITY_LEVELS,
    EventStatus,
    FeedItemState,
    FeedKind,
    GuideLevel,
    GuideStatus,
    Horizon,
    InitiativeKind,
    InitiativeStatus,
    NoteType,
    Region,
    ShowUp,
    Stance,
)

Url = str  # free text, validated loosely: http(s) or empty


def _url(v: str) -> str:
    v = v.strip()
    if v and not v.startswith(("http://", "https://")):
        raise ValueError("Links must start with http:// or https://")
    return v


def _required(v: str, what: str) -> str:
    v = v.strip()
    if not v:
        raise ValueError(f"{what} is required")
    return v


# ---------- auth ----------


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class PasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=12, max_length=200)


class UserOut(BaseModel):
    id: int
    email: str
    name: str

    @classmethod
    def of(cls, u: User) -> "UserOut":
        return cls(id=u.id, email=u.email, name=u.name)


# ---------- initiatives ----------


class InitiativeOut(BaseModel):
    id: int
    slug: str
    name: str
    domain_code: str
    domain_slug: str
    summary: str
    status: str
    url: str
    kind: str
    regions: list[str]
    lead: str
    participants: str
    started: int | None
    aliases: str

    @classmethod
    def of(cls, i: Initiative, d: Domain) -> "InitiativeOut":
        return cls(
            id=i.id, slug=i.slug, name=i.name, domain_code=d.code, domain_slug=d.slug,
            summary=i.summary, status=i.status, url=i.url, kind=i.kind, regions=list(i.regions or []),
            lead=i.lead, participants=i.participants, started=i.started, aliases=i.aliases,
        )


class InitiativeIn(BaseModel):
    name: str = Field(max_length=120)
    domain_slug: str
    summary: str = ""
    status: InitiativeStatus = "research"
    url: Url = ""
    kind: InitiativeKind = "industry"
    regions: list[Region] = Field(default_factory=list)
    lead: str = Field(default="", max_length=200)
    participants: str = ""
    started: int | None = Field(default=None, ge=1950, le=2100)
    aliases: str = Field(default="", max_length=300)

    @field_validator("name")
    @classmethod
    def _n(cls, v: str) -> str:
        return _required(v, "Name")

    @field_validator("url")
    @classmethod
    def _u(cls, v: str) -> str:
        return _url(v)


class InitiativePatch(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    domain_slug: str | None = None
    summary: str | None = None
    status: InitiativeStatus | None = None
    url: Url | None = None
    kind: InitiativeKind | None = None
    regions: list[Region] | None = None
    lead: str | None = Field(default=None, max_length=200)
    participants: str | None = None
    started: int | None = Field(default=None, ge=1950, le=2100)
    aliases: str | None = Field(default=None, max_length=300)

    @field_validator("url")
    @classmethod
    def _u(cls, v: str | None) -> str | None:
        return None if v is None else _url(v)


# ---------- notes ----------


class NoteBase(BaseModel):
    type: NoteType
    title: str = Field(max_length=200)
    body: str = ""
    so_what: str
    source_url: Url = ""
    occurred_on: date
    domain_slug: str
    regions: list[Region] = Field(default_factory=list)
    horizon: Horizon = "12m"
    stance: Stance = "watch"
    initiative_slugs: list[str] = Field(default_factory=list)
    event_id: int | None = None
    review_on: date | None = None
    # Written from a feed item: that item is marked as noted and linked.
    from_feed_item_id: int | None = None

    @field_validator("title")
    @classmethod
    def _title(cls, v: str) -> str:
        return _required(v, "Headline")

    @field_validator("so_what")
    @classmethod
    def _so_what(cls, v: str) -> str:
        return _required(v, "'So what for Qsofte'")

    @field_validator("source_url")
    @classmethod
    def _src(cls, v: str) -> str:
        return _url(v)

    @field_validator("regions")
    @classmethod
    def _regions(cls, v: list[str]) -> list[str]:
        return list(dict.fromkeys(v))


class NoteIn(NoteBase):
    pass


class NoteOut(BaseModel):
    id: int
    type: str
    title: str
    body: str
    so_what: str
    source_url: str
    occurred_on: date
    domain_code: str
    domain_slug: str
    domain_name: str
    regions: list[str]
    horizon: str
    stance: str
    initiatives: list[dict]
    event_id: int | None
    review_on: date | None
    created_by: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def of(cls, n: Note) -> "NoteOut":
        return cls(
            id=n.id, type=n.type, title=n.title, body=n.body, so_what=n.so_what,
            source_url=n.source_url, occurred_on=n.occurred_on,
            domain_code=n.domain.code, domain_slug=n.domain.slug, domain_name=n.domain.name,
            regions=list(n.regions or []), horizon=n.horizon, stance=n.stance,
            initiatives=[{"slug": i.slug, "name": i.name} for i in n.initiatives],
            event_id=n.event_id, review_on=n.review_on, created_by=n.created_by.name,
            created_at=n.created_at, updated_at=n.updated_at,
        )


# ---------- domains ----------


class DomainOut(BaseModel):
    id: int
    slug: str
    code: str
    name: str
    summary: str
    position: str
    position_reviewed_at: datetime | None
    position_due: bool
    owner: str
    open_questions: str
    capability_level: int
    capability_label: str
    capability_evidence: str
    note_count: int = 0

    @classmethod
    def of(cls, d: Domain, due: bool, note_count: int = 0) -> "DomainOut":
        return cls(
            id=d.id, slug=d.slug, code=d.code, name=d.name, summary=d.summary,
            position=d.position, position_reviewed_at=d.position_reviewed_at, position_due=due,
            owner=d.owner, open_questions=d.open_questions,
            capability_level=d.capability_level, capability_label=CAPABILITY_LEVELS[d.capability_level],
            capability_evidence=d.capability_evidence, note_count=note_count,
        )


class DomainDetail(DomainOut):
    initiatives: list[InitiativeOut]
    notes: list[NoteOut]


class DomainPatch(BaseModel):
    position: str | None = None
    owner: str | None = Field(default=None, max_length=120)
    open_questions: str | None = None
    capability_level: int | None = Field(default=None, ge=0, le=len(CAPABILITY_LEVELS) - 1)
    capability_evidence: str | None = None
    # Confirms the position still stands without changing its text.
    mark_reviewed: bool = False


# ---------- events ----------


class EventBase(BaseModel):
    name: str = Field(max_length=160)
    organiser: str = ""
    city: str = ""
    starts_on: date | None = None
    ends_on: date | None = None
    typical_month: int | None = Field(default=None, ge=1, le=12)
    level: ShowUp = "watch"
    status: EventStatus = "considering"
    goal: str = ""
    why: str = ""
    url: Url = ""
    domain_codes: list[str] = Field(default_factory=list)

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        return _required(v, "Name")

    @field_validator("url")
    @classmethod
    def _u(cls, v: str) -> str:
        return _url(v)


class EventIn(EventBase):
    pass


class EventOut(EventBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    next_on: date | None = None
    debrief_count: int = 0

    @classmethod
    def of(cls, e: Event, next_on: date | None, debriefs: int = 0) -> "EventOut":
        return cls(
            id=e.id, name=e.name, organiser=e.organiser, city=e.city, starts_on=e.starts_on,
            ends_on=e.ends_on, typical_month=e.typical_month, level=e.level, status=e.status,
            goal=e.goal, why=e.why, url=e.url, domain_codes=list(e.domain_codes or []),
            next_on=next_on, debrief_count=debriefs,
        )


# ---------- today ----------


class TodayOut(BaseModel):
    week: str
    signals: list[NoteOut]
    upcoming: list[EventOut]
    due_positions: list[DomainOut]
    due_theses: list[NoteOut]


# ---------- initiatives, detail ----------


class InitiativeDetail(InitiativeOut):
    domain_name: str
    notes: list[NoteOut]
    guides: list["GuideRef"]
    feed_items: list["FeedItemOut"]


# ---------- guides ----------


class GuideRef(BaseModel):
    slug: str
    title: str
    summary: str
    level: str
    status: str


class GuideOut(GuideRef):
    id: int
    body: str
    domain_slug: str | None
    domain_code: str | None
    initiative_slugs: list[str]
    updated_by: str
    updated_at: datetime

    @classmethod
    def of(cls, g: Guide) -> "GuideOut":
        return cls(
            id=g.id, slug=g.slug, title=g.title, summary=g.summary, level=g.level, status=g.status,
            body=g.body, domain_slug=g.domain.slug if g.domain else None,
            domain_code=g.domain.code if g.domain else None, initiative_slugs=list(g.initiative_slugs or []),
            updated_by=g.updated_by, updated_at=g.updated_at,
        )


class GuideIn(BaseModel):
    title: str = Field(max_length=200)
    summary: str = ""
    body: str = ""
    level: GuideLevel = "primer"
    status: GuideStatus = "draft"
    domain_slug: str | None = None
    initiative_slugs: list[str] = Field(default_factory=list)

    @field_validator("title")
    @classmethod
    def _t(cls, v: str) -> str:
        return _required(v, "Title")


# ---------- feeds ----------


class FeedOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    url: str
    kind: str
    active: bool
    relevant_only: bool
    last_fetched_at: datetime | None
    last_error: str
    item_count: int


class FeedIn(BaseModel):
    name: str = Field(max_length=120)
    url: str = Field(max_length=500)
    kind: FeedKind = "industry"
    active: bool = True
    relevant_only: bool = False

    @field_validator("name")
    @classmethod
    def _n(cls, v: str) -> str:
        return _required(v, "Name")


class FeedItemOut(BaseModel):
    id: int
    feed_id: int
    feed_name: str
    title: str
    link: str
    summary: str
    published_at: datetime
    domain_codes: list[str]
    initiative_slugs: list[str]
    state: str
    note_id: int | None

    @classmethod
    def of(cls, i: FeedItem) -> "FeedItemOut":
        return cls(
            id=i.id, feed_id=i.feed_id, feed_name=i.feed.name, title=i.title, link=i.link, summary=i.summary,
            published_at=i.published_at, domain_codes=list(i.domain_codes or []),
            initiative_slugs=list(i.initiative_slugs or []), state=i.state, note_id=i.note_id,
        )


class FeedItemPatch(BaseModel):
    state: FeedItemState


class RefreshOut(BaseModel):
    feeds: int
    added: int
    failed: int


# ---------- search and ask ----------


class SearchHit(BaseModel):
    kind: str  # note | guide | initiative | domain | event | feed
    id: str
    title: str
    snippet: str
    href: str  # in-app path, or the article link for feed items
    date: str | None = None
    score: float


class SearchOut(BaseModel):
    q: str
    terms: list[str]
    hits: list[SearchHit]


class AskIn(BaseModel):
    question: str = Field(min_length=3, max_length=1000)


class AskOut(BaseModel):
    question: str
    answer: str
    sources: list[SearchHit]
    model: str


class AskStatus(BaseModel):
    enabled: bool


InitiativeDetail.model_rebuild()
