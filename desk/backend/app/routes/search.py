from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from .. import ask as asker
from ..config import get_settings
from ..db import get_db
from ..models import User
from ..schemas import AskIn, AskOut, AskStatus, SearchOut
from ..search import search
from ..security import current_user

router = APIRouter(tags=["search"])


@router.get("/search", response_model=SearchOut)
async def search_desk(
    q: str = Query(min_length=1, max_length=200), _: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> SearchOut:
    r = await search(db, q)
    return SearchOut(q=q, terms=r.query.terms, hits=[d.hit() for d in r.docs], fuzzy=r.fuzzy, corrected=r.corrected)


@router.get("/ask", response_model=AskStatus)
async def ask_status(_: User = Depends(current_user)) -> AskStatus:
    return AskStatus(enabled=asker.enabled())


NOTHING = ("Nothing in the Desk mentions that yet. Search with other words, or add a note or guide "
           "so the next answer has something to go on.")


@router.post("/ask", response_model=AskOut)
async def ask(body: AskIn, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> AskOut:
    if not asker.enabled():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE,
                            "Ask is not set up: add the DESK_ANTHROPIC_API_KEY secret and deploy. Search still works.")
    docs = (await search(db, body.question, limit=asker.MAX_SOURCES)).docs
    sources = [d.hit() for d in docs]
    if not docs:
        return AskOut(question=body.question, answer=NOTHING, sources=[], model="")
    asker.limiter.check(user.id, get_settings().ask_per_hour)
    text, model = await asker.answer(body.question, docs)
    return AskOut(question=body.question, answer=text, sources=sources, model=model)
