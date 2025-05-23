
import { CalendarDays, Github, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React from "react";
import AddEventModal from "@/components/AddEventModal";
import { useState } from "react";

// Fetch only approved upcoming events and their approved groups from Supabase
async function fetchUpcomingEvents() {
  // Select events & join groups for group names.
  const { data, error } = await supabase
    .from("events")
    .select(`
      id,
      title,
      event_date,
      start_time,
      location,
      status,
      group_id,
      groups (
        name,
        status
      )
    `)
    .eq("status", "approved")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(10); // Gets next 10 events

  if (error) throw error;
  return data || [];
}

const Index = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: fetchUpcomingEvents,
  });

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1F2C] to-[#23283B]">
      {/* NAVBAR */}
      <nav className="w-full flex justify-between items-center px-4 py-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-primary w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight text-white">
            Utah Dev Events
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/forgeutah"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white story-link"
            aria-label="Forge Utah Foundation Github"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </a>
          <button
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-black font-semibold shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-fade-in"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>
          <AddEventModal open={showModal} onOpenChange={setShowModal} />
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center mt-8 mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
          Discover &amp; Share{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-primary bg-clip-text text-transparent">
            Tech Events
          </span>{" "}
          in Utah
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-6">
          The Utah Developer Community Calendar – your source for all{" "}
          <span className="text-primary font-semibold">technology events</span>{" "}
          across Utah. Powered by{" "}
          <span className="text-white font-bold">Forge Utah Foundation</span>.
        </p>
      </section>

      {/* UPCOMING EVENTS PREVIEW */}
      <section className="flex flex-col items-center flex-1 mb-10">
        <div className="card-gradient max-w-3xl w-full p-6 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
            <CalendarDays className="w-6 h-6 text-primary" />
            Upcoming Events
          </h2>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-muted-foreground text-sm border-b border-border">
                  <th className="py-2 px-3 font-semibold">Event</th>
                  <th className="py-2 px-3 font-semibold">Group</th>
                  <th className="py-2 px-3 font-semibold">Date &amp; Time / City</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-muted-foreground">
                      Loading events...
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-red-500">
                      Failed to load events.
                    </td>
                  </tr>
                )}
                {!isLoading && !error && events && events.filter((event: any) => {
                  // Only show event if group is null (unlisted) or group.status is approved
                  return !event.groups || event.groups.status === "approved";
                }).length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-muted-foreground">
                      No events yet.
                    </td>
                  </tr>
                )}
                {!isLoading && events && events
                  .filter((event: any) => {
                    // Only show event if group is null (unlisted) or group.status is approved
                    return !event.groups || event.groups.status === "approved";
                  })
                  .map((event: any) => (
                    <tr key={event.id} className="border-b border-border hover:bg-white/5 transition">
                      {/* Event Title */}
                      <td className="py-3 px-3 text-white font-medium">{event.title}</td>
                      
                      {/* Group Name */}
                      <td className="py-3 px-3 text-muted-foreground">
                        {event.groups?.name ?? <span className="italic text-xs">Unlisted Group</span>}
                      </td>
                      
                      {/* Date, Time and City */}
                      <td className="py-3 px-3 text-muted-foreground">
                        <span>
                          {event.event_date &&
                            new Date(event.event_date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric"
                            })
                          }
                          {event.start_time ? (
                            <>
                              {" "}
                              at {event.start_time.slice(0, 5)}
                            </>
                          ) : null}
                          {event.location ? (
                            <> &mdash; {event.location}</>
                          ) : null}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <a href="#" className="text-primary text-sm story-link">See full calendar &rarr;</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full text-center py-6 text-muted-foreground text-sm border-t border-border mt-auto">
        <span>
          &copy; {new Date().getFullYear()} Forge Utah Foundation. Empowering Utah's developer community.
        </span>
      </footer>
    </div>
  );
};

export default Index;
