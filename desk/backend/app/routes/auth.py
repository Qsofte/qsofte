from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import User, utcnow
from ..schemas import LoginIn, PasswordIn, UserOut
from ..security import (
    check_password_or_dummy,
    clear_session_cookie,
    client_key,
    current_user,
    hash_password,
    issue_token,
    set_session_cookie,
    throttle,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=UserOut)
async def login(body: LoginIn, request: Request, response: Response, db: AsyncSession = Depends(get_db)) -> UserOut:
    key = client_key(request)
    throttle.check(key)
    user = await db.scalar(select(User).where(func.lower(User.email) == body.email.lower()))
    if not check_password_or_dummy(body.password, user) or user is None or not user.is_active:
        throttle.fail(key)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "That email and password do not match an account.")
    throttle.clear(key)
    user.last_login_at = utcnow()
    await db.commit()
    set_session_cookie(response, issue_token(user))
    return UserOut.of(user)


@router.post("/logout", status_code=204)
async def logout(response: Response) -> Response:
    clear_session_cookie(response)
    response.status_code = 204
    return response


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(current_user)) -> UserOut:
    return UserOut.of(user)


@router.post("/password", response_model=UserOut)
async def change_password(
    body: PasswordIn, response: Response, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> UserOut:
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Your current password is not right.")
    user.password_hash = hash_password(body.new_password)
    user.token_version += 1  # signs out every other device
    await db.commit()
    set_session_cookie(response, issue_token(user))
    return UserOut.of(user)


@router.post("/logout-everywhere", status_code=204)
async def logout_everywhere(
    response: Response, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> Response:
    user.token_version += 1
    await db.commit()
    clear_session_cookie(response)
    response.status_code = 204
    return response
