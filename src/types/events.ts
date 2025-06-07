
export interface Event {
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
    tags?: string[];
  } | null;
  group_id?: string;
}

export interface Group {
  id: string;
  name: string;
  tags?: string[];
}

export interface EventsSectionProps {
  events: Event[];
  groups: Group[];
  isLoading: boolean;
  error: any;
  allTags: string[];
}
