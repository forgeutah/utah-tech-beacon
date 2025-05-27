#!/usr/bin/env sh

set -e

if ! command -v uv ; then
    echo "please install uv: https://docs.astral.sh/uv/getting-started/installation/"
    exit 1
fi
echo "Installing project dependencies..."
uv sync --locked
uv run playwright install --with-deps --no-shell chromium

if ! [ -f .env ] ; then
    echo "Seeding .env file..."
    {
        echo "DEBUG=1"
        echo "PLAYWRIGHT_TIMEOUT_MS=5000"
    } > .env
fi
