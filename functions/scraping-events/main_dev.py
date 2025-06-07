import dotenv

if __name__ == "__main__":
    # load env vars before even importing anything from `scraping_events`
    dotenv.load_dotenv()

    from scraping_events.main_cli import main

    main()
