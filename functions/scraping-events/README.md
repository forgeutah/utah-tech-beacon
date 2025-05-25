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
