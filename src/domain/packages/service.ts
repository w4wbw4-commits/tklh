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

export const listPublishedPlatformPackagesForHome = () =>
  db
    .from("platform_packages")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

export const listAllPlatformPackages = () =>
  db.from("platform_packages").select("*").order("sort_order", { ascending: true });

export const listAllPlatformPackagesForAdmin = () =>
  db
    .from("platform_packages")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

export const upsertPlatformPackage = (payload: Insert<"platform_packages">) =>
  db.from("platform_packages").upsert(payload).select("*").single();

export const insertPlatformPackage = (payload: Insert<"platform_packages">) =>
  db.from("platform_packages").insert([payload]);

export const updatePlatformPackage = (id: string, patch: Update<"platform_packages">) =>
  db.from("platform_packages").update(patch).eq("id", id);

export const deletePlatformPackage = (id: string) =>
  db.from("platform_packages").delete().eq("id", id);

export const listVendorPackages = (vendorId: string) =>
  db.from("packages").select("*").eq("vendor_id", vendorId).order("price", { ascending: true });

export const listLegacyPackagesForAdmin = () =>
  db.from("packages").select("id,name,price,vendor_id,created_at").order("created_at", { ascending: false });

export const createVendorPackage = (payload: Insert<"packages">) =>
  db.from("packages").insert(payload).select("*").single();

export const updateVendorPackage = (id: string, patch: Update<"packages">) =>
  db.from("packages").update(patch).eq("id", id);

export const deleteVendorPackage = (id: string) =>
  db.from("packages").delete().eq("id", id);

export const deleteVendorPackages = (ids: string[]) =>
  db.from("packages").delete().in("id", ids);

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

// ---------------------------------------------------------------------------
// Realtime helpers
// ---------------------------------------------------------------------------

export const subscribeToPlatformPackagesTable = (channelName: string, onChange: () => void) =>
  db
    .channel(channelName)
    .on("postgres_changes", { event: "*", schema: "public", table: "platform_packages" }, onChange)
    .subscribe();

/** Admin packages panel listens to both platform + legacy vendor packages. */
export const subscribeToAdminPackagesTables = (channelName: string, onChange: () => void) =>
  db
    .channel(channelName)
    .on("postgres_changes", { event: "*", schema: "public", table: "platform_packages" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, onChange)
    .subscribe();

export const unsubscribe = (channel: ReturnType<typeof db.channel>) => db.removeChannel(channel);

/** Slot/eligibility projection used by the planner finalisation flow. */
export const getPlatformPackageSlots = (id: string) =>
  db
    .from("platform_packages")
    .select("slots, eligible_vendor_ids, price")
    .eq("id", id)
    .maybeSingle();
