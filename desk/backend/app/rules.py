"""Pure rules: no database, no I/O, tested directly (tests/test_rules.py)."""

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
