from datetime import datetime, timezone
from pathlib import Path

import pytest

from app import feeds as reader
from app.rules import build_tagger

FIX = Path(__file__).parent / "fixtures"


def test_rss2_items_dates_and_clean_summaries():
    items = reader.parse_feed((FIX / "rss2.xml").read_bytes())
    first = items[0]
    assert first.title == "HKMA advances Project Ensemble pilot"
    assert first.guid == "a-1"
    assert first.published_at == datetime(2026, 11, 24, 2, tzinfo=timezone.utc)
    assert first.summary == "Tokenised deposits settle 24/7 now."
    assert items[3].link == ""  # javascript: links are dropped


def test_rss1_rdf():
    [item] = reader.parse_feed((FIX / "rss1.xml").read_bytes())
    assert item.title == "Statement on the New Payments Platform"
    assert item.published_at == datetime(2026, 11, 5, 23, 45, tzinfo=timezone.utc)


def test_atom_with_relative_link():
    [item] = reader.parse_feed((FIX / "atom.xml").read_bytes(), base_url="https://example.org/feed")
    assert item.link == "https://example.org/news/agora"
    assert item.guid == "tag:example.org,2026:1"


def test_broken_publisher_xml_is_repaired():
    data = b'<rss><channel><item><title>A &amp; B &nbsp; C & D</title><link>https://x.org/?a=1&b=2</link></item></channel></rss>'
    [item] = reader.parse_feed(data)
    assert item.title == "A & B C & D"
    assert item.link == "https://x.org/?a=1&b=2"


def test_not_a_feed():
    with pytest.raises(reader.FeedError, match="not an RSS or Atom feed"):
        reader.parse_feed(b"<html><body>hi</body></html>")
    with pytest.raises(reader.FeedError, match="readable feed"):
        reader.parse_feed(b"not xml at all <<<")


def test_entity_expansion_attacks_are_refused():
    bomb = b'<?xml version="1.0"?><!DOCTYPE r [<!ENTITY a "aaaaaaaaaa"><!ENTITY b "&a;&a;&a;&a;">]><rss><channel><item><title>&b;</title></item></channel></rss>'
    with pytest.raises(reader.FeedError):
        reader.parse_feed(bomb)


@pytest.mark.parametrize("url", ["http://127.0.0.1/feed", "http://localhost/feed", "http://10.0.0.5/x",
                                 "http://169.254.169.254/latest/meta-data"])
async def test_private_addresses_are_refused(url):
    with pytest.raises(reader.FeedError, match="private address"):
        await reader._check_public(url)


def test_feed_urls_must_be_web_addresses():
    with pytest.raises(reader.FeedError):
        reader.check_feed_url("file:///etc/passwd")
    assert reader.check_feed_url(" https://example.org/rss ") == "https://example.org/rss"


async def test_store_dedupes_filters_and_tags():
    from app import db as dbmod
    from app.models import Feed, FeedItem
    from sqlalchemy import select

    tagger = build_tagger([("ensemble", "D4", "Project Ensemble", "")])
    parsed = reader.parse_feed((FIX / "rss2.xml").read_bytes())
    now = datetime(2026, 11, 26, tzinfo=timezone.utc)
    async with dbmod.sessionmaker()() as db:
        busy = Feed(name="Busy", url="https://example.org/busy", relevant_only=True)
        everything = Feed(name="All", url="https://example.org/all", relevant_only=False)
        db.add_all([busy, everything])
        await db.flush()
        assert await reader.store(db, busy, parsed, tagger, now) == 1  # only the tagged item
        assert await reader.store(db, everything, parsed, tagger, now) == 3  # 2023 item too old
        assert await reader.store(db, everything, parsed, tagger, now) == 0  # already stored
        await db.commit()
        tagged = (await db.scalars(select(FeedItem).where(FeedItem.feed_id == busy.id))).one()
        assert tagged.domain_codes == ["D3", "D4"] and tagged.initiative_slugs == ["ensemble"]
