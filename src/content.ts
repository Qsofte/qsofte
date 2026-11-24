// All website copy lives here, so content changes never touch layout code.
import westpac from './assets/clients/westpac.webp';
import chilliMasala from './assets/clients/chilli-masala.webp';
import adyopant from './assets/clients/adyopant-legal.webp';
import atmabodh from './assets/clients/atmabodh.webp';

export const company = {
  name: 'Qsofte',
  tagline: 'Software & technology partner',
  email: 'admin@qsofte.com',
  phone: '+64 22 414 2956',
  phoneHref: 'tel:+64224142956',
  address: ['1 Te Hoiere Street', 'Aotea, Porirua', 'New Zealand'],
  formEndpoint: 'https://formspree.io/f/xnnaqwgz',
};

export const hero = {
  eyebrow: 'Qsofte · Porirua, New Zealand',
  title: 'Software, thoughtfully made.',
  lead:
    'A product company and a consultancy in one. We build Srovi, first-mile traceability for food supply chains, and we design, build and test software for banks, payments, the public sector, agriculture and law.',
  primary: 'Start a conversation',
  secondary: 'Explore services',
};

export const home = {
  clientsLabel: 'Trusted by',
  armsEyebrow: 'Two ways to work with us',
  armsTitle: 'A product arm and a services arm.',
  domainsEyebrow: 'Where we work',
  domainsTitle: 'Deep in banking. Specialists where it matters.',
  domainsMore: 'Explore industries',
  workEyebrow: 'Selected work',
  workTitle: 'Built, shipped and running.',
  servicesEyebrow: 'What we do',
  servicesTitle: 'Everything your software needs. Nothing it doesn’t.',
  valuesEyebrow: 'Why Qsofte',
  valuesTitle: 'Simple to work with. Built to last.',
  processEyebrow: 'How we work',
  processTitle: 'Four steps. No surprises.',
  more: 'Learn more',
};

export const servicesPage = {
  title: 'Consultancy & services',
  lead: 'Choose one service or bring us in end to end. Either way, you get a senior team that cares about the outcome.',
};

export const contactPage = {
  title: 'Let’s talk.',
  lead: 'Tell us a little about your project and we’ll get back to you.',
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
  title: 'Have something in mind?',
  text: 'Tell us what you’re trying to achieve. We’ll come back with ideas and next steps.',
  action: 'Start a conversation',
};

export const notFound = {
  title: 'This page doesn’t exist.',
  text: 'It may have moved.',
  action: 'Back to home',
};

