import { db } from "@/domain/client";
import type { Insert, Update } from "@/domain/types";

// ---------------------------------------------------------------------------
// incidents domain — quality reports and emergency requests.
// ---------------------------------------------------------------------------

export const createIncident = (payload: Insert<"incident_reports">) =>
  db.from("incident_reports").insert(payload).select("*").single();

export const listIncidents = () =>
  db.from("incident_reports").select("*").order("created_at", { ascending: false });

export const updateIncident = (id: string, patch: Update<"incident_reports">) =>
  db.from("incident_reports").update(patch).eq("id", id);

export const createEmergency = (payload: Insert<"emergency_requests">) =>
  db.from("emergency_requests").insert(payload).select("*").single();

export const listEmergenciesForBooking = (bookingId: string) =>
  db
    .from("emergency_requests")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });
