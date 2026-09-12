import { db } from "@/domain/client";
import type { LeadStatus } from "@/domain/types";
import type { Database } from "@/integrations/supabase/types";

type PlannerInterestStatus = Database["public"]["Enums"]["planner_interest_status"];
type VendorApplicationStatus = Database["public"]["Enums"]["vendor_application_status"];

// ---------------------------------------------------------------------------
// leads domain — customer leads, planner interest, vendor applications.
// ---------------------------------------------------------------------------

interface UpsertArgs {
  userId: string;
  phone: string; // already E.164 +966...
  displayName?: string | null;
  contactEmail?: string | null;
  status?: LeadStatus;
  source?: string;
  eventId?: string | null;
  bookingId?: string | null;
}

/**
 * Upsert a customer lead row keyed by (user_id, phone). Used both at OTP
 * verification (status='verified') and after the wizard completes a booking
 * (status='booked'). Failures are logged but never thrown — lead capture is
 * non-blocking from the user's perspective.
 */
export const upsertCustomerLead = async ({
  userId,
  phone,
  displayName,
  contactEmail,
  status = "verified",
  source = "phone_otp",
  eventId = null,
  bookingId = null,
}: UpsertArgs) => {
  const { data: existing } = await db
    .from("customer_leads")
    .select("id, status")
    .eq("user_id", userId)
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    // Don't downgrade status (e.g. don't move 'booked' back to 'verified')
    const order: LeadStatus[] = ["verified", "planned", "booked", "completed", "lost"];
    const currentRank = order.indexOf(existing.status as LeadStatus);
    const nextRank = order.indexOf(status);
    const finalStatus = nextRank > currentRank ? status : (existing.status as LeadStatus);
    const { error } = await db
      .from("customer_leads")
      .update({
        status: finalStatus,
        display_name: displayName ?? undefined,
        contact_email: contactEmail ?? undefined,
        event_id: eventId ?? undefined,
        booking_id: bookingId ?? undefined,
        source,
      })
      .eq("id", existing.id);
    if (error) console.warn("[leads] update failed", error.message);
    return existing.id;
  }

  const { data, error } = await db
    .from("customer_leads")
    .insert({
      user_id: userId,
      phone,
      display_name: displayName ?? null,
      contact_email: contactEmail ?? null,
      status,
      source,
      event_id: eventId,
      booking_id: bookingId,
    })
    .select("id")
    .single();
  if (error) {
    console.warn("[leads] insert failed", error.message);
    return null;
  }
  return data.id;
};

// ---- Admin leads panel ----------------------------------------------------

export const listCustomerLeads = (filter: LeadStatus | "all") => {
  const query = db
    .from("customer_leads")
    .select("id, phone, display_name, contact_email, status, source, event_id, booking_id, created_at, notes")
    .order("created_at", { ascending: false })
    .limit(200);
  return filter === "all" ? query : query.eq("status", filter);
};

export const updateLeadStatus = (id: string, status: LeadStatus) =>
  db.from("customer_leads").update({ status }).eq("id", id);

export const subscribeCustomerLeads = (onChange: () => void) => {
  const channel = db
    .channel("admin-leads")
    .on("postgres_changes", { event: "*", schema: "public", table: "customer_leads" }, onChange)
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
};

// ---- Planner interest -------------------------------------------------

export const countNewPlannerInterest = () =>
  db.from("planner_interest").select("id", { count: "exact", head: true }).eq("status", "new");

export const listPlannerInterest = () =>
  db.from("planner_interest").select("*").order("created_at", { ascending: false });

export const listPlannerInterestForAdmin = () =>
  db
    .from("planner_interest")
    .select("id, full_name, phone, details, status, admin_notes, contacted_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

export const updatePlannerInterestStatus = (
  id: string,
  patch: { status: PlannerInterestStatus; contacted_at?: string },
) => db.from("planner_interest").update(patch).eq("id", id);

export const updatePlannerInterestNotes = (id: string, admin_notes: string) =>
  db.from("planner_interest").update({ admin_notes }).eq("id", id);

export const subscribePlannerInterest = (onChange: () => void) => {
  const channel = db
    .channel("admin-planner-interest")
    .on("postgres_changes", { event: "*", schema: "public", table: "planner_interest" }, onChange)
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
};

// ---- Vendor applications ----------------------------------------------

export const listVendorApplications = () =>
  db.from("vendor_applications").select("*").order("created_at", { ascending: false });

export const listVendorApplicationsForAdmin = (filter: VendorApplicationStatus | "all") => {
  const query = db
    .from("vendor_applications")
    .select("id, full_name, phone, email, entity_type, service_type, city, notes, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return filter === "all" ? query : query.eq("status", filter);
};

export const updateVendorApplicationStatus = (id: string, status: VendorApplicationStatus) =>
  db
    .from("vendor_applications")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);

export const subscribeVendorApplications = (onChange: () => void) => {
  const channel = db
    .channel("admin-vendor-applications")
    .on("postgres_changes", { event: "*", schema: "public", table: "vendor_applications" }, onChange)
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
};

/** Public, unauthenticated planner-interest submission (planning wizard fallback). */
export const submitPlannerInterest = (payload: { full_name: string; phone: string; details: unknown }) =>
  db.from("planner_interest").insert(payload as never);

export const createVendorApplication = (payload: Insert<"vendor_applications">) =>
  db.from("vendor_applications").insert(payload);
