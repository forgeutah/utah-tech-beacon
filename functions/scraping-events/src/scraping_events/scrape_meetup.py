import logging
import re
from datetime import UTC, datetime
from urllib.parse import ParseResult as ParsedUrl

from playwright.async_api import Browser, Error as PlaywrightError, expect as pw_expect

from scraping_events.exceptions import ParsingError
from scraping_events.playwright import PageWrapper
from scraping_events.response import Event

LOGGER = logging.getLogger(__name__)


def is_meetup_url(url_parsed: ParsedUrl) -> bool:
    hostname = url_parsed.hostname
    if hostname is None:
        return False
    return re.fullmatch(r".*\.?meetup\.com", hostname, flags=re.IGNORECASE) is not None


async def _get_upcoming_event_urls(page_wrapper: PageWrapper, starting_url: str, max_events: int) -> list[str]:
    LOGGER.info(f"Looking for upcoming events listed on {starting_url}")
    await page_wrapper.navigate(starting_url)
    page = page_wrapper.page
    await page.locator("#see-all-upcoming-events-button").click()
    await page.get_by_role("link", name="Upcoming").click()
    event_urls: list[str] = []
    for event_number in range(1, max_events + 1):
        event_card = page.locator(f"#event-card-e-{event_number}")
        try:
            await pw_expect(event_card).to_be_visible()
        except PlaywrightError:
            LOGGER.info(f"Failed to find event #{event_number}; stopping", exc_info=True)
            break
        event_url = await event_card.get_attribute("href")
        if event_url is None:
            raise ParsingError(f"Failed to get event URL for event #{event_number}")
        event_urls.append(event_url)
    LOGGER.info(f"Grabbed {len(event_urls)} URLs for upcoming events")
    return event_urls


async def _get_event_details(page_wrapper: PageWrapper, event_url: str) -> Event:
    LOGGER.info(f"Getting details for event at {event_url}")
    await page_wrapper.navigate(event_url)
    page = page_wrapper.page
    # time
    bottom_action_bar = page.locator("[data-event-label='action-bar']")
    event_time_display = bottom_action_bar.locator("[datetime]")
    event_time_str = await event_time_display.get_attribute("datetime")
    if event_time_str is None:
        raise ParsingError(f"Failed to get event time from {event_url}")
    event_time = _parse_timestamp(event_time_str)

    # TODO
    return Event(title=event_url, time=event_time)


def _parse_timestamp(timestamp_str: str) -> datetime:
    # example input: "2025-06-03T18:30:00Z[UTC]"
    match = re.fullmatch(r"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})Z\[UTC]", timestamp_str)
    if match is None:
        raise ParsingError(f"Regex failed to parse timestamp: {timestamp_str!r}")
    time_naive_str = match.group(1)
    try:
        return datetime.strptime(time_naive_str, "%Y-%m-%dT%H:%M:%S").replace(tzinfo=UTC)
    except ValueError as e:
        raise ParsingError(f"`datetime.strptime` failed to parse timestamp: {time_naive_str!r}") from e


async def scrape_meetup(browser: Browser, url: str, max_events: int) -> list[Event]:
    async with PageWrapper.open(browser) as page_wrapper:
        event_urls = await _get_upcoming_event_urls(page_wrapper, url, max_events)
        events: list[Event] = [await _get_event_details(page_wrapper, event_url) for event_url in event_urls]
        return events
