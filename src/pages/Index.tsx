
import { CalendarDays, Github, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React from "react";
import AddEventModal from "@/components/AddEventModal";
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CalendarSidebar } from "@/components/CalendarSidebar";
import { EventsTable } from "@/components/EventsTable";

// Fetch all approved upcoming events and their approved groups from Supabase
async function fetchUpcomingEvents() {
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
      description,
      groups (
        name,
        status
      )
    `)
    .eq("status", "approved")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch all approved groups for the filter
async function fetchGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name")
    .eq("status", "approved")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

const Index = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: fetchUpcomingEvents,
  });

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
    
    // TODO: Add tag filtering when tags are implemented
    
    return true;
  }) || [];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#1A1F2C] to-[#23283B]">
        <CalendarSidebar 
          groups={groups || []}
          selectedGroups={selectedGroups}
          setSelectedGroups={setSelectedGroups}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
        
        <div className="flex-1 flex flex-col">
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

          {/* EVENTS TABLE */}
          <section className="flex flex-col items-center flex-1 mb-10 px-4">
            <div className="card-gradient max-w-6xl w-full p-6 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
                <CalendarDays className="w-6 h-6 text-primary" />
                Utah Tech Events Calendar
                {filteredEvents.length > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({filteredEvents.length} events)
                  </span>
                )}
              </h2>
              
              <EventsTable 
                events={filteredEvents}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </section>

          {/* FOOTER */}
          <footer className="w-full text-center py-6 text-muted-foreground text-sm border-t border-border mt-auto">
            <span>
              &copy; {new Date().getFullYear()} Forge Utah Foundation. Empowering Utah's developer community.
            </span>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
