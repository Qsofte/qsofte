// All website copy lives here, so content changes never touch layout code.
import westpac from './assets/clients/westpac.webp';
import chilliMasala from './assets/clients/chilli-masala.webp';
import adyopant from './assets/clients/adyopant-legal.webp';
import atmabodh from './assets/clients/atmabodh.webp';
import sroviLogo from './assets/srovi-logo.webp';

export const company = {
  name: 'Qsofte',
  tagline: 'Product development and services & consulting',
  email: 'admin@qsofte.com',
  phone: '+64 22 414 2956',
  phoneHref: 'tel:+64224142956',
  address: ['1 Te Hoiere Street', 'Aotea, Porirua', 'New Zealand'],
  formEndpoint: 'https://formspree.io/f/xnnaqwgz',
};

export const hero = {
  eyebrow: 'Product development · Services & consulting',
  title: 'Software, thoughtfully made.',
  lead:
    'We build our own products, starting with Srovi for agriculture, and we partner with teams in banking, payments, government and law to deliver theirs. AI-native from the first line, with senior engineers accountable at every step.',
  primary: 'Start a conversation',
  secondary: 'See how we build',
};

export const home = {
  clientsLabel: 'Trusted by',
  armsEyebrow: 'What we do',
  armsTitle: 'Two lines of business. One standard of craft.',
  aiEyebrow: 'How we build',
  aiTitle: 'AI-native, from the first line.',
  aiLead:
    'AI agents write, test and review code alongside our engineers. People set the direction, own the decisions and approve every change. You get the speed of AI with the judgement of a senior team.',
  aiExampleLabel: 'Example',
  aiExampleTitle: 'Srovi is built this way.',
  aiExampleText:
    'Our traceability product was built AI-native from day one: every feature planned before it was coded, every business rule enforced by an automated check, every release verified before it reached a farm or a buyer.',
  aiExampleAction: 'Discover Srovi',
  domainsEyebrow: 'Where we work',
  domainsTitle: 'At home in banking. Specialists where it counts.',
  domainsMore: 'Explore industries',
  workEyebrow: 'Selected work',
  workTitle: 'Built, shipped and in use.',
  servicesEyebrow: 'What we do',
  servicesTitle: 'Everything your software needs. Nothing it doesn’t.',
  valuesEyebrow: 'Why Qsofte',
  valuesTitle: 'Easy to work with. Built to last.',
  processEyebrow: 'How we work',
  processTitle: 'Four steps. No surprises.',
  more: 'Learn more',
};

export const servicesPage = {
  title: 'Services & consulting',
  lead: 'We partner with your team, for a single piece of work or the whole journey from strategy to launch. You work with senior people who own the outcome alongside you.',
};

export const contactPage = {
  title: 'Let’s talk.',
  lead: 'Tell us what you’re working on. A senior member of the team will reply.',
  formLabel: 'Contact form',
  fields: {
    name: 'Name',
    email: 'Email',
    phone: 'Phone (optional)',
    company: 'Company (optional)',
    message: 'How can we help?',
  },
  submit: 'Send message',
  sending: 'Sending…',
  sentTitle: 'Thank you.',
  sentText: 'Your message is on its way. We’ll be in touch soon.',
  error: 'Something went wrong. Please email us at',
  labels: { email: 'Email', phone: 'Phone', office: 'Office' },
};

export const callToAction = {
  title: 'Let’s build it together.',
  text: 'Tell us what you want to achieve. We’ll come back with a clear view of how to get there.',
  action: 'Start a conversation',
};

export const notFound = {
  title: 'This page doesn’t exist.',
  text: 'It may have moved, or the link may be out of date.',
  action: 'Back to home',
};

export const footer = {
  blurb: 'We build products like Srovi, and partner with teams to deliver theirs.',
  productHeading: 'Product',
  industriesHeading: 'Industries',
  servicesHeading: 'Services',
  companyHeading: 'Company',
  rights: 'All rights reserved.',
};

export const a11y = {
  skipToContent: 'Skip to content',
};

export const nav = [
  { to: '/srovi', label: 'Srovi' },
  { to: '/services', label: 'Services' },
  { to: '/industries', label: 'Industries' },
  { to: '/contact', label: 'Contact' },
];

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
  | 'spark';
