from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .. import feeds as reader
from ..db import get_db
from ..models import Feed, FeedItem, User
from ..schemas import FeedIn, FeedItemOut, FeedItemPatch, FeedOut, RefreshOut
from ..security import current_user
from ..vocab import FeedItemState
from .initiatives import json_has

router = APIRouter(tags=["feeds"])


@router.get("/feeds", response_model=list[FeedOut])
async def list_feeds(_: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> list[FeedOut]:
    return [FeedOut.model_validate(f) for f in (await db.scalars(select(Feed).order_by(Feed.kind, Feed.name))).all()]


async def _feed(db: AsyncSession, feed_id: int) -> Feed:
    f = await db.get(Feed, feed_id)
    if f is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That feed does not exist or was removed.")
    return f


def _url_or_422(url: str) -> str:
    try:
        return reader.check_feed_url(url)
    except reader.FeedError as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(e))


@router.post("/feeds", response_model=FeedOut, status_code=201)
async def add_feed(body: FeedIn, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> FeedOut:
    f = Feed(name=body.name, url=_url_or_422(body.url), kind=body.kind, active=body.active,
             relevant_only=body.relevant_only)
    db.add(f)
    try:
        await db.commit()
    except IntegrityError:
        raise HTTPException(status.HTTP_409_CONFLICT, "That feed is already on the list.")
    return FeedOut.model_validate(f)


@router.put("/feeds/{feed_id}", response_model=FeedOut)
async def update_feed(
    feed_id: int, body: FeedIn, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> FeedOut:
    f = await _feed(db, feed_id)
    f.name, f.url, f.kind = body.name, _url_or_422(body.url), body.kind
    f.active, f.relevant_only = body.active, body.relevant_only
    try:
        await db.commit()
    except IntegrityError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Another feed already uses that address.")
    return FeedOut.model_validate(f)


@router.delete("/feeds/{feed_id}", status_code=204)
async def delete_feed(feed_id: int, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> None:
    await db.delete(await _feed(db, feed_id))
    await db.commit()


@router.post("/feeds/refresh", response_model=RefreshOut)
async def refresh(
    feed_id: int | None = None, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> RefreshOut:
    only = await _feed(db, feed_id) if feed_id is not None else None
    return RefreshOut(**await reader.refresh_all(db, only=only))


@router.get("/feed-items", response_model=list[FeedItemOut])
async def list_items(
    state: FeedItemState | None = None,
    include_dismissed: bool = False,
    feed_id: int | None = None,
    domain: str | None = Query(default=None, pattern=r"^D[1-9]$"),
    initiative: str | None = None,
    untagged: bool = False,
    limit: int = Query(default=100, ge=1, le=300),
    _: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> list[FeedItemOut]:
    stmt = select(FeedItem).options(selectinload(FeedItem.feed))
    if state:
        stmt = stmt.where(FeedItem.state == state)
    elif not include_dismissed:
        stmt = stmt.where(FeedItem.state != "dismissed")
    if feed_id is not None:
        stmt = stmt.where(FeedItem.feed_id == feed_id)
    if domain:
        stmt = stmt.where(json_has(FeedItem.domain_codes, domain))
    if initiative:
        stmt = stmt.where(json_has(FeedItem.initiative_slugs, initiative))
    stmt = stmt.order_by(FeedItem.published_at.desc(), FeedItem.id.desc()).limit(limit)
    items = (await db.scalars(stmt)).all()
    if untagged:
        items = [i for i in items if not i.domain_codes]
    return [FeedItemOut.of(i) for i in items]


@router.patch("/feed-items/{item_id}", response_model=FeedItemOut)
async def set_item_state(
    item_id: int, body: FeedItemPatch, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> FeedItemOut:
    item = await db.scalar(select(FeedItem).options(selectinload(FeedItem.feed)).where(FeedItem.id == item_id))
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That article is no longer in the inbox.")
    if body.state == "noted" and item.note_id is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Write a note from the article to mark it noted.")
    item.state = body.state
    await db.commit()
    return FeedItemOut.of(item)


@router.get("/feed-items/{item_id}", response_model=FeedItemOut)
async def get_item(item_id: int, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> FeedItemOut:
    item = await db.scalar(select(FeedItem).options(selectinload(FeedItem.feed)).where(FeedItem.id == item_id))
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That article is no longer in the inbox.")
    return FeedItemOut.of(item)
