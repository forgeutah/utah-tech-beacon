
import { serve } from "https://deno.land/std@0.171.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to format date for iCal
function formatICalDate(date: string, time?: string): string {
  const dateObj = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(':');
    dateObj.setHours(parseInt(hours), parseInt(minutes));
  }
  return dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Helper function to escape iCal text
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const selectedGroups = url.searchParams.get('groups')?.split(',').filter(Boolean) || [];
    const selectedTags = url.searchParams.get('tags')?.split(',').filter(Boolean) || [];

    const supabase = createClient(
      "https://gocvjqljtcxtcrwvfwez.supabase.co",
      Deno.env.get('SUPABASE_ANON_KEY') || ""
    );

    // Build query
    let query = supabase
      .from("events")
      .select(`
        id,
        title,
        event_date,
        start_time,
        end_time,
        location,
        description,
        tags,
        groups (
          name,
          status
        )
      `)
      .eq("status", "approved")
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });

    const { data: events, error } = await query;

    if (error) {
      throw error;
    }

    // Filter events based on selected groups and tags
    const filteredEvents = events?.filter((event: any) => {
      // Only show event if group is null (unlisted) or group.status is approved
      if (event.groups && event.groups.status !== "approved") {
        return false;
      }
      
      // Filter by selected groups
      if (selectedGroups.length > 0) {
        if (!event.group_id || !selectedGroups.includes(event.group_id)) {
          return false;
        }
      }
      
      // Filter by selected tags
      if (selectedTags.length > 0) {
        if (!event.tags || !event.tags.some((tag: string) => selectedTags.includes(tag))) {
          return false;
        }
      }
      
      return true;
    }) || [];

    // Generate iCal content
    const icalEvents = filteredEvents.map((event: any) => {
      const startDate = formatICalDate(event.event_date, event.start_time);
      const endDate = event.end_time 
        ? formatICalDate(event.event_date, event.end_time)
        : formatICalDate(event.event_date, event.start_time ? `${parseInt(event.start_time.split(':')[0]) + 1}:${event.start_time.split(':')[1]}` : '23:59');
      
      const groupName = event.groups?.name || 'Unlisted Group';
      const description = event.description ? escapeICalText(event.description) : '';
      const location = event.location ? escapeICalText(event.location) : '';
      const title = escapeICalText(event.title);

      return `BEGIN:VEVENT
UID:${event.id}@utahdevevents.com
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${title}
DESCRIPTION:${description}\\n\\nGroup: ${groupName}${event.tags ? `\\n\\nTags: ${event.tags.join(', ')}` : ''}
LOCATION:${location}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT`;
    }).join('\n');

    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Utah Dev Events//Utah Dev Events Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Utah Dev Events
X-WR-CALDESC:Utah Developer Community Events
X-WR-TIMEZONE:America/Denver
${icalEvents}
END:VCALENDAR`;

    return new Response(icalContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": "attachment; filename=utah-dev-events.ics",
      },
    });
  } catch (err) {
    console.error("Error generating iCal:", err);
    return new Response(
      JSON.stringify({ message: "Failed to generate iCal", error: err.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