export type ServiceIcon = IconName;

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
    text: 'Business rules, security and design standards are written as automated guards that run on every change, so speed never costs quality.',
  },
  {
    title: 'Always ready to ship',
    text: 'An automated path from commit to production, with the live system verified after every release.',
  },
];

export type Arm = { eyebrow: string; title: string; tagline: string; text: string; to: string; action: string };

export const arms: Arm[] = [
  {
    eyebrow: 'Product development · AgriTech',
    title: 'Srovi',
    tagline: 'First-mile traceability for fresh food.',
    text: 'Buyers must prove where their food came from, but the record breaks at the farm gate. Srovi captures it there, on the producer’s phone, and gives every lot a passport buyers can check.',
    to: '/srovi',
    action: 'Discover Srovi',
  },
  {
    eyebrow: 'Services & consulting',
    title: 'Partnering with you',
    tagline: 'Senior teams, working alongside yours.',
    text: 'From strategy to launch and beyond: technology consulting, AI-native product engineering, point of sale, OpenEMR and quality engineering.',
    to: '/services',
    action: 'Partner with us',
  },
];

export type Domain = {
  slug: string;
  title: string;
  summary: string;
  points: string[];
  proof?: string;
  icon: IconName;
};

export const industriesPage = {
  title: 'Industries',
  lead: 'Banking is our home ground. Around it, we have built specialist depth wherever software has to be right first time: money, government, food and law.',
  keyLabel: 'Key domain',
  specialityLabel: 'Speciality',
};

export const domains: Domain[] = [
  {
    slug: 'banking',
    title: 'Banking',
    summary:
      'Delivery, quality engineering and modernisation for banking platforms, where reliability, security and regulation come first.',
    points: [
      'Core and digital banking delivery',
      'Test strategy, automation and regression at scale',
      'Integration across legacy and modern platforms',
      'Security, audit and regulatory readiness',
    ],
    proof: 'Trusted by Westpac',
    icon: 'bank',
  },
  {
    slug: 'payments-and-cards',
    title: 'Payments & Cards',
    summary: 'Payment journeys and card programmes that must work every time, at the counter and online.',
    points: [
      'Card and payment flow design and testing',
      'Payment gateway and terminal integration',
      'Point-of-sale payments for retail and hospitality',
      'Reconciliation and settlement reporting',
    ],
    proof: 'Point of sale deployed across the Chilli Masala chain',
    icon: 'card',
  },
  {
    slug: 'public-sector',
    title: 'Public Sector',
    summary: 'Public services people can rely on: accessible, secure and built to outlast any single programme.',
    points: [
      'Accessible, inclusive digital services',
      'Secure handling of personal information',
      'Modernisation of legacy systems',
      'Assurance and independent testing',
    ],
    icon: 'civic',
  },
  {
    slug: 'agritech',
    title: 'AgriTech',
    summary: 'Software that works at the farm gate, on a phone in the field, and still stands up to an enterprise buyer’s audit.',
    points: [
      'First-mile traceability and product passports',
      'Harvest, packhouse and dispatch operations',
      'Weighing, grading and mass balance',
      'Designed for patchy connectivity and any weighing scale',
    ],
    proof: 'Home of Srovi, used by Blinkit and Flipkart',
    icon: 'leaf',
  },
  {
    slug: 'legal',
    title: 'Legal',
    summary: 'Practical technology for law firms: secure, simple to use, and built around client confidentiality.',
    points: [
      'Practice and matter management',
      'Secure document handling and client portals',
      'Websites that build trust',
      'Workflow automation for routine tasks',
    ],
    proof: 'Trusted by Adyopant Legal',
    icon: 'scales',
  },
];

export type CaseStudy = { client: string; title: string; text: string; points: string[]; to: string; action: string };

