# Qsofte website

Public website for [qsofte.com](https://qsofte.com): React + TypeScript (Vite), served by nginx in Docker,
with automatic Let's Encrypt certificates.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173 (client-rendered, for editing)
npm run check        # typecheck + unit tests + production build (with prerender)
npm run test:e2e     # Playwright on desktop, tablet and phone, against the built site
npm run serve        # serve dist/ exactly as production nginx does
```

**Brand architecture.** Qsofte is the parent company. Srovi (AgriTech) and Samewe
(CommunityTech) are its products, and Qsofte Engineering is its technology-services arm.
Pages: `/`, `/products`, `/srovi`, `/samewe`, `/engineering`, `/about`, `/contact`, `/privacy`.

**Content.** All copy, page titles and descriptions, and structured data live in
[`src/content.ts`](src/content.ts). Every factual claim has a source in
[`docs/assessment/`](docs/assessment/README.md); add one when you add a claim.

**How pages are built.** `npm run build` builds the client, then renders every page in
`pages` (content.ts) to static HTML with React's server renderer
([`scripts/prerender.mjs`](scripts/prerender.mjs)). Each page gets its own HTML, title,
description, canonical, Open Graph data and JSON-LD, plus a generated `sitemap.xml` and
`404.html`. The browser then hydrates it into the React app. To add a page: add it to
`pages` in `content.ts`, add a `<Route>` in `App.tsx`, and add it to `e2e/routes.ts`.

**Design.** Principles, the design system and its guardrails are in
[`docs/design.md`](docs/design.md). Every value comes from
[`src/styles/tokens.css`](src/styles/tokens.css); run `.claude/scripts/ui-check.sh` before
pushing UI changes.

## Release pipeline

| Workflow | When | What |
| --- | --- | --- |
| `ci.yml` | every PR and push to `main` | typecheck, unit tests, build, Playwright e2e, Docker image smoke test |
| `deploy-prod.yml` | push a `v*` tag, or run manually and type `deploy` | re-runs CI, builds the image on the runner, frees disk on the server, ships image + release, deploys, verifies HTTPS + cert, runs e2e against the live site |
| `cert-monitor.yml` | daily | fails if the live certificate expires within 21 days |

To release:

```bash
git tag v2.0.0 && git push origin v2.0.0
```

### Required GitHub settings

- Secrets: `SERVER_IP`, `SERVER_USER`, `SERVER_PASSWORD` (SSH to the prod server)
- Variables (optional): `PROD_DOMAIN` (default `qsofte.com`), `SSL_EMAIL` (default `admin@qsofte.com`)
- Environment `production` (add required reviewers there if you want an approval gate)

## Production server

The server needs only Docker; nothing is built on it (the image is built in CI and loaded over SSH).
Before each deploy [`deploy/free-space.sh`](deploy/free-space.sh) clears unused Docker images, build cache,
old journals and old releases, and stops the deploy with a disk report if under 1 GB is still free.
Container logs are capped at 30 MB each. Everything else is created by [`deploy/deploy.sh`](deploy/deploy.sh):

```
/opt/qsofte/releases/<sha>/   one directory per deployed commit (last 3 kept)
/opt/qsofte/current           symlink to the live release
/opt/qsofte/shared/           certificates and ACME webroot (persist across deploys)
```

- **web**: nginx serving the built site on ports 80/443. It uses the HTTPS config once a certificate
  exists, HTTP-only before that, and reloads every 6h so renewed certificates are picked up.
- **certbot**: runs `certbot renew` every 12h using the webroot (no downtime, no port juggling).

On the first deploy the script retires the old HAProxy + host-certbot setup and the old
`modest_lalande` container, then requests a certificate for `$DOMAIN`.

Useful commands on the server:

```bash
cd /opt/qsofte/current/deploy
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml exec certbot certbot certificates
```

Rollback: re-run **Deploy to Production** from an earlier tag.
