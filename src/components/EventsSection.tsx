
import { Calendar, Rss } from "lucide-react";
import { useState } from "react";
import { parseISO, isSameDay, startOfToday } from "date-fns";
import { EventsTimeline } from "@/components/EventsTimeline";
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";
import { CalendarView } from "@/components/CalendarView";
import CalendarLinkModal from "@/components/CalendarLinkModal";
import RssLinkModal from "@/components/RssLinkModal";
import AddEventModal from "@/components/AddEventModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Event {
  id: string;
  title: string;
  event_date: string;
  start_time?: string;
  location?: string;
  link?: string;
  description?: string;
  tags?: string[];
  groups?: {
    name: string;
    status: string;
  } | null;
  group_id?: string;
}

interface Group {
  id: string;
  name: string;
  tags?: string[];
}

interface EventsSectionProps {
  events: Event[];
  groups: Group[];
  isLoading: boolean;
  error: any;
  allTags: string[];
}

export default function EventsSection({ events, groups, isLoading, error, allTags }: EventsSectionProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [visibleEventCount, setVisibleEventCount] = useState(10);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showRssModal, setShowRssModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

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

  // Generate RSS URL with current filters
  const generateRssUrl = () => {
    const params = new URLSearchParams();
    if (selectedGroups.length > 0) {
      params.set('groups', selectedGroups.join(','));
    }
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    }
    
    return `https://gocvjqljtcxtcrwvfwez.supabase.co/functions/v1/generate-rss?${params.toString()}`;
  };

  // Extract all tags from groups and events combined
  const allAvailableTags = [...new Set([
    ...allTags,
    ...groups
      .filter(group => group.tags && group.tags.length > 0)
      .flatMap(group => group.tags || [])
  ])].sort();

  // Filter events to only show today and future events
  const upcomingEvents = events?.filter((event: Event) => {
    const eventDate = parseISO(event.event_date);
    const today = startOfToday();
    return eventDate >= today;
  }) || [];

  // Filter events based on selected groups, tags, and date using OR logic
  const filteredEvents = upcomingEvents.filter((event: Event) => {
    console.log('Filtering event:', event.title, {
      eventGroupId: event.group_id,
      eventTags: event.tags,
      groupTags: event.groups?.tags,
      selectedGroups,
      selectedTags,
      groupStatus: event.groups?.status
    });

    // Only show event if group is null (unlisted) or group.status is approved
    if (event.groups && event.groups.status !== "approved") {
      console.log('Event filtered out due to group status:', event.title);
      return false;
    }
    
    // Filter by selected date first
    if (selectedDate) {
      const eventDate = parseISO(event.event_date);
      if (!isSameDay(eventDate, selectedDate)) {
        console.log('Event filtered out due to date:', event.title);
        return false;
      }
    }
    
    // If no group or tag filters are selected, show all events (that passed the date filter)
    if (selectedGroups.length === 0 && selectedTags.length === 0) {
      console.log('No filters selected, showing event:', event.title);
      return true;
    }
    
    // Check if event matches any selected group
    const matchesGroup = selectedGroups.length > 0 && event.group_id && selectedGroups.includes(event.group_id);
    
    // Check if event matches any selected tag
    // Use event tags if available, otherwise fall back to group tags
    const eventTagsToCheck = event.tags && event.tags.length > 0 
      ? event.tags 
      : (event.groups?.tags || []);
    
    const matchesTag = selectedTags.length > 0 && eventTagsToCheck.some((tag: string) => selectedTags.includes(tag));
    
    console.log('Filter results for event:', event.title, {
      matchesGroup,
      matchesTag,
      eventTagsToCheck,
      hasGroupFilters: selectedGroups.length > 0,
      hasTagFilters: selectedTags.length > 0
    });
    
    // If both filters are active, event must match at least one
    if (selectedGroups.length > 0 && selectedTags.length > 0) {
      const result = matchesGroup || matchesTag;
      console.log('Both filters active, OR result:', result);
      return result;
    }
    
    // If only group filter is active
    if (selectedGroups.length > 0 && selectedTags.length === 0) {
      console.log('Only group filter active, result:', matchesGroup);
      return matchesGroup;
    }
    
    // If only tag filter is active
    if (selectedTags.length > 0 && selectedGroups.length === 0) {
      console.log('Only tag filter active, result:', matchesTag);
      return matchesTag;
    }
    
    // Fallback - should not reach here
    console.log('Fallback case, showing event:', event.title);
    return true;
  });

  console.log('Final filtered events count:', filteredEvents.length);

  const handleShowMore = () => {
    setVisibleEventCount(prev => prev + 10);
  };

  return (
    <>
      <section className="flex flex-col items-center flex-1 mb-10 px-4">
        <div className="max-w-6xl w-full">
          <div className="flex gap-8">
            {/* Main content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6 ml-6">
                <div className="flex items-center gap-4">
                  <MultiSelectDropdown
                    groups={groups || []}
                    selectedGroups={selectedGroups}
                    onSelectionChange={setSelectedGroups}
                    placeholder="Groups"
                  />
                  
                  {allAvailableTags.length > 0 && (
                    <MultiSelectDropdown
                      groups={allAvailableTags.map(tag => ({ id: tag, name: tag }))}
                      selectedGroups={selectedTags}
                      onSelectionChange={setSelectedTags}
                      placeholder="Tags"
                    />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCalendarModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 text-primary border border-primary rounded-md hover:bg-primary hover:text-black transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    iCal
                  </button>
                  
                  <button
                    onClick={() => setShowRssModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 text-primary border border-primary rounded-md hover:bg-primary hover:text-black transition-colors"
                  >
                    <Rss className="w-4 h-4" />
                    RSS
                  </button>
                </div>
              </div>
              
              <EventsTimeline 
                events={filteredEvents}
                isLoading={isLoading}
                error={error}
                visibleCount={visibleEventCount}
                onShowMore={handleShowMore}
              />
            </div>

            {/* Calendar sidebar - hidden on mobile */}
            <div className="hidden md:block w-72 flex-shrink-0 space-y-4">
              <Button
                onClick={() => setShowAddEventModal(true)}
                className="w-full flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </Button>

              {/* Pass upcoming filtered events to calendar */}
              <CalendarView
                events={filteredEvents}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>
          </div>
        </div>
      </section>

      <CalendarLinkModal
        open={showCalendarModal}
        onOpenChange={setShowCalendarModal}
        selectedGroups={selectedGroups}
        selectedTags={selectedTags}
        groups={groups || []}
        generateICalUrl={generateICalUrl}
      />

      <RssLinkModal
        open={showRssModal}
        onOpenChange={setShowRssModal}
        selectedGroups={selectedGroups}
        selectedTags={selectedTags}
        groups={groups || []}
        generateRssUrl={generateRssUrl}
      />

      <AddEventModal 
        open={showAddEventModal} 
        onOpenChange={setShowAddEventModal} 
      />
    </>
  );
}
