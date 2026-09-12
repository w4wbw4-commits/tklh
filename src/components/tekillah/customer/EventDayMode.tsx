import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, AlertTriangle, Building2, UtensilsCrossed, Camera, Music2, Flower2, Car, Radio,
} from "lucide-react";
import { bookingsService } from "@/domain";
import type { EventRow, BookingWithVendor } from "./types";
import { useTranslation } from "react-i18next";
import { ReportIncidentDialog } from "./ReportIncidentDialog";

const categoryIcons: Record<string, typeof Building2> = {
  hall: Building2, catering: UtensilsCrossed, photography: Camera,
  dj: Music2, decor: Flower2, cars: Car,
};

const GREEN = "hsl(var(--green))";
const CREAM = "hsl(var(--cream))";
const WINE = "hsl(var(--wine))";

export const EventDayMode = ({ event }: { event: EventRow }) => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<BookingWithVendor[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const liveStatuses = [
    { label: t("customer.day.live1"), bg: "hsl(var(--secondary))", text: "hsl(var(--foreground) / 0.7)" },
    { label: t("customer.day.live2"), bg: "hsl(var(--gold) / 0.12)", text: "hsl(var(--green))" },
    { label: t("customer.day.live3"), bg: "hsl(var(--green) / 0.10)", text: GREEN },
    { label: t("customer.day.live4"), bg: GREEN, text: CREAM },
  ];

  useEffect(() => {
    (async () => {
      const { data } = await bookingsService.listConfirmedForEventWithVendorTier(event.id);
      const list = (data ?? []) as unknown as BookingWithVendor[];
      setBookings(list);
      setProgress(Object.fromEntries(list.map((b) => [b.id, 0])));
    })();
  }, [event.id]);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((prev) => {
        const next = { ...prev };
        for (const id of Object.keys(next)) {
          if (next[id] < 3 && Math.random() > 0.6) next[id] = Math.min(3, next[id] + 1);
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-luxury sm:p-8"
        style={{ backgroundColor: GREEN }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.span animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: WINE }} />
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-primary-foreground/70">
                {t("customer.day.kicker")}
              </div>
              <h3 className="font-arabic text-xl font-semibold sm:text-2xl">{t("customer.day.title")}</h3>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
            style={{ backgroundColor: "hsl(var(--cream) / 0.12)", color: CREAM }}>
            <Radio className="h-3.5 w-3.5" /> {t("customer.day.live")}
          </div>
        </div>
      </motion.div>

      <div>
        <h4 className="mb-3 font-arabic text-lg font-semibold">{t("customer.day.vendorStatus")}</h4>
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-foreground/65">
            {t("customer.day.noConfirmed")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {bookings.map((b, i) => {
              const Icon = categoryIcons[b.vendor?.category ?? ""] ?? Building2;
              const status = liveStatuses[progress[b.id] ?? 0];
              return (
                <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <div className="flex-1">
                      <div className="font-arabic text-sm font-semibold">{b.vendor?.business_name}</div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <motion.div animate={{ width: `${((progress[b.id] ?? 0) / 3) * 100}%` }}
                          transition={{ duration: 0.6 }} className="h-full bg-primary" />
                      </div>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{ backgroundColor: status.bg, color: status.text }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <ReportIncidentDialog bookingId={b.id} vendorId={b.vendor_id} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a href="tel:+966564343704"
          className="group flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-card transition hover:bg-primary/10">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <div className="font-arabic text-sm font-semibold text-primary">{t("customer.day.coordinator")}</div>
            <div className="mt-0.5 text-xs text-foreground/65">{t("customer.day.coordinatorDesc")}</div>
          </div>
        </a>

        <a href="tel:911"
          className="flex items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 shadow-card transition hover:bg-destructive/10">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-destructive text-destructive-foreground">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="font-arabic text-sm font-semibold text-destructive">{t("customer.day.emergency")}</div>
            <div className="mt-0.5 text-xs text-foreground/65">{t("customer.day.emergencyDesc")}</div>
          </div>
        </a>
      </div>
    </div>
  );
};
