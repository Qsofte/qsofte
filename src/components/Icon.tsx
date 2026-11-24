import type { IconName } from '../content';

// One family of glyphs: 24px grid, 1.5 stroke, round caps, currentColor.
// Add new icons here in the same style; never use emoji or raster icons.
const paths: Record<IconName, JSX.Element> = {
  // Consultancy: a compass, direction before effort
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  // Retail POS: a terminal with its receipt
  terminal: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8.5 7h7M8.5 10.5h7" />
      <circle cx="9" cy="15" r=".6" />
      <circle cx="12" cy="15" r=".6" />
      <circle cx="15" cy="15" r=".6" />
      <circle cx="9" cy="18" r=".6" />
      <circle cx="12" cy="18" r=".6" />
      <circle cx="15" cy="18" r=".6" />
    </>
  ),
  // Web & apps: a browser window and a phone
  devices: (
    <>
      <rect x="2.5" y="4" width="15" height="11" rx="2" />
      <path d="M2.5 7.5h15" />
      <rect x="15" y="9" width="6.5" height="11" rx="1.5" />
      <path d="M17.5 17.5h1.5" />
    </>
  ),
  // OpenEMR: a heartbeat
  pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  // Testing: a check in a circle
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.7 2.7L16 9.8" />
    </>
  ),
  // Banking: a classical building
  bank: (
    <>
      <path d="M3 9.5L12 4l9 5.5" />
      <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
      <path d="M3 20.5h18" />
    </>
  ),
  // Payments & cards: a card
  card: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 10h19M6 15h4" />
    </>
  ),
  // Public sector: a civic building with a flag
  civic: (
    <>
      <path d="M4 20.5h16M5.5 20.5v-8h13v8M12 12.5V6" />
      <path d="M12 3.5h4.5l-1 1.25 1 1.25H12" />
      <path d="M9 20.5v-4h6v4" />
    </>
  ),
  // AgriTech: a leaf
  leaf: (
    <>
      <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" />
      <path d="M5 19l7-7" />
    </>
  ),
  // Legal: scales
  scales: (
    <>
      <path d="M12 4v16M8 20.5h8M5 7h14" />
      <path d="M5 7l-2.5 6a2.5 2.5 0 005 0L5 7zM19 7l-2.5 6a2.5 2.5 0 005 0L19 7z" />
    </>
  ),
  // Journey: at source
  pin: (
    <>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.25" />
    </>
  ),
  // Journey: on the road
  truck: (
    <>
      <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" />
      <circle cx="6.5" cy="17.5" r="1.75" />
      <circle cx="17" cy="17.5" r="1.75" />
    </>
  ),
  // Journey: at the packhouse
  box: (
    <>
      <path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z" />
      <path d="M3.5 7.5L12 11.5l8.5-4M12 11.5v9" />
    </>
  ),
  // Journey: at the dock, signed for at both ends
  handshake: (
    <>
      <path d="M4 15.5l4.5-4.5 3 1.5 3.5-3.5 5 5" />
      <path d="M2.5 13.5l3 3M21.5 13.5l-3 3M9 17.5l1.5 1.5M12 16.5l1.5 1.5" />
    </>
  ),
  // Journey: on the shelf, one scan
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
      <path d="M14 14h2.5v2.5H14zM18.5 18.5h2v2h-2zM18.5 14h2M14 18.5v2" />
    </>
  ),
};

export default function Icon({ name, size = 28 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
