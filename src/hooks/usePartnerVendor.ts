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
    const { data } = await supabase
      .from("vendors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setVendor((data as VendorRow | null) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { vendor, loading: authLoading || loading, refresh, user };
};
