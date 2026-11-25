// All website copy lives here, so content changes never touch layout code.
// Every factual claim has a source in docs/assessment/README.md (Product evidence)
// or docs/assessment/decisions.md. Add the source when you add a claim.
import westpac from './assets/clients/westpac.webp';
import chilliMasala from './assets/clients/chilli-masala.webp';
import adyopant from './assets/clients/adyopant-legal.webp';
import atmabodh from './assets/clients/atmabodh.webp';
import sroviLogo from './assets/srovi-logo.webp';

export const siteUrl = 'https://qsofte.com';

export const company = {
  name: 'Qsofte',
  tagline: 'A technology company that builds its own products, and builds with others.',
  email: 'admin@qsofte.com',
  phone: '+64 22 414 2956',
  phoneHref: 'tel:+64224142956',
  address: ['1 Te Hoiere Street', 'Aotea, Porirua', 'New Zealand'],
  formEndpoint: 'https://formspree.io/f/xnnaqwgz',
};

/** Every page that exists, with the metadata prerendered into its HTML. */
export type PageMeta = { title: string; description: string; noindex?: boolean };

export const pages: Record<string, PageMeta> = {
  '/': {
    title: 'Qsofte | Products that solve. Expertise that delivers.',
    description:
      'Qsofte builds Srovi, first-mile traceability for food supply chains, and Samewe, for residential communities. Qsofte Engineering builds alongside banks, merchants and public bodies.',
  },
  '/products': {
    title: 'Products | Qsofte',
    description: 'Srovi for agriculture and food supply chains, and Samewe for residential communities. Products built by Qsofte.',
  },
  '/srovi': {
    title: 'Srovi: first-mile traceability for fresh food | Qsofte',
    description:
      'Srovi records every hand-over from farm to dock on the producer’s phone, in a tamper-evident record, and gives every lot a passport buyers can check.',
  },
  '/samewe': {
    title: 'Samewe: one app for a residential community | Qsofte',
    description:
      'Samewe is a Qsofte product in development for residential societies and residents’ welfare associations: residents and flats, maintenance billing, the gate, notices and more.',
  },
  '/engineering': {
    title: 'Qsofte Engineering | Qsofte',
    description:
      'Qsofte Engineering: AI-native product engineering, payments and cards, agentic contact centres, point of sale and software testing.',
  },
  '/about': {
    title: 'About | Qsofte',
    description: 'Qsofte is a technology company that builds its own products, Srovi and Samewe, and an engineering practice that builds with others.',
  },
  '/contact': {
    title: 'Contact | Qsofte',
    description: 'Talk to Qsofte about Srovi, Samewe or Qsofte Engineering.',
  },
  '/privacy': {
    title: 'Privacy | Qsofte',
    description: 'What personal information the Qsofte website collects, why, and what you can ask us to do with it.',
  },
  '/404': {
    title: 'Page not found | Qsofte',
    description: 'This page doesn’t exist.',
    noindex: true,
  },
};

/** schema.org data prerendered as JSON-LD. Only facts that are true today:
 *  Samewe is not released, so it has none. */
export const structuredData: Record<string, object> = {
  '/': {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Qsofte',
    url: 'https://qsofte.com/',
    logo: 'https://qsofte.com/android-chrome-512x512.png',
    email: 'admin@qsofte.com',
    telephone: '+64 22 414 2956',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1 Te Hoiere Street, Aotea',
      addressLocality: 'Porirua',
      addressCountry: 'NZ',
    },
    brand: [
      { '@type': 'Brand', name: 'Srovi' },
      { '@type': 'Brand', name: 'Samewe' },
    ],
  },
  '/srovi': {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Srovi',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'First-mile traceability for fresh produce, poultry and seafood.',
    url: 'https://qsofte.com/srovi',
    publisher: { '@type': 'Organization', name: 'Qsofte', url: 'https://qsofte.com/' },
  },
};

