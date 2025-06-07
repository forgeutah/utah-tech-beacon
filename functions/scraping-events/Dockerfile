FROM ghcr.io/astral-sh/uv:0.7-python3.13-bookworm-slim

ENV UV_PYTHON_PREFERENCE=only-system \
    UV_LOCKED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_NO_CACHE=1

WORKDIR /app

# install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --no-default-groups --no-install-project
ENV PATH="/app/.venv/bin:$PATH"
RUN playwright install --with-deps --no-shell chromium

# get actual application code
COPY src src
RUN uv sync --no-default-groups

EXPOSE 8080

ENTRYPOINT ["python", "-m", "scraping_events.main"]
