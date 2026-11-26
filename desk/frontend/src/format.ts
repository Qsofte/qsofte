// Date helpers. Dates from the API are ISO 'YYYY-MM-DD' (no time zone) or ISO datetimes.
import { months } from './content';

function parseDay(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return { y, m, d };
}

/** '26 Nov 2026'. */
export function day(iso: string): string {
  const { y, m, d } = parseDay(iso);
  return `${d} ${months[m - 1]} ${y}`;
}

/** '3–5 Jun 2027', '30 Sep – 2 Oct 2027', or one day. */
export function range(start: string, end: string | null): string {
  if (!end || end === start) return day(start);
  const a = parseDay(start);
  const b = parseDay(end);
  if (a.y === b.y && a.m === b.m) return `${a.d}–${b.d} ${months[b.m - 1]} ${b.y}`;
  if (a.y === b.y) return `${a.d} ${months[a.m - 1]} – ${b.d} ${months[b.m - 1]} ${b.y}`;
  return `${day(start)} – ${day(end)}`;
}

/** Today in the viewer's time zone as 'YYYY-MM-DD'. */
export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** The twelve months starting with the current one: [{year, month (1-12), label}]. */
export function nextTwelveMonths(now = new Date()): { year: number; month: number; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: months[d.getMonth()] };
  });
}

/** Which of those twelve slots (0-11) an ISO date falls in, or -1. */
export function monthSlot(iso: string | null, now = new Date()): number {
  if (!iso) return -1;
  const { y, m } = parseDay(iso);
  const slot = (y - now.getFullYear()) * 12 + (m - 1 - now.getMonth());
  return slot >= 0 && slot < 12 ? slot : -1;
}

/** Lower case, accents removed: 'Agorá' -> 'agora'. Matches the server's search folding. */
export function fold(text: string): string {
  return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** '3 hours ago', '2 days ago', or a date for anything older than a week. */
export function ago(iso: string, now = new Date()): string {
  const mins = Math.round((now.getTime() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days <= 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return day(iso);
}
