"""The Alembic history builds exactly the tables the models describe, and comes back down."""

import asyncio
import importlib.util

from app.models import SEARCH_WEIGHTS, search_expression

from .conftest import BACKEND, TEST_URL, migrate, recreate_database

URL = TEST_URL.rsplit("/", 1)[0] + "/desk_migrations"


def test_migrations_up_check_down_up():
    asyncio.run(recreate_database(URL))
    migrate(URL, "upgrade", "head")
    migrate(URL, "check")
    migrate(URL, "downgrade", "base")
    migrate(URL, "upgrade", "head")


def test_search_expressions_in_0003_match_the_models():
    # Alembic cannot compare generated columns, so this does.
    path = next((BACKEND / "alembic" / "versions").glob("0003_*.py"))
    spec = importlib.util.spec_from_file_location("m0003", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    assert module.EXPRESSIONS == {t: search_expression(t) for t in SEARCH_WEIGHTS}
