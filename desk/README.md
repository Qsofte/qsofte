# Payments Desk

A private, signed-in workspace at **https://payments.desk.qsofte.com** for Qsofte's payments
strategy work: the six watch domains and our position on each, named initiatives (Nexus,
Mandala, Agorá, Acacia …), a journal of notes that must each say "so what for Qsofte",
an event plan for where we show up, and a capability map.

Same stack as om, cut down to what this needs:

| Layer | Technology |
| --- | --- |
| API | FastAPI, async SQLAlchemy 2, Alembic, Pydantic 2 (`backend/`) |
| Database | PostgreSQL 16 (SQLite in tests) |
| Frontend | React 19, TypeScript, Vite 7, React Router 7, plain CSS with the qsofte.com tokens (`frontend/`) |
| Runtime | One container: uvicorn serves `/api` and the built app. nginx in front does TLS. |

Not carried over from om: Redis, Capacitor/PWA, maps, payment gateway, workers.

## Privacy

This repository is **public**. Notes, positions and accounts live only in the server's
Postgres (`/opt/qsofte/shared/desk/db`), never in git. `app/seed.py` holds public reference
data only. Everything under `/api` except sign-in needs a session; pages send `noindex`, and
`robots.txt` disallows all.

Security in short: bcrypt passwords; a signed session in an httpOnly, Secure,
SameSite=Strict cookie (12 h); writes need an `X-Desk-Request` header (blocks cross-site
forms); sign-in is throttled in the app and by nginx; changing a password signs out every
other device; strict CSP; no API docs in production.

## Going live (one-time)

1. **DNS**: add an `A` record for `payments.desk.qsofte.com` pointing at the same server
   as qsofte.com.
2. **GitHub secrets** (repository → Settings → Secrets and variables → Actions, `production`
   environment):
   - `DESK_SECRET_KEY`: `openssl rand -hex 32`
   - `DESK_DB_PASSWORD`: `openssl rand -hex 24` (letters and digits only; it goes in a URL)
   - `DESK_ADMIN_EMAIL`: the first person's email
   - `DESK_ADMIN_PASSWORD`: their first password, 12+ characters. Change it in the app
     (Account) after first sign-in. It is only used while there are no accounts.
3. **Deploy** as usual (tag `v*` or run *Deploy to Production*). The workflow builds the
   desk image, writes `/opt/qsofte/shared/desk/desk.env` (root-only) from the secrets, starts
   `desk`, `desk-db` and `desk-backup`, and requests the certificate. Without the secrets the
   Desk is skipped and the main site deploys as before. If DNS is not ready, the deploy
   warns and the Desk answers 503 over HTTP until the next deploy gets the certificate.

Optional: set the repository variable `DESK_DOMAIN` to use another host name.

## Adding people

On the server, in the live release:

```bash
cd /opt/qsofte/current/deploy
c() { docker compose -f docker-compose.prod.yml --profile desk "$@"; }
c exec -T desk python -m app.cli add-user person@example.com "Their Name"   # then type a password, Enter
c exec -T desk python -m app.cli set-password person@example.com           # reset; signs them out
c exec -T desk python -m app.cli disable-user person@example.com
```

Passwords are read from stdin so they never appear in shell history or `ps`.

## Backups

`desk-backup` writes `desk-YYYY-MM-DD.sql.gz` every 24 h to
`/opt/qsofte/shared/desk/backups` and keeps 14 days. These sit on the same server; copy
them somewhere else on a schedule for real protection. Restore:

```bash
gunzip -c desk-2026-11-26.sql.gz | docker compose -f docker-compose.prod.yml --profile desk exec -T desk-db psql -U desk desk
```

## Local development

```bash
docker compose -f desk/docker-compose.dev.yml up -d          # Postgres on :5433
cd desk/backend && python -m venv .venv && . .venv/bin/activate
pip install -r requirements-test.txt && cp .env.example .env
alembic upgrade head && python -m app.cli bootstrap
uvicorn app.main:app --reload --port 8000                      # API docs at /api/docs
cd ../frontend && npm install && npm run dev                   # http://localhost:5174
```

Checks (CI runs all of these):

```bash
cd desk/backend && python -m pytest -q                         # API, auth, rules, migrations
cd desk/frontend && npm run check                              # types, tests, design guard, build
```

## Adding a feature

1. Model in `app/models.py`, then `alembic revision --autogenerate -m "..."`.
2. Schema in `app/schemas.py` (one serialiser per entity), route in `app/routes/`.
3. Rules with no database go in `app/rules.py` and are tested directly.
4. Frontend: types and call in `src/api.ts`, copy in `src/content.ts`, page in `src/pages/`.
5. Design follows the public site (`docs/design.md`): tokens only, flat, scoped CSS, one
   primary button per view, 44px taps. `src/__tests__/designHolds.test.ts` enforces it.
