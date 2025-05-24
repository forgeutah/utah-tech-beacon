
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

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

interface CalendarViewProps {
  events: Event[];
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

export function CalendarView({ events, selectedDate, onDateSelect }: CalendarViewProps) {
  // Get dates that have events
  const eventDates = events.map(event => parseISO(event.event_date));
  
  // Custom day content to show dots for event days
  const renderDay = (date: Date) => {
    const hasEvents = eventDates.some(eventDate => isSameDay(eventDate, date));
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{format(date, 'd')}</span>
        {hasEvents && (
          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-[#22243A]/80 via-[#23283B]/80 to-[#383B53]/80 backdrop-blur-sm border border-white/10 rounded-xl p-3">
      <h3 className="text-lg font-semibold text-white mb-3">Calendar</h3>
      <Calendar
        mode="single"
        selected={selectedDate || undefined}
        onSelect={(date) => onDateSelect(date || null)}
        className="w-full"
        classNames={{
          day: cn(
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative hover:bg-white/10 cursor-pointer"
          ),
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
        }}
        components={{
          Day: ({ date }) => renderDay(date),
        }}
      />
      {selectedDate && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <button
            onClick={() => onDateSelect(null)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}
