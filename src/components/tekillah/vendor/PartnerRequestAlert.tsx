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
  const [side, setSide] = useState<SideAlert[]>([]);

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

  // Offer-expiry, calendar and financial alerts (derived, read-only).
  useEffect(() => {
    let alive = true;
    void (async () => {
      const today = new Date();
      const soon = new Date(today);
      soon.setDate(soon.getDate() + 7);
      const [offers, upcoming, outstanding] = await Promise.all([
        availabilityService.listExpiredActiveOffers(vendorId, iso(today)),
        bookingsService.listConfirmedBetween(vendorId, iso(today), iso(soon)),
        bookingsService.listOutstandingForVendor(vendorId),
      ]);
      if (!alive) return;
      const next: SideAlert[] = [];
      const expired = offers.data?.length ?? 0;
      if (expired > 0) {
        next.push({
          key: "offers",
          to: "/partner/pricing",
          icon: TagIcon,
          title: t("portal.alerts.offerExpiry", {
            defaultValue: "لديك {{count}} عرض موسمي منتهي وما زال مفعّلاً",
            count: expired,
          }),
        });
      }
      const events = upcoming.data?.length ?? 0;
      if (events > 0) {
        next.push({
          key: "calendar",
          to: "/partner/calendar",
          icon: CalendarClock,
          title: t("portal.alerts.calendar", {
            defaultValue: "{{count}} مناسبة مؤكدة خلال الأيام السبعة القادمة",
            count: events,
          }),
        });
      }
      const due = (outstanding.data ?? []).filter(
        (b) => Number(b.total_price ?? 0) - Number(b.paid_amount ?? 0) > 0,
      );
      if (due.length > 0) {
        const amount = due.reduce(
          (sum, b) => sum + (Number(b.total_price ?? 0) - Number(b.paid_amount ?? 0)),
          0,
        );
        next.push({
          key: "finance",
          to: "/partner/reports",
          icon: Wallet,
          title: t("portal.alerts.finance", {
            defaultValue: "مبالغ متبقية غير محصّلة: {{amount}} ر.س على {{count}} حجز",
            amount: amount.toLocaleString("en-US"),
            count: due.length,
          }),
        });
      }
      setSide(next);
    })();
    return () => {
      alive = false;
    };
  }, [vendorId, t]);

  if (pending === 0 && side.length === 0) return null;

  const sideStrip = side.length > 0 && (
    <div className="mb-5 grid gap-2">
      {side.map(({ key, to, icon: Icon, title }) => (
        <Link
          key={key}
          to={to}
          className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-primary/10"
        >
          <Icon className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0">{title}</span>
        </Link>
      ))}
    </div>
  );

  if (pending === 0) return <>{sideStrip}</>;

  return (
    <>
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
    {sideStrip}
    </>
  );

};
