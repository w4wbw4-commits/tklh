import { db } from "@/domain/client";
import type { Insert, Update } from "@/domain/types";

// ---------------------------------------------------------------------------
// events domain — events, timeline milestones, guests.
// ---------------------------------------------------------------------------

export const listMyEvents = (customerId: string) =>
  db
    .from("events")
    .select("*")
    .eq("customer_id", customerId)
    .order("event_date", { ascending: true });

export const createEvent = (payload: Insert<"events">) =>
  db.from("events").insert(payload).select("*").single();

export const updateEvent = (id: string, patch: Update<"events">) =>
  db.from("events").update(patch).eq("id", id);

export const listMilestones = (eventId: string) =>
  db
    .from("timeline_milestones")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

export const updateMilestone = (id: string, patch: Update<"timeline_milestones">) =>
  db.from("timeline_milestones").update(patch).eq("id", id);

export const listGuests = (eventId: string) =>
  db
    .from("guests")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

export const addGuest = (payload: Insert<"guests">) =>
  db.from("guests").insert(payload).select("*").single();

export const updateGuest = (id: string, patch: Update<"guests">) =>
  db.from("guests").update(patch).eq("id", id);

export const removeGuest = (id: string) => db.from("guests").delete().eq("id", id);
