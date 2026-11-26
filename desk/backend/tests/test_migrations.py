"""The Alembic history builds exactly the tables the models describe."""

import os
import subprocess
import sys
import tempfile
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent


def test_migrations_match_models():
    with tempfile.TemporaryDirectory() as tmp:
        env = {**os.environ, "DESK_DATABASE_URL": f"sqlite+aiosqlite:///{tmp}/m.db"}
        for args in (["upgrade", "head"], ["check"]):
            r = subprocess.run([sys.executable, "-m", "alembic", *args], cwd=BACKEND, env=env,
                               capture_output=True, text=True)
            assert r.returncode == 0, r.stderr
