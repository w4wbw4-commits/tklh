import { db } from "@/domain/client";
import type { Insert, Update } from "@/domain/types";

// ---------------------------------------------------------------------------
// availability domain — vendor calendar and pricing rules.
// ---------------------------------------------------------------------------

export const listForVendor = (vendorId: string) =>
  db
    .from("vendor_availability")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("date", { ascending: true });

/**
 * Availability state for every vendor over a date range, through the
 * SECURITY DEFINER `availability_for_dates` RPC. This is what the customer
 * catalog reads: the vendor_availability table itself is restricted to the
 * owning vendor / booking customer / admin, and the RPC returns availability
 * state only (no booking ids, no PII).
 */
export const listAvailabilityForDates = (from: string, to: string) =>
  db.rpc("availability_for_dates", { _from: from, _to: to });

export const listAvailabilityForDate = (date: string) =>
  listAvailabilityForDates(date, date);


export const block = (payload: Insert<"vendor_availability">) =>
  db.from("vendor_availability").upsert(payload, { onConflict: "vendor_id,date" });

export const unblock = (vendorId: string, date: string) =>
  db.from("vendor_availability").delete().eq("vendor_id", vendorId).eq("date", date);

export const deleteAvailabilityById = (id: string) =>
  db.from("vendor_availability").delete().eq("id", id);

export const updateAvailabilityById = (id: string, patch: Update<"vendor_availability">) =>
  db.from("vendor_availability").update(patch).eq("id", id);

export const listPricingRules = (vendorId: string) =>
  db
    .from("vendor_pricing_rules")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

/** Ascending order — used by the partner pricing page. */
export const listPricingRulesAsc = (vendorId: string) =>
  db
    .from("vendor_pricing_rules")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: true });

export const createPricingRule = (payload: Insert<"vendor_pricing_rules">) =>
  db.from("vendor_pricing_rules").insert(payload).select("*").single();

export const updatePricingRule = (id: string, patch: Update<"vendor_pricing_rules">) =>
  db.from("vendor_pricing_rules").update(patch).eq("id", id);

export const deletePricingRule = (id: string) =>
  db.from("vendor_pricing_rules").delete().eq("id", id);

// ---------------------------------------------------------------------------
// Realtime helpers
// ---------------------------------------------------------------------------

export const subscribeToVendorAvailability = (
  channelName: string,
  vendorId: string,
  onChange: () => void,
) =>
  db
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "vendor_availability", filter: `vendor_id=eq.${vendorId}` },
      onChange,
    )
    .subscribe();

export const unsubscribe = (channel: ReturnType<typeof db.channel>) => db.removeChannel(channel);
