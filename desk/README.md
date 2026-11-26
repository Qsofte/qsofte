# Payments Desk

A private, signed-in workspace at **https://payments.desk.qsofte.com** for Qsofte's payments
strategy work:

- **Today**: this week's notes, tagged news from the feeds, upcoming events, reviews due.
- **Domains**: the six watch areas and our position on each.
- **Landscape**: about 70 initiatives by kind (cross-border links, central bank projects,
  payment rails, QR schemes, bank platforms, rules, standards, industry moves) and region,
  each with its notes, guides and news.
- **Library**: primers and deep dives in Markdown. Seeded guides are drafts until checked.
- **Notes**: signals, briefs, theses, meetings and debriefs; each says "so what for Qsofte".
- **Feeds**: RSS/Atom from regulators and the industry, tagged to domains and initiatives.
- **Events** and **Capabilities**: where we show up, and where we stand.
- **Search** (header, or press `/`) across all of it, and **Ask**: answers from Desk content
  with Claude, citing its sources.

Same stack as om, cut down to what this needs:

| Layer | Technology |
| --- | --- |
| API | FastAPI, async SQLAlchemy 2, Alembic, Pydantic 2 (`backend/`) |
| Database | PostgreSQL 16 (SQLite in tests) |
| Frontend | React 19, TypeScript, Vite 7, React Router 7, plain CSS with the qsofte.com tokens (`frontend/`) |
| Runtime | One container: uvicorn serves `/api` and the built app. nginx in front does TLS. |

Not carried over from om: Redis, Capacitor/PWA, maps, payment gateway, workers. Feeds refresh
in a background task inside the one process.

## Privacy

This repository is **public**. Notes, positions and accounts live only in the server's
Postgres (`/opt/qsofte/shared/desk/db`), never in git. `app/seed.py` holds public reference
data only. Everything under `/api` except sign-in needs a session; pages send `noindex`, and
`robots.txt` disallows all.

Security in short: bcrypt passwords; a signed session in an httpOnly, Secure,
SameSite=Strict cookie (12 h); writes need an `X-Desk-Request` header (blocks cross-site
forms); sign-in is throttled in the app and by nginx; changing a password signs out every
other device; strict CSP; no API docs in production.

## Feeds

The Desk reads its feeds every three hours (`DESK_FEED_INTERVAL_MINUTES`), and **Refresh now**
on the Feeds page reads them on demand. Each article is tagged by keyword: domain terms in
`app/rules.py` (`DOMAIN_TERMS`) and each initiative's name and *also known as* words (edit them
on the initiative page). Articles older than 120 days are not stored.

Add a source on the Feeds page with its RSS or Atom address. Mark busy general sources
*only matching articles* so only tagged items are kept. Sources that block automated readers
(Finextra, Swift, MAS, IMF and NPCI did in November 2026) show the reason on the page.
The reader refuses private addresses and oversized responses, and parses XML with defusedxml.

## Search

Postgres full-text search, with no extra service to run:

- Each searchable table (domains, initiatives, notes, guides, events, feed items) has a stored
  `search_vector` that Postgres keeps up to date itself, with a GIN index (migration 0003).
  Weights rank titles over summaries over body text (`SEARCH_WEIGHTS` in `app/models.py`).
- The `desk` text search configuration is English stemming with accents removed (`unaccent`),
  so "settlements" finds "settling" and "agora" finds "Agorá".
- Before searching, `rules.expand` adds British/US spellings (tokenised/tokenized), payments
  acronyms both ways (`ACRONYMS`: CBDC, A2A, VoP, NPP…) and each initiative's *also known as* words.
- Results rank with `ts_rank_cd`, doubled when every word matches; snippets come from
  `ts_headline` with the matching words marked.
- A word that matches nothing is corrected against the Desk's own words with `pg_trgm`
  ("remitance" → "remittance") and the page says so; if matches are still few, close titles are
  added.

**Meaning-based search** runs alongside, so a question finds the right guide even when it
shares no words with it ("how do banks move money across borders faster?" finds the
cross-border primer):

- Model: `BAAI/bge-small-en-v1.5` (open source, about 65 MB, 384 dimensions) through fastembed
  on the server's CPU. It is baked into the desk image; nothing is sent to an outside service.
- `search_chunks` (migration 0004) holds paragraph-sized chunks of every searchable row with
  their embeddings, in pgvector with an HNSW index. It is a cache of the rows: the background
  indexer (`app/semantic.py`, every 10 minutes) embeds only what is new or changed, by content
  hash, and removes what is gone. `python -m app.cli reindex` runs it now.
- Search takes the nearest chunks (similarity 0.6 or more, measured on this model) and merges
  them with the keyword results by reciprocal rank fusion. Results found only by meaning are
  labelled *Related in meaning*. Ask uses the same merged results for its sources.
- Costs (measured): about 220 MB more image (the model and its runtime), about 210 MB more
  memory once the model loads, and about 5 seconds to embed 150 documents on 2 threads. If the model cannot load, meaning search switches itself
  off and keyword search carries on. `DESK_SEMANTIC=false` turns it off.

The database image is `pgvector/pgvector` (Postgres 16 with pgvector, Debian-based) for both
`desk-db` and the backup job. Migration 0004 rebuilds text indexes because sort order differs
from the Alpine image used before.

## Ask

Ask searches the Desk for the question, sends the best 12 matches to Claude
(`claude-opus-5-5`, set by `DESK_ASK_MODEL`) and shows the answer with numbered citations.
It answers only from those sources and says when the Desk does not cover something. Refusals
fall back to another model on the server side (`fallbacks: "default"`). Limited to 30 questions
per person per hour (`DESK_ASK_PER_HOUR`).

It is off until the `DESK_ANTHROPIC_API_KEY` GitHub secret is set and the Desk is deployed.
**Privacy:** each question and the matching Desk content (notes, positions, guides) are sent
to the Anthropic API. Leave the key unset if that is not acceptable; Search works without it.

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
   - `DESK_ANTHROPIC_API_KEY` (optional): an Anthropic API key, to turn on Ask.
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

Checks (CI runs all of these). Backend tests need Postgres with pgvector (the dev compose
one): they rebuild the `desk_test` database on it (:5433) each run, or the one named in
`DESK_TEST_DATABASE_URL`. Meaning search is tested with a fake embedder; set
`DESK_EMBED_CACHE` to a folder holding the real model to run its test too.

```bash
cd desk/backend && python -m pytest -q                         # API, auth, rules, search, migrations
cd desk/frontend && npm run check                              # types, tests, design guard, build
```

## Adding a feature

1. Model in `app/models.py`, then `alembic revision --autogenerate -m "..."`.
2. Schema in `app/schemas.py` (one serialiser per entity), route in `app/routes/`.
3. Rules with no database go in `app/rules.py` and are tested directly.
4. Frontend: types and call in `src/api.ts`, copy in `src/content.ts`, page in `src/pages/`.
5. Design follows the public site (`docs/design.md`): tokens only, flat, scoped CSS, one
   primary button per view, 44px taps. `src/__tests__/designHolds.test.ts` enforces it.
