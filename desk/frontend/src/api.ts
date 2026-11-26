// The one way the Desk talks to its server. Same origin, cookie session.
import {
  copy,
  type EventStatus,
  type FeedItemState,
  type FeedKind,
  type GuideLevel,
  type GuideStatus,
  type Horizon,
  type InitiativeKind,
  type InitiativeStatus,
  type NoteType,
  type Region,
  type ShowUp,
  type Stance,
} from './content';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface InitiativeRef {
  slug: string;
  name: string;
}

export interface Initiative extends InitiativeRef {
  id: number;
  domain_code: string;
  domain_slug: string;
  summary: string;
  status: InitiativeStatus;
  url: string;
  kind: InitiativeKind;
  regions: Region[];
  lead: string;
  participants: string;
  started: number | null;
  aliases: string;
}

export interface InitiativeInput {
  name: string;
  domain_slug: string;
  summary: string;
  status: InitiativeStatus;
  url: string;
  kind: InitiativeKind;
  regions: Region[];
  lead: string;
  participants: string;
  started: number | null;
  aliases: string;
}

export interface GuideRef {
  slug: string;
  title: string;
  summary: string;
  level: GuideLevel;
  status: GuideStatus;
}

export interface InitiativeDetail extends Initiative {
  domain_name: string;
  notes: Note[];
  guides: GuideRef[];
  feed_items: FeedItem[];
}

export interface Guide extends GuideRef {
  id: number;
  body: string;
  domain_slug: string | null;
  domain_code: string | null;
  initiative_slugs: string[];
  updated_by: string;
  updated_at: string;
}

export interface GuideInput {
  title: string;
  summary: string;
  body: string;
  level: GuideLevel;
  status: GuideStatus;
  domain_slug: string | null;
  initiative_slugs: string[];
}

export interface Feed {
  id: number;
  name: string;
  url: string;
  kind: FeedKind;
  active: boolean;
  relevant_only: boolean;
  last_fetched_at: string | null;
  last_error: string;
  item_count: number;
}

export type FeedInput = Pick<Feed, 'name' | 'url' | 'kind' | 'active' | 'relevant_only'>;

export interface FeedItem {
  id: number;
  feed_id: number;
  feed_name: string;
  title: string;
  link: string;
  summary: string;
  published_at: string;
  domain_codes: string[];
  initiative_slugs: string[];
  state: FeedItemState;
  note_id: number | null;
}

export interface SearchHit {
  kind: 'note' | 'guide' | 'initiative' | 'domain' | 'event' | 'feed';
  id: string;
  title: string;
  snippet: string;
  href: string;
  date: string | null;
  score: number;
  match: 'words' | 'meaning' | 'both' | 'close';
}

export interface Answer {
  question: string;
  answer: string;
  sources: SearchHit[];
  model: string;
}

export interface Note {
  id: number;
  type: NoteType;
  title: string;
  body: string;
  so_what: string;
  source_url: string;
  occurred_on: string;
  domain_code: string;
  domain_slug: string;
  domain_name: string;
  regions: Region[];
  horizon: Horizon;
  stance: Stance;
  initiatives: InitiativeRef[];
  event_id: number | null;
  review_on: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface NoteInput {
  type: NoteType;
  title: string;
  body: string;
  so_what: string;
  source_url: string;
  occurred_on: string;
  domain_slug: string;
  regions: Region[];
  horizon: Horizon;
  stance: Stance;
  initiative_slugs: string[];
  event_id: number | null;
  review_on: string | null;
  from_feed_item_id?: number | null;
}

export interface Domain {
  id: number;
  slug: string;
  code: string;
  name: string;
  summary: string;
  position: string;
  position_reviewed_at: string | null;
  position_due: boolean;
  owner: string;
  open_questions: string;
  capability_level: number;
  capability_label: string;
  capability_evidence: string;
  note_count: number;
}

export interface DomainDetail extends Domain {
  initiatives: Initiative[];
  notes: Note[];
}

export interface DomainPatch {
  position?: string;
  owner?: string;
  open_questions?: string;
  capability_level?: number;
  capability_evidence?: string;
  mark_reviewed?: boolean;
}

export interface DeskEvent {
  id: number;
  name: string;
  organiser: string;
  city: string;
  starts_on: string | null;
  ends_on: string | null;
  typical_month: number | null;
  level: ShowUp;
  status: EventStatus;
  goal: string;
  why: string;
  url: string;
  domain_codes: string[];
  next_on: string | null;
  debrief_count: number;
}

export type EventInput = Omit<DeskEvent, 'id' | 'next_on' | 'debrief_count'>;

export interface Today {
  week: string;
  signals: Note[];
  upcoming: DeskEvent[];
  due_positions: Domain[];
  due_theses: Note[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

// Called when any request finds the session gone, so the app can show sign-in.
let onSignedOut: () => void = () => {};
export function setSignedOutHandler(fn: () => void) {
  onSignedOut = fn;
}

// FastAPI returns {detail: string} for our errors and {detail: [{msg, loc}]} for validation.
export function errorMessage(body: unknown, status: number): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail
      .map((d: { msg?: string; loc?: unknown[] }) => {
        const field = Array.isArray(d.loc) ? String(d.loc[d.loc.length - 1]) : '';
        const msg = (d.msg ?? '').replace(/^Value error, /, '');
        return field && !msg.toLowerCase().includes('required') ? `${field}: ${msg}` : msg;
      })
      .join(' ');
  }
  return status >= 500 ? copy.errors.generic : `The server refused the request (${status}).`;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: {
        'X-Desk-Request': '1',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(copy.errors.network, 0);
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && path !== '/auth/login' && path !== '/auth/me') onSignedOut();
    throw new ApiError(errorMessage(data, res.status), res.status);
  }
  return data as T;
}

