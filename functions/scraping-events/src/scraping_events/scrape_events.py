import dataclasses
import logging
from collections.abc import Awaitable, Callable
from urllib.parse import ParseResult as ParsedUrl, urlparse

from playwright.async_api import Browser

from scraping_events.exceptions import UnknownEventProviderError
from scraping_events.response import Event
from scraping_events.scrape_meetup import is_meetup_url, scrape_meetup

LOGGER = logging.getLogger(__name__)


@dataclasses.dataclass
class EventProvider:
    name: str
    identifier: Callable[[ParsedUrl], bool]
    scrape_func: Callable[[Browser, str], Awaitable[list[Event]]]


EVENT_PROVIDERS: list[EventProvider] = [
    EventProvider(
        name="Meetup.com",
        identifier=is_meetup_url,
        scrape_func=scrape_meetup,
    )
]


async def scrape_events(browser: Browser, url: str) -> list[Event]:
    LOGGER.info(f"Processing URL: {url}")
    url_parsed = urlparse(url, allow_fragments=False)
    for event_provider in EVENT_PROVIDERS:
        if event_provider.identifier(url_parsed):
            LOGGER.info(f"URL recognized as belonging to event provider {event_provider.name}")
            return await event_provider.scrape_func(browser, url)
    # no match
    raise UnknownEventProviderError(url)
