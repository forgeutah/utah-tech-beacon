
import { Calendar, Rss } from "lucide-react";
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";
import { Group } from "@/types/events";

interface EventsFilterControlsProps {
  groups: Group[];
  selectedGroups: string[];
  onGroupSelectionChange: (groups: string[]) => void;
  allAvailableTags: string[];
  selectedTags: string[];
  onTagSelectionChange: (tags: string[]) => void;
  onCalendarModalOpen: () => void;
  onRssModalOpen: () => void;
}

export const EventsFilterControls = ({
  groups,
  selectedGroups,
  onGroupSelectionChange,
  allAvailableTags,
  selectedTags,
  onTagSelectionChange,
  onCalendarModalOpen,
  onRssModalOpen
}: EventsFilterControlsProps) => {
  return (
    <div className="flex items-center justify-between mb-6 ml-6">
      <div className="flex items-center gap-4">
        <MultiSelectDropdown
          groups={groups || []}
          selectedGroups={selectedGroups}
          onSelectionChange={onGroupSelectionChange}
          placeholder="Groups"
        />
        
        {allAvailableTags.length > 0 && (
          <MultiSelectDropdown
            groups={allAvailableTags.map(tag => ({ id: tag, name: tag }))}
            selectedGroups={selectedTags}
            onSelectionChange={onTagSelectionChange}
            placeholder="Tags"
          />
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onCalendarModalOpen}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 text-primary border border-primary rounded-md hover:bg-primary hover:text-black transition-colors"
        >
          <Calendar className="w-4 h-4" />
          iCal
        </button>
        
        <button
          onClick={onRssModalOpen}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 text-primary border border-primary rounded-md hover:bg-primary hover:text-black transition-colors"
        >
          <Rss className="w-4 h-4" />
          RSS
        </button>
      </div>
    </div>
  );
};
