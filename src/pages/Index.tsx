import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";

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
        status,
        tags
      )
    `)
    .eq("status", "approved")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  
  // Add sample events for demo purposes
  const sampleEvents = [
    {
      id: "sample-1",
      title: "React Meetup - State Management",
      event_date: "2025-05-25",
      start_time: "18:00",
      location: "Tech Hub Downtown",
      status: "approved",
      group_id: "sample-group-1",
      description: "Join us for an in-depth discussion about state management in React applications.",
      tags: ["React", "JavaScript", "Frontend"],
      groups: {
        name: "React Developers",
        status: "approved",
        tags: ["React", "JavaScript"]
      }
    },
    {
      id: "sample-2", 
      title: "Evening Networking Social",
      event_date: "2025-05-25",
      start_time: "20:30",
      location: "Rooftop Bar & Grill",
      status: "approved",
      group_id: "sample-group-2",
      description: "Casual networking event for tech professionals. Come meet fellow developers and share experiences.",
      tags: ["Networking", "Social", "Community"],
      groups: {
        name: "Tech Professionals Network",
        status: "approved", 
        tags: ["Networking", "Community"]
      }
    }
  ];

  return [...sampleEvents, ...(data || [])];
}

// Fetch all approved groups for the filter
async function fetchGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, tags")
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

  // Extract all unique tags from events and groups for the tags filter
  const allTags = React.useMemo(() => {
    if (!events && !groups) return [];
    
    const tagsSet = new Set<string>();
    
    // Add event tags
    if (events) {
      events.forEach((event: any) => {
        if (event.tags && Array.isArray(event.tags)) {
          event.tags.forEach((tag: string) => tagsSet.add(tag));
        }
      });
    }
    
    // Add group tags
    if (groups) {
      groups.forEach((group: any) => {
        if (group.tags && Array.isArray(group.tags)) {
          group.tags.forEach((tag: string) => tagsSet.add(tag));
        }
      });
    }
    
    return Array.from(tagsSet).sort();
  }, [events, groups]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#23283B]">
      <Navbar />
      <Hero />
      <EventsSection 
        events={events || []}
        groups={groups || []}
        isLoading={isLoading}
        error={error}
        allTags={allTags}
      />
      <Footer />
    </div>
  );
};

export default Index;
