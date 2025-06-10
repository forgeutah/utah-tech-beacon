
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedEvent {
  url: string;
  title: string;
  description: string;
  time: string; // ISO datetime string
  venue_name: string;
  venue_url?: string;
  venue_address: string;
  image_url?: string;
}

interface ScrapeResponse {
  events: ScrapedEvent[];
}

// Function to create a JWT for Google OAuth
async function createJWT(serviceAccountKey: any): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccountKey.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600, // 1 hour
    iat: now
  };

  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  // Create signature
  const textToSign = `${encodedHeader}.${encodedPayload}`;
  const privateKey = serviceAccountKey.private_key;

  // Import the private key
  const keyData = privateKey.replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(textToSign)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${textToSign}.${encodedSignature}`;
}

// Function to get OAuth token using the JWT
async function getOAuthToken(serviceAccountKey: any): Promise<string> {
  const jwt = await createJWT(serviceAccountKey);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get OAuth token: ${error}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the service account key JSON
    const serviceAccountKeyJson = Deno.env.get('MEETUP_SCRAPER_IAM_KEY')
    if (!serviceAccountKeyJson) {
      throw new Error('MEETUP_SCRAPER_IAM_KEY not configured')
    }

    // Parse the service account key
    let serviceAccountKey;
    try {
      serviceAccountKey = JSON.parse(serviceAccountKeyJson);
    } catch (parseError) {
      console.error('Error parsing service account key:', parseError);
      throw new Error('Invalid service account key format. Must be valid JSON.');
    }

    console.log('Getting OAuth token from Google Cloud IAM...')
    
    // Get OAuth token
    const oauthToken = await getOAuthToken(serviceAccountKey);
    console.log('Successfully obtained OAuth token')

    console.log('Starting event scraping process...')

    // Fetch all groups with meetup_link from database
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, meetup_link')
      .not('meetup_link', 'is', null)
      .eq('status', 'approved') // Only scrape approved groups

    if (groupsError) {
      console.error('Error fetching groups:', groupsError)
      throw groupsError
    }

    console.log(`Found ${groups?.length || 0} groups with meetup links`)

    let totalEventsProcessed = 0
    let totalEventsCreated = 0
    let totalEventsUpdated = 0

    // Process each group
    for (const group of groups || []) {
      if (!group.meetup_link) continue

      console.log(`Processing group: ${group.name} (${group.meetup_link})`)

      try {
        // Call the scraping service with OAuth token
        const scrapeResponse = await fetch('https://utah-dev-events-839851813394.us-west3.run.app/scrape-events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oauthToken}`
          },
          body: JSON.stringify({
            url: group.meetup_link,
            max_events: 3
          })
        })

        if (!scrapeResponse.ok) {
          console.error(`Failed to scrape events for group ${group.name}: ${scrapeResponse.status}`)
          continue
        }

        const scrapeData: ScrapeResponse = await scrapeResponse.json()
        console.log(`Scraped ${scrapeData.events?.length || 0} events for group ${group.name}`)

        // Process each scraped event
        for (const scrapedEvent of scrapeData.events || []) {
          totalEventsProcessed++

          // Parse the event date and time
          const eventDateTime = new Date(scrapedEvent.time)
          const eventDate = eventDateTime.toISOString().split('T')[0]
          const startTime = eventDateTime.toTimeString().split(' ')[0].substring(0, 5)

          // Check if event already exists (by URL)
          const { data: existingEvents, error: checkError } = await supabase
            .from('events')
            .select('id')
            .eq('link', scrapedEvent.url)
            .limit(1)

          if (checkError) {
            console.error('Error checking existing event:', checkError)
            continue
          }

          const eventData = {
            group_id: group.id,
            title: scrapedEvent.title,
            description: scrapedEvent.description,
            event_date: eventDate,
            start_time: startTime,
            location: scrapedEvent.venue_address,
            venue_name: scrapedEvent.venue_name,
            link: scrapedEvent.url,
            image: scrapedEvent.image_url,
            status: 'approved' // Auto-approve scraped events
          }

          if (existingEvents && existingEvents.length > 0) {
            // Update existing event
            const { error: updateError } = await supabase
              .from('events')
              .update(eventData)
              .eq('id', existingEvents[0].id)

            if (updateError) {
              console.error('Error updating event:', updateError)
            } else {
              totalEventsUpdated++
              console.log(`Updated event: ${scrapedEvent.title}`)
            }
          } else {
            // Create new event
            const { error: insertError } = await supabase
              .from('events')
              .insert([eventData])

            if (insertError) {
              console.error('Error creating event:', insertError)
            } else {
              totalEventsCreated++
              console.log(`Created event: ${scrapedEvent.title}`)
            }
          }
        }
      } catch (error) {
        console.error(`Error processing group ${group.name}:`, error)
        continue
      }
    }

    const summary = {
      totalGroups: groups?.length || 0,
      totalEventsProcessed,
      totalEventsCreated,
      totalEventsUpdated,
      message: 'Event scraping completed successfully'
    }

    console.log('Scraping summary:', summary)

    return new Response(
      JSON.stringify(summary),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in scrape-meetup-events function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
