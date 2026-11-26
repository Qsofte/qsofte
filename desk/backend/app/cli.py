"""Operator commands, run inside the desk container.

  python -m app.cli bootstrap              seed reference data; create the first account from
                                           DESK_ADMIN_EMAIL / DESK_ADMIN_PASSWORD if there are no users
  python -m app.cli add-user EMAIL NAME    add a person (password read from stdin, never argv)
  python -m app.cli set-password EMAIL     reset a password (from stdin); signs them out everywhere
  python -m app.cli disable-user EMAIL     stop a person signing in
"""

import asyncio
import sys

from sqlalchemy import func, select

from .config import get_settings
from .db import dispose, sessionmaker
from .models import User
from .security import hash_password
from .seed import seed

MIN_PASSWORD = 12


def _read_password() -> str:
    pw = sys.stdin.readline().rstrip("\n")
    if len(pw) < MIN_PASSWORD:
        sys.exit(f"Password must be at least {MIN_PASSWORD} characters.")
    return pw


async def bootstrap() -> None:
    s = get_settings()
    async with sessionmaker()() as db:
        added = await seed(db)
        print(f"desk: seed added {added}")
        users = await db.scalar(select(func.count()).select_from(User))
        if users == 0:
            if not (s.admin_email and s.admin_password):
                print("desk: no accounts yet and DESK_ADMIN_EMAIL / DESK_ADMIN_PASSWORD are not set; nobody can sign in")
                return
            if len(s.admin_password) < MIN_PASSWORD:
                sys.exit(f"desk: DESK_ADMIN_PASSWORD must be at least {MIN_PASSWORD} characters")
            db.add(User(email=s.admin_email.lower(), name=s.admin_name, password_hash=hash_password(s.admin_password)))
            await db.commit()
            print(f"desk: created the first account for {s.admin_email}")


async def _user(db, email: str) -> User:
    u = await db.scalar(select(User).where(func.lower(User.email) == email.lower()))
    if u is None:
        sys.exit(f"No account for {email}.")
    return u


async def add_user(email: str, name: str) -> None:
    pw = _read_password()
    async with sessionmaker()() as db:
        if await db.scalar(select(User).where(func.lower(User.email) == email.lower())):
            sys.exit(f"{email} already has an account.")
        db.add(User(email=email.lower(), name=name, password_hash=hash_password(pw)))
        await db.commit()
    print(f"Added {email}.")


async def set_password(email: str) -> None:
    pw = _read_password()
    async with sessionmaker()() as db:
        u = await _user(db, email)
        u.password_hash = hash_password(pw)
        u.token_version += 1
        u.is_active = True
        await db.commit()
    print(f"Password reset for {email}; their other sessions are signed out.")


async def disable_user(email: str) -> None:
    async with sessionmaker()() as db:
        u = await _user(db, email)
        u.is_active = False
        u.token_version += 1
        await db.commit()
    print(f"{email} can no longer sign in.")


def main(argv: list[str]) -> None:
    commands = {
        "bootstrap": (bootstrap, 0),
        "add-user": (add_user, 2),
        "set-password": (set_password, 1),
        "disable-user": (disable_user, 1),
    }
    if not argv or argv[0] not in commands or len(argv) - 1 != commands[argv[0]][1]:
        sys.exit(__doc__)
    fn, _ = commands[argv[0]]

    async def run() -> None:
        try:
            await fn(*argv[1:])
        finally:
            await dispose()

    asyncio.run(run())


if __name__ == "__main__":
    main(sys.argv[1:])
