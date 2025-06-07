# Function: Scraping Events

This subproject runs on python and uses [uv](https://docs.astral.sh/uv/) for project management.

## Development Tools

Run `./dev-setup.sh` to get things set up for local development.
From there, you can activate the project's python virtual environment (AKA `venv`) and run `main_dev.py`.

For pre-defined tasks, such as linting, we use [poethepoet](https://poethepoet.natn.io/).
You can install with `uv`:
```bash
uv tool install poethepoet
```
You can then use the `poe` CLI tool:
```bash
poe --help  # see defined tasks
poe lint  # run the task named `lint`
```

### Playwright

[Playwright](https://playwright.dev/python/) is used to interact with websites.
Please refer to the official docs for help.

When this process is run with environment variable `DEBUG=1`, the browser is launched with `headless=False`.
In addition, a recording (AKA `trace`) of the browser interactions is saved to the `traces/` directory.
You can open the trace file in Playwright's trace viewer using the Playwright CLI:
```bash
uv run playwright show-trace traces/trace-filename.zip
# or if your virtual environment is already active in your current shell:
playwright show-trace traces/trace-filename.zip
```
