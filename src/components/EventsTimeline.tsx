
import React from "react";
import { format, parseISO, isSameDay, isToday, isTomorrow, isYesterday, isPast, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users } from "lucide-react";

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
}

interface EventsTimelineProps {
  events: Event[];
  isLoading: boolean;
  error: any;
  visibleCount: number;
  onShowMore: () => void;
}

const formatEventDateTime = (eventDate: string, startTime?: string) => {
  const date = parseISO(eventDate);
  
  // Create full datetime if we have start_time
  let fullDateTime = date;
  if (startTime) {
    const [hours, minutes] = startTime.split(':').map(Number);
    fullDateTime = new Date(date);
    fullDateTime.setHours(hours, minutes);
  }
  
  // Format the time part in AM/PM
  let timeDisplay = "";
  if (startTime) {
    timeDisplay = format(fullDateTime, "h:mm a");
    
    // Add relative time for upcoming events
    if (!isPast(fullDateTime)) {
      const relativeTime = formatDistanceToNow(fullDateTime, { addSuffix: true });
      timeDisplay += ` • ${relativeTime}`;
    }
  }
  
  return { date, timeDisplay };
};

const formatDayHeader = (date: Date) => {
  if (isToday(date)) {
    return `${format(date, "MMM d")} Today`;
  } else if (isTomorrow(date)) {
    return `${format(date, "MMM d")} Tomorrow`;
  } else if (isYesterday(date)) {
    return `${format(date, "MMM d")} Yesterday`;
  } else {
    return `${format(date, "MMM d")} ${format(date, "EEEE")}`;
  }
};

export function EventsTimeline({ events, isLoading, error, visibleCount, onShowMore }: EventsTimelineProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        Failed to load events.
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No events match your current filters.
      </div>
    );
  }

  const visibleEvents = events.slice(0, visibleCount);
  const hasMoreEvents = events.length > visibleCount;

  // Group events by date
  const groupedEvents = visibleEvents.reduce((groups, event) => {
    const { date } = formatEventDateTime(event.event_date, event.start_time);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date,
        events: []
      };
    }
    
    groups[dateKey].events.push(event);
    return groups;
  }, {} as Record<string, { date: Date; events: Event[] }>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([dateKey, { date, events: dayEvents }]) => (
        <div key={dateKey} className="flex gap-6">
          {/* Date column */}
          <div className="flex-shrink-0 w-24">
            <div className="sticky top-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <div className="font-medium">
                  {formatDayHeader(date)}
                </div>
              </div>
            </div>
          </div>

          {/* Events column */}
          <div className="flex-1 space-y-4">
            {dayEvents.map((event) => {
              const { timeDisplay } = formatEventDateTime(event.event_date, event.start_time);
              
              return (
                <div
                  key={event.id}
                  className="bg-gradient-to-br from-[#22243A]/80 via-[#23283B]/80 to-[#383B53]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-all duration-200"
                >
                  {/* Time and duration */}
                  {timeDisplay && (
                    <div className="flex items-center gap-2 text-sm text-primary mb-3">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{timeDisplay}</span>
                    </div>
                  )}

                  {/* Event title */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {event.title}
                  </h3>

                  {/* Event description */}
                  {event.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Event details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    {/* Group */}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {event.groups?.name ?? (
                          <span className="italic">Unlisted Group</span>
                        )}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location || "TBD"}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs bg-transparent border-primary/40 text-primary/90 px-2"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {hasMoreEvents && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={onShowMore}
            className="px-6 py-2 text-sm bg-primary/10 text-primary border border-primary rounded-md hover:bg-primary hover:text-black transition-colors"
          >
            Show More ({events.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
