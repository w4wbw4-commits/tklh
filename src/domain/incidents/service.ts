import { db } from "@/domain/client";
import type { Insert, Update } from "@/domain/types";

// ---------------------------------------------------------------------------
// incidents domain — quality reports and emergency requests.
// ---------------------------------------------------------------------------

export const createIncident = (payload: Insert<"incident_reports">) =>
  db.from("incident_reports").insert(payload).select("*").single();

export const listIncidents = () =>
  db.from("incident_reports").select("*").order("created_at", { ascending: false });

export const listIncidentsWithVendor = () =>
  db
    .from("incident_reports")
    .select(
      "id, customer_id, vendor_id, booking_id, kind, description, attachments, status, admin_notes, created_at, vendor:vendors(business_name, category)",
    )
    .order("created_at", { ascending: false });

export const updateIncident = (id: string, patch: Update<"incident_reports">) =>
  db.from("incident_reports").update(patch).eq("id", id);

/** Subscribe to any change on incident_reports (admin incident review list). */
export const subscribeIncidents = (onChange: () => void) => {
  const channel = db
    .channel("admin-incidents")
    .on("postgres_changes", { event: "*", schema: "public", table: "incident_reports" }, onChange)
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
};

export const createEmergency = (payload: Insert<"emergency_requests">) =>
  db.from("emergency_requests").insert(payload).select("*").single();

export const listEmergenciesForBooking = (bookingId: string) =>
  db
    .from("emergency_requests")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });
