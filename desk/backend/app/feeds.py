"""Reads RSS 2.0, RSS 1.0 (RDF) and Atom feeds into feed_items.

Safety: XML is parsed with defusedxml (no entity expansion or external fetches); only http(s)
URLs on public addresses are fetched, redirects included; responses are capped in size and time.
"""

import asyncio
import html
import html.entities
import ipaddress
import logging
import re
import socket
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import urljoin, urlparse

import httpx
from defusedxml import ElementTree
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Domain, Feed, FeedItem, Initiative, utcnow
from .rules import Tagger, build_tagger, tag

log = logging.getLogger("desk.feeds")

USER_AGENT = "Mozilla/5.0 (compatible; DeskFeedReader/1.0)"
MAX_BYTES = 4 * 1024 * 1024
TIMEOUT = 20.0
MAX_REDIRECTS = 3
MAX_AGE_DAYS = 120  # older items are not stored
MAX_ITEMS_PER_FETCH = 100


class FeedError(Exception):
    """A reason a feed could not be read, in words a person can act on."""


@dataclass
class ParsedItem:
    guid: str
    title: str
    link: str
    summary: str
    published_at: datetime | None


# ---------------------------------------------------------------------------- parsing


def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


def _child(el, *names: str):
    for c in el:
        if _local(c.tag) in names:
            return c
    return None


def _text(el, *names: str) -> str:
    c = _child(el, *names)
    return (c.text or "").strip() if c is not None and c.text else ""


def clean_text(raw: str, limit: int = 600) -> str:
    """HTML to plain text: tags removed, entities decoded, whitespace collapsed, trimmed."""
    text = re.sub(r"<(script|style)\b.*?</\1>", " ", raw or "", flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > limit:
        text = text[: limit - 1].rsplit(" ", 1)[0] + "…"
    return text


def parse_date(value: str) -> datetime | None:
    value = (value or "").strip()
    if not value:
        return None
    try:
        dt = parsedate_to_datetime(value)  # RSS 2.0: RFC 822
    except (TypeError, ValueError, IndexError):
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))  # Atom, dc:date
        except ValueError:
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


_XML_ENTITIES = {"amp", "lt", "gt", "quot", "apos"}


def repair(data: bytes) -> bytes:
    """Fixes the two mistakes publishers make most: bare '&' and HTML-only entities like &nbsp;."""
    text = data.decode("utf-8", errors="replace")

    def entity(m: re.Match) -> str:
        name = m.group(1)
        if name in _XML_ENTITIES or name.startswith("#"):
            return m.group(0)
        char = html.entities.html5.get(name + ";")
        return "".join(f"&#{ord(c)};" for c in char) if char else f"&amp;{name};"

    text = re.sub(r"&(#?\w+);", entity, text)
    text = re.sub(r"&(?!#?\w+;)", "&amp;", text)
    return text.encode("utf-8")


def parse_feed(data: bytes, base_url: str = "") -> list[ParsedItem]:
    """Items from an RSS 2.0, RSS 1.0 or Atom document. Raises FeedError if it is none of them."""
    try:
        root = ElementTree.fromstring(data)
    except ElementTree.ParseError:
        try:
            root = ElementTree.fromstring(repair(data))
        except Exception as e:
            raise FeedError(f"The source did not return a readable feed ({type(e).__name__}).") from e
    except Exception as e:  # defusedxml raises its own types for unsafe documents
        raise FeedError(f"The source did not return a readable feed ({type(e).__name__}).") from e
    if _local(root.tag) not in ("rss", "RDF", "feed"):
        raise FeedError("The address returned XML, but not an RSS or Atom feed.")

    items: list[ParsedItem] = []
    for el in root.iter():
        name = _local(el.tag)
        if name == "item":
            title = clean_text(_text(el, "title"), 500)
            link = _text(el, "link") or (el.get("{http://www.w3.org/1999/02/22-rdf-syntax-ns#}about") or "")
            guid = _text(el, "guid") or link or title
            summary = _text(el, "description", "encoded", "summary")
            date = parse_date(_text(el, "pubDate", "date", "published", "updated"))
        elif name == "entry":
            title = clean_text(_text(el, "title"), 500)
            link = ""
            for c in el:
                if _local(c.tag) == "link" and c.get("rel", "alternate") == "alternate":
                    link = c.get("href", "")
                    break
            guid = _text(el, "id") or link or title
            summary = _text(el, "summary", "content")
            date = parse_date(_text(el, "published", "updated"))
        else:
            continue
        if not title:
            continue
        link = urljoin(base_url, link.strip()) if link else ""
        if link and urlparse(link).scheme not in ("http", "https"):
            link = ""
        items.append(ParsedItem(guid=guid.strip()[:500], title=title, link=link[:1000],
                                summary=clean_text(summary), published_at=date))
    return items


# ---------------------------------------------------------------------------- fetching


