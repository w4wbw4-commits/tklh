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

  const { data: ev, error: evErr } = await supabase.from("events").insert({
    customer_id: userId,
    title: plan.eventType
      ? t(`eventTypes.${plan.eventType}`)
      : t("customer.create.defaultTitle"),
    event_date: plan.date,
    city: plan.city ? t(`cities.${plan.city}`) : null,
    guest_count: guests,
    total_budget: plan.budget,
    theme: plan.selectedChips?.[0] || null,
    notes: visionNote || null,
  }).select("id").single();

  if (evErr || !ev) throw new Error(evErr?.message ?? "event_insert_failed");

  const pickList = Object.values(plan.picks ?? {});
  if (pickList.length === 0) {
    return { eventId: ev.id, bookingIds: [] };
  }

  const bookingsToInsert = pickList.map((p) => ({
    customer_id: userId,
    vendor_id: p.vendorId,
    package_id: p.packageId,
    event_id: ev.id,
    event_date: plan.date,
    guest_count: guests,
    total_price: p.price,
    status: "pending" as const,
  }));

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
