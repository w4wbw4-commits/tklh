import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { VendorRow } from "@/components/tekillah/vendor/types";

// Shared hook to fetch the currently signed-in user's vendor profile.
// Used across every page of the partner portal.
export const usePartnerVendor = () => {
  const { user, loading: authLoading } = useAuth();
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setVendor(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Fetch non-sensitive columns directly. Sensitive PII columns
    // (iban, phone, *_url certificates) are revoked from the authenticated
    // role and must be fetched via the SECURITY DEFINER `get_vendor_private`
    // RPC, which only returns the row to the owner or admins.
    const { data } = await supabase
      .from("vendors")
      .select(
        "id, user_id, business_name, category, bio, bio_en, city, region, region_en, district, district_en, portfolio_urls, google_maps_url, daily_capacity, starting_price, weekday_price, weekend_price, min_deposit, men_capacity, women_capacity, extra_services, extra_services_en, verified, active, approval_status, rejection_reason"
      )
      .eq("user_id", user.id)
      .maybeSingle();
    let merged = (data as VendorRow | null) ?? null;
    if (merged) {
      const { data: priv } = await supabase.rpc("get_vendor_private", { _vendor_id: merged.id });
      const row = Array.isArray(priv) ? priv[0] : priv;
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
    setVendor(merged);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { vendor, loading: authLoading || loading, refresh, user };
};
