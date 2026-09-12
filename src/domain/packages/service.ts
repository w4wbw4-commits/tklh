import { db } from "@/domain/client";
import type { Insert, Update } from "@/domain/types";

// ---------------------------------------------------------------------------
// packages domain — vendor packages and platform (curated) packages.
// ---------------------------------------------------------------------------

export const listPublishedPlatformPackages = () =>
  db
    .from("platform_packages")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

export const listAllPlatformPackages = () =>
  db.from("platform_packages").select("*").order("sort_order", { ascending: true });

export const upsertPlatformPackage = (payload: Insert<"platform_packages">) =>
  db.from("platform_packages").upsert(payload).select("*").single();

export const updatePlatformPackage = (id: string, patch: Update<"platform_packages">) =>
  db.from("platform_packages").update(patch).eq("id", id);

export const listVendorPackages = (vendorId: string) =>
  db.from("packages").select("*").eq("vendor_id", vendorId).order("price", { ascending: true });

export const createVendorPackage = (payload: Insert<"packages">) =>
  db.from("packages").insert(payload).select("*").single();

export const updateVendorPackage = (id: string, patch: Update<"packages">) =>
  db.from("packages").update(patch).eq("id", id);

/**
 * Average price of `basic`-tier packages per vendor category — the realistic
 * floor used by the planner's budget guidance.
 */
export const listBasicTierPricesByCategory = () =>
  db
    .from("packages")
    .select("price, tier, vendor:vendors_public!inner(category, active)")
    .eq("tier", "basic")
    .eq("active", true);