export const work: CaseStudy[] = [
  {
    client: 'Chilli Masala',
    title: 'Point of sale for a large restaurant chain',
    text: 'We established and deployed the point-of-sale system that runs service across the Chilli Masala restaurant chain.',
    points: ['Established the POS platform', 'Deployed across the chain'],
    to: '/services#retail-pos',
    action: 'Point of sale',
  },
  {
    client: 'Srovi',
    title: 'Traceability from source to shelf',
    text: 'Our own product, built AI-native: every hand-over from farm to dock recorded on a phone, in a form no one can rewrite. Used by Blinkit and Flipkart, and proven in exports.',
    points: ['Fresh produce, poultry and seafood', 'A passport for every lot', 'Works with any scale and WhatsApp', 'Built for audit'],
    to: '/srovi',
    action: 'Discover Srovi',
  },
];

export const srovi = {
  logo: sroviLogo,
  logoAlt: 'Srovi',
  byline: 'A Qsofte product',
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
export type Service = {
  slug: string;
  title: string;
  summary: string;
  points: string[];
  icon: ServiceIcon;
};

export const services: Service[] = [
  {
    slug: 'ai-native',
    title: 'AI-native product engineering',
    summary:
      'We build your product the way we build our own: AI agents in the delivery team, senior engineers in charge, and automated guardrails on every change. Srovi is the proof.',
    points: [
      'AI agents that write, test and review, under senior engineers',
      'Plans that stay true to the code',
      'Business and design rules enforced on every change',
      'Helping your team adopt AI-native delivery safely',
    ],
    icon: 'spark',
  },
  {
    slug: 'consultancy',
    title: 'Technology consultancy',
    summary:
      'Clear, practical advice before you commit budget. We help you choose the right platforms, untangle legacy systems and plan a roadmap your team can deliver.',
    points: [
      'Technology roadmaps and platform selection',
      'Process reviews and automation opportunities',
      'Architecture, security and cloud reviews',
      'AI adoption strategy, with the controls to match',
    ],
    icon: 'compass',
  },
  {
    slug: 'retail-pos',
    title: 'Point of sale',
    summary:
      'Point-of-sale systems that keep pace with a busy floor, from a single store to a restaurant chain. We established and deployed POS across the Chilli Masala chain.',
    points: [
      'Fast, dependable checkout',
      'Stock and sales visible across every site',
      'Integration with payments, accounting and e-commerce',
      'Room to grow as you open new locations',
    ],
    icon: 'terminal',
  },
  {
    slug: 'web-and-apps',
    title: 'Web and app development',
    summary:
      'Websites, online stores and mobile apps that are fast, accessible and easy to use, and that turn visitors into customers.',
    points: [
      'Corporate websites and online stores',
      'Web and mobile applications',
      'Performance, accessibility and search built in',
      'Hosting, monitoring and ongoing support',
    ],
    icon: 'devices',
  },
  {
    slug: 'openemr',
    title: 'OpenEMR for healthcare',
    summary:
      'Electronic medical records shaped around how your practice really works, so clinicians spend less time on screens and more with patients.',
    points: [
      'OpenEMR setup, customisation and data migration',
      'Workflows designed around your clinicians',
      'Secure, compliant handling of patient information',
      'Staff training and ongoing support',
    ],
    icon: 'pulse',
  },
  {
    slug: 'testing',
    title: 'Quality engineering',
    summary:
      'Release with confidence. We find problems before your users do, with rigorous manual, automated and AI-assisted testing.',
    points: [
      'Functional and regression testing',
      'Automated end-to-end suites',
      'Performance and security testing',
      'Usability and accessibility reviews',
    ],
    icon: 'check',
  },
];

export const clients = [
  { name: 'Westpac', logo: westpac },
  { name: 'Chilli Masala', logo: chilliMasala },
  { name: 'Adyopant Legal', logo: adyopant },
  { name: 'Atmabodh', logo: atmabodh },
];

export const process = [
  { title: 'Discover', text: 'We get to know your business, your users and what success looks like to you.' },
  { title: 'Plan', text: 'Together we agree the outcome, scope, cost and timeline, and write it down.' },
  { title: 'Build', text: 'AI-native, in short cycles, so you see working software every week.' },
  { title: 'Support', text: 'We stay with you after launch, keeping things running and improving.' },
];

export const values = [
  {
    title: 'A senior team, hands on',
    text: 'You work directly with the people who design and build your software, not a layer of account managers.',
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
