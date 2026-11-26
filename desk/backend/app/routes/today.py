from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import Domain, Note, User, utcnow
from ..rules import in_window, position_due, week_label
from ..schemas import DomainOut, NoteOut, TodayOut
from ..security import current_user
from .common import notes_query
from .events import all_events

router = APIRouter(tags=["today"])

SIGNAL_DAYS = 7
EVENT_DAYS = 90


@router.get("/today", response_model=TodayOut)
async def today(_: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> TodayOut:
    today = date.today()
    now = utcnow()
    recent = (
        await db.scalars(
            notes_query()
            .where(Note.occurred_on >= today - timedelta(days=SIGNAL_DAYS), Note.type != "thesis")
            .order_by(Note.occurred_on.desc(), Note.id.desc())
            .limit(30)
        )
    ).all()
    theses = (
        await db.scalars(
            notes_query()
            .where(Note.type == "thesis", Note.review_on.is_not(None), Note.review_on <= today + timedelta(days=14))
            .order_by(Note.review_on)
        )
    ).all()
    domains = (await db.scalars(select(Domain).order_by(Domain.sort))).all()
    events = [e for e in await all_events(db, today) if e.level != "skip" and in_window(e.next_on, today, EVENT_DAYS)]
    return TodayOut(
        week=week_label(today),
        signals=[NoteOut.of(n) for n in recent],
        upcoming=events,
        due_positions=[DomainOut.of(d, True) for d in domains if position_due(d.position_reviewed_at, now)],
        due_theses=[NoteOut.of(n) for n in theses],
    )
