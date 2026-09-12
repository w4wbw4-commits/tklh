import { db } from "@/domain/client";
import type { Insert, Update, VendorRow } from "@/domain/types";

// ---------------------------------------------------------------------------
// vendors domain.
//
// Public (non-sensitive) columns are read directly. Sensitive PII columns
// (iban, phone, certificate URLs) are revoked from the `authenticated` role and
// must go through the SECURITY DEFINER `get_vendor_private` RPC, which returns
// the row only to the owner or an admin.
// ---------------------------------------------------------------------------

export const VENDOR_PUBLIC_COLUMNS =
  "id, user_id, business_name, category, bio, bio_en, city, region, region_en, district, district_en, portfolio_urls, google_maps_url, daily_capacity, starting_price, weekday_price, weekend_price, min_deposit, men_capacity, women_capacity, extra_services, extra_services_en, verified, active, approval_status, rejection_reason";

export const getVendorPrivate = async (vendorId: string) => {
  const { data } = await db.rpc("get_vendor_private", { _vendor_id: vendorId });
  return Array.isArray(data) ? data[0] : data;
};

/** The signed-in user's own vendor profile, with private fields merged in. */
export const getMyVendor = async (userId: string): Promise<VendorRow | null> => {
  const { data } = await db
    .from("vendors")
    .select(VENDOR_PUBLIC_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  let merged = (data as VendorRow | null) ?? null;
  if (merged) {
    const row = await getVendorPrivate(merged.id);
    if (row) {
      merged = {
        ...merged,
        iban: row.iban ?? null,
        iban_certificate_url: row.iban_certificate_url ?? null,
        commercial_register_url: row.commercial_register_url ?? null,
        phone: row.phone ?? null,
      };
    }
  }
  return merged;
};

export const listPendingVerifications = () =>
  db.rpc("admin_list_pending_vendor_verifications");

export const listPendingDocs = () => db.rpc("admin_list_pending_vendor_docs");

export const getVendorRatingsSummary = (vendorId: string) =>
  db.from("vendor_ratings_summary").select("*").eq("vendor_id", vendorId).maybeSingle();

export const listAllRatingsSummaries = () =>
  db.from("vendor_ratings_summary").select("vendor_id, avg_rating, reviews_count, completed_bookings");

export const listPortfolioItems = (vendorId: string) =>
  db
    .from("vendor_portfolio_items")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("sort_order", { ascending: true });

/** Ordered by sort_order then created_at — used by the vendor's own portfolio manager. */
export const listPortfolioItemsOrdered = (vendorId: string) =>
  db
    .from("vendor_portfolio_items")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

export const listPortfolioItemsForVendors = (vendorIds: string[]) =>
  db
    .from("vendor_portfolio_items")
    .select("vendor_id, url, media_type, caption, sort_order")
    .in("vendor_id", vendorIds)
    .order("sort_order", { ascending: true });

export const listLatestVideoPortfolioItem = (vendorId: string) =>
  db
    .from("vendor_portfolio_items")
    .select("id, url, duration_seconds, caption")
    .eq("vendor_id", vendorId)
    .eq("media_type", "video")
    .order("created_at", { ascending: false })
    .limit(1);

export const insertPortfolioItem = (payload: Insert<"vendor_portfolio_items">) =>
  db.from("vendor_portfolio_items").insert(payload);

export const insertPortfolioItemReturning = (payload: Insert<"vendor_portfolio_items">) =>
  db.from("vendor_portfolio_items").insert(payload).select("id, url, duration_seconds, caption").maybeSingle();

export const deletePortfolioItem = (id: string) =>
  db.from("vendor_portfolio_items").delete().eq("id", id);

export const deletePortfolioVideosForVendor = (vendorId: string) =>
  db.from("vendor_portfolio_items").delete().eq("vendor_id", vendorId).eq("media_type", "video");

export const updatePortfolioItemCaption = (id: string, caption: string | null) =>
  db.from("vendor_portfolio_items").update({ caption }).eq("id", id);

// ---------------------------------------------------------------------------
// Admin vendor management
// ---------------------------------------------------------------------------

export interface VendorListRow {
  id: string;
  business_name: string;
  category: string;
  city: string | null;
  created_at: string;
  hidden: boolean;
  hidden_until: string | null;
}

export const listApprovedVendorsBasic = () =>
  db
    .from("vendors")
    .select("id, business_name, category, city, created_at, hidden, hidden_until")
    .eq("approval_status", "approved")
    .order("created_at", { ascending: false });

export const updateVendorVisibility = (
  id: string,
  payload: { hidden: boolean; hidden_until: string | null },
) => db.from("vendors").update(payload).eq("id", id);

export const updateVendorStatus = (id: string, patch: Update<"vendors">) =>
  db.from("vendors").update(patch).eq("id", id);

export const updateVendorFields = (id: string, patch: Update<"vendors">) =>
  db.from("vendors").update(patch).eq("id", id);

export const insertVendor = (payload: Insert<"vendors">) =>
  db.from("vendors").insert(payload).select("id").maybeSingle();

export const insertVendorReturning = (payload: Insert<"vendors">, returnCols: string) =>
  db.from("vendors").insert(payload).select(returnCols).single();

export const updateVendorReturning = (id: string, patch: Update<"vendors">, returnCols: string) =>
  db.from("vendors").update(patch).eq("id", id).select(returnCols).single();

export const getVendorEditFields = (vendorId: string) =>
  db
    .from("vendors")
    .select(
      "id, user_id, business_name, category, bio, bio_en, city, region, region_en, district, district_en, weekday_price, weekend_price, min_deposit, men_capacity, women_capacity, portfolio_urls, extra_services, extra_services_en",
    )
    .eq("id", vendorId)
    .maybeSingle();

export const listEligibleVendorsForPackages = () =>
  db
    .from("vendors")
    .select("id, business_name, category, city")
    .eq("approval_status", "approved")
    .eq("active", true)
    .order("business_name", { ascending: true });

/**
 * Permanently delete a vendor and every record that references them. Order
 * matters: child rows are cleared before the parent vendor row, otherwise FK
 * constraints reject the delete. Returns the failing step label + error, or
 * null on full success.
 */
export const deleteVendorCascade = async (
  id: string,
): Promise<{ label: string; error: { message?: string } } | null> => {
  const steps: Array<[string, () => Promise<{ error: { message?: string } | null }>]> = [
    ["media", async () => await db.from("vendor_portfolio_items").delete().eq("vendor_id", id)],
    ["availability", async () => await db.from("vendor_availability").delete().eq("vendor_id", id)],
    ["packages", async () => await db.from("packages").delete().eq("vendor_id", id)],
    ["bookings", async () => await db.from("bookings").delete().eq("vendor_id", id)],
    ["vendor", async () => await db.from("vendors").delete().eq("id", id)],
  ];
  for (const [label, run] of steps) {
    const { error } = await run();
    if (error) return { label, error };
  }
  return null;
};

// ---------------------------------------------------------------------------
// Public catalog (wizard) — vendors_public view joined with packages.
// ---------------------------------------------------------------------------

export const listPublicVendorsForWizard = (categories: string[]) =>
  db
    .from("vendors_public")
    .select(
      "id, business_name, bio, bio_en, category, city, region, region_en, district, district_en, starting_price, weekday_price, weekend_price, men_capacity, women_capacity, extra_services, extra_services_en, verified, portfolio_urls, packages(id, name, tier, price, description, active, approval_status)",
    )
    .eq("active", true)
    .eq("approval_status", "approved")
    .in("category", categories);

// ---------------------------------------------------------------------------
// Realtime helpers
// ---------------------------------------------------------------------------

export const subscribeToVendorsTable = (channelName: string, onChange: () => void) =>
  db
    .channel(channelName)
    .on("postgres_changes", { event: "*", schema: "public", table: "vendors" }, onChange)
    .subscribe();

/** Multi-table listener used by the public wizard catalog. */
export const subscribeToPublicVendorsListing = (channelName: string, onChange: () => void) =>
  db
    .channel(channelName)
    .on("postgres_changes", { event: "*", schema: "public", table: "vendors" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "vendor_portfolio_items" }, onChange)
    .subscribe();

export const unsubscribe = (channel: ReturnType<typeof db.channel>) => db.removeChannel(channel);
