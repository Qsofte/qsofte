"""The Desk: JSON API under /api, and the built React app for every other path.

The app shell is served to anyone (it holds no content); every /api route except
sign-in and health needs a valid session.
"""

import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import APIRouter, Depends, FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from . import feeds, semantic
from .db import dispose, sessionmaker
from .routes import auth, domains, events, guides, initiatives, notes, search, today
from .routes import feeds as feed_routes
from .security import require_write_header


@asynccontextmanager
async def lifespan(_: FastAPI):
    s = get_settings()
    tasks = []
    if s.feed_interval_minutes > 0:
        tasks.append(asyncio.create_task(feeds.run_forever(sessionmaker(), s.feed_interval_minutes)))
    if s.semantic and s.embed_interval_minutes > 0:
        tasks.append(asyncio.create_task(semantic.run_forever(sessionmaker(), s.embed_interval_minutes)))
    yield
    for task in tasks:
        task.cancel()
    await dispose()


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(
        title="Qsofte Payments Desk",
        lifespan=lifespan,
        # No public schema or docs in production.
        docs_url=None if s.is_production else "/api/docs",
        redoc_url=None,
        openapi_url=None if s.is_production else "/api/openapi.json",
    )

    api = APIRouter(prefix="/api", dependencies=[Depends(require_write_header)])
    for module in (auth, domains, initiatives, notes, guides, events, feed_routes, search, today):
        api.include_router(module.router)
    app.include_router(api)

    @app.get("/healthz", include_in_schema=False)
    async def healthz() -> PlainTextResponse:
        return PlainTextResponse("ok\n")

    @app.get("/robots.txt", include_in_schema=False)
    async def robots() -> PlainTextResponse:
        return PlainTextResponse("User-agent: *\nDisallow: /\n")

    @app.middleware("http")
    async def headers(request: Request, call_next):
        response: Response = await call_next(request)
        h = response.headers
        h.setdefault("X-Robots-Tag", "noindex, nofollow")
        h.setdefault("X-Content-Type-Options", "nosniff")
        h.setdefault("X-Frame-Options", "DENY")
        h.setdefault("Referrer-Policy", "same-origin")
        h.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; "
            "connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
        )
        if request.url.path.startswith("/api/"):
            h.setdefault("Cache-Control", "no-store")
        return response

    @app.api_route("/api/{rest:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"], include_in_schema=False)
    async def api_not_found(rest: str) -> JSONResponse:
        return JSONResponse({"detail": f"There is no API route /api/{rest}."}, status_code=404)

    _mount_frontend(app, s.static_dir)
    return app


def _mount_frontend(app: FastAPI, static_dir: Path) -> None:
    index = static_dir / "index.html"
    assets = static_dir / "assets"
    if assets.is_dir():
        app.mount("/assets", StaticFiles(directory=assets), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    async def spa(path: str) -> Response:
        candidate = (static_dir / path).resolve()
        if path and candidate.is_file() and static_dir.resolve() in candidate.parents:
            return FileResponse(candidate)
        if index.is_file():
            return FileResponse(index, headers={"Cache-Control": "no-cache"})
        return PlainTextResponse("The Desk frontend is not built. Run npm run build in desk/frontend.", 503)


app = create_app()
