from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import String, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..db import get_db
from ..models import Domain, FeedItem, Guide, Initiative, Note, User, note_initiatives
from ..schemas import FeedItemOut, GuideRef, InitiativeDetail, InitiativeIn, InitiativeOut, InitiativePatch, NoteOut
from ..security import current_user
from .common import domain_by_slug, notes_query

router = APIRouter(prefix="/initiatives", tags=["initiatives"])


@router.get("", response_model=list[InitiativeOut])
async def list_initiatives(_: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> list[InitiativeOut]:
    rows = await db.execute(
        select(Initiative, Domain).join(Domain, Initiative.domain_id == Domain.id).order_by(Domain.sort, Initiative.sort)
    )
    return [InitiativeOut.of(i, d) for i, d in rows.all()]


async def _get(db: AsyncSession, slug: str) -> tuple[Initiative, Domain]:
    row = (await db.execute(
        select(Initiative, Domain).join(Domain, Initiative.domain_id == Domain.id).where(Initiative.slug == slug)
    )).first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"There is no initiative called '{slug}'.")
    return row[0], row[1]


def json_has(column, value: str):
    """A JSON list column contains value; portable across Postgres and SQLite via its JSON text."""
    return cast(column, String).like(f'%"{value}"%')


@router.get("/{slug}", response_model=InitiativeDetail)
async def get_initiative(slug: str, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> InitiativeDetail:
    i, d = await _get(db, slug)
    notes = (await db.scalars(
        notes_query().join(note_initiatives, note_initiatives.c.note_id == Note.id)
        .where(note_initiatives.c.initiative_id == i.id)
        .order_by(Note.occurred_on.desc(), Note.id.desc()).limit(20)
    )).unique().all()
    guides = [g for g in (await db.scalars(select(Guide).order_by(Guide.sort))).all() if slug in (g.initiative_slugs or [])]
    items = (await db.scalars(
        select(FeedItem).options(selectinload(FeedItem.feed))
        .where(json_has(FeedItem.initiative_slugs, slug), FeedItem.state != "dismissed")
        .order_by(FeedItem.published_at.desc()).limit(15)
    )).all()
    return InitiativeDetail(
        **InitiativeOut.of(i, d).model_dump(), domain_name=d.name,
        notes=[NoteOut.of(n) for n in notes],
        guides=[GuideRef(slug=g.slug, title=g.title, summary=g.summary, level=g.level, status=g.status) for g in guides],
        feed_items=[FeedItemOut.of(x) for x in items],
    )


def _slugify(name: str) -> str:
    out = "".join(c.lower() if c.isalnum() else "-" for c in name)
    return "-".join(p for p in out.split("-") if p)[:60] or "initiative"


@router.post("", response_model=InitiativeOut, status_code=201)
async def create_initiative(
    body: InitiativeIn, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> InitiativeOut:
    d = await domain_by_slug(db, body.domain_slug)
    slug = _slugify(body.name)
    if await db.scalar(select(Initiative).where(Initiative.slug == slug)):
        raise HTTPException(status.HTTP_409_CONFLICT, f"An initiative called '{body.name}' already exists.")
    last = await db.scalar(select(func.max(Initiative.sort)))
    data = body.model_dump(exclude={"domain_slug"})
    i = Initiative(slug=slug, domain_id=d.id, sort=(last or 0) + 1,
                   **{k: v.strip() if isinstance(v, str) else v for k, v in data.items()})
    db.add(i)
    await db.commit()
    return InitiativeOut.of(i, d)


@router.patch("/{slug}", response_model=InitiativeOut)
async def update_initiative(
    slug: str, body: InitiativePatch, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> InitiativeOut:
    i, d = await _get(db, slug)
    changes = body.model_dump(exclude_unset=True)
    if "domain_slug" in changes:
        d = await domain_by_slug(db, changes.pop("domain_slug"))
        i.domain_id = d.id
    for field, value in changes.items():
        if field in ("name",) and value is None:
            continue
        setattr(i, field, value.strip() if isinstance(value, str) else value)
    await db.commit()
    return InitiativeOut.of(i, d)