async def _check_public(url: str) -> None:
    parts = urlparse(url)
    if parts.scheme not in ("http", "https") or not parts.hostname:
        raise FeedError("Feed addresses must start with https:// (or http://).")
    try:
        infos = await asyncio.get_running_loop().getaddrinfo(parts.hostname, parts.port or None,
                                                             type=socket.SOCK_STREAM)
    except socket.gaierror as e:
        raise FeedError(f"The host {parts.hostname} could not be found.") from e
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if not ip.is_global:
            raise FeedError(f"{parts.hostname} points at a private address; the Desk only reads public feeds.")


def check_feed_url(url: str) -> str:
    """Shape check used when a feed is added (the address check happens when it is fetched)."""
    url = url.strip()
    parts = urlparse(url)
    if parts.scheme not in ("http", "https") or not parts.hostname:
        raise FeedError("Feed addresses must start with https:// (or http://).")
    return url


async def fetch(url: str, client: httpx.AsyncClient) -> bytes:
    for _ in range(MAX_REDIRECTS + 1):
        await _check_public(url)
        async with client.stream("GET", url) as resp:
            if resp.is_redirect:
                url = urljoin(url, resp.headers.get("location", ""))
                continue
            if resp.status_code == 403:
                raise FeedError("The source refused the request (403). It may block automated readers.")
            if resp.status_code >= 400:
                raise FeedError(f"The source answered {resp.status_code}. Check the address.")
            chunks, size = [], 0
            async for chunk in resp.aiter_bytes():
                size += len(chunk)
                if size > MAX_BYTES:
                    raise FeedError("The feed is larger than 4 MB, so the Desk did not read it.")
                chunks.append(chunk)
            return b"".join(chunks)
    raise FeedError("The feed redirected too many times.")


def new_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        timeout=TIMEOUT, follow_redirects=False,
        headers={"User-Agent": USER_AGENT, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5"},
    )


# ---------------------------------------------------------------------------- storing


async def load_tagger(db: AsyncSession) -> Tagger:
    rows = await db.execute(
        select(Initiative.slug, Domain.code, Initiative.name, Initiative.aliases)
        .join(Domain, Initiative.domain_id == Domain.id)
    )
    return build_tagger([tuple(r) for r in rows.all()])


async def store(db: AsyncSession, feed: Feed, parsed: list[ParsedItem], tagger: Tagger,
                now: datetime | None = None) -> int:
    """Adds new items (by guid); returns how many were added. Caller commits."""
    now = now or utcnow()
    oldest = now - timedelta(days=MAX_AGE_DAYS)
    seen = set((await db.scalars(select(FeedItem.guid).where(FeedItem.feed_id == feed.id))).all())
    added = 0
    for p in parsed[:MAX_ITEMS_PER_FETCH]:
        if p.guid in seen:
            continue
        published = p.published_at or now
        if published < oldest:
            continue
        codes, slugs = tag(f"{p.title} {p.summary}", tagger)
        if feed.relevant_only and not codes and not slugs:
            continue
        db.add(FeedItem(feed_id=feed.id, guid=p.guid, title=p.title, link=p.link, summary=p.summary,
                        published_at=min(published, now), domain_codes=codes, initiative_slugs=slugs))
        seen.add(p.guid)
        added += 1
    feed.item_count = (feed.item_count or 0) + added
    return added


async def refresh_feed(db: AsyncSession, feed: Feed, client: httpx.AsyncClient, tagger: Tagger) -> int:
    try:
        parsed = parse_feed(await fetch(feed.url, client), base_url=feed.url)
        added = await store(db, feed, parsed, tagger)
        feed.last_error = ""
    except FeedError as e:
        feed.last_error, added = str(e), 0
    except httpx.TimeoutException:
        feed.last_error, added = "The source took longer than 20 seconds to answer.", 0
    except httpx.HTTPError as e:
        feed.last_error, added = f"Could not connect to the source ({type(e).__name__}).", 0
    feed.last_fetched_at = utcnow()
    return added


async def refresh_all(db: AsyncSession, only: Feed | None = None) -> dict[str, int]:
    feeds = [only] if only else list((await db.scalars(select(Feed).where(Feed.active.is_(True)))).all())
    tagger = await load_tagger(db)
    result = {"feeds": len(feeds), "added": 0, "failed": 0}
    async with new_client() as client:
        for feed in feeds:
            result["added"] += await refresh_feed(db, feed, client, tagger)
            if feed.last_error:
                result["failed"] += 1
            await db.commit()
    return result


async def run_forever(sessionmaker, interval_minutes: int) -> None:
    """Background refresh inside the desk process. First run a minute after start-up."""
    await asyncio.sleep(60)
    while True:
        try:
            async with sessionmaker() as db:
                result = await refresh_all(db)
            log.info("desk feeds refreshed: %s", result)
        except Exception:  # keep the loop alive; each feed records its own error
            log.exception("desk feeds refresh failed")
        await asyncio.sleep(interval_minutes * 60)
