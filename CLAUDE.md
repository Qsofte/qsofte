# Qsofte website

Marketing site for qsofte.com. Vite + React 18 + TypeScript, plain CSS, no UI framework.

## Commands

- `npm run check` (typecheck + vitest + build). Run before every push.
- `npm run test:e2e` (Playwright desktop + mobile against `vite preview`).

## Rules

- **Copy lives in `src/content.ts`.** Pages render it; don't hardcode text in components.
- **Clients are preserved.** Westpac, Chilli Masala, Adyopant Legal and Atmabodh must stay on the
  home page. `src/App.test.tsx` and `e2e/site.spec.ts` fail if a logo disappears.
- **A colour is a token.** Use the CSS variables at the top of `src/styles.css`; don't add raw hex values in rules.
- **Phone first.** No horizontal scroll at 390px (e2e checks it), 44px tap targets, 16px inputs.
- **Old URLs keep working.** `/Connect` redirects to `/contact`; add a redirect when you rename a route.
- **Infra is code.** Server changes go in `deploy/` and ship through `deploy-prod.yml`; never hand-edit the server.
  Certificates renew in the `certbot` container; nginx reloads every 6h to serve them.
- Never commit secrets. Deploy credentials are GitHub secrets (`SERVER_*`).
