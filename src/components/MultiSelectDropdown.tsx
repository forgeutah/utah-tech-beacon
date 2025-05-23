
import React, { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Group {
  id: string;
  name: string;
}

interface MultiSelectDropdownProps {
  groups: Group[];
  selectedGroups: string[];
  onSelectionChange: (groups: string[]) => void;
  placeholder?: string;
}

export function MultiSelectDropdown({
  groups,
  selectedGroups,
  onSelectionChange,
  placeholder = "Filter by groups"
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleGroupToggle = (groupId: string) => {
    const newSelection = selectedGroups.includes(groupId)
      ? selectedGroups.filter(id => id !== groupId)
      : [...selectedGroups, groupId];
    onSelectionChange(newSelection);
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-10 justify-between text-white border-border bg-transparent hover:bg-white/10"
          >
            <span>
              {selectedGroups.length === 0 
                ? placeholder
                : `${selectedGroups.length} selected`
              }
            </span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56 bg-popover border-border" 
          align="start"
        >
          {groups.map((group) => (
            <DropdownMenuCheckboxItem
              key={group.id}
              checked={selectedGroups.includes(group.id)}
              onCheckedChange={() => handleGroupToggle(group.id)}
              onSelect={(event) => event.preventDefault()}
              className="cursor-pointer"
            >
              {group.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedGroups.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-white"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
