// All website copy lives here, so content changes never touch layout code.
import consultancy from './assets/services/consultancy.webp';
import pos from './assets/services/pos.webp';
import webdev from './assets/services/webdevelopment.webp';
import openemr from './assets/services/openemr.webp';
import testing from './assets/services/testing.webp';
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
  eyebrow: 'Software & technology partner · Porirua, New Zealand',
  title: 'Technology that works as hard as your business.',
  lead:
    'Qsofte designs, builds and supports software for retailers, healthcare practices and growing businesses, from the first strategy conversation through launch and beyond.',
};

export type Service = {
  slug: string;
  title: string;
  summary: string;
  points: string[];
  image: string;
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
    image: consultancy,
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
    image: pos,
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
    image: webdev,
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
    image: openemr,
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
    image: testing,
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
