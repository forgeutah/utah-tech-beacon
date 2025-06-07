from functools import lru_cache

from pydantic_settings import BaseSettings


class _Env(BaseSettings):
    debug: bool = False
    playwright_timeout_ms: int = 15_000
    port: int = 8080


@lru_cache(maxsize=1)
def get_env() -> _Env:
    return _Env()
