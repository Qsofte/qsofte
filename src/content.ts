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
    'We design, build and look after software for retailers, healthcare practices and growing businesses, from the first conversation to launch and beyond.',
  primary: 'Start a conversation',
  secondary: 'Explore services',
};

export const home = {
  clientsLabel: 'Trusted by',
  servicesEyebrow: 'What we do',
  servicesTitle: 'Everything your software needs. Nothing it doesn’t.',
  valuesEyebrow: 'Why Qsofte',
  valuesTitle: 'Simple to work with. Built to last.',
  processEyebrow: 'How we work',
  processTitle: 'Four steps. No surprises.',
  more: 'Learn more',
};

export const servicesPage = {
  title: 'Services',
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
  servicesHeading: 'Services',
  companyHeading: 'Company',
  rights: 'All rights reserved.',
};

export const a11y = {
  skipToContent: 'Skip to content',
};

export const nav = [
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
];

export type ServiceIcon = 'compass' | 'terminal' | 'devices' | 'pulse' | 'check';

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
      'Point-of-sale systems that keep up with a busy shop floor, from a single boutique to a multi-store chain.',
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
