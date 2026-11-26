"""Loaders shared by routes. Relationships are always loaded up front: lazy loads fail on an async session."""

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import Domain, Initiative, Note


def notes_query() -> Select[tuple[Note]]:
    return select(Note).options(
        selectinload(Note.domain), selectinload(Note.initiatives), selectinload(Note.created_by)
    )


async def domain_by_slug(db: AsyncSession, slug: str) -> Domain:
    d = await db.scalar(select(Domain).where(Domain.slug == slug))
    if d is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"There is no domain called '{slug}'.")
    return d


async def initiatives_by_slug(db: AsyncSession, slugs: list[str]) -> list[Initiative]:
    if not slugs:
        return []
    found = list((await db.scalars(select(Initiative).where(Initiative.slug.in_(slugs)))).all())
    missing = set(slugs) - {i.slug for i in found}
    if missing:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, f"Unknown initiative: {', '.join(sorted(missing))}."
        )
    return found
