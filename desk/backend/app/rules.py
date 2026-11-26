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
    "latest new news give show explain summarise summarize qsofte desk please vs versus doing done happening going get got make made say said think".split()
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


# Acronyms and their spelled-out forms, both ways. Payments vocabulary only; initiative aliases
# (edited in the app) are added on top at query time.
ACRONYMS: dict[str, list[str]] = {
    "cbdc": ["central bank digital currency"],
    "wcbdc": ["wholesale cbdc", "wholesale central bank digital currency"],
    "rtp": ["real-time payment", "instant payment"],
    "a2a": ["account-to-account"],
    "vop": ["verification of payee"],
    "cop": ["confirmation of payee"],
    "aml": ["anti-money laundering"],
    "ctf": ["counter-terrorism financing"],
    "kyc": ["know your customer"],
    "fx": ["foreign exchange"],
    "dlt": ["distributed ledger"],
    "defi": ["decentralised finance"],
    "rwa": ["real-world asset"],
    "mmf": ["money market fund"],
    "bnpl": ["buy now pay later"],
    "psp": ["payment service provider"],
    "pis": ["payment initiation"],
    "cdr": ["consumer data right"],
    "npp": ["new payments platform"],
    "upi": ["unified payments interface"],
    "fps": ["faster payments"],
    "iso20022": ["iso 20022"],
    "g20": ["g20 roadmap"],
}
_SPELLED = {fold(p): a for a, phrases in ACRONYMS.items() for p in phrases}


def spelling_variants(word: str) -> list[str]:
    """British and US forms the English stemmer keeps apart: tokenised <-> tokenized."""
    out = []
    for a, b in (("is", "iz"), ("iz", "is")):
        m = re.match(rf"^(.{{3,}}){a}(e|ed|es|er|ers|ing|ation|ations)$", word)
        if m:
            out.append(f"{m.group(1)}{b}{m.group(2)}")
    for a, b in (("our", "or"), ("or", "our")):
        if word.endswith(a) and len(word) > len(a) + 2 and word not in ("four", "your", "tour", "hour"):
            out.append(word[: -len(a)] + b)
    return out


@dataclass
class Query:
    """A search, expanded. Each group lists interchangeable forms of one thing the person typed;
    a result should match a form from every group to rank highest. `extra` only adds recall."""

    groups: list[list[str]]
    extra: list[str] = field(default_factory=list)

    @property
    def terms(self) -> list[str]:
        return [g[0] for g in self.groups]


def expand(q: str, alias_groups: list[list[str]] | None = None) -> Query:
    """Terms from the query, each with its spelling variants, acronym forms and initiative aliases.

    alias_groups: for each initiative, its folded names and aliases ("nexus", "nexus global payments", "ngp").
    """
    folded = " ".join(fold(q).split())
    groups = []
    for term in query_terms(q):
        forms = [term, *spelling_variants(term)]
        forms += ACRONYMS.get(term.replace(" ", ""), [])
        for names in alias_groups or []:
            if term in names:
                forms += [n for n in names if n != term]
        groups.append(list(dict.fromkeys(forms)))
    extra = [acronym for phrase, acronym in _SPELLED.items() if phrase in folded]
    for names in alias_groups or []:
        extra += [names[0] for n in names if " " in n and n in folded]
    return Query(groups=groups, extra=list(dict.fromkeys(extra)))


def fuse(rankings: list[list], k: int = 60) -> dict:
    """Reciprocal rank fusion: merges ranked lists by position, not by their incomparable scores.

    An item ranked r in a list earns 1 / (k + r); items found by several lists add up.
    """
    scores: dict = {}
    for ranking in rankings:
        for r, key in enumerate(ranking, start=1):
            scores[key] = scores.get(key, 0.0) + 1.0 / (k + r)
    return scores
