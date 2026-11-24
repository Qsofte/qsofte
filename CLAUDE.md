# Qsofte website

Marketing site for qsofte.com. Vite + React 18 + TypeScript, plain CSS, no UI framework.

**Design: Jony Ive inspired: simplicity, clarity, deference.** Read `docs/design.md`.
**Any UI or copy change follows `.claude/skills/ui-change`** and passes `.claude/scripts/ui-check.sh`
before it is pushed. A hook runs the design guard after every edit under `src/`.

## Commands

- `npm run check` (typecheck + vitest + build). Run before every push.
- `npm run test:e2e` (Playwright desktop + mobile against `vite preview`, incl. browser guardrails).
- `.claude/scripts/ui-check.sh` (all of the above, in order).

## Rules

- **Copy lives in `src/content.ts`.** Pages render it; don't hardcode text in components.
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
- **Old URLs keep working.** `/Connect` redirects to `/contact`; add a redirect when you rename a route.
- **Infra is code.** Server changes go in `deploy/` and ship through `deploy-prod.yml`; never hand-edit the server.
  Certificates renew in the `certbot` container; nginx reloads every 6h to serve them.
- Never commit secrets. Deploy credentials are GitHub secrets (`SERVER_*`).