export const nav = [
  { to: '/products', label: 'Products' },
  { to: '/engineering', label: 'Engineering' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export const a11y = {
  skipToContent: 'Skip to content',
};

export type IconName =
  | 'compass'
  | 'terminal'
  | 'devices'
  | 'pulse'
  | 'check'
  | 'bank'
  | 'card'
  | 'civic'
  | 'leaf'
  | 'scales'
  | 'pin'
  | 'truck'
  | 'box'
  | 'handshake'
  | 'qr'
  | 'spark'
  | 'headset'
  | 'home';

/* ---------------------------------------------------------------- Home */

export type Arm = { eyebrow: string; title: string; tagline: string; to: string; action: string };

export const hero = {
  title: 'Products that solve. Expertise that delivers.',
};

export const arms: Arm[] = [
  {
    eyebrow: 'Products',
    title: 'Products that solve.',
    tagline: 'Srovi for agriculture and food supply chains. Samewe for residential communities.',
    to: '/products',
    action: 'Explore our products',
  },
  {
    eyebrow: 'Qsofte Engineering',
    title: 'Expertise that delivers.',
    tagline: 'Payments and cards, agentic contact centres, and AI-native product engineering.',
    to: '/engineering',
    action: 'Qsofte Engineering',
  },
];

export const home = {
  clientsLabel: 'Trusted by',
  productsEyebrow: 'Our products',
  productsTitle: 'Two products, each built around one problem.',
  productsMore: 'All products',
  engineeringEyebrow: 'Qsofte Engineering',
  engineeringTitle: 'The same team, building with you.',
  engineeringMore: 'Qsofte Engineering',
  approachEyebrow: 'How we build',
  approachTitle: 'AI-native, from the first line.',
  approachLead:
    'AI agents write, test and review code alongside our engineers. People set the direction, own the decisions and approve every change.',
  approachMore: 'About Qsofte',
};

export const callToAction = {
  title: 'Let’s build it together.',
  text: 'Tell us about your product, your project or your community. We’ll come back with a clear next step.',
  action: 'Start a conversation',
};

/* ------------------------------------------------------------ Products */

export type ProductStatus = 'In use' | 'In development';

export type Product = {
  slug: string;
  name: string;
  sector: string;
  status: ProductStatus;
  logo?: string;
  tagline: string;
  problem: string;
  audience: string;
  to: string;
  action: string;
};

export const productsPage = {
  title: 'Products',
  lead: 'We turn problems we understand closely into products. Each is a Qsofte product with its own name, built the same AI-native way.',
  problemLabel: 'The problem',
  audienceLabel: 'Built for',
  statusLabel: 'Status',
  byline: 'A Qsofte product',
};

export const products: Product[] = [
  {
    slug: 'srovi',
    name: 'Srovi',
    sector: 'AgriTech',
    status: 'In use',
    logo: sroviLogo,
    tagline: 'First-mile traceability for fresh food.',
    problem:
      'Buyers must prove where their food came from, but the record breaks at the farm gate. Srovi captures it there, on the producer’s phone, and gives every lot a passport buyers can check.',
    audience: 'Enterprise buyers of fresh produce, poultry and seafood, and the growers and packhouses that supply them.',
    to: '/srovi',
    action: 'Discover Srovi',
  },
  {
    slug: 'samewe',
    name: 'Samewe',
    sector: 'CommunityTech',
    status: 'In development',
    tagline: 'One app for a residential community.',
    problem:
      'Running a residential society means the gate and its visitors, residents and flats, monthly maintenance bills, complaints, notices and shared spaces. Samewe brings them into one app on everyone’s phone.',
    audience: 'Residential societies and residents’ welfare associations: committees, residents and gate staff.',
    to: '/samewe',
    action: 'Discover Samewe',
  },
];

/* -------------------------------------------------------------- Samewe */

export type ModuleStatus = 'Built' | 'In progress' | 'Planned';

export const samewe = {
  byline: 'A Qsofte product',
  status: 'In development' as ProductStatus,
  title: 'Samewe',
  tagline: 'One app for a residential community.',
  lead:
    'Samewe runs a residential society from everyone’s phone: the gate and its visitors, residents and flats, maintenance billing from the society’s own rules, a helpdesk, notices and polls, amenities, domestic staff and parking.',
  audienceTitle: 'Built for',
  audience: [
    { title: 'Committees', text: 'Run maintenance billing, notices and the society’s records in one place.' },
    { title: 'Residents', text: 'See bills, raise requests, book amenities and approve visitors from a phone.' },
    { title: 'Gate staff', text: 'Log and verify visitors on a screen designed for the gate.' },
  ],
  statusTitle: 'Where Samewe is today',
  statusLead: 'Samewe is in development. Each part is planned before it is built; this is the current state of each.',
  statusNote: 'Status as of November 2026.',
  modules: [
    { name: 'Sign-in, roles and permissions', status: 'Built' as ModuleStatus },
    { name: 'Residents and flats', status: 'In progress' as ModuleStatus },
    { name: 'Maintenance billing', status: 'In progress' as ModuleStatus },
    { name: 'Visitors and the gate', status: 'Planned' as ModuleStatus },
    { name: 'Helpdesk', status: 'Planned' as ModuleStatus },
    { name: 'Notices and polls', status: 'Planned' as ModuleStatus },
    { name: 'Amenity booking', status: 'Planned' as ModuleStatus },
    { name: 'Domestic staff', status: 'Planned' as ModuleStatus },
    { name: 'Parking', status: 'Planned' as ModuleStatus },
  ],
  interestTitle: 'Run a residential community?',
  interestText: 'Register your interest and we’ll keep you updated as Samewe’s modules become available.',
  interestAction: 'Register interest',
};

/* --------------------------------------------------------- Engineering */

export type Capability = { slug: string; title: string; text: string; icon: IconName };

export const engineering = {
  eyebrow: 'Technology services',
  title: 'Qsofte Engineering',
  lead:
    'The team that builds our products also builds with others. Senior engineers, working alongside your team, using the same AI-native approach we use on Srovi and Samewe.',
  capabilitiesTitle: 'What we do',
  domainsTitle: 'Where we’ve worked',
  domainsLead: 'Banking is our home ground; we also work in payments, the public sector, agriculture and law.',
  clientsLabel: 'Clients have included',
  approachTitle: 'How we work with you',
};

export const capabilities: Capability[] = [
  {
    slug: 'payments',
    title: 'Payments and cards',
    text: 'Our most established area: payment and card journeys for banks and merchants, from design and delivery to testing and point-of-sale integration.',
    icon: 'card',
  },
  {
    slug: 'contact-centre',
    title: 'Agentic contact centre as a service',
    text: 'AI agents that answer customers’ calls and messages, resolve routine requests and hand over to your people when it matters, run for you as a service.',
    icon: 'headset',
  },
  {
    slug: 'ai-native',
    title: 'AI-native product engineering',
    text: 'New products built the way we build our own: written plans, AI agents in the delivery team, senior engineers accountable, and automated guardrails on every change.',
    icon: 'spark',
  },
  {
    slug: 'point-of-sale',
    title: 'Point of sale',
    text: 'We established and deployed the point-of-sale system for Chilli Masala, a restaurant chain.',
    icon: 'terminal',
  },
  {
    slug: 'testing',
    title: 'Software testing',
    text: 'Manual and automated testing, including behaviour-driven test suites, so problems are found before your customers find them.',
    icon: 'check',
  },
];

export const domains: { name: string; note?: string }[] = [
  { name: 'Banking', note: 'Westpac' },
  { name: 'Payments and cards', note: 'Chilli Masala' },
  { name: 'Public sector' },
  { name: 'Agriculture', note: 'Srovi' },
  { name: 'Legal', note: 'Adyopant Legal' },
];

export const process = [
  { title: 'Discover', text: 'We get to know your business, your users and what success looks like to you.' },
  { title: 'Plan', text: 'Together we agree the outcome, scope, cost and timeline, and write it down.' },
  { title: 'Build', text: 'AI-native, in short cycles, so you see working software every week.' },
  { title: 'Support', text: 'We stay with you after launch, keeping things running and improving.' },
];

/* --------------------------------------------------------------- About */

export const about = {
  title: 'About Qsofte',
  lead:
    'Qsofte is a technology company. We build our own products for problems we understand closely, and through Qsofte Engineering we build with others.',
  brandsTitle: 'One company, three names',
  brands: [
    { name: 'Qsofte', role: 'The parent company', text: 'Technology and product development.' },
    { name: 'Srovi', role: 'AgriTech', text: 'Agricultural operations, supply chains and traceability.', to: '/srovi' },
    { name: 'Samewe', role: 'CommunityTech', text: 'Residential communities and residents’ welfare associations.', to: '/samewe' },
    { name: 'Qsofte Engineering', role: 'Technology services', text: 'Product engineering and enterprise technology.', to: '/engineering' },
  ],
  approachTitle: 'How we build',
  valuesTitle: 'What you can expect',
  whereTitle: 'Where we are',
  whereText: 'Qsofte is based in New Zealand and works with clients and partners internationally.',
};

export const aiPrinciples = [
  {
    title: 'Intent before code',
    text: 'Every feature starts as a short written plan. Agents build from it, and automated checks keep the plan and the code in step.',
  },
  {
    title: 'Agents build, people decide',
    text: 'AI agents write, test and review. Senior engineers set direction, review every change and remain accountable for it.',
  },
  {
    title: 'Rules become checks',
    text: 'Business rules, security and design standards are written as automated guards that run on every change.',
  },
  {
    title: 'Always ready to ship',
    text: 'An automated path from commit to production, with the live system verified after every release.',
  },
];

export const values = [
  {
    title: 'A senior team, hands on',
    text: 'You work directly with the people who design and build your software.',
  },
  {
    title: 'Built to last',
    text: 'Tested, documented and automated, so your software stays easy to run and change.',
  },
  {
    title: 'Straight talking',
    text: 'Honest advice, transparent pricing and no surprises.',
  },
];

/* ------------------------------------------------------------- Contact */

export const topics = [
  { value: 'general', label: 'General enquiry' },
  { value: 'srovi', label: 'Srovi' },
  { value: 'samewe', label: 'Samewe: register interest' },
  { value: 'engineering', label: 'Qsofte Engineering' },
];

export const contactPage = {
  title: 'Let’s talk.',
  lead: 'Tell us what you’re working on. A senior member of the team will reply.',
  formLabel: 'Contact form',
  fields: {
    topic: 'What is it about?',
    name: 'Name',
    email: 'Email',
    phone: 'Phone (optional)',
    company: 'Company or community (optional)',
    message: 'How can we help?',
  },
  honeypot: 'Leave this field empty',
  submit: 'Send message',
  sending: 'Sending…',
  sentTitle: 'Thank you.',
  sentText: 'Your message is on its way. We’ll be in touch soon.',
  error: 'Something went wrong and your message was not sent. Please email us at',
  privacyNote: 'We use what you send only to reply to you.',
  privacyLink: 'How we handle your information',
  labels: { email: 'Email', phone: 'Phone', office: 'Office' },
};

/* ------------------------------------------------------------- Privacy */

export const privacy = {
  title: 'Privacy',
  updated: 'Last updated 25 November 2026',
  sections: [
    {
      heading: 'What we collect',
      body: [
        'When you use the contact form we receive the topic you choose, your name, email address, message, and your phone number and organisation if you give them.',
        'Our web server keeps standard access logs (IP address, page requested, time and browser) for security and troubleshooting. They are rotated automatically.',
        'This website does not use cookies, analytics or advertising trackers.',
      ],
    },
    {
      heading: 'Why we collect it',
      body: ['We use what you send only to reply to your enquiry and to follow up on it. We do not sell it or use it for marketing lists.'],
    },
    {
      heading: 'Who processes it',
      body: [
        'Contact form submissions are delivered to us by Formspree, a form service, which processes them on our behalf under its own privacy policy (formspree.io).',
      ],
    },
    {
      heading: 'How long we keep it',
      body: ['We keep enquiries for as long as we need them to respond and follow up, and delete them when you ask us to.'],
    },
    {
      heading: 'Your rights',
      body: [
        'Qsofte is based in New Zealand, and we handle personal information in line with the New Zealand Privacy Act 2020. You can ask to see or correct the information we hold about you, or ask us to delete it, by emailing us.',
      ],
    },
  ],
  contactLabel: 'Privacy questions:',
};

/* -------------------------------------------------------------- Shared */

export const notFound = {
  title: 'This page doesn’t exist.',
  text: 'It may have moved, or the link may be out of date.',
  action: 'Back to home',
};

export const footer = {
  blurb: 'Products that solve. Expertise that delivers.',
  productsHeading: 'Products',
  companyHeading: 'Company',
  privacy: 'Privacy',
  rights: 'All rights reserved.',
};

export const clients = [
  { name: 'Westpac', logo: westpac, width: 212, height: 40 },
  { name: 'Chilli Masala', logo: chilliMasala, width: 90, height: 40 },
  { name: 'Adyopant Legal', logo: adyopant, width: 102, height: 40 },
  { name: 'Atmabodh', logo: atmabodh, width: 152, height: 40 },
];

export const srovi = {
  logo: sroviLogo,
  logoAlt: 'Srovi',
  byline: 'A Qsofte product',
  status: 'In use',
  helper: 'First-mile traceability for fresh produce, poultry and seafood.',
  title: 'Trust at the first mile.',
  tagline: 'From source to verified, for enterprise food buyers.',
  lead: 'Buyers are asked to prove where their food came from. The proof breaks at the first mile, where nothing is recorded. Srovi records it there, on the producer’s phone, in a form no one can rewrite, and hands every lot a passport the buyer can check.',
  clientsLabel: 'Clients',
  clients: ['Blinkit', 'Flipkart', 'Proven in exports'],
  problemTitle: 'The record breaks at the first mile.',
  problems: [
    { title: 'Blind recalls', text: 'One failure, everything withdrawn.' },
    { title: 'Unproven premiums', text: 'Claims that cannot be evidenced are discounted.' },
    { title: 'Lost margin', text: 'Weight and grade vanish between source and dock.' },
    { title: 'Excluded growers', text: 'Smallholders who cannot evidence practice are dropped.' },
    { title: 'Stalled programmes', text: 'Tools built for a desk never reach the farm.' },
  ],
  journeyTitle: 'Every hand-over, recorded.',
  journey: [
    { title: 'At source', text: 'Weighed, tagged, located, checked.', icon: 'pin' as IconName },
    { title: 'On the road', text: 'Dispatched, received, reweighed.', icon: 'truck' as IconName },
    { title: 'At the packhouse', text: 'Graded; every kilogram accounted for.', icon: 'box' as IconName },
    { title: 'At the dock', text: 'Signed for at both ends.', icon: 'handshake' as IconName },
    { title: 'On the shelf', text: 'One scan shows the whole journey.', icon: 'qr' as IconName },
  ],
  principles: ['Scan, don’t trust', 'Private by design', 'A standard inside'],
  passport: {
    label: 'Product passport',
    rows: [
      ['Product', 'Mango · Grade A'],
      ['Origin', 'Ratnagiri, Maharashtra'],
      ['Harvested', 'Weighed and tagged at source'],
      ['Quality', 'Brix 18 · 280 g'],
    ],
    badge: 'Srovi verified',
    caption: 'An example passport',
  },
  valueTitle: 'Five pools of value. Several pay back in the first season.',
  valueNote: 'Impact and payback are indicative, and sized on your own data during the diagnostic.',
  value: [
    { pool: 'Protect revenue', items: [['Surgical recall', 'High · First season'], ['Brand trust', 'Medium · Year 1']] },
    { pool: 'Grow revenue', items: [['Provable premium', 'High · Year 1'], ['Market access', 'Medium · Year 1']] },
    { pool: 'Reduce cost to serve', items: [['Shrinkage and mass balance', 'High · First season'], ['Disputes and rejections', 'Medium · First season']] },
    { pool: 'Compliance by design', items: [['Residue control at source', 'High · First season'], ['Audit readiness', 'Medium · Year 1']] },
    { pool: 'Secure the supply base', items: [['Inclusive, verified supply base', 'High · Year 2+'], ['Supply visibility', 'Medium · Year 1']] },
  ],
  builtTitle: 'Built for the farm gate',
  built: [
    'A phone, not a terminal',
    'Any scale they already own',
    'WhatsApp, not another inbox',
    'No account for the counterparty',
    'Every kind of source',
    'Warn, record, review',
  ],
  proofTitle: 'Why buyers trust it',
  proof: ['A real operation', 'Leading buyers', 'Tamper evidence', 'Open standard', 'Partner ledger', 'Built for audit'],
  useCasesTitle: 'Use cases',
  useCases: ['Fruit', 'Fishery', 'Eggs', 'Mushrooms', 'Poultry', 'Dairy', 'Honey'],
  pathTitle: 'How it starts',
  path: [
    { title: 'Diagnose', when: '4–6 weeks' },
    { title: 'Pilot', when: 'One season' },
    { title: 'Scale', when: 'Year 1–2' },
  ],
  askTitle: 'Start with one sourcing region.',
  askText: 'A short diagnostic sizes the value on your own data. Then we prove it with a one-season pilot.',
  askAction: 'Book a diagnostic',
};
