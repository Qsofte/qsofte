// All Desk copy. Pages render it; components hold no sentences of their own.
// Values (keys) match the API's vocab.py; the strings are what people read.

export const brand = { name: 'Payments Desk', by: 'Qsofte' };

export const nav = [
  { to: '/', label: 'Today', end: true },
  { to: '/domains', label: 'Domains' },
  { to: '/notes', label: 'Notes' },
  { to: '/events', label: 'Events' },
  { to: '/capabilities', label: 'Capabilities' },
];

export const noteTypes = {
  signal: { label: 'Signal', hint: 'Something happened in the industry or in tech' },
  brief: { label: 'Brief', hint: 'A one-page explainer' },
  thesis: { label: 'Thesis', hint: 'Our position and bet, with a date to review it' },
  meeting: { label: 'Meeting', hint: 'A client, regulator or partner conversation' },
  debrief: { label: 'Debrief', hint: 'What we took away from an event' },
} as const;
export type NoteType = keyof typeof noteTypes;

export const regions = {
  AU: 'Australia',
  IN: 'India',
  SG: 'Singapore',
  GULF: 'Gulf',
  EU: 'Europe',
  UK: 'UK',
  US: 'US',
  GLOBAL: 'Global',
} as const;
export type Region = keyof typeof regions;

export const horizons = { now: 'Now', '12m': '12 months', '3y': '3 years+' } as const;
export type Horizon = keyof typeof horizons;

export const stances = { watch: 'Watch', explore: 'Explore', invest: 'Invest', lead: 'Lead' } as const;
export type Stance = keyof typeof stances;

export const showUp = {
  speak: { label: 'Speak', hint: 'On stage or a panel' },
  host: { label: 'Host', hint: 'A roundtable or dinner' },
  attend: { label: 'Attend', hint: 'Be there, book meetings' },
  watch: { label: 'Watch', hint: 'Follow remotely' },
  skip: { label: 'Skip', hint: 'Not this year' },
} as const;
export type ShowUp = keyof typeof showUp;

export const eventStatus = { considering: 'Considering', confirmed: 'Confirmed', done: 'Done' } as const;
export type EventStatus = keyof typeof eventStatus;

export const initiativeStatus = {
  research: 'Research',
  pilot: 'Pilot',
  live: 'Live',
  paused: 'Paused',
  ended: 'Ended',
} as const;

