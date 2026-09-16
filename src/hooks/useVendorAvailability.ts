import { useCallback, useEffect, useId, useState } from "react";
import { availabilityService } from "@/domain";
import type { AvailabilityDayRecord } from "@/components/tekillah/availability/AvailabilityCalendar";

export interface VendorAvailabilityRow extends AvailabilityDayRecord {
  id: string;
  vendor_id: string;
  note: string | null;
  booking_id: string | null;
}

export const useVendorAvailability = (vendorId: string, enabled = true) => {
  const channelId = useId().replace(/:/g, "");
  const [items, setItems] = useState<VendorAvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const { data, error: queryError } = await availabilityService.listForVendor(vendorId);
    if (queryError) {
      setError(queryError);
    } else {
      setItems((data ?? []) as VendorAvailabilityRow[]);
      setError(null);
    }
    setLoading(false);
  }, [enabled, vendorId]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    void refresh();
    const channel = availabilityService.subscribeToVendorAvailability(
      `availability-${vendorId}-${channelId}`,
      vendorId,
      refresh,
    );
    return () => {
      void availabilityService.unsubscribe(channel);
    };
  }, [channelId, enabled, refresh, vendorId]);

  return { items, loading, error, refresh };
};