import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceKey } from "@/components/tekillah/wizard/types";

// Maps wizard service keys to vendor categories (1:1 here)
const SERVICE_TO_CATEGORY: Record<ServiceKey, string> = {
  hall: "hall",
  catering: "catering",
  photography: "photography",
  dj: "dj",
  decor: "decor",
  cars: "cars",
};

export interface MarketPrice {
  avg: number | null;   // average price of "basic" packages for this category
  count: number;        // number of vendors contributing
}

/**
 * Pulls the average price of `basic`-tier packages per service category from
 * the vendors marketplace. The Smart Budget Calculator uses this as the
 * realistic floor (with a sensible static fallback when no vendors exist yet).
 */
export const useMarketPrices = () => {
  const [prices, setPrices] = useState<Record<ServiceKey, MarketPrice>>({
    hall: { avg: null, count: 0 },
    catering: { avg: null, count: 0 },
    photography: { avg: null, count: 0 },
    dj: { avg: null, count: 0 },
    decor: { avg: null, count: 0 },
    cars: { avg: null, count: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Fetch active vendors with their basic packages joined.
      const { data, error } = await supabase
        .from("packages")
        .select("price, tier, vendor:vendors_public!inner(category, active)")
        .eq("tier", "basic")
        .eq("active", true);
      if (cancelled) return;
      if (error) { setLoading(false); return; }

      const buckets: Record<string, number[]> = {};
      (data ?? []).forEach((row: any) => {
        const cat = row.vendor?.category;
        if (!cat || row.vendor?.active === false) return;
        if (!buckets[cat]) buckets[cat] = [];
        buckets[cat].push(Number(row.price));
      });

      const next = { ...prices };
      (Object.keys(SERVICE_TO_CATEGORY) as ServiceKey[]).forEach((k) => {
        const cat = SERVICE_TO_CATEGORY[k];
        const vals = buckets[cat] ?? [];
        next[k] = {
          count: vals.length,
          avg: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null,
        };
      });
      setPrices(next);
      setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { prices, loading };
};