const q = (params: Record<string, string | undefined>) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
  return s ? `?${s}` : '';
};

export const api = {
  me: () => request<User>('GET', '/auth/me'),
  login: (email: string, password: string) => request<User>('POST', '/auth/login', { email, password }),
  logout: () => request<void>('POST', '/auth/logout'),
  logoutEverywhere: () => request<void>('POST', '/auth/logout-everywhere'),
  changePassword: (current_password: string, new_password: string) =>
    request<User>('POST', '/auth/password', { current_password, new_password }),

  today: () => request<Today>('GET', '/today'),

  domains: () => request<Domain[]>('GET', '/domains'),
  domain: (slug: string) => request<DomainDetail>('GET', `/domains/${slug}`),
  updateDomain: (slug: string, patch: DomainPatch) => request<DomainDetail>('PATCH', `/domains/${slug}`, patch),

  initiatives: () => request<Initiative[]>('GET', '/initiatives'),
  initiative: (slug: string) => request<InitiativeDetail>('GET', `/initiatives/${slug}`),
  createInitiative: (body: Partial<InitiativeInput> & { name: string; domain_slug: string }) =>
    request<Initiative>('POST', '/initiatives', body),
  updateInitiative: (slug: string, body: Partial<InitiativeInput>) =>
    request<Initiative>('PATCH', `/initiatives/${slug}`, body),

  guides: () => request<Guide[]>('GET', '/guides'),
  guide: (slug: string) => request<Guide>('GET', `/guides/${slug}`),
  createGuide: (body: GuideInput) => request<Guide>('POST', '/guides', body),
  updateGuide: (slug: string, body: GuideInput) => request<Guide>('PUT', `/guides/${slug}`, body),
  deleteGuide: (slug: string) => request<void>('DELETE', `/guides/${slug}`),

  feeds: () => request<Feed[]>('GET', '/feeds'),
  addFeed: (body: FeedInput) => request<Feed>('POST', '/feeds', body),
  updateFeed: (id: number, body: FeedInput) => request<Feed>('PUT', `/feeds/${id}`, body),
  deleteFeed: (id: number) => request<void>('DELETE', `/feeds/${id}`),
  refreshFeeds: (feedId?: number) =>
    request<{ feeds: number; added: number; failed: number }>('POST', `/feeds/refresh${feedId ? `?feed_id=${feedId}` : ''}`),
  feedItems: (filters: { state?: string; feed_id?: string; domain?: string; initiative?: string; limit?: string } = {}) =>
    request<FeedItem[]>('GET', `/feed-items${q(filters)}`),
  feedItem: (id: number) => request<FeedItem>('GET', `/feed-items/${id}`),
  setFeedItemState: (id: number, state: FeedItemState) => request<FeedItem>('PATCH', `/feed-items/${id}`, { state }),

  search: (query: string) =>
    request<{ q: string; terms: string[]; hits: SearchHit[]; fuzzy: boolean; corrected: string | null }>('GET', `/search${q({ q: query })}`),
  askStatus: () => request<{ enabled: boolean }>('GET', '/ask'),
  ask: (question: string) => request<Answer>('POST', '/ask', { question }),

  notes: (filters: { type?: string; domain?: string; region?: string; q?: string; initiative?: string } = {}) =>
    request<Note[]>('GET', `/notes${q(filters)}`),
  note: (id: number) => request<Note>('GET', `/notes/${id}`),
  createNote: (body: NoteInput) => request<Note>('POST', '/notes', body),
  updateNote: (id: number, body: NoteInput) => request<Note>('PUT', `/notes/${id}`, body),
  deleteNote: (id: number) => request<void>('DELETE', `/notes/${id}`),

  events: () => request<DeskEvent[]>('GET', '/events'),
  event: (id: number) => request<DeskEvent>('GET', `/events/${id}`),
  createEvent: (body: EventInput) => request<DeskEvent>('POST', '/events', body),
  updateEvent: (id: number, body: EventInput) => request<DeskEvent>('PUT', `/events/${id}`, body),
  deleteEvent: (id: number) => request<void>('DELETE', `/events/${id}`),
};
