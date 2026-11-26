"""Tests run on Postgres: search uses its full-text search, unaccent and pg_trgm.

DESK_TEST_DATABASE_URL names the test database (default: the dev compose Postgres on :5433).
It is dropped and rebuilt with the real migrations once per run; each test then starts from
empty tables with the reference data seeded and one account.
"""

import asyncio
import os
import subprocess
import sys
from pathlib import Path

import asyncpg
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.engine import make_url

TEST_URL = os.environ.get("DESK_TEST_DATABASE_URL", "postgresql+asyncpg://desk:desk@localhost:5433/desk_test")
os.environ["DESK_DATABASE_URL"] = TEST_URL
os.environ["DESK_SECRET_KEY"] = "test-secret-key-test-secret-key-0123456789"
os.environ["DESK_COOKIE_SECURE"] = "false"
os.environ["DESK_ENVIRONMENT"] = "test"
os.environ["DESK_FEED_INTERVAL_MINUTES"] = "0"
os.environ["DESK_TIMEZONE"] = "UTC"
os.environ.pop("DESK_ANTHROPIC_API_KEY", None)

from sqlalchemy import text  # noqa: E402

from app import db as dbmod  # noqa: E402
from app.main import create_app  # noqa: E402
from app.models import User  # noqa: E402
from app.security import hash_password, throttle  # noqa: E402
from app.seed import seed  # noqa: E402

BACKEND = Path(__file__).resolve().parent.parent
EMAIL = "owner@example.com"
PASSWORD = "correct horse battery staple"
WRITE = {"X-Desk-Request": "1"}


async def recreate_database(url: str) -> None:
    """Drops and creates the database named in url, connecting to the server's 'postgres' db."""
    u = make_url(url)
    admin = u.set(drivername="postgresql", database="postgres").render_as_string(hide_password=False)
    try:
        conn = await asyncpg.connect(admin)
    except (OSError, asyncpg.PostgresError) as e:
        raise RuntimeError(
            f"The tests need Postgres at {u.host}:{u.port}. Start it with "
            "`docker compose -f desk/docker-compose.dev.yml up -d`, or set DESK_TEST_DATABASE_URL."
        ) from e
    try:
        await conn.execute(f'DROP DATABASE IF EXISTS "{u.database}" WITH (FORCE)')
        await conn.execute(f'CREATE DATABASE "{u.database}"')
    finally:
        await conn.close()


def migrate(url: str, *args: str) -> None:
    r = subprocess.run([sys.executable, "-m", "alembic", *args], cwd=BACKEND,
                       env={**os.environ, "DESK_DATABASE_URL": url}, capture_output=True, text=True)
    assert r.returncode == 0, r.stderr


def pytest_sessionstart(session):
    asyncio.run(recreate_database(TEST_URL))
    migrate(TEST_URL, "upgrade", "head")


TABLES = ", ".join(t.name for t in dbmod.Base.metadata.sorted_tables)


@pytest.fixture(autouse=True)
async def database():
    async with dbmod.get_engine().begin() as conn:
        await conn.execute(text(f"TRUNCATE {TABLES} RESTART IDENTITY CASCADE"))
    async with dbmod.sessionmaker()() as s:
        await seed(s)
        s.add(User(email=EMAIL, name="Owner", password_hash=hash_password(PASSWORD)))
        await s.commit()
    throttle._fails.clear()
    yield
    await dbmod.dispose()


@pytest.fixture
async def anon():
    async with AsyncClient(transport=ASGITransport(app=create_app()), base_url="http://desk.test") as c:
        yield c


@pytest.fixture
async def client(anon):
    r = await anon.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, headers=WRITE)
    assert r.status_code == 200, r.text
    yield anon
