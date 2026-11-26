from app.security import COOKIE

from .conftest import EMAIL, PASSWORD, WRITE


async def test_every_data_route_needs_a_session(anon):
    for path in ("/api/today", "/api/domains", "/api/notes", "/api/events", "/api/initiatives", "/api/auth/me"):
        r = await anon.get(path)
        assert r.status_code == 401, path
        assert r.json()["detail"] == "Sign in to use the Desk."


async def test_sign_in_sets_a_strict_httponly_cookie(anon):
    r = await anon.post("/api/auth/login", json={"email": EMAIL.upper(), "password": PASSWORD}, headers=WRITE)
    assert r.status_code == 200
    cookie = r.headers["set-cookie"].lower()
    assert COOKIE in cookie and "httponly" in cookie and "samesite=strict" in cookie
    assert (await anon.get("/api/auth/me")).json()["email"] == EMAIL


async def test_wrong_password_says_so(anon):
    r = await anon.post("/api/auth/login", json={"email": EMAIL, "password": "nope"}, headers=WRITE)
    assert r.status_code == 401
    assert "do not match" in r.json()["detail"]


async def test_writes_without_the_desk_header_are_refused(anon):
    r = await anon.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
    assert r.status_code == 403


async def test_sign_in_is_throttled(anon):
    for _ in range(8):
        await anon.post("/api/auth/login", json={"email": EMAIL, "password": "nope"}, headers=WRITE)
    r = await anon.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, headers=WRITE)
    assert r.status_code == 429


async def test_tampered_cookie_is_rejected(anon):
    anon.cookies.set(COOKIE, "not.a.token")
    assert (await anon.get("/api/today")).status_code == 401


async def test_changing_password_signs_out_old_sessions(client):
    old = client.cookies.get(COOKIE)
    r = await client.post(
        "/api/auth/password",
        json={"current_password": PASSWORD, "new_password": "an even longer new password"},
        headers=WRITE,
    )
    assert r.status_code == 200
    assert (await client.get("/api/auth/me")).status_code == 200  # new cookie works
    client.cookies.set(COOKIE, old)
    assert (await client.get("/api/auth/me")).status_code == 401


async def test_sign_out(client):
    assert (await client.post("/api/auth/logout", headers=WRITE)).status_code == 204
    client.cookies.clear()
    assert (await client.get("/api/auth/me")).status_code == 401


async def test_pages_are_noindex(anon):
    r = await anon.get("/healthz")
    assert r.headers["x-robots-tag"] == "noindex, nofollow"
    assert (await anon.get("/robots.txt")).text.endswith("Disallow: /\n")
