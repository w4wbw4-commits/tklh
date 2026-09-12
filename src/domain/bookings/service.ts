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

// ---------------------------------------------------------------------------
// Additional selects used by vendor/admin/customer screens. Each is a thin,
// exact-match wrapper around the query previously inlined in the component.
// ---------------------------------------------------------------------------

export const BOOKING_WITH_PACKAGE_FULL =
  "id, event_date, status, total_price, paid_amount, guest_count, customer_id, attendance_confirmed_at, package:packages(name)";

export const listForVendorWithPackageAsc = (vendorId: string) =>
  db
    .from("bookings")
    .select(BOOKING_WITH_PACKAGE_FULL)
    .eq("vendor_id", vendorId)
    .order("event_date", { ascending: true });

export const listForVendorFinancials = (vendorId: string) =>
  db
    .from("bookings")
    .select("id, event_date, status, total_price, paid_amount, customer_id, package:packages(name)")
    .eq("vendor_id", vendorId)
    .order("event_date", { ascending: false });

export const listForVendorOverview = (vendorId: string) =>
  db
    .from("bookings")
    .select("id, event_date, total_price, status")
    .eq("vendor_id", vendorId);

export const listForVendorSales = (vendorId: string) =>
  db
    .from("bookings")
    .select("id, event_date, total_price, status, guest_count")
    .eq("vendor_id", vendorId)
    .order("event_date", { ascending: false });

export const listForVendorAnalytics = (vendorId: string) =>
  db
    .from("bookings")
    .select("event_date, total_price, status")
    .eq("vendor_id", vendorId);

export const listUpcomingForVendor = (vendorId: string, fromDate: string) =>
  db
    .from("bookings")
    .select("id, event_date, vendor_id")
    .eq("vendor_id", vendorId)
    .gte("event_date", fromDate)
    .in("status", ["pending", "confirmed"])
    .order("event_date");

export const listPendingWithDetails = () =>
  db
    .from("bookings")
    .select(`
      id, status, total_price, paid_amount, event_id, vendor_id,
      package_id, platform_package_id, event_date, customer_id,
      vendor:vendors(business_name, category, phone, user_id),
      package:packages(name),
      platform_package:platform_packages(name),
      event:events(title, city, guest_count)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

export const countActive = () =>
  db.from("bookings").select("*", { count: "exact", head: true }).in("status", ["pending", "confirmed"]);

export const listForEventWithVendorTier = (eventId: string) =>
  db
    .from("bookings")
    .select("*, vendor:vendors(business_name, category, city), package:packages(name, tier)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

export const listTimelineForEvent = (eventId: string) =>
  db
    .from("bookings")
    .select(
      "id, status, event_date, attendance_confirmed_at, vendor_id, vendor:vendors(business_name, category, phone), package:packages(name)",
    )
    .eq("event_id", eventId)
    .order("event_date", { ascending: true });

export const getByIdWithVendorAndPackage = (id: string) =>
  db
    .from("bookings")
    .select("*, vendor:vendors(business_name, category), package:packages(name)")
    .eq("id", id)
    .maybeSingle();

export const getByIdInvoiceDetail = (id: string) =>
  db
    .from("bookings")
    .select(
      "*, vendor:vendors(business_name, category, city), package:packages(name, description), event:events(title, city, guest_count)",
    )
    .eq("id", id)
    .maybeSingle();

export const listChecklistsByCategory = (bookingId: string) =>
  db.from("booking_checklists").select("*").eq("booking_id", bookingId).order("category");

export const insertChecklists = (items: Insert<"booking_checklists">[]) =>
  db.from("booking_checklists").insert(items).select();

/** Subscribe to any change on a vendor's bookings (used by VendorBookings tab). */
export const subscribeVendorBookings = (vendorId: string, onChange: () => void) => {
  const channel = db
    .channel(`vendor-bookings-${vendorId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bookings", filter: `vendor_id=eq.${vendorId}` },
      onChange,
    )
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
};

/** Subscribe to any change on a vendor's bookings (used by VendorFinancials). */
export const subscribeVendorFinancials = (vendorId: string, onChange: () => void) => {
  const channel = db
    .channel(`vendor-financials-${vendorId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bookings", filter: `vendor_id=eq.${vendorId}` },
      onChange,
    )
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
};

/** Subscribe to booking + payment changes for the admin pending-bookings screen. */
export const subscribeAdminPending = (onChange: () => void) => {
  const channel = db
    .channel("admin-pending-bookings")
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, onChange)
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
};
