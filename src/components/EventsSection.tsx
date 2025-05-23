import { Calendar } from "lucide-react";
import { useState } from "react";
import { EventsTimeline } from "@/components/EventsTimeline";
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";
import CalendarLinkModal from "@/components/CalendarLinkModal";

interface Event {
  id: string;
  title: string;
  event_date: string;
  start_time?: string;
  location?: string;
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
  const [visibleEventCount, setVisibleEventCount] = useState(10);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

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

  // Extract all tags from groups and events combined
  const allAvailableTags = [...new Set([
    ...allTags,
    ...groups
      .filter(group => group.tags && group.tags.length > 0)
      .flatMap(group => group.tags || [])
  ])].sort();

  // Filter events based on selected groups and tags
  const filteredEvents = events?.filter((event: Event) => {
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

  const handleShowMore = () => {
    setVisibleEventCount(prev => prev + 10);
  };

  return (
    <>
      <section className="flex flex-col items-center flex-1 mb-10 px-4">
        <div className="max-w-6xl w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <MultiSelectDropdown
                groups={groups || []}
                selectedGroups={selectedGroups}
                onSelectionChange={setSelectedGroups}
              />
              
              {allAvailableTags.length > 0 && (
                <MultiSelectDropdown
                  groups={allAvailableTags.map(tag => ({ id: tag, name: tag }))}
                  selectedGroups={selectedTags}
                  onSelectionChange={setSelectedTags}
                  placeholder="Filter by tags"
                />
              )}
            </div>
            
            <button
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 text-primary border border-primary rounded-md hover:bg-primary hover:text-black transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Get Calendar Link
            </button>
          </div>
          
          <EventsTimeline 
            events={filteredEvents}
            isLoading={isLoading}
            error={error}
            visibleCount={visibleEventCount}
            onShowMore={handleShowMore}
          />
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
    </>
  );
}
