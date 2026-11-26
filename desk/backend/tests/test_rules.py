from datetime import date, datetime, timedelta, timezone

from app.rules import in_window, next_occurrence, position_due, week_label

NOW = datetime(2026, 11, 26, 9, tzinfo=timezone.utc)
TODAY = date(2026, 11, 26)


def test_week_label_uses_iso_weeks():
    assert week_label(TODAY) == "Week 48 · 2026"
    assert week_label(date(2027, 1, 1)) == "Week 53 · 2026"


def test_position_never_reviewed_is_due():
    assert position_due(None, NOW)


def test_position_due_after_thirty_days():
    assert not position_due(NOW - timedelta(days=30), NOW)
    assert position_due(NOW - timedelta(days=31), NOW)


def test_position_due_accepts_naive_datetimes():
    assert not position_due((NOW - timedelta(days=2)).replace(tzinfo=None), NOW)


def test_confirmed_date_wins_over_usual_month():
    assert next_occurrence(date(2027, 3, 4), 10, TODAY) == date(2027, 3, 4)


def test_usual_month_this_year_or_next():
    assert next_occurrence(None, 12, TODAY) == date(2026, 12, 1)
    assert next_occurrence(None, 11, TODAY) == date(2026, 11, 1)  # still this month
    assert next_occurrence(None, 6, TODAY) == date(2027, 6, 1)


def test_no_date_and_no_month_is_unknown():
    assert next_occurrence(None, None, TODAY) is None


def test_window_includes_the_current_month():
    assert in_window(date(2026, 11, 1), TODAY, 90)
    assert in_window(date(2027, 2, 24), TODAY, 90)
    assert not in_window(date(2027, 2, 25), TODAY, 90)
    assert not in_window(date(2026, 10, 31), TODAY, 90)
    assert not in_window(None, TODAY, 90)
