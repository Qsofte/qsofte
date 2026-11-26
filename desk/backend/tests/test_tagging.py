from app.rules import build_tagger, fold, query_terms, score, tag

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


def test_score_prefers_title_and_full_matches():
    title_hit = score(["nexus", "fx"], "Nexus FX quotes", "")
    body_hit = score(["nexus", "fx"], "Something else", "nexus fx")
    partial = score(["nexus", "fx"], "Nexus", "")
    assert title_hit > body_hit > 0
    assert title_hit > partial > 0
    assert score(["nexus"], "Other", "nothing") == 0
