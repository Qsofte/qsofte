from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import Event, Note, User
from ..rules import next_occurrence
from ..schemas import EventIn, EventOut
from ..security import current_user

router = APIRouter(prefix="/events", tags=["events"])


async def debrief_counts(db: AsyncSession) -> dict[int, int]:
    rows = await db.execute(
        select(Note.event_id, func.count()).where(Note.event_id.is_not(None)).group_by(Note.event_id)
    )
    return {event_id: count for event_id, count in rows.all()}


def sort_key(e: EventOut) -> tuple[int, date]:
    return (0, e.next_on) if e.next_on else (1, date.max)


async def all_events(db: AsyncSession, today: date) -> list[EventOut]:
    counts = await debrief_counts(db)
    events = (await db.scalars(select(Event))).all()
    out = [EventOut.of(e, next_occurrence(e.starts_on, e.typical_month, today), counts.get(e.id, 0)) for e in events]
    return sorted(out, key=sort_key)


@router.get("", response_model=list[EventOut])
async def list_events(_: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> list[EventOut]:
    return await all_events(db, date.today())


def _check(body: EventIn) -> None:
    if body.starts_on and body.ends_on and body.ends_on < body.starts_on:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "The end date is before the start date.")


def _apply(e: Event, body: EventIn) -> None:
    for field, value in body.model_dump().items():
        setattr(e, field, value.strip() if isinstance(value, str) else value)


async def _one(db: AsyncSession, e: Event) -> EventOut:
    counts = await debrief_counts(db)
    return EventOut.of(e, next_occurrence(e.starts_on, e.typical_month, date.today()), counts.get(e.id, 0))


@router.post("", response_model=EventOut, status_code=201)
async def create_event(body: EventIn, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> EventOut:
    _check(body)
    e = Event()
    _apply(e, body)
    db.add(e)
    await db.commit()
    return await _one(db, e)


async def _get(db: AsyncSession, event_id: int) -> Event:
    e = await db.get(Event, event_id)
    if e is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That event does not exist or was deleted.")
    return e


@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: int, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> EventOut:
    return await _one(db, await _get(db, event_id))


@router.put("/{event_id}", response_model=EventOut)
async def update_event(
    event_id: int, body: EventIn, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> EventOut:
    _check(body)
    e = await _get(db, event_id)
    _apply(e, body)
    await db.commit()
    return await _one(db, e)


@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: int, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> None:
    await db.delete(await _get(db, event_id))
    await db.commit()
