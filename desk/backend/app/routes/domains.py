from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import Domain, Initiative, Note, User, utcnow
from ..rules import position_due
from ..schemas import DomainDetail, DomainOut, DomainPatch, InitiativeOut, NoteOut
from ..security import current_user
from .common import domain_by_slug, notes_query

router = APIRouter(tags=["domains"])


async def _note_counts(db: AsyncSession) -> dict[int, int]:
    rows = await db.execute(select(Note.domain_id, func.count()).group_by(Note.domain_id))
    return {domain_id: count for domain_id, count in rows.all()}


@router.get("/domains", response_model=list[DomainOut])
async def list_domains(_: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> list[DomainOut]:
    now = utcnow()
    counts = await _note_counts(db)
    domains = (await db.scalars(select(Domain).order_by(Domain.sort))).all()
    return [DomainOut.of(d, position_due(d.position_reviewed_at, now), counts.get(d.id, 0)) for d in domains]


async def _detail(db: AsyncSession, d: Domain) -> DomainDetail:
    inits = (await db.scalars(select(Initiative).where(Initiative.domain_id == d.id).order_by(Initiative.sort))).all()
    notes = (
        await db.scalars(
            notes_query().where(Note.domain_id == d.id).order_by(Note.occurred_on.desc(), Note.id.desc()).limit(20)
        )
    ).all()
    counts = await _note_counts(db)
    base = DomainOut.of(d, position_due(d.position_reviewed_at, utcnow()), counts.get(d.id, 0))
    return DomainDetail(
        **base.model_dump(),
        initiatives=[InitiativeOut.of(i, d) for i in inits],
        notes=[NoteOut.of(n) for n in notes],
    )


@router.get("/domains/{slug}", response_model=DomainDetail)
async def get_domain(slug: str, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> DomainDetail:
    return await _detail(db, await domain_by_slug(db, slug))


@router.patch("/domains/{slug}", response_model=DomainDetail)
async def update_domain(
    slug: str, body: DomainPatch, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> DomainDetail:
    d = await domain_by_slug(db, slug)
    if body.position is not None and body.position.strip() != d.position:
        d.position = body.position.strip()
        d.position_reviewed_at = utcnow()
    if body.mark_reviewed:
        d.position_reviewed_at = utcnow()
    if body.owner is not None:
        d.owner = body.owner.strip()
    if body.open_questions is not None:
        d.open_questions = body.open_questions.strip()
    if body.capability_level is not None:
        d.capability_level = body.capability_level
    if body.capability_evidence is not None:
        d.capability_evidence = body.capability_evidence.strip()
    await db.commit()
    return await _detail(db, d)
