import dotenv

# load env vars before even importing anything from `scraping_events`
dotenv.load_dotenv()

if __name__ == "__main__":
    import uvicorn

    import scraping_events.main_api
    from scraping_events.env import get_env

    env = get_env()
    uvicorn.run(scraping_events.main_api.api, host="localhost", port=env.port, reload=True, reload_dirs=["src"])
