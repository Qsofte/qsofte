from .conftest import WRITE


async def test_landscape_lists_kinds_and_regions(client):
    items = (await client.get("/api/initiatives")).json()
    by_slug = {i["slug"]: i for i in items}
    assert len(items) >= 60
    assert by_slug["qris"]["kind"] == "qr" and by_slug["qris"]["regions"] == ["ASEAN"]
    assert by_slug["agora"]["started"] == 2024 and "Swiss National Bank" in by_slug["agora"]["participants"]
    assert {i["kind"] for i in items} >= {"central-bank", "cross-border", "payment-system", "qr", "regulation"}


async def test_initiative_detail_gathers_notes_guides_and_news(client):
    note = {"type": "signal", "title": "Nexus update", "so_what": "Matters for APAC banks.",
            "occurred_on": "2026-11-20", "domain_slug": "cross-border", "initiative_slugs": ["nexus"]}
    assert (await client.post("/api/notes", json=note, headers=WRITE)).status_code == 201
    d = (await client.get("/api/initiatives/nexus")).json()
    assert d["domain_name"] == "Global and cross-border"
    assert [n["title"] for n in d["notes"]] == ["Nexus update"]
    assert "nexus-explained" in [g["slug"] for g in d["guides"]]
    assert (await client.get("/api/initiatives/nope")).status_code == 404


async def test_add_and_edit_an_initiative(client):
    body = {"name": "Project Example", "domain_slug": "digital-assets", "kind": "central-bank",
            "regions": ["AU"], "started": 2026, "aliases": "Example"}
    r = await client.post("/api/initiatives", json=body, headers=WRITE)
    assert r.status_code == 201 and r.json()["slug"] == "project-example"
    assert (await client.post("/api/initiatives", json=body, headers=WRITE)).status_code == 409
    r = await client.patch("/api/initiatives/project-example",
                           json={"status": "pilot", "domain_slug": "tokenised-deposits"}, headers=WRITE)
    assert r.json()["status"] == "pilot" and r.json()["domain_code"] == "D4"
    assert (await client.patch("/api/initiatives/project-example", json={"kind": "spaceship"},
                               headers=WRITE)).status_code == 422


async def test_seeded_guides_start_as_drafts(client):
    guides = (await client.get("/api/guides")).json()
    assert len(guides) >= 6 and all(g["status"] == "draft" for g in guides)
    g = (await client.get("/api/guides/qr-payments-primer")).json()
    assert "EMVCo" in g["body"] and g["domain_code"] == "D2"


async def test_write_review_and_delete_a_guide(client):
    body = {"title": "PayTo for corporates", "summary": "Mandates.", "body": "## What\n\nText.",
            "domain_slug": "real-time-rails", "initiative_slugs": ["npp-payto"]}
    r = await client.post("/api/guides", json=body, headers=WRITE)
    assert r.status_code == 201 and r.json()["slug"] == "payto-for-corporates"
    assert r.json()["updated_by"] == "Owner"
    r2 = await client.post("/api/guides", json=body, headers=WRITE)
    assert r2.json()["slug"] == "payto-for-corporates-2"
    r = await client.put("/api/guides/payto-for-corporates", json={**body, "status": "reviewed"}, headers=WRITE)
    assert r.json()["status"] == "reviewed"
    bad = await client.put("/api/guides/payto-for-corporates", json={**body, "initiative_slugs": ["nope"]}, headers=WRITE)
    assert bad.status_code == 422
    assert (await client.delete("/api/guides/payto-for-corporates", headers=WRITE)).status_code == 204
    assert (await client.get("/api/guides/payto-for-corporates")).status_code == 404
