import logging
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from playwright.async_api import Browser

from scraping_events.logging_config import set_logging_config
from scraping_events.playwright_utils import launch_browser
from scraping_events.schemas import ResponseError, ScrapeEventsRequest, ScrapeEventsResponse
from scraping_events.scrape_events import scrape_events

set_logging_config()  # not main-guarded, so it's inherited by subprocesses

LOGGER = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(api_: FastAPI):
    async with launch_browser() as browser:
        api_.state.browser = browser
        yield


async def _browser_dep(request: Request) -> Browser:
    return request.app.state.browser


BrowserDep = Annotated[Browser, Depends(_browser_dep)]


api = FastAPI(lifespan=lifespan)


@api.exception_handler(Exception)
async def _exception_handler(_, e: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=ResponseError.from_exception(e).model_dump(mode="json"),
    )


@api.get("/")
async def get_root():  # noqa: ANN201
    return {
        "status": "ok",
        "docs_url": api.docs_url,
    }


@api.post("/scrape-events")
async def post_scrape_events(body: ScrapeEventsRequest, browser: BrowserDep) -> ScrapeEventsResponse:
    events = await scrape_events(browser, body.url, body.max_events)
    return ScrapeEventsResponse(events=events)
