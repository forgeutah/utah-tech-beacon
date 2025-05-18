
import { serve } from "https://deno.land/std@0.171.0/http/server.ts";
import cheerio from "npm:cheerio@1.0.0-rc.12";
import axios from "npm:axios@1.6.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to extract event IDs from Meetup
function extractEventId(link: string | null) {
  if (!link) return null;
  const match = link.match(/\/events\/(\d+)/);
  return match ? match[1] : null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { meetup_link, luma_link } = await req.json();
    let events: any[] = [];

    // Only support meetup.com for now
    if (meetup_link && meetup_link.includes("meetup.com")) {
      const url = meetup_link.endsWith("/") ? meetup_link + "events/" : meetup_link + "/events/";
      const { data: html } = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "text/html"
        }
      });

      const $ = cheerio.load(html);

      $("section[data-testid='event-list'] article[eventid], article[data-event-id]").each(function () {
        if (events.length >= 3) return;
        const event: any = {};

        event.title = $(this).find("h3").text().trim();

        const relLink = $(this).find("a[href*='/events/']").attr("href");
        event.link = relLink ? `https://www.meetup.com${relLink}` : null;
        event.external_id = extractEventId(relLink);

        const dateStr = $(this).find("time").attr("datetime") || $(this).find("time").text();
        if (dateStr) {
          event.event_date = dateStr.split("T")[0];
          event.start_time = dateStr.includes("T") ? dateStr.split("T")[1]?.slice(0, 5) : null;
        }

        event.description = $(this).find("p").text().trim();
        event.location = $(this).find("[data-testid='event-card-location']").text().trim()
          || $(this).find("span:contains('Location')").parent().text().replace('Location', '').trim();

        if (event.title && event.external_id) {
          events.push(event);
        }
      });
    }

    // Future: add support for Luma, etc.

    // Cap to 3 events max
    return new Response(JSON.stringify({ events: events.slice(0, 3) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error in scrape-events:", err);
    return new Response(
      JSON.stringify({ message: "Failed to scrape events", error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
