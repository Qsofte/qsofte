from pathlib import Path

from app import feeds as reader

from .conftest import WRITE

FIX = Path(__file__).parent / "fixtures"


async def _refresh_with_fixture(client, monkeypatch, name="rss2.xml"):
    async def fake_fetch(url, _client):
        return (FIX / name).read_bytes()
    monkeypatch.setattr(reader, "fetch", fake_fetch)
    r = await client.post("/api/feeds", json={"name": "Example", "url": "https://example.org/rss"}, headers=WRITE)
    feed = r.json()
    r = await client.post(f"/api/feeds/refresh?feed_id={feed['id']}", headers=WRITE)
    assert r.status_code == 200, r.text
    return feed, r.json()


async def test_seeded_feeds(client):
    feeds = (await client.get("/api/feeds")).json()
    assert len(feeds) == 15 and all(f["url"].startswith("https://") for f in feeds)


async def test_feed_validation(client):
    r = await client.post("/api/feeds", json={"name": "x", "url": "ftp://example.org"}, headers=WRITE)
    assert r.status_code == 422 and "https://" in r.text
    url = (await client.get("/api/feeds")).json()[0]["url"]
    assert (await client.post("/api/feeds", json={"name": "dup", "url": url}, headers=WRITE)).status_code == 409


async def test_refresh_tags_and_lists_items(client, monkeypatch):
    feed, result = await _refresh_with_fixture(client, monkeypatch)
    assert result["added"] >= 2 and result["failed"] == 0
    items = (await client.get(f"/api/feed-items?feed_id={feed['id']}")).json()
    first = items[0]
    assert first["title"] == "HKMA advances Project Ensemble pilot"
    assert "ensemble" in first["initiative_slugs"] and first["feed_name"] == "Example"
    assert [i["id"] for i in (await client.get("/api/feed-items?initiative=ensemble")).json()] == [first["id"]]
    assert first["id"] in [i["id"] for i in (await client.get("/api/feed-items?domain=D4")).json()]
    ensemble = (await client.get("/api/initiatives/ensemble")).json()
    assert [i["id"] for i in ensemble["feed_items"]] == [first["id"]]


async def test_failed_refresh_records_why(client, monkeypatch):
    async def broken(url, _client):
        raise reader.FeedError("The source answered 404. Check the address.")
    monkeypatch.setattr(reader, "fetch", broken)
    feed = (await client.post("/api/feeds", json={"name": "Gone", "url": "https://example.org/gone"}, headers=WRITE)).json()
    r = (await client.post(f"/api/feeds/refresh?feed_id={feed['id']}", headers=WRITE)).json()
    assert r["failed"] == 1
    gone = [f for f in (await client.get("/api/feeds")).json() if f["id"] == feed["id"]][0]
    assert "404" in gone["last_error"] and gone["last_fetched_at"]


async def test_star_dismiss_and_note_from_item(client, monkeypatch):
    feed, _ = await _refresh_with_fixture(client, monkeypatch)
    items = (await client.get(f"/api/feed-items?feed_id={feed['id']}")).json()
    a, b = items[0], items[1]
    assert (await client.patch(f"/api/feed-items/{b['id']}", json={"state": "dismissed"}, headers=WRITE)).json()["state"] == "dismissed"
    assert b["id"] not in [i["id"] for i in (await client.get("/api/feed-items")).json()]
    assert (await client.patch(f"/api/feed-items/{a['id']}", json={"state": "noted"}, headers=WRITE)).status_code == 422
    note = {"type": "signal", "title": a["title"], "so_what": "Watch HK tokenised deposits.", "occurred_on": "2026-11-24",
            "domain_slug": "tokenised-deposits", "source_url": a["link"], "from_feed_item_id": a["id"]}
    n = (await client.post("/api/notes", json=note, headers=WRITE)).json()
    again = (await client.get(f"/api/feed-items/{a['id']}")).json()
    assert again["state"] == "noted" and again["note_id"] == n["id"]
