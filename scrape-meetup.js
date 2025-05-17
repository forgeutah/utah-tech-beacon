
const axios = require("axios");
const cheerio = require("cheerio");

// The Meetup events page for Utah Go
const MEETUP_URL = "https://www.meetup.com/utahgophers/events/";

async function scrapeMeetupEvents() {
  try {
    // Fetch the HTML from Meetup
    const { data: html } = await axios.get(MEETUP_URL, {
      headers: {
        // Pretend to be a real browser to avoid bot protections
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });

    const $ = cheerio.load(html);

    // Events info will be collected here
    const events = [];

    // Meetup currently lists events within article elements with data-event-id, but this can change
    $("section[data-testid='event-list'] article[eventid], article[data-event-id]").each(function () {
      const event = {};

      // Get event title
      event.title = $(this).find("h3").text().trim();

      // Get event link (relative href)
      const relLink = $(this).find("a[href*='/events/']").attr("href");
      event.link = relLink ? `https://www.meetup.com${relLink}` : null;

      // Get event date
      event.date = $(this).find("time").attr("datetime") || $(this).find("time").text();

      // Get event description (if available)
      event.description = $(this).find("p").text().trim();

      // Filter only if an event title is present
      if (event.title) {
        events.push(event);
      }
    });

    // Print as JSON
    console.log(JSON.stringify(events, null, 2));
  } catch (err) {
    console.error("Failed to fetch or scrape Meetup events:", err.message);
  }
}

scrapeMeetupEvents();
