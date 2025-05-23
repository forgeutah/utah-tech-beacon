
const axios = require("axios");
const cheerio = require("cheerio");
const { createClient } = require("@supabase/supabase-js");

// === SUPABASE SETUP ===
// Replace these with your actual project details
const SUPABASE_URL = "https://gocvjqljtcxtcrwvfwez.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY3ZqcWxqdGN4dGNyd3Zmd2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NTQzMzUsImV4cCI6MjA2MzAzMDMzNX0.R0NQtfvSeekfHR-QE8l5bPf7f_vL1_ol-SFVjdWRQxI";

// This is the UUID of the Utah Go group in your Supabase "groups" table.
// Replace with the correct ID from your database!
const UTAH_GO_GROUP_ID = "REPLACE_WITH_ACTUAL_GROUP_UUID";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// The Meetup events page for Utah Go
const MEETUP_URL = "https://www.meetup.com/utahgophers/events/";

function extractEventId(link) {
  // Meetup event URLs contain the event ID: /events/<id>/
  if (!link) return null;
  const match = link.match(/\/events\/(\d+)/);
  return match ? match[1] : null;
}

async function upsertEvent(event) {
  if (!event.external_id) {
    console.warn("Skipping event without external_id:", event.title);
    return;
  }
  // Insert or update by (group_id, external_id) constraint
  const { error } = await supabase
    .from("events")
    .upsert([{
      group_id: UTAH_GO_GROUP_ID,
      title: event.title,
      event_date: event.event_date,
      start_time: event.start_time,
      location: event.location,
      status: "approved",
      description: event.description,
      link: event.link,
      external_id: event.external_id
    }], { onConflict: "group_id,external_id" });
  if (error) {
    console.error(`Error upserting "${event.title}": ${error.message}`);
  } else {
    console.log(`Upserted: "${event.title}"`);
  }
}

// Function to extract tags from Meetup page
async function extractGroupTags() {
  try {
    // First, get the group page instead of events page to find tags
    const groupUrl = MEETUP_URL.split('/events')[0];
    const { data: html } = await axios.get(groupUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });

    const $ = cheerio.load(html);
    const tags = [];

    // Look for topics or tags on the page
    $('[data-testid="group-topics"] span, .groupTopics span, .topics a').each(function() {
      const tag = $(this).text().trim();
      if (tag && !tag.includes("See all") && !tag.includes("show more")) {
        tags.push(tag);
      }
    });

    if (tags.length > 0) {
      // Update the group tags in Supabase
      const { error } = await supabase
        .from("groups")
        .update({ tags })
        .eq("id", UTAH_GO_GROUP_ID);
      
      if (error) {
        console.error("Error updating group tags:", error.message);
      } else {
        console.log("Updated group tags:", tags);
      }
    }

    return tags;
  } catch (err) {
    console.error("Failed to extract group tags:", err.message);
    return [];
  }
}

async function scrapeMeetupEvents() {
  try {
    // Try to extract and update group tags first
    await extractGroupTags();

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

      // Get external_id from link
      event.external_id = extractEventId(relLink);

      // Get event date
      // Try to parse date as ISO (yyyy-mm-dd), fallback to text
      const dateStr = $(this).find("time").attr("datetime") || $(this).find("time").text();
      if (dateStr) {
        event.event_date = dateStr.split("T")[0];
        event.start_time = dateStr.includes("T") ? dateStr.split("T")[1]?.slice(0, 5) : null;
      }

      // Get event description (if available)
      event.description = $(this).find("p").text().trim();

      // Meetup does not directly list city, so try scraping a "location" string if present
      event.location = $(this).find("[data-testid='event-card-location']").text().trim() ||
        $(this).find("span:contains('Location')").parent().text().replace('Location', '').trim();

      // Filter only if an event title and external_id is present
      if (event.title && event.external_id) {
        events.push(event);
      }
    });

    if (events.length === 0) {
      console.log("No events found to upsert.");
      return;
    }

    // Upsert all events sequentially for robust error reporting
    for (const event of events) {
      await upsertEvent(event);
    }
    console.log(`Finished upserting ${events.length} events.`);
  } catch (err) {
    console.error("Failed to fetch or scrape Meetup events:", err.message);
  }
}

scrapeMeetupEvents();
