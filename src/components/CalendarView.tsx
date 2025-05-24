
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
  
  // Check if a date has events
  const hasEvents = (date: Date) => {
    return eventDates.some(eventDate => isSameDay(eventDate, date));
  };

  return (
    <div className="bg-gradient-to-br from-[#22243A]/80 via-[#23283B]/80 to-[#383B53]/80 backdrop-blur-sm border border-white/10 rounded-xl p-3">
      <Calendar
        mode="single"
        selected={selectedDate || undefined}
        onSelect={(date) => onDateSelect(date || null)}
        className="w-full pointer-events-auto"
        classNames={{
          cell: "text-center text-sm p-0 relative flex items-center justify-center",
          day: cn(
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative hover:bg-white/10 cursor-pointer rounded-full inline-flex items-center justify-center"
          ),
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-full",
          day_today: "text-primary font-semibold bg-transparent",
        }}
        modifiers={{
          hasEvents: (date) => hasEvents(date)
        }}
        modifiersClassNames={{
          hasEvents: "relative after:absolute after:bottom-0.5 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
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
