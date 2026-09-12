import { db } from "@/domain/client";
import type { BookingStatus, Insert, Update } from "@/domain/types";

// ---------------------------------------------------------------------------
// bookings domain — customer, partner, and admin reads plus status changes.
// Status side effects (calendar blocking, notifications) stay in the database
// triggers exactly as today; this service only writes the row.
// ---------------------------------------------------------------------------

export const BOOKING_WITH_VENDOR =
  "*, vendor:vendors_public(business_name, category, city)";

export const listForCustomer = (customerId: string) =>
  db
    .from("bookings")
    .select(BOOKING_WITH_VENDOR)
    .eq("customer_id", customerId)
    .order("event_date", { ascending: true });

export const listForEvent = (eventId: string) =>
  db
    .from("bookings")
    .select(BOOKING_WITH_VENDOR)
    .eq("event_id", eventId)
    .order("event_date", { ascending: true });

export const listForVendor = (vendorId: string) =>
  db
    .from("bookings")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("event_date", { ascending: true });

export const getById = (id: string) =>
  db.from("bookings").select("*").eq("id", id).maybeSingle();

export const create = (payload: Insert<"bookings">) =>
  db.from("bookings").insert(payload).select("*").single();

export const setStatus = (id: string, status: BookingStatus) =>
  db.from("bookings").update({ status }).eq("id", id);

export const update = (id: string, patch: Update<"bookings">) =>
  db.from("bookings").update(patch).eq("id", id);

export const confirmAttendance = (id: string, byUserId: string) =>
  db
    .from("bookings")
    .update({ attendance_confirmed_at: new Date().toISOString(), attendance_confirmed_by: byUserId })
    .eq("id", id);

export const listChecklists = (bookingId: string) =>
  db
    .from("booking_checklists")
    .select("*")
    .eq("booking_id", bookingId)
    .order("sort_order", { ascending: true });

export const setChecklistDone = (id: string, done: boolean) =>
  db.from("booking_checklists").update({ done }).eq("id", id);
