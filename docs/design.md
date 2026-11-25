# Design

Inspired by the principles associated with Jony Ive, Apple, Linear and Stripe:
**simplicity, clarity, deference.** The content is the interface; the design steps
back so it can be read. These are references, not templates.

## Principles

1. **Type does the work.** Large, tightly tracked headlines; one system font
   (SF Pro on Apple devices). Hierarchy comes from size and weight, not colour or boxes.
2. **Space is a material.** Generous section spacing (`--section`), an 8px grid
   (`--space-1…10`), and a readable line length (`--measure`).
3. **Ink on white, one quiet accent.** Navy ink (`--ink`, `--ink-2`, `--ink-3`) on
   white and soft greys (`--surface-2/3`). Mint (`--accent`) only for focus rings.
4. **Flat and precise.** Hairlines (`--border`) and quiet surfaces separate things.
   No shadows, no gradients.
5. **One thing to do.** At most one primary button (`btn--primary`) per view;
   everything else is `btn--secondary` or a `link-more` text link.
6. **Drawn, not decorated.** Icons come from `components/Icon.tsx` and only appear
   where they help someone scan. No emoji, no clip art, no stock illustration.
7. **Real things only.** No fabricated screenshots, metrics or testimonials. Status
   is shown as it is (`StatusTag`).
8. **Phone first.** Nothing scrolls sideways, tap targets are at least 44px
   (`--tap`), and inputs are 16px or larger.

## Design system

### Tokens (`src/styles/tokens.css`)

| Group | Tokens | Notes |
| --- | --- | --- |
| Colour | `--ink`, `--ink-2`, `--ink-3`, `--hairline`, `--surface`, `--surface-2`, `--surface-3`, `--accent`, `--on-ink`, `--danger`, `--glass` | Every text colour reaches at least 4.5:1 on every surface (`--ink-3` is 5.6:1 on white, 4.9:1 on `--surface-3`) |
| Product accents | `--srovi`, `--samewe` | Product identity only: Srovi's logo green and Samewe's forest green. Marks and wordmarks, never body text |
| Type scale | `--text-xs` 13px · `--text-sm` 15px · `--text-base` 17px · `--text-lg` 20px · `--text-xl` · `--text-2xl` · `--text-display` (fluid) | Weights `--weight-regular/medium/semibold`; `--tracking-*`, `--leading-*` |
| Space | `--space-1` 4px … `--space-10` 128px, `--section`, `--gutter` | 8px grid |
| Layout | `--container` 1120px, `--measure` 62ch, `--header-h` 64px | |
| Shape | `--radius-sm` 10px, `--radius` 18px, `--radius-lg` 28px, `--radius-full`, `--border` | |
| Touch | `--tap` 44px | Minimum height for anything you can press |
| Motion | `--ease`, `--duration` 200ms | |

### Breakpoints

Layouts collapse at three widths, written in each page's stylesheet: **900px**
(four columns to two), **760px** (two columns to one; tablet portrait) and
**560–640px** (phone). The header switches to the menu button at 640px. Breakpoints
are plain `max-width` media queries, since custom properties cannot be used inside them.

### Components

| Component | Use |
| --- | --- |
| `.btn btn--primary` / `.btn btn--secondary` | The only buttons; one primary per view |
| `.link-more` | A quiet text link with a chevron, for secondary actions |
| `.eyebrow`, `.display`, `.headline`, `.lead`, `.muted` | Typographic roles (`styles/base.css`) |
| `.container`, `.section` | Content width and section rhythm |
| `.visually-hidden` | Present for screen readers and search, hidden on screen |
| `Header` / `Footer` | Navigation (`nav` in `content.ts`) and the brand footer |
| `ProductMark` | A product's own identity: its logo, or its wordmark in its accent |
| `StatusTag` | Real status. Live is solid, in progress is outlined, planned is quiet |
| `Icon` | One glyph family: 24px grid, 1.5 stroke, round caps, `currentColor`, `aria-hidden` |
| `Clients`, `CallToAction` | Client logos in one muted tone; the closing enquiry prompt |
| Form fields (`Contact`) | Label above the field, 16px text, 44px minimum, quiet fill that turns white on focus |

### Interaction states

- **Hover:** links darken from `--ink-2` to `--ink`; panels move from `--surface-2` to `--surface-3`; `link-more` chevrons shift 3px.
- **Focus:** a 2px `--accent` ring offset by 3px, on every focusable element (`:focus-visible`).
- **Disabled:** 50% opacity, default cursor.

### Motion

Transitions are 200ms on colour, background and small transforms only, never on
layout. `prefers-reduced-motion` turns them off and disables smooth scrolling.

### Product identities

Srovi and Samewe keep their own identity inside the Qsofte system: their mark
(`ProductMark`) and accent token, always next to "A Qsofte product". Everything
else, including type, spacing, components and status, is shared, so the family stays
coherent. A new product adds its logo or wordmark colour token and an entry in
`products` in `content.ts`.

## Images

- Only WebP or SVG, each under 150 KB, in `src/assets/`. Every image has `alt` and
  explicit `width`/`height` where it is a fixed size.
- Photography or illustration must be consistent in style and must show the real thing.
  The previous AI line-art set was retired because of fake text ("SME", "Open EMR"),
  mixed stroke weights, visual noise, and a testing image that showed a payment terminal.

## Where things live

| What | Where |
| --- | --- |
| Every colour, size, font, radius and motion value | `src/styles/tokens.css` |
| Reset, type classes, `.container`, `.section`, `.btn`, `.link-more` | `src/styles/base.css` |
| A page or component's styles, scoped to its root class | `Foo.css` next to `Foo.tsx` |
| All copy, page metadata and structured data | `src/content.ts` |
| The source of every factual claim | `docs/assessment/README.md`, `docs/assessment/decisions.md` |

## How it is enforced

| Guard | Checks | Runs |
| --- | --- | --- |
| `src/__tests__/designSystemHolds.test.ts` | tokens only (colour, spacing, type), no shadows/gradients, stylesheets scoped to their root, shared classes only in base.css, only two button variants, copy in content.ts, no emoji, images WebP/SVG ≤150 KB, all used, all with alt | `npm test`, CI, and after every edit (`.claude/hooks/ui-guard.sh`) |
| `e2e/guardrails.spec.ts` | in a real browser on desktop, tablet and phone: no sideways scroll, 44px taps, 16px inputs, ≤1 primary button per view, every colour on screen is a token, images load, no console errors (CSP violations, hydration mismatches) | `npm run test:e2e`, CI, and against the live site after each deploy |
| `e2e/a11y.spec.ts` | axe WCAG 2.2 AA rules on every page; keyboard skip link | same |
| `e2e/seo.spec.ts` | raw HTML per page: unique title, description, canonical, Open Graph, one `<h1>`; sitemap; structured data | same |
| `src/App.test.tsx`, `e2e/site.spec.ts` | brand architecture, honest product status, clients preserved, journeys, forms, retired URLs, internal links | `npm test` / `npm run test:e2e` |

Run everything with `.claude/scripts/ui-check.sh`. The checks are zero-tolerance: fix
the code, never the test. Automated accessibility checks do not prove WCAG
conformance; test journeys with a keyboard and a screen reader when they change.
