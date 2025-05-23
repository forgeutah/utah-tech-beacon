
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Users, Tag } from "lucide-react";

interface Group {
  id: string;
  name: string;
  tags?: string[];
}

interface CalendarSidebarProps {
  groups: Group[];
  selectedGroups: string[];
  setSelectedGroups: (groups: string[]) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  allTags: string[];
}

export function CalendarSidebar({
  groups,
  selectedGroups,
  setSelectedGroups,
  selectedTags,
  setSelectedTags,
  allTags,
}: CalendarSidebarProps) {
  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups(
      selectedGroups.includes(groupId)
        ? selectedGroups.filter(id => id !== groupId)
        : [...selectedGroups, groupId]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const clearAllFilters = () => {
    setSelectedGroups([]);
    setSelectedTags([]);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <span className="font-semibold text-white">Filters</span>
          </div>
          <SidebarTrigger />
        </div>
        {(selectedGroups.length > 0 || selectedTags.length > 0) && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Groups
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={group.id}
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => handleGroupToggle(group.id)}
                  />
                  <label
                    htmlFor={group.id}
                    className="text-sm text-sidebar-foreground cursor-pointer hover:text-white transition-colors"
                  >
                    {group.name}
                  </label>
                </div>
              ))}
              {groups.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No groups available
                </p>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              {allTags.length > 0 ? (
                allTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    />
                    <label
                      htmlFor={`tag-${tag}`}
                      className="text-sm text-sidebar-foreground cursor-pointer hover:text-white transition-colors"
                    >
                      {tag}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No tags available
                </p>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
