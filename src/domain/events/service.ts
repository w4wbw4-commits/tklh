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

/** Same insert, but only returns the new id — used by the create-event dialog. */
export const createEventReturningId = (payload: Insert<"events">) =>
  db.from("events").insert(payload).select("id").single();

export const getEventById = (id: string) =>
  db.from("events").select("*").eq("id", id).maybeSingle();

export const updateEvent = (id: string, patch: Update<"events">) =>
  db.from("events").update(patch).eq("id", id);

export const listMilestones = (eventId: string) =>
  db
    .from("timeline_milestones")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

/** Lightweight milestone shape used by dashboard summary/count widgets. */
export const listMilestoneSummaries = (eventId: string) =>
  db
    .from("timeline_milestones")
    .select("id, title, status, due_date")
    .eq("event_id", eventId)
    .order("due_date", { ascending: true });

export const updateMilestone = (id: string, patch: Update<"timeline_milestones">) =>
  db.from("timeline_milestones").update(patch).eq("id", id);

export const listGuests = (eventId: string) =>
  db
    .from("guests")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

/** Guest list ordered newest-first — used by the guest manager panel. */
export const listGuestsNewestFirst = (eventId: string) =>
  db
    .from("guests")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

/** Just the RSVP column — used for dashboard counters. */
export const listGuestRsvpStatuses = (eventId: string) =>
  db.from("guests").select("rsvp_status").eq("event_id", eventId);

export const addGuest = (payload: Insert<"guests">) =>
  db.from("guests").insert(payload).select("*").single();

/** Insert without asking PostgREST to return the row (matches guest-manager form). */
export const addGuestSilent = (payload: Insert<"guests">) =>
  db.from("guests").insert(payload);

export const updateGuest = (id: string, patch: Update<"guests">) =>
  db.from("guests").update(patch).eq("id", id);

export const removeGuest = (id: string) => db.from("guests").delete().eq("id", id);
