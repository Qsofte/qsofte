import type { ServiceIcon } from '../content';

// One family of glyphs: 24px grid, 1.5 stroke, round caps, currentColor.
// Add new icons here in the same style; never use emoji or raster icons.
const paths: Record<ServiceIcon, JSX.Element> = {
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
};

export default function Icon({ name, size = 28 }: { name: ServiceIcon; size?: number }) {
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
