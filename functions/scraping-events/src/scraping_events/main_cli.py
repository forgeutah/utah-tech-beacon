import asyncio
import logging
from argparse import ArgumentParser

from scraping_events.logging_config import set_logging_config
from scraping_events.playwright_utils import launch_browser
from scraping_events.schemas import ResponseError, ResponseSuccess
from scraping_events.scrape_events import scrape_events

set_logging_config()  # not main-guarded, so it's inherited by subprocesses

LOGGER = logging.getLogger(__name__)


async def _main_async(url: str, max_events: int) -> ResponseSuccess:
    async with launch_browser() as browser:
        events = await scrape_events(browser, url, max_events)
        return ResponseSuccess(events=events)


def main():
    arg_parser = ArgumentParser()
    arg_parser.add_argument("url", help="Web URL to scrape events from")
    arg_parser.add_argument("--max-events", type=int, default=3, help="Maximum number of events to return")
    args = arg_parser.parse_args()
    try:
        response = asyncio.run(_main_async(args.url, args.max_events))
    except Exception as e:
        print(ResponseError.from_exception(e).model_dump_json(indent=2))  # noqa: T201
        raise
    else:
        print(response.model_dump_json(indent=2))  # noqa: T201


if __name__ == "__main__":
    main()
