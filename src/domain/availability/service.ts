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
