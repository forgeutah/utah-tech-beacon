
import React, { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Group {
  id: string;
  name: string;
}

interface MultiSelectDropdownProps {
  groups: Group[];
  selectedGroups: string[];
  onSelectionChange: (groups: string[]) => void;
}

export function MultiSelectDropdown({
  groups,
  selectedGroups,
  onSelectionChange,
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

  const selectedGroupNames = groups
    .filter(group => selectedGroups.includes(group.id))
    .map(group => group.name);

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
                ? "Filter by groups" 
                : `${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''} selected`
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
              className="cursor-pointer"
            >
              {group.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedGroups.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedGroupNames.slice(0, 3).map((name) => (
            <Badge 
              key={name} 
              variant="secondary" 
              className="bg-primary/20 text-primary border-primary/30"
            >
              {name}
            </Badge>
          ))}
          {selectedGroupNames.length > 3 && (
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              +{selectedGroupNames.length - 3} more
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-white"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
