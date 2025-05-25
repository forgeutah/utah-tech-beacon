import asyncio
import logging
from argparse import ArgumentParser

from scraping_events.logging_config import set_logging_config
from scraping_events.response import Response

set_logging_config()  # not main-guarded, so it's inherited by subprocesses

LOGGER = logging.getLogger(__name__)


async def scrape_events(url: str) -> Response:
    LOGGER.info(f"Scraping events from {url}")
    return Response(events=[])  # TODO


def main():
    arg_parser = ArgumentParser()
    arg_parser.add_argument("url", help="Web URL to scrape events from")
    args = arg_parser.parse_args()
    response = asyncio.run(scrape_events(args.url))
    print(response.model_dump_json(indent=2))  # noqa: T201


if __name__ == "__main__":
    main()
