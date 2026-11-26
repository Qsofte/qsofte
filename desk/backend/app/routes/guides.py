from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..db import get_db
from ..models import Guide, User
from ..schemas import GuideIn, GuideOut
from ..security import current_user
from .common import domain_by_slug, initiatives_by_slug

router = APIRouter(prefix="/guides", tags=["guides"])


def _q():
    return select(Guide).options(selectinload(Guide.domain))


@router.get("", response_model=list[GuideOut])
async def list_guides(_: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> list[GuideOut]:
    return [GuideOut.of(g) for g in (await db.scalars(_q().order_by(Guide.sort, Guide.title))).all()]


async def _get(db: AsyncSession, slug: str) -> Guide:
    g = await db.scalar(_q().where(Guide.slug == slug))
    if g is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That guide does not exist or was deleted.")
    return g


@router.get("/{slug}", response_model=GuideOut)
async def get_guide(slug: str, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> GuideOut:
    return GuideOut.of(await _get(db, slug))


async def _apply(db: AsyncSession, g: Guide, body: GuideIn, user: User) -> None:
    g.domain_id = (await domain_by_slug(db, body.domain_slug)).id if body.domain_slug else None
    await initiatives_by_slug(db, body.initiative_slugs)  # refuses unknown slugs
    g.title = body.title
    g.summary = body.summary.strip()
    g.body = body.body
    g.level = body.level
    g.status = body.status
    g.initiative_slugs = list(dict.fromkeys(body.initiative_slugs))
    g.updated_by = user.name


def _slugify(title: str) -> str:
    out = "".join(c.lower() if c.isalnum() else "-" for c in title)
    return "-".join(p for p in out.split("-") if p)[:80] or "guide"


@router.post("", response_model=GuideOut, status_code=201)
async def create_guide(body: GuideIn, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> GuideOut:
    base = slug = _slugify(body.title)
    n = 2
    while await db.scalar(select(Guide.id).where(Guide.slug == slug)):
        slug, n = f"{base}-{n}", n + 1
    last = await db.scalar(select(func.max(Guide.sort)))
    g = Guide(slug=slug, sort=(last or 0) + 1)
    await _apply(db, g, body, user)
    db.add(g)
    await db.commit()
    return GuideOut.of(await _get(db, slug))


@router.put("/{slug}", response_model=GuideOut)
async def update_guide(
    slug: str, body: GuideIn, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> GuideOut:
    g = await _get(db, slug)
    await _apply(db, g, body, user)
    await db.commit()
    db.expunge_all()
    return GuideOut.of(await _get(db, slug))


@router.delete("/{slug}", status_code=204)
async def delete_guide(slug: str, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> None:
    await db.delete(await _get(db, slug))
    await db.commit()
