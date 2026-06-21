// ---------------------------------------------------------------------------
// Finalise a pending plan into real DB rows
// ---------------------------------------------------------------------------
// Used in two places:
//  1. PlanningWizard.handleFinish — when an authenticated user clicks "Confirm".
//  2. Dashboard mount — when a guest signed in with a snapshot waiting in
//     localStorage. The dashboard hands the snapshot to this helper, then
//     clears storage and redirects to checkout.
// Returns the first booking id so the caller can redirect to /checkout/:id.
// ---------------------------------------------------------------------------

import { supabase } from "@/integrations/supabase/client";
import type { PendingPlan } from "@/lib/pendingPlan";
import type { TFunction } from "i18next";

export interface FinalisePlanInput {
  userId: string;
  plan: PendingPlan;
  t: TFunction;
}

export interface FinalisePlanResult {
  eventId: string;
  bookingIds: string[];
}

export const finalisePlan = async ({
  userId,
  plan,
  t,
}: FinalisePlanInput): Promise<FinalisePlanResult> => {
  const guests = (plan.men ?? 0) + (plan.women ?? 0);
  const visionNote = [plan.vision, (plan.selectedChips ?? []).join(" • ")]
    .filter(Boolean).join("\n");

  // Tag the event when this is a fast-track package booking so the admin can
  // see at a glance which event needs manual vendor assignment.
  const pkgTag = plan.packageSelection
    ? `[PACKAGE_BOOKING:${plan.packageSelection.key}:${plan.packageSelection.price}]`
    : null;
  const composedNotes = [pkgTag, visionNote].filter(Boolean).join("\n") || null;

  // Only forward platform_package_id when the user actually picked an
  // admin-curated package (kind === "admin"); curated tier keys are not UUIDs.
  const platformPackageId =
    plan.packageSelection?.kind === "admin" ? plan.packageSelection.key : null;

  const { data: ev, error: evErr } = await supabase.from("events").insert({
    customer_id: userId,
    title: plan.eventType
      ? t(`eventTypes.${plan.eventType}`)
      : t("customer.create.defaultTitle"),
    event_date: plan.date,
    city: plan.city ? t(`cities.${plan.city}`) : null,
    guest_count: guests,
    total_budget: plan.packageSelection?.price ?? plan.budget,
    theme: plan.selectedChips?.[0] || plan.packageSelection?.name || null,
    notes: composedNotes,
    platform_package_id: platformPackageId,
  }).select("id").single();

  if (evErr || !ev) throw new Error(evErr?.message ?? "event_insert_failed");

  const pickList = Object.values(plan.picks ?? {});

  // Fast-track package booking: auto-assign one booking per slot using the
  // first eligible vendor for each requested category.
  let bookingsToInsert: Array<{
    customer_id: string; vendor_id: string; package_id: string | null;
    platform_package_id: string | null; event_id: string; event_date: string;
    guest_count: number; total_price: number; status: "pending";
  }> = [];

  if (plan.packageSelection?.kind === "admin" && pickList.length === 0) {
    const { data: pkgRow } = await supabase
      .from("platform_packages")
      .select("slots, eligible_vendor_ids, price")
      .eq("id", plan.packageSelection.key)
      .maybeSingle();

    const slots = ((pkgRow?.slots as unknown as Array<{ category: string; count: number }>) ?? []);
    const eligibleIds = (pkgRow?.eligible_vendor_ids as string[] | null) ?? [];

    if (slots.length > 0 && eligibleIds.length > 0) {
      const { data: vendorRows } = await supabase
        .from("vendors_public")
        .select("id, category")
        .in("id", eligibleIds)
        .eq("approval_status", "approved")
        .eq("active", true);

      const used = new Set<string>();
      const slotPrice = slots.length > 0 ? Number(pkgRow?.price ?? 0) / slots.reduce((s, x) => s + x.count, 0) : 0;
      for (const slot of slots) {
        for (let i = 0; i < slot.count; i++) {
          const candidate = (vendorRows ?? []).find((v) => v.category === slot.category && !used.has(v.id));
          if (!candidate) continue;
          used.add(candidate.id);
          bookingsToInsert.push({
            customer_id: userId,
            vendor_id: candidate.id,
            package_id: null,
            platform_package_id: platformPackageId,
            event_id: ev.id,
            event_date: plan.date,
            guest_count: guests,
            total_price: Math.round(slotPrice),
            status: "pending" as const,
          });
        }
      }
    }
  } else {
    bookingsToInsert = pickList.map((p) => ({
      customer_id: userId,
      vendor_id: p.vendorId,
      package_id: p.packageId ?? null,
      platform_package_id: platformPackageId,
      event_id: ev.id,
      event_date: plan.date,
      guest_count: guests,
      total_price: p.price,
      status: "pending" as const,
    }));
  }

  if (bookingsToInsert.length === 0) {
    return { eventId: ev.id, bookingIds: [] };
  }

  const { data: createdBookings, error: bErr } = await supabase
    .from("bookings")
    .insert(bookingsToInsert)
    .select("id");

  if (bErr || !createdBookings) {
    throw new Error(bErr?.message ?? "bookings_insert_failed");
  }

  return {
    eventId: ev.id,
    bookingIds: createdBookings.map((b) => b.id),
  };
};