export const capabilityLevels = [
  { label: 'Aware', hint: 'We follow it' },
  { label: 'Informed', hint: 'We can brief a client on it' },
  { label: 'Credible', hint: 'We have a point of view and a paper or talk' },
  { label: 'Proven', hint: 'We have delivered work in it' },
  { label: 'Leading', hint: 'Clients come to us for it' },
];

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const copy = {
  signIn: {
    title: 'Sign in',
    lead: 'The Payments Desk is private to the Qsofte team.',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    working: 'Signing in…',
  },
  shell: { signOut: 'Sign out', account: 'Account', skip: 'Skip to content' },
  today: {
    eyebrow: 'Briefing',
    lead: 'What moved this week, what is coming up, and what needs a fresh look.',
    signals: 'This week',
    noSignals: 'Nothing logged in the last seven days. Add a signal when something moves.',
    upcoming: 'Coming up in the next 90 days',
    noUpcoming: 'No events in the next 90 days.',
    due: 'Due for review',
    positionsDue: (n: number) => `${n} domain position${n === 1 ? '' : 's'} not reviewed in 30 days`,
    thesesDue: 'Theses to check',
    nothingDue: 'Every position and thesis is current.',
    add: 'Add a note',
  },
  domains: {
    title: 'Domains',
    lead: 'The six areas we watch. Each holds our current position, the initiatives that matter and the notes behind them.',
    notes: (n: number) => `${n} note${n === 1 ? '' : 's'}`,
    noPosition: 'No position written yet.',
  },
  domain: {
    position: 'Our position',
    positionHint: 'Two or three sentences: what we believe and what it means for Qsofte and our clients.',
    reviewed: (when: string) => `Reviewed ${when}`,
    neverReviewed: 'Never reviewed',
    due: 'Due for review',
    owner: 'Owner',
    questions: 'Open questions',
    initiatives: 'Key initiatives',
    noInitiatives: 'No initiatives yet.',
    addInitiative: 'Add an initiative',
    initiativeName: 'Name',
    initiativeSummary: 'Summary',
    initiativeUrl: 'Link',
    initiativeStatus: 'Status',
    notes: 'Latest notes',
    noNotes: 'No notes in this domain yet.',
    edit: 'Edit position',
    save: 'Save position',
    stillStands: 'Still stands',
    cancel: 'Cancel',
    saved: 'Saved.',
    addNote: 'Add a note here',
    allNotes: 'All notes in this domain',
  },
  notes: {
    title: 'Notes',
    lead: 'Signals, briefs, theses, meetings and debriefs. Every one says what it means for Qsofte.',
    search: 'Search notes',
    allTypes: 'All types',
    allDomains: 'All domains',
    allRegions: 'All regions',
    none: 'No notes match. Clear the filters or add the first one.',
    add: 'Add a note',
    soWhat: 'So what for Qsofte',
  },
  note: {
    newTitle: 'New note',
    editTitle: 'Edit note',
    type: 'Type',
    headline: 'Headline',
    body: 'What happened',
    bodyHint: 'The facts, briefly. Keep client names out unless they are public.',
    soWhat: 'So what for Qsofte',
    soWhatHint: 'Required. What it means for us, our clients or our capability plan.',
    source: 'Source link',
    date: 'Date',
    domain: 'Domain',
    regions: 'Regions',
    horizon: 'Horizon',
    stance: 'Stance',
    initiatives: 'Initiatives',
    event: 'Event',
    noEvent: 'No event',
    reviewOn: 'Review on',
    reviewHint: 'When we check whether we still believe it.',
    save: 'Save note',
    saving: 'Saving…',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete note',
    confirmDelete: 'Delete this note for good?',
    confirmYes: 'Yes, delete it',
    back: 'All notes',
    by: (name: string, when: string) => `Added by ${name}, ${when}`,
  },
  events: {
    title: 'Events',
    lead: 'Where Qsofte shows up over the next twelve months, and why.',
    strip: 'Next twelve months',
    stripKey: 'Speak or host',
    usually: (m: string) => `Usually ${m}`,
    dateTbc: 'Date to confirm',
    debriefs: (n: number) => `${n} debrief${n === 1 ? '' : 's'}`,
    writeDebrief: 'Write a debrief',
    add: 'Add an event',
    edit: 'Edit',
    none: 'No events yet.',
  },
  event: {
    newTitle: 'New event',
    editTitle: 'Edit event',
    name: 'Name',
    organiser: 'Organiser',
    city: 'City',
    startsOn: 'Starts',
    endsOn: 'Ends',
    month: 'Usual month',
    monthHint: 'Used until exact dates are confirmed.',
    noMonth: 'Not known',
    level: 'How we show up',
    status: 'Status',
    why: 'Why we go',
    goal: 'Goal this time',
    goalHint: 'What would make it worth it: meetings, a talk, a lead.',
    url: 'Link',
    domains: 'Domains',
    save: 'Save event',
    cancel: 'Cancel',
    delete: 'Delete event',
    confirmDelete: 'Delete this event for good? Debriefs stay, unlinked.',
    confirmYes: 'Yes, delete it',
  },
  capabilities: {
    title: 'Capabilities',
    lead: 'Where Qsofte stands in each domain, and the proof behind it.',
    evidence: 'Proof',
    evidenceHint: 'A delivered project, a paper, a talk, trained people.',
    noEvidence: 'No proof recorded yet.',
    save: 'Save',
    level: 'Level',
  },
  account: {
    title: 'Account',
    change: 'Change password',
    current: 'Current password',
    next: 'New password',
    nextHint: 'At least 12 characters.',
    save: 'Change password',
    done: 'Password changed. Other devices are signed out.',
    everywhere: 'Sign out on every device',
  },
  notFound: { title: 'Not here', lead: 'That page does not exist in the Desk.', home: 'Back to Today' },
  errors: {
    network: 'The Desk could not reach its server. Check your connection and try again.',
    generic: 'Something went wrong on the server. Try again; if it keeps happening, check the server logs.',
  },
};
