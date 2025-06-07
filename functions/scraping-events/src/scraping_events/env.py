from functools import lru_cache

from pydantic_settings import BaseSettings


class _Env(BaseSettings):
    debug: bool = False
    playwright_timeout_ms: int = 30_000


@lru_cache(maxsize=1)
def get_env() -> _Env:
    return _Env()
