import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { vendorsService } from "@/domain";
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
    // Non-sensitive columns plus the private fields the owner is allowed to see
    // — both handled by the shared vendors service.
    const merged = await vendorsService.getMyVendor(user.id);
    setVendor(merged);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { vendor, loading: authLoading || loading, refresh, user };
};
