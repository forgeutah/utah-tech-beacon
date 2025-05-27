import re
from urllib.parse import ParseResult as ParsedUrl

from playwright.async_api import Browser

from scraping_events.playwright import PageWrapper
from scraping_events.response import Event


def is_meetup_url(url_parsed: ParsedUrl) -> bool:
    hostname = url_parsed.hostname
    if hostname is None:
        return False
    return re.fullmatch(r".*\.?meetup\.com", hostname, flags=re.IGNORECASE) is not None


async def scrape_meetup(browser: Browser, url: str) -> list[Event]:
    async with PageWrapper.open(browser) as page:
        await page.goto(url)
        return []  # TODO
