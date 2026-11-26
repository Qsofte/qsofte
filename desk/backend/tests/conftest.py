"""Each test gets a fresh SQLite database with the reference data seeded and one account."""

import os
import tempfile

import pytest
from httpx import ASGITransport, AsyncClient

_tmp = tempfile.mkdtemp()
os.environ["DESK_DATABASE_URL"] = f"sqlite+aiosqlite:///{_tmp}/test.db"
os.environ["DESK_SECRET_KEY"] = "test-secret-key-test-secret-key-0123456789"
os.environ["DESK_COOKIE_SECURE"] = "false"
os.environ["DESK_ENVIRONMENT"] = "test"

from app import db as dbmod  # noqa: E402
from app.main import create_app  # noqa: E402
from app.models import User  # noqa: E402
from app.security import hash_password, throttle  # noqa: E402
from app.seed import seed  # noqa: E402

EMAIL = "owner@example.com"
PASSWORD = "correct horse battery staple"
WRITE = {"X-Desk-Request": "1"}


@pytest.fixture(autouse=True)
async def database():
    engine = dbmod.get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(dbmod.Base.metadata.drop_all)
        await conn.run_sync(dbmod.Base.metadata.create_all)
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
