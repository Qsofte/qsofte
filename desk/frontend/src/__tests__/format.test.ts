import { describe, expect, it } from 'vitest';
import { day, monthSlot, nextTwelveMonths, range, todayIso } from '../format';

describe('dates', () => {
  it('formats a day', () => expect(day('2026-11-26')).toBe('26 Nov 2026'));
  it('formats a day from a datetime', () => expect(day('2026-11-26T09:00:00Z')).toBe('26 Nov 2026'));
  it('collapses ranges', () => {
    expect(range('2027-06-03', '2027-06-05')).toBe('3–5 Jun 2027');
    expect(range('2027-09-30', '2027-10-02')).toBe('30 Sep – 2 Oct 2027');
    expect(range('2027-12-30', '2028-01-02')).toBe('30 Dec 2027 – 2 Jan 2028');
    expect(range('2027-06-03', null)).toBe('3 Jun 2027');
  });
  it('gives today as ISO', () => expect(todayIso(new Date(2026, 0, 5))).toBe('2026-01-05'));
});

describe('twelve-month strip', () => {
  const now = new Date(2026, 10, 26); // 26 Nov 2026
  it('starts with this month and crosses the year', () => {
    const m = nextTwelveMonths(now);
    expect(m[0]).toEqual({ year: 2026, month: 11, label: 'Nov' });
    expect(m[2]).toEqual({ year: 2027, month: 1, label: 'Jan' });
    expect(m).toHaveLength(12);
  });
  it('places dates in slots', () => {
    expect(monthSlot('2026-11-01', now)).toBe(0);
    expect(monthSlot('2027-10-31', now)).toBe(11);
    expect(monthSlot('2027-11-01', now)).toBe(-1);
    expect(monthSlot('2026-10-31', now)).toBe(-1);
    expect(monthSlot(null, now)).toBe(-1);
  });
});
