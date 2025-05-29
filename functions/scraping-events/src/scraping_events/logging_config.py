import logging
import logging.config

from scraping_events.env import get_env

_VERBOSE_LOGGERS = [
    "__main__",
    "__mp_main__",
    "scraping_events",
]


def set_logging_config():
    env = get_env()
    config = {
        "version": 1,
        "formatters": {
            "default": {
                "format": "%(asctime)s | %(levelname)-8s | %(name)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "stderr": {
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stderr",
                "formatter": "default",
                "level": logging.DEBUG,
            },
        },
        "loggers": {
            _verbose_logger_name: {
                "level": logging.DEBUG if env.debug else logging.INFO,
            }
            for _verbose_logger_name in _VERBOSE_LOGGERS
        },
        "root": {
            "level": logging.WARNING,  # inherited by loggers with level not set otherwise
            "handlers": ["stderr"],
        },
        "disable_existing_loggers": False,  # allow loggers to be instantiated before this config
    }
    logging.config.dictConfig(config)
