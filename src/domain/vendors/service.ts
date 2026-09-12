import { db } from "@/domain/client";
import type { VendorRow } from "@/domain/types";

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

export const listPortfolioItems = (vendorId: string) =>
  db
    .from("vendor_portfolio_items")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("sort_order", { ascending: true });
