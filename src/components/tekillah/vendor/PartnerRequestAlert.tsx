import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, CalendarClock, TagIcon, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { availabilityService, bookingsService } from "@/domain";

type SideAlert = { key: string; to: string; icon: typeof Wallet; title: string };

const iso = (d: Date) => d.toISOString().slice(0, 10);



/**
 * Persistent "new booking request" alert for the partner portal.
 *
 * The attention state is derived from the bookings table (status = pending),
 * not from notification read state — so it keeps ringing until the partner
 * actually accepts or rejects the request. Realtime keeps the count live.
 */
export const PartnerRequestAlert = ({ vendorId }: { vendorId: string }) => {
  const { t } = useTranslation();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const { count, error } = await bookingsService.countPendingForVendor(vendorId);
      if (!alive || error) return;
      setPending(count ?? 0);
    };
    void refresh();
    const unsubscribe = bookingsService.subscribeVendorBookingsUnique(vendorId, () => void refresh());
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [vendorId]);

  if (pending === 0) return null;

  return (
    <Link
      to="/partner/bookings"
      role="alert"
      aria-live="polite"
      className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-destructive/60 bg-destructive/10 px-4 py-3 transition-colors hover:bg-destructive/15"
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/50" />
        <BellRing className="relative h-4 w-4 animate-bounce" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-black text-foreground">
          {t("portal.alerts.pendingTitle", {
            defaultValue: "لديك {{count}} طلب حجز بانتظار ردك",
            count: pending,
          })}
        </div>
        <div className="text-xs text-foreground/70">
          {t("portal.alerts.pendingBody", {
            defaultValue: "التنبيه يبقى ظاهراً حتى تقبل الطلب أو ترفضه.",
          })}
        </div>
      </div>
    </Link>
  );
};
