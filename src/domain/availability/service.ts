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

export const block = (payload: Insert<"vendor_availability">) =>
  db.from("vendor_availability").upsert(payload, { onConflict: "vendor_id,date" });

export const unblock = (vendorId: string, date: string) =>
  db.from("vendor_availability").delete().eq("vendor_id", vendorId).eq("date", date);

export const deleteAvailabilityById = (id: string) =>
  db.from("vendor_availability").delete().eq("id", id);

export const listPricingRules = (vendorId: string) =>
  db
    .from("vendor_pricing_rules")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

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
