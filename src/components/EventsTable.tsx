
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Event {
  id: string;
  title: string;
  event_date: string;
  start_time?: string;
  location?: string;
  description?: string;
  groups?: {
    name: string;
    status: string;
  } | null;
}

interface EventsTableProps {
  events: Event[];
  isLoading: boolean;
  error: any;
}

export function EventsTable({ events, isLoading, error }: EventsTableProps) {
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

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="text-muted-foreground text-sm border-b border-border">
            <TableHead className="text-muted-foreground">Event</TableHead>
            <TableHead className="text-muted-foreground">Group</TableHead>
            <TableHead className="text-muted-foreground">Date & Time</TableHead>
            <TableHead className="text-muted-foreground">Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} className="border-b border-border hover:bg-white/5 transition">
              <TableCell className="text-white font-medium">
                <div>
                  <div className="font-medium">{event.title}</div>
                  {event.description && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {event.description}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-muted-foreground">
                {event.groups?.name ?? (
                  <span className="italic text-xs">Unlisted Group</span>
                )}
              </TableCell>
              
              <TableCell className="text-muted-foreground">
                <div className="flex flex-col">
                  <span>
                    {event.event_date &&
                      new Date(event.event_date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    }
                  </span>
                  {event.start_time && (
                    <span className="text-sm">
                      {event.start_time.slice(0, 5)}
                    </span>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-muted-foreground">
                {event.location || "TBD"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
