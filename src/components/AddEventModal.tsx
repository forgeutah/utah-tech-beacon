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
    contact_email: "",
  });
  const [groupData, setGroupData] = useState({
    name: "",
    meetup_link: "",
    luma_link: "",
    contact_email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setEventType(null);
      setEventData({ title: "", group: "", event_date: "", start_time: "", location: "", contact_email: "" });
      setGroupData({ name: "", meetup_link: "", luma_link: "", contact_email: "" });
    }, 200);
  };

  // Add validator step
  type ValidatorStep = "form" | "validator" | "confirmed";
  const [validatorStep, setValidatorStep] = useState<ValidatorStep>("form");
  const [scrapedEvents, setScrapedEvents] = useState<any[]>([]);
  const [scrapeError, setScrapeError] = useState<string>("");

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

    // Scrape events before submitting group
    try {
      setScrapeError("");
      setScrapedEvents([]);

      const res = await fetch("/functions/v1/scrape-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetup_link: groupData.meetup_link,
          luma_link: groupData.luma_link,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to scrape events. Please double check your link.");
      }
      const data = await res.json();
      setScrapedEvents(data.events || []);
      setValidatorStep("validator");
    } catch (err: any) {
      setScrapeError(err.message || "Unknown error scraping events.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApproveGroup() {
    setIsSubmitting(true);
    // Insert group
    const { data: group, error } = await supabase
      .from("groups")
      .insert({
        name: groupData.name,
        meetup_link: groupData.meetup_link,
        luma_link: groupData.luma_link,
        status: "pending",
      }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    // Insert events
    for (const e of scrapedEvents) {
      await supabase.from("events").insert({
        title: e.title,
        group_id: group.id,
        event_date: e.event_date,
        start_time: e.start_time,
        location: e.location,
        status: "pending",
        description: e.description,
        link: e.link,
        external_id: e.external_id
      });
    }
    toast({ title: "Group submitted!", description: "Your group is pending approval along with the next 3 events.", variant: "default" });
    handleClose();
    setValidatorStep("confirmed");
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
              ? "All events and groups go through an approval process before being listed. We may contact you if we have questions."
              : step === 2 && eventType === "one-time"
                ? "Enter the details for your one-time event."
                : step === 2 && eventType === "recurring-group"
                  ? "Enter your group details. Meetup.com and Luma groups will auto-update for you."
                  : ""}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Button
              className={`w-full ${eventType === "one-time" ? "border-2 border-primary" : ""}`}
              variant="outline"
              onClick={() => {
                setEventType("one-time");
                setStep(2);
              }}
            >
              One-time Event
            </Button>
            <Button
              className={`w-full ${eventType === "recurring-group" ? "border-2 border-primary" : ""}`}
              variant="outline"
              onClick={() => {
                setEventType("recurring-group");
                setStep(2);
              }}
            >
              Recurring Group with Regular Events
            </Button>
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
            <Input
              type="email"
              placeholder="Contact Email (in case we have questions)"
              value={eventData.contact_email}
              required
              onChange={e => setEventData(v => ({ ...v, contact_email: e.target.value }))}
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
          <>
            {validatorStep === "form" && (
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
                <Input
                  type="email"
                  placeholder="Contact Email (in case we have questions)"
                  value={groupData.contact_email}
                  required
                  onChange={e => setGroupData(v => ({ ...v, contact_email: e.target.value }))}
                />
                {scrapeError && <div className="text-red-500">{scrapeError}</div>}
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Next
                  </Button>
                </DialogFooter>
              </form>
            )}
            {validatorStep === "validator" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Review scraped events for <span className="text-primary">{groupData.name}</span></h4>
                  <ul className="space-y-1">
                    {scrapedEvents.length > 0 ? (
                      scrapedEvents.map((event, idx) => (
                        <li key={idx} className="border rounded-md p-2 bg-muted/50">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs">{event.event_date} {event.start_time && `at ${event.start_time}`}</div>
                          <div className="text-xs text-muted-foreground">{event.location}</div>
                        </li>
                      ))
                    ) : (
                      <li className="italic text-gray-500">No events found for this group.</li>
                    )}
                  </ul>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setValidatorStep("form")} disabled={isSubmitting}>
                    Back
                  </Button>
                  <Button onClick={handleApproveGroup} disabled={scrapedEvents.length === 0 || isSubmitting}>
                    Submit for Approval
                  </Button>
                </DialogFooter>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
