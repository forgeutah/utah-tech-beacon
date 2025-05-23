import { CalendarDays, Github, Plus, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React from "react";
import AddEventModal from "@/components/AddEventModal";
import { useState } from "react";
import { EventsTable } from "@/components/EventsTable";
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";

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
      tags,
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
  const [visibleEventCount, setVisibleEventCount] = useState(10);

  // Generate iCal URL with current filters
  const generateICalUrl = () => {
    const params = new URLSearchParams();
    if (selectedGroups.length > 0) {
      params.set('groups', selectedGroups.join(','));
    }
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    }
    
    return `https://gocvjqljtcxtcrwvfwez.supabase.co/functions/v1/generate-ical?${params.toString()}`;
  };

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

  // Extract all unique tags from events for the tags filter
  const allTags = React.useMemo(() => {
    if (!events) return [];
    
    const tagsSet = new Set<string>();
    
    events.forEach((event: any) => {
      if (event.tags && Array.isArray(event.tags)) {
        event.tags.forEach((tag: string) => tagsSet.add(tag));
      }
    });
    
    return Array.from(tagsSet).sort();
  }, [events]);

  const handleShowMore = () => {
    setVisibleEventCount(prev => prev + 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#23283B]">
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <MultiSelectDropdown
                groups={groups || []}
                selectedGroups={selectedGroups}
                onSelectionChange={setSelectedGroups}
              />
              
              {allTags.length > 0 && (
                <MultiSelectDropdown
                  groups={allTags.map(tag => ({ id: tag, name: tag }))}
                  selectedGroups={selectedTags}
                  onSelectionChange={setSelectedTags}
                  placeholder="Filter by tags"
                />
              )}
            </div>
            
            <a
              href={generateICalUrl()}
              download="utah-dev-events.ics"
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 text-primary border border-primary rounded-md hover:bg-primary hover:text-black transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Download Calendar
            </a>
          </div>
          
          <EventsTable 
            events={filteredEvents}
            isLoading={isLoading}
            error={error}
            visibleCount={visibleEventCount}
            onShowMore={handleShowMore}
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
  );
};

export default Index;
