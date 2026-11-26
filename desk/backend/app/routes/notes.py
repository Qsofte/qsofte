from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import Domain, Event, Initiative, Note, User, note_initiatives
from ..schemas import NoteIn, NoteOut
from ..security import current_user
from ..vocab import NoteType, Region
from .common import domain_by_slug, initiatives_by_slug, notes_query

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=list[NoteOut])
async def list_notes(
    type: NoteType | None = None,
    domain: str | None = None,
    region: Region | None = None,
    initiative: str | None = None,
    event_id: int | None = None,
    q: str | None = Query(default=None, max_length=100),
    since: date | None = None,
    limit: int = Query(default=200, ge=1, le=500),
    _: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> list[NoteOut]:
    stmt = notes_query()
    if type:
        stmt = stmt.where(Note.type == type)
    if domain:
        stmt = stmt.join(Domain, Note.domain_id == Domain.id).where(Domain.slug == domain)
    if initiative:
        stmt = (
            stmt.join(note_initiatives, note_initiatives.c.note_id == Note.id)
            .join(Initiative, Initiative.id == note_initiatives.c.initiative_id)
            .where(Initiative.slug == initiative)
        )
    if event_id is not None:
        stmt = stmt.where(Note.event_id == event_id)
    if since:
        stmt = stmt.where(Note.occurred_on >= since)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(Note.title.ilike(like), Note.body.ilike(like), Note.so_what.ilike(like)))
    stmt = stmt.order_by(Note.occurred_on.desc(), Note.id.desc()).limit(limit)
    notes = (await db.scalars(stmt)).unique().all()
    # Regions are a JSON list; filtered here so it works the same on Postgres and SQLite.
    if region:
        notes = [n for n in notes if region in (n.regions or [])]
    return [NoteOut.of(n) for n in notes]


async def _get(db: AsyncSession, note_id: int) -> Note:
    n = await db.scalar(notes_query().where(Note.id == note_id))
    if n is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That note does not exist or was deleted.")
    return n


@router.get("/{note_id}", response_model=NoteOut)
async def get_note(note_id: int, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> NoteOut:
    return NoteOut.of(await _get(db, note_id))


async def _apply(db: AsyncSession, n: Note, body: NoteIn) -> None:
    d = await domain_by_slug(db, body.domain_slug)
    if body.event_id is not None and await db.get(Event, body.event_id) is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "The event this note links to does not exist.")
    n.type = body.type
    n.title = body.title
    n.body = body.body
    n.so_what = body.so_what
    n.source_url = body.source_url
    n.occurred_on = body.occurred_on
    n.domain_id = d.id
    n.regions = list(body.regions)
    n.horizon = body.horizon
    n.stance = body.stance
    n.event_id = body.event_id
    n.review_on = body.review_on if body.type == "thesis" else None
    n.initiatives = await initiatives_by_slug(db, body.initiative_slugs)


@router.post("", response_model=NoteOut, status_code=201)
async def create_note(body: NoteIn, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> NoteOut:
    n = Note(created_by_id=user.id, initiatives=[])
    await _apply(db, n, body)
    db.add(n)
    await db.commit()
    return NoteOut.of(await _get(db, n.id))


@router.put("/{note_id}", response_model=NoteOut)
async def update_note(
    note_id: int, body: NoteIn, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> NoteOut:
    n = await _get(db, note_id)
    await _apply(db, n, body)
    await db.commit()
    db.expunge_all()
    return NoteOut.of(await _get(db, note_id))


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: int, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> None:
    n = await db.scalar(select(Note).where(Note.id == note_id))
    if n is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That note does not exist or was deleted.")
    await db.delete(n)
    await db.commit()
