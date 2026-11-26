"""Pure rules: no database, no I/O, tested directly (tests/test_rules.py)."""

import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone

from .vocab import POSITION_REVIEW_DAYS


def week_label(today: date) -> str:
    """'Week 48 · 2026' using ISO weeks, which is what a weekly briefing is numbered by."""
    year, week, _ = today.isocalendar()
    return f"Week {week} · {year}"


def position_due(reviewed_at: datetime | None, now: datetime, days: int = POSITION_REVIEW_DAYS) -> bool:
    """A position never reviewed, or reviewed more than `days` ago, is due."""
    if reviewed_at is None:
        return True
    if reviewed_at.tzinfo is None:  # SQLite hands back naive datetimes
        reviewed_at = reviewed_at.replace(tzinfo=timezone.utc)
    return now - reviewed_at > timedelta(days=days)


def next_occurrence(starts_on: date | None, typical_month: int | None, today: date) -> date | None:
    """When an event next happens: its confirmed date, else the 1st of its usual month.

    A confirmed date in the past stays in the past (the event happened). A usual month
    rolls to next year once this year's has gone.
    """
    if starts_on is not None:
        return starts_on
    if typical_month is None:
        return None
    candidate = date(today.year, typical_month, 1)
    if typical_month < today.month:
        candidate = date(today.year + 1, typical_month, 1)
    return candidate


def in_window(when: date | None, today: date, days: int) -> bool:
    """True if `when` falls from the start of this month to `days` ahead.

    The start of the month, not today, so an event 'usually in November' still
    shows during November.
    """
    if when is None:
        return False
    return date(today.year, today.month, 1) <= when <= today + timedelta(days=days)


# ---------------------------------------------------------------------------------------
# Tagging news to domains and initiatives, by keyword.

# Regex fragments per domain; matched case- and accent-insensitively at word starts.
DOMAIN_TERMS: dict[str, list[str]] = {
    "D1": [r"cross[- ]border", r"correspondent bank", r"remittance", r"swift\b", r"iso ?20022",
           r"interlink", r"g20 roadmap", r"multi-?cbdc", r"fx settlement"],
    "D2": [r"instant payment", r"real[- ]time payment", r"fast payment", r"faster payments", r"\bupi\b",
           r"\bnpp\b", r"payto", r"fednow", r"\brtp\b", r"\bpix\b", r"sepa instant", r"qr (code|payment)",
           r"\bqr\b", r"account[- ]to[- ]account", r"payment system"],
    "D3": [r"stablecoin", r"\bcbdc", r"central bank digital currenc", r"digital currenc", r"crypto",
           r"digital asset", r"tokeni[sz]", r"\bmica\b", r"blockchain", r"distributed ledger"],
    "D4": [r"tokeni[sz]ed deposit", r"deposit token", r"wholesale settlement", r"unified ledger",
           r"wholesale cbdc", r"tokeni[sz]ed (asset|securit|bond|fund)", r"atomic settlement"],
    "D5": [r"\bscam", r"\bfraud", r"anti-money laundering", r"\baml\b", r"sanction", r"licens",
           r"operational resilience", r"consumer protection"],
    "D6": [r"agentic", r"\bai agent", r"artificial intelligence", r"open banking", r"open finance",
           r"pay by bank", r"generative ai"],
}


def fold(text: str) -> str:
    """Lower case, accents removed: 'Agorá' -> 'agora'."""
    decomposed = unicodedata.normalize("NFKD", text)
    return "".join(c for c in decomposed if not unicodedata.combining(c)).lower()


@dataclass
class Tagger:
    domain_patterns: dict[str, re.Pattern] = field(default_factory=dict)
    # slug -> (domain code, pattern over its name and aliases)
    initiatives: dict[str, tuple[str, re.Pattern]] = field(default_factory=dict)


def _names_pattern(names: list[str]) -> re.Pattern | None:
    words = sorted({fold(n).strip() for n in names if len(fold(n).strip()) >= 3}, key=len, reverse=True)
    if not words:
        return None
    return re.compile(r"(?<![\w])(" + "|".join(re.escape(w) for w in words) + r")(?![\w])")


def build_tagger(initiatives: list[tuple[str, str, str, str]]) -> Tagger:
    """initiatives: (slug, domain code, name, comma-separated aliases)."""
    t = Tagger()
    for code, terms in DOMAIN_TERMS.items():
        t.domain_patterns[code] = re.compile("|".join(f"(?:{x})" for x in terms))
    for slug, code, name, aliases in initiatives:
        # "Project Nexus" is also found as "Nexus".
        names = [name, re.sub(r"^project\s+", "", name, flags=re.I)]
        names += [a for a in (aliases or "").split(",") if a.strip()]
        pattern = _names_pattern(names)
        if pattern:
            t.initiatives[slug] = (code, pattern)
    return t


def tag(text: str, tagger: Tagger) -> tuple[list[str], list[str]]:
    """Domains and initiatives a piece of text is about. An initiative implies its domain."""
    folded = fold(text)
    slugs = [slug for slug, (_, p) in tagger.initiatives.items() if p.search(folded)]
    codes = {code for code, p in tagger.domain_patterns.items() if p.search(folded)}
    codes |= {tagger.initiatives[s][0] for s in slugs}
    return sorted(codes), slugs


# ---------------------------------------------------------------------------------------
# Search: terms from a query or a question, and a simple relevance score.

STOPWORDS = set(
    "a an and are as at be been but by can could did do does for from had has have how i if in into is it its "
    "me my of on or our should so than that the their them then there these they this to us was we were what "
    "when where which who why will with would you your about any all also between more most much tell know "
    "latest new news give show explain summarise summarize qsofte desk please vs versus".split()
)


def query_terms(q: str, limit: int = 8) -> list[str]:
    words = re.findall(r"[\w][\w\-./]*", fold(q))
    out: list[str] = []
    for w in words:
        w = w.strip("-./")
        if len(w) < 2 or w in STOPWORDS or w in out:
            continue
        out.append(w)
    return out[:limit]


def score(terms: list[str], title: str, body: str) -> float:
    """Title hits count three times a body hit; matching every term earns a bonus."""
    if not terms:
        return 0.0
    t, b = fold(title or ""), fold(body or "")
    total, matched = 0.0, 0
    for term in terms:
        in_title = term in t
        hits = min(b.count(term), 3)
        if in_title or hits:
            matched += 1
        total += (3.0 if in_title else 0.0) + hits
    if matched == 0:
        return 0.0
    coverage = matched / len(terms)
    return total * (0.5 + coverage) * (1.5 if matched == len(terms) else 1.0)
