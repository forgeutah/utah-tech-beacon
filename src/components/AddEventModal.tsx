
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Step = 1 | 2 | 3;
type EventType = "one-time" | "recurring-group" | null;

export default function AddEventModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<Step>(1);
  const [eventType, setEventType] = useState<EventType>(null);
  const [eventData, setEventData] = useState({
    title: "",
    group: "",
    event_date: "",
    start_time: "",
    location: "",
  });
  const [groupData, setGroupData] = useState({
    name: "",
    meetup_link: "",
    luma_link: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setEventType(null);
      setEventData({ title: "", group: "", event_date: "", start_time: "", location: "" });
      setGroupData({ name: "", meetup_link: "", luma_link: "" });
    }, 200);
  };

  // HANDLERS
  async function handleEventSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    // First, check group exists or not (very simple: just by name)
    let groupId: string | null = null;
    if (eventData.group) {
      const { data: group, error } = await supabase
        .from("groups")
        .select("id")
        .eq("name", eventData.group)
        .maybeSingle();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      if (group) groupId = group.id;
    }
    // If group doesn't exist, create new group (pending status).
    if (!groupId && eventData.group) {
      const { data, error } = await supabase
        .from("groups")
        .insert({ name: eventData.group, status: "pending" })
        .select()
        .single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      groupId = data.id;
    }
    // Insert the event
    const { error: eventError } = await supabase
      .from("events")
      .insert({
        title: eventData.title,
        group_id: groupId,
        event_date: eventData.event_date,
        start_time: eventData.start_time,
        location: eventData.location,
        status: "pending",
      });
    if (eventError) {
      toast({ title: "Error", description: eventError.message, variant: "destructive" });
    } else {
      toast({ title: "Event submitted!", description: "Your event is pending approval.", variant: "default" });
      handleClose();
    }
    setIsSubmitting(false);
  }

  async function handleGroupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase
      .from("groups")
      .insert({
        name: groupData.name,
        meetup_link: groupData.meetup_link,
        luma_link: groupData.luma_link,
        status: "pending",
      });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Group submitted!", description: "Your group is pending approval.", variant: "default" });
      handleClose();
    }
    setIsSubmitting(false);
  }

  // RENDER
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Event or Group</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Start by telling us what you're adding:"
              : step === 2 && eventType === "one-time"
                ? "Enter the details for your one-time event."
                : step === 2 && eventType === "recurring-group"
                  ? "Enter your group details and a link for recurring events."
                  : ""}
          </DialogDescription>
        </DialogHeader>
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Button
              className={`w-full ${eventType === "one-time" ? "border-2 border-primary" : ""}`}
              variant="outline"
              onClick={() => setEventType("one-time")}
            >
              One-time Event
            </Button>
            <Button
              className={`w-full ${eventType === "recurring-group" ? "border-2 border-primary" : ""}`}
              variant="outline"
              onClick={() => setEventType("recurring-group")}
            >
              Recurring Group with Regular Events
            </Button>
            <DialogFooter>
              <Button
                disabled={!eventType}
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && eventType === "one-time" && (
          <form onSubmit={handleEventSubmit} className="flex flex-col gap-3">
            <Input
              placeholder="Event Title"
              value={eventData.title}
              required
              onChange={e => setEventData(v => ({ ...v, title: e.target.value }))}
            />
            <Input
              placeholder="Group (optional - name)"
              value={eventData.group}
              onChange={e => setEventData(v => ({ ...v, group: e.target.value }))}
            />
            <Input
              type="date"
              placeholder="Date"
              value={eventData.event_date}
              required
              onChange={e => setEventData(v => ({ ...v, event_date: e.target.value }))}
            />
            <Input
              type="time"
              placeholder="Start Time"
              value={eventData.start_time}
              onChange={e => setEventData(v => ({ ...v, start_time: e.target.value }))}
            />
            <Input
              placeholder="City or Location"
              value={eventData.location}
              onChange={e => setEventData(v => ({ ...v, location: e.target.value }))}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 2 && eventType === "recurring-group" && (
          <form onSubmit={handleGroupSubmit} className="flex flex-col gap-3">
            <Input
              placeholder="Group Name"
              value={groupData.name}
              required
              onChange={e => setGroupData(v => ({ ...v, name: e.target.value }))}
            />
            <Input
              placeholder="Meetup.com Link (optional)"
              value={groupData.meetup_link}
              onChange={e => setGroupData(v => ({ ...v, meetup_link: e.target.value }))}
            />
            <Input
              placeholder="Luma Link (optional)"
              value={groupData.luma_link}
              onChange={e => setGroupData(v => ({ ...v, luma_link: e.target.value }))}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
