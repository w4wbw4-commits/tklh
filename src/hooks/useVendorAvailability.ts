import { useCallback, useEffect, useId, useState } from "react";
import { availabilityService } from "@/domain";
import type { AvailabilityDayRecord } from "@/components/tekillah/availability/AvailabilityCalendar";

export interface VendorAvailabilityRow extends AvailabilityDayRecord {
  id: string;
  vendor_id: string;
  note: string | null;
  booking_id: string | null;
}

export const useVendorAvailability = (vendorId: string) => {
  const channelId = useId().replace(/:/g, "");
  const [items, setItems] = useState<VendorAvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    const { data, error: queryError } = await availabilityService.listForVendor(vendorId);
    if (queryError) {
      setError(queryError);
    } else {
      setItems((data ?? []) as VendorAvailabilityRow[]);
      setError(null);
    }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
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
  }, [channelId, refresh, vendorId]);

  return { items, loading, error, refresh };
};