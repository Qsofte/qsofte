# Qsofte website

Website for qsofte.com. Vite + React 18 + TypeScript, plain CSS, no UI framework. Every
page is prerendered to static HTML at build time (`scripts/prerender.mjs`) and hydrated.

**Brand architecture (approved):** Qsofte is the parent company; **Srovi** (AgriTech) and
**Samewe** (CommunityTech) are its products; **Qsofte Engineering** is its services arm.
Samewe's code lives in the `ram` repository; "RAM" is never used on the site.

**Design: Jony Ive inspired: simplicity, clarity, deference.** Read `docs/design.md`.
**Any UI or copy change follows `.claude/skills/ui-change`** and passes `.claude/scripts/ui-check.sh`
before it is pushed. A hook runs the design guard after every edit under `src/`.

## Payments Desk (`desk/`)

A separate private app at payments.desk.qsofte.com (FastAPI + Postgres + React 19). Read
`desk/README.md`. The public site's rules on design apply to it too. Its data lives only in
the server's Postgres: this repo is public, so never commit notes, positions or accounts.
Checks: `cd desk/backend && python -m pytest -q` (needs Postgres: the dev compose one, or
`DESK_TEST_DATABASE_URL`) and `cd desk/frontend && npm run check`.

## Commands

- `npm run check` (typecheck + vitest + build). Run before every push.
- `npm run test:e2e` (Playwright desktop, tablet and phone against `scripts/serve-dist.mjs`, which
  serves `dist/` like production nginx: own HTML per page, real 404s, the same 301s).
  `vite preview` is not used for tests: it serves the home page's HTML for every route.
- `.claude/scripts/ui-check.sh` (all of the above, in order).

## Rules

- **Copy lives in `src/content.ts`.** Pages render it; don't hardcode text in components. Page
  titles, descriptions and JSON-LD live there too (`pages`, `structuredData`).
- **Claims need evidence.** Never invent clients, metrics, capabilities or availability. Every
  claim has a source in `docs/assessment/README.md` (product evidence) or `decisions.md`. Product
  status (`In use`, `In development`, module `Built/In progress/Planned`) must match the product
  repos (`om` for Srovi, `ram` for Samewe).
- **A new page** is added in three places: `pages` in `content.ts`, a `<Route>` in `App.tsx`,
  and `e2e/routes.ts`. The prerender fails the build if a page renders no `<h1>`.
- **Clients are preserved.** Westpac, Chilli Masala, Adyopant Legal and Atmabodh must stay on the
  home page. `src/App.test.tsx` and `e2e/site.spec.ts` fail if a logo disappears.
- **Every value is a token.** Colour, spacing, type, radii and motion live in `src/styles/tokens.css`.
  Flat: no shadows or gradients. `src/__tests__/designSystemHolds.test.ts` fails on a violation, with zero tolerance.
- **Stylesheets are scoped.** `Foo.css` sits next to `Foo.tsx` and every selector starts with its root class;
  shared classes (`.btn`, `.container`…) live only in `src/styles/base.css`.
- **One primary button per view** (`btn--primary`); otherwise `btn--secondary` or `link-more`.
- **Icons are drawn** in `components/Icon.tsx` (24px grid, 1.5 stroke, currentColor). No emoji, no clip art.
- **Images** are WebP/SVG, ≤150 KB, used, with alt.
- **Phone first.** No horizontal scroll at 390px, 44px tap targets, 16px inputs (`e2e/guardrails.spec.ts` measures them).
- **Old URLs keep working.** `/services` and `/industries` → `/engineering`, `/Connect` → `/contact`:
  301s in both nginx templates and in `scripts/serve-dist.mjs`, and a `<Navigate>` in `App.tsx`.
  Add all of them when you rename a route.
- **Security headers** (CSP, Permissions-Policy) live in `deploy/nginx/*.conf.template`. The CSP
  allows nothing inline: no `style={...}`, no inline scripts. A new third party needs a CSP entry
  and a line in the privacy notice.
- **Infra is code.** Server changes go in `deploy/` and ship through `deploy-prod.yml`; never hand-edit the server.
  Certificates renew in the `certbot` container; nginx reloads every 6h to serve them.
- Never commit secrets. Deploy credentials are GitHub secrets (`SERVER_*`).
