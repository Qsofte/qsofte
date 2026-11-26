"""Passwords, session cookies and the guards every data route sits behind.

- Passwords: bcrypt.
- Session: a signed JWT in an httpOnly, SameSite=Strict, Secure cookie. It carries the
  user's token_version, so changing a password signs out every other device.
- Writes need the X-Desk-Request header. Browsers will not add a custom header to a
  cross-site request without a CORS preflight, which this API never grants.
- Sign-in attempts are throttled per address.
"""

import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .db import get_db
from .models import User

COOKIE = "desk_session"
CSRF_HEADER = "x-desk-request"
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except ValueError:
        return False


# Spent on unknown emails so a miss takes as long as a wrong password.
_DUMMY_HASH = hash_password("not-a-real-password")


def check_password_or_dummy(password: str, user: User | None) -> bool:
    if user is None:
        verify_password(password, _DUMMY_HASH)
        return False
    return verify_password(password, user.password_hash)


def issue_token(user: User) -> str:
    s = get_settings()
    now = datetime.now(timezone.utc)
    payload = {"sub": str(user.id), "ver": user.token_version, "iat": now, "exp": now + timedelta(hours=s.session_hours)}
    return jwt.encode(payload, s.secret_key, algorithm=ALGORITHM)


def set_session_cookie(response: Response, token: str) -> None:
    s = get_settings()
    response.set_cookie(
        COOKIE,
        token,
        max_age=s.session_hours * 3600,
        httponly=True,
        secure=s.cookie_secure,
        samesite="strict",
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    s = get_settings()
    response.delete_cookie(COOKIE, path="/", httponly=True, secure=s.cookie_secure, samesite="strict")


SIGNED_OUT = HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in to use the Desk.")


async def current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    token = request.cookies.get(COOKIE)
    if not token:
        raise SIGNED_OUT
    try:
        payload = jwt.decode(token, get_settings().secret_key, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
        version = int(payload["ver"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise SIGNED_OUT
    user = await db.scalar(select(User).where(User.id == user_id))
    if user is None or not user.is_active or user.token_version != version:
        raise SIGNED_OUT
    return user


async def require_write_header(request: Request) -> None:
    if request.method in ("POST", "PUT", "PATCH", "DELETE") and request.headers.get(CSRF_HEADER) != "1":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This request did not come from the Desk app.")


class LoginThrottle:
    """At most `limit` failed sign-ins per address per `window` seconds. One process, so memory is enough."""

    def __init__(self, limit: int = 8, window: float = 900) -> None:
        self.limit = limit
        self.window = window
        self._fails: dict[str, deque[float]] = defaultdict(deque)

    def _trim(self, key: str, now: float) -> deque[float]:
        q = self._fails[key]
        while q and now - q[0] > self.window:
            q.popleft()
        return q

    def check(self, key: str) -> None:
        if len(self._trim(key, time.monotonic())) >= self.limit:
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                "Too many sign-in attempts. Wait 15 minutes and try again.",
            )

    def fail(self, key: str) -> None:
        now = time.monotonic()
        self._trim(key, now).append(now)

    def clear(self, key: str) -> None:
        self._fails.pop(key, None)


throttle = LoginThrottle()


def client_key(request: Request) -> str:
    # nginx sets X-Real-IP; uvicorn runs with --proxy-headers behind it.
    return request.headers.get("x-real-ip") or (request.client.host if request.client else "unknown")
