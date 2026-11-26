import type { DeskEvent } from '../api';
import { copy, months } from '../content';
import { range } from '../format';

/** Confirmed dates, else 'Usually Oct', else 'Date to confirm'. */
export default function EventWhen({ event }: { event: DeskEvent }) {
  if (event.starts_on) return <>{range(event.starts_on, event.ends_on)}</>;
  if (event.typical_month) return <>{copy.events.usually(months[event.typical_month - 1])}</>;
  return <>{copy.events.dateTbc}</>;
}
