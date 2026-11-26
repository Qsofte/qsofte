from datetime import date, timedelta

from .conftest import WRITE

TODAY = date.today()


def note(**over):
    body = {
        "type": "signal",
        "title": "Nexus Global Payments names its first operator",
        "body": "",
        "so_what": "Raises the bar for APAC banks' ISO 20022 readiness; pitch our readiness review.",
        "occurred_on": TODAY.isoformat(),
        "domain_slug": "cross-border",
        "regions": ["SG", "IN"],
        "initiative_slugs": ["nexus"],
    }
    body.update(over)
    return body


async def test_seeded_domains_and_initiatives(client):
    domains = (await client.get("/api/domains")).json()
    assert [d["code"] for d in domains] == ["D1", "D2", "D3", "D4", "D5", "D6"]
    assert all(d["position_due"] for d in domains)
    slugs = {i["slug"] for i in (await client.get("/api/initiatives")).json()}
    assert {"nexus", "mandala", "agora", "acacia"} <= slugs


async def test_note_requires_so_what(client):
    r = await client.post("/api/notes", json=note(so_what="  "), headers=WRITE)
    assert r.status_code == 422
    assert "So what for Qsofte" in r.text


async def test_note_rejects_unknown_initiative_and_bad_links(client):
    assert (await client.post("/api/notes", json=note(initiative_slugs=["nope"]), headers=WRITE)).status_code == 422
    assert (await client.post("/api/notes", json=note(source_url="javascript:alert(1)"), headers=WRITE)).status_code == 422


async def test_note_round_trip_and_filters(client):
    r = await client.post("/api/notes", json=note(), headers=WRITE)
    assert r.status_code == 201, r.text
    n = r.json()
    assert n["domain_code"] == "D1" and n["initiatives"] == [{"slug": "nexus", "name": "Project Nexus"}]
    assert n["created_by"] == "Owner"

    await client.post("/api/notes", json=note(title="FedNow volumes", domain_slug="real-time-rails",
                                              regions=["US"], initiative_slugs=[]), headers=WRITE)
    assert len((await client.get("/api/notes")).json()) == 2
    assert [x["title"] for x in (await client.get("/api/notes?region=US")).json()] == ["FedNow volumes"]
    assert len((await client.get("/api/notes?initiative=nexus")).json()) == 1
    assert len((await client.get("/api/notes?q=fednow")).json()) == 1
    assert len((await client.get("/api/notes?domain=cross-border")).json()) == 1

    r = await client.put(f"/api/notes/{n['id']}", json=note(title="Edited", initiative_slugs=["agora", "nexus"]), headers=WRITE)
    assert r.status_code == 200
    assert r.json()["title"] == "Edited" and len(r.json()["initiatives"]) == 2

    assert (await client.delete(f"/api/notes/{n['id']}", headers=WRITE)).status_code == 204
    assert (await client.get(f"/api/notes/{n['id']}")).status_code == 404


async def test_domain_position_marks_it_reviewed(client):
    r = await client.patch("/api/domains/tokenised-deposits",
                           json={"position": "Deposit tokens beat stablecoins for bank clients.", "capability_level": 1},
                           headers=WRITE)
    d = r.json()
    assert d["position_due"] is False and d["capability_label"] == "informed"
    assert (await client.patch("/api/domains/tokenised-deposits", json={"capability_level": 9}, headers=WRITE)).status_code == 422


async def test_events_ordered_by_next_occurrence(client):
    events = (await client.get("/api/events")).json()
    dates = [e["next_on"] for e in events if e["next_on"]]
    assert dates == sorted(dates)
    r = await client.post("/api/events", json={"name": "Test summit", "starts_on": "2027-05-02", "ends_on": "2027-05-01"},
                          headers=WRITE)
    assert r.status_code == 422 and "end date" in r.text


async def test_debrief_links_to_event(client):
    event = (await client.get("/api/events")).json()[0]
    r = await client.post("/api/notes", json=note(type="debrief", event_id=event["id"]), headers=WRITE)
    assert r.status_code == 201
    again = (await client.get(f"/api/events/{event['id']}")).json()
    assert again["debrief_count"] == 1


async def test_today_brings_signals_events_and_due_reviews(client):
    await client.post("/api/notes", json=note(), headers=WRITE)
    await client.post("/api/notes", json=note(title="Old", occurred_on=(TODAY - timedelta(days=30)).isoformat()), headers=WRITE)
    await client.post("/api/notes", json=note(type="thesis", title="Agorá goes live by 2028",
                                              review_on=(TODAY + timedelta(days=3)).isoformat()), headers=WRITE)
    t = (await client.get("/api/today")).json()
    assert t["week"].startswith("Week ")
    assert [s["title"] for s in t["signals"]] == ["Nexus Global Payments names its first operator"]
    assert [s["title"] for s in t["due_theses"]] == ["Agorá goes live by 2028"]
    assert len(t["due_positions"]) == 6
    assert all(e["level"] != "skip" for e in t["upcoming"])


async def test_unknown_api_route_is_json_404(client):
    r = await client.get("/api/nope")
    assert r.status_code == 404 and "no API route" in r.json()["detail"]
