"""Full-text search on Postgres: stems, spelling, acronyms, aliases, accents, typos, ranking."""

from app.search import MARK_END, MARK_START

from .conftest import WRITE


async def hits(client, q):
    r = (await client.get("/api/search", params={"q": q})).json()
    return r, [(h["kind"], h["title"]) for h in r["hits"]]


async def add_note(client, **over):
    note = {"type": "signal", "title": "A note", "so_what": "Matters.", "occurred_on": "2026-11-20",
            "domain_slug": "cross-border", **over}
    r = await client.post("/api/notes", json=note, headers=WRITE)
    assert r.status_code == 201, r.text
    return r.json()


async def test_word_forms_match_by_stem(client):
    await add_note(client, title="Banks settling instantly", so_what="Settlement moves to 24/7.")
    _, found = await hits(client, "settlements")
    assert ("note", "Banks settling instantly") in found


async def test_british_and_us_spellings_find_each_other(client):
    await add_note(client, title="Tokenization pilot in the US")
    _, found = await hits(client, "tokenisation")
    assert ("note", "Tokenization pilot in the US") in found
    _, found = await hits(client, "tokenized")
    assert ("guide", "Tokenised deposits, stablecoins and CBDC compared") in found


async def test_acronyms_and_aliases(client):
    await add_note(client, title="Digital pound consultation", body="A central bank digital currency for the UK.")
    _, found = await hits(client, "CBDC")
    assert ("note", "Digital pound consultation") in found
    _, found = await hits(client, "NGP")
    assert found[0] == ("initiative", "Project Nexus")


async def test_accents_do_not_matter(client):
    _, found = await hits(client, "agora")
    assert found[0] == ("initiative", "Project Agorá")


async def test_matching_every_word_ranks_first(client):
    await add_note(client, title="Hong Kong news", so_what="Nothing about money.")
    await add_note(client, title="Hong Kong tokenised deposits go live")
    _, found = await hits(client, "Hong Kong tokenised deposits")
    notes = [t for k, t in found if k == "note"]
    assert notes.index("Hong Kong tokenised deposits go live") < notes.index("Hong Kong news")


async def test_snippets_mark_the_matching_words(client):
    await add_note(client, title="Liquidity", body="Banks pre-fund the settlement account every evening.")
    r, _ = await hits(client, "prefund settlement account")
    note = next(h for h in r["hits"] if h["title"] == "Liquidity")
    assert f"{MARK_START}settlement{MARK_END}" in note["snippet"]


async def test_misspelt_words_are_corrected_and_said(client):
    r, found = await hits(client, "remitance corridors")
    assert r["corrected"] == "remittance corridors"
    assert ("guide", "Cross-border payments: why they are slow and what is changing") in found
    r, _ = await hits(client, "stablecoyn")
    assert r["corrected"] == "stablecoin" and r["hits"]


async def test_close_title_matches_when_little_else_matches(client):
    await add_note(client, title="Interchange caps")
    r, found = await hits(client, "interchang")
    assert ("note", "Interchange caps") in found


async def test_new_and_edited_rows_are_searchable_at_once(client):
    n = await add_note(client, title="Placeholder")
    _, found = await hits(client, "quokka")
    assert ("note", "Placeholder") not in found
    note = {"type": "signal", "title": "Quokka payments", "so_what": "Matters.", "occurred_on": "2026-11-20",
            "domain_slug": "cross-border"}
    await client.put(f"/api/notes/{n['id']}", json=note, headers=WRITE)
    _, found = await hits(client, "quokka")
    assert ("note", "Quokka payments") in found


async def test_nothing_to_search(client):
    r, found = await hits(client, "the and of")
    assert found == [] and r["corrected"] is None
    r, found = await hits(client, "zzqxv")
    assert found == []