export const footer = {
  blurb: 'Software and technology partner, based in Porirua, New Zealand.',
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
  | 'qr';
export type ServiceIcon = IconName;

export type Arm = { eyebrow: string; title: string; text: string; to: string; action: string };

export const arms: Arm[] = [
  {
    eyebrow: 'Product',
    title: 'Srovi',
    text: 'Trust at the first mile. Traceability that starts on the producer’s phone and ends in a passport the buyer can check.',
    to: '/srovi',
    action: 'Discover Srovi',
  },
  {
    eyebrow: 'Consultancy & services',
    title: 'Senior teams, end to end',
    text: 'Technology consultancy, product engineering, POS, OpenEMR and software testing, delivered by people who have done it before.',
    to: '/services',
    action: 'Explore services',
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
  lead: 'Banking is our home ground. Around it we have built specialist depth where software has to be right: money, government, food and law.',
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
    summary: 'Payment journeys and card programmes that have to work every time, at the till and online.',
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
    summary: 'Services citizens can rely on: accessible, secure and built to last beyond a single programme.',
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
    summary: 'Software that works at the farm gate, on a phone, in the field, and stands up to an enterprise buyer’s audit.',
    points: [
      'First-mile traceability and product passports',
      'Harvest, packhouse and dispatch operations',
      'Weighing, grading and mass balance',
      'Built for patchy connectivity and any scale',
    ],
    proof: 'We build Srovi, used by Blinkit and Flipkart',
    icon: 'leaf',
  },
  {
    slug: 'legal',
    title: 'Legal',
    summary: 'Practical technology for law firms: secure, simple to use, and respectful of client confidentiality.',
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
    text: 'We established and deployed the point-of-sale system for Chilli Masala, a large restaurant chain.',
    points: ['Established the POS platform', 'Deployed across the chain'],
    to: '/services#retail-pos',
    action: 'Retail POS',
  },
  {
    client: 'Srovi',
    title: 'Traceability from source to shelf',
    text: 'Our own product: every hand-over from farm to dock recorded on a phone, in a form no one can rewrite. Used by Blinkit and Flipkart, and proven in exports.',
    points: ['Fresh produce, poultry and seafood', 'Product passport for every lot', 'Works with any scale and WhatsApp', 'Built for audit'],
    to: '/srovi',
    action: 'Discover Srovi',
  },
];

export const srovi = {
  eyebrow: 'Srovi · A Qsofte product',
  title: 'Trust at the first mile.',
  tagline: 'From source to verified. For enterprise buyers of fresh produce, poultry and seafood.',
  lead: 'Buyers are asked to prove where their food came from. The proof breaks at the first mile, where nothing is recorded. Srovi records it there, on the producer’s phone, in a form no one can rewrite, and hands every lot a passport the buyer can check.',
  clientsLabel: 'Clients',
  clients: ['Blinkit', 'Flipkart', 'Proven in exports'],
  problemTitle: 'The first mile is where the record breaks.',
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
  valueNote: 'Indicative; sized on the buyer’s own data in the diagnostic.',
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
  proofTitle: 'Proof',
  proof: ['A real operation', 'Leading buyers', 'Tamper evidence', 'Open standard', 'Partner ledger', 'Built for audit'],
  useCasesTitle: 'Use cases',
  useCases: ['Fruit', 'Fishery', 'Eggs', 'Mushrooms', 'Poultry', 'Dairy', 'Honey'],
  pathTitle: 'How we start',
  path: [
    { title: 'Diagnose', when: '4–6 weeks' },
    { title: 'Pilot', when: 'One season' },
    { title: 'Scale', when: 'Year 1–2' },
  ],
  askTitle: 'The ask: a diagnostic on one sourcing region.',
  askText: 'We size the value on your own data, then pilot for one season.',
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
    slug: 'consultancy',
    title: 'Technology Consultancy',
    summary:
      'Clear, practical advice before you commit budget. We help you choose the right platforms, untangle legacy systems and plan a roadmap your team can deliver.',
    points: [
      'Technology roadmaps and platform selection',
      'Process reviews and automation opportunities',
      'Architecture, security and cloud reviews',
      'Hands-on guidance all the way through delivery',
    ],
    icon: 'compass',
  },
  {
    slug: 'retail-pos',
    title: 'Retail POS Solutions',
    summary:
      'Point-of-sale systems that keep up with a busy floor, from a single boutique to a restaurant chain. We established and deployed POS across the Chilli Masala chain.',
    points: [
      'Fast, reliable checkout your staff will enjoy using',
      'Real-time inventory across every store',
      'Integrations with payments, accounting and e-commerce',
      'Scales with you as you open new locations',
    ],
    icon: 'terminal',
  },
  {
    slug: 'web-and-apps',
    title: 'Website & App Development',
    summary:
      'Custom websites, e-commerce and mobile apps that look great, load fast and turn visitors into customers.',
    points: [
      'Corporate websites and online stores',
      'Web and mobile applications',
      'Performance, accessibility and SEO built in',
      'Hosting, monitoring and ongoing support',
    ],
    icon: 'devices',
  },
  {
    slug: 'openemr',
    title: 'OpenEMR Solutions',
    summary:
      'Electronic medical records tailored to how your practice actually works, so clinicians spend less time on screens and more with patients.',
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
    title: 'Software Testing & QA',
    summary:
      'Ship with confidence. We find the problems before your users do, with rigorous manual and automated testing.',
    points: [
      'Functional and regression testing',
      'Automated end-to-end test suites',
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
  { title: 'Discover', text: 'We learn your business, your users and what success looks like.' },
  { title: 'Design', text: 'We shape the solution with you, with clear scope, cost and timeline.' },
  { title: 'Build', text: 'Short, visible iterations so you see progress every week.' },
  { title: 'Support', text: 'We stay on after launch to keep things running and improving.' },
];

export const values = [
  {
    title: 'Senior, hands-on team',
    text: 'You work directly with the people who design and build your solution.',
  },
  {
    title: 'Built to last',
    text: 'Tested, documented and automated, so your software is easy to run and change.',
  },
  {
    title: 'Straight talking',
    text: 'Honest advice, transparent pricing and no surprises along the way.',
  },
];
