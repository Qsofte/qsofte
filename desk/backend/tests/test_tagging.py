from app.rules import build_tagger, expand, fold, query_terms, spelling_variants, tag

TAGGER = build_tagger([
    ("agora", "D1", "Project Agorá", "Agora, Agorá"),
    ("nexus", "D1", "Project Nexus", "Nexus Global Payments"),
    ("upi", "D2", "UPI", "Unified Payments Interface"),
    ("ensemble", "D4", "Project Ensemble", ""),
])


def test_fold_removes_accents_and_case():
    assert fold("Agorá ÉTÉ") == "agora ete"


def test_initiative_names_match_without_project_or_accents():
    assert tag("BIS update on Agora pilot", TAGGER) == (["D1"], ["agora"])
    assert tag("Nexus reaches agreement", TAGGER)[1] == ["nexus"]


def test_names_match_whole_words_only():
    assert tag("Pupils at the agoraphobia clinic", TAGGER) == ([], [])
    assert tag("Groupie music festival", TAGGER) == ([], [])


def test_domain_keywords():
    codes, _ = tag("Regulator consults on stablecoin reserves and scam losses", TAGGER)
    assert codes == ["D3", "D5"]


def test_initiative_brings_its_domain():
    assert tag("Project Ensemble moves to pilot", TAGGER)[0] == ["D4"]


def test_query_terms_drop_filler():
    assert query_terms("What is our position on tokenised deposits vs stablecoins?") == [
        "position", "tokenised", "deposits", "stablecoins"]
    assert query_terms("the and of") == []


def test_spelling_variants_cover_british_and_us_forms():
    assert spelling_variants("tokenised") == ["tokenized"]
    assert spelling_variants("tokenization") == ["tokenisation"]
    assert spelling_variants("labour") == ["labor"]
    assert spelling_variants("settlement") == []
    assert spelling_variants("your") == []


def test_expand_adds_acronyms_both_ways_and_aliases():
    aliases = [["nexus", "project nexus", "nexus global payments", "ngp"]]
    q = expand("CBDC tokenised", aliases)
    assert q.groups == [["cbdc", "central bank digital currency"], ["tokenised", "tokenized"]]
    q = expand("What is NGP doing on central bank digital currency?", aliases)
    assert q.groups[0] == ["ngp", "nexus", "project nexus", "nexus global payments"]
    assert "cbdc" in q.extra
    assert q.terms == ["ngp", "central", "bank", "digital", "currency"]
