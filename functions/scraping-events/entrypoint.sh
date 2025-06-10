#!/usr/bin/env bash

# entrypoint for Docker container

set -e

cd "$(dirname "$0")"  # always run from this script's directory

uvicorn scraping_events.main_api:api \
    --host 0.0.0.0 \
    --port "${PORT:-8080}" \
    "$@"
