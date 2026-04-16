import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar, CheckCircle2, Clock, CreditCard, Building2,
  UtensilsCrossed, Camera, Music2, Flower2, Car,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { EventRow, BookingWithVendor } from "./types";
import { useTranslation } from "react-i18next";
import { fmtNumber, fmtDateTime } from "@/i18n/format";

const categoryIcons: Record<string, typeof Building2> = {
  hall: Building2, catering: UtensilsCrossed, photography: Camera,
  dj: Music2, decor: Flower2, cars: Car,
};

const useCountdown = (eventDate: string) => {
  const target = useMemo(() => new Date(eventDate).getTime(), [eventDate]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const diff = target - now;
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const isToday = days === 0 && diff > -86_400_000;
  const isPast = diff < -86_400_000;
  return { days, hours, isToday, isPast };
};

export const EventOverview = ({ event }: { event: EventRow }) => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<BookingWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { days, hours, isToday, isPast } = useCountdown(event.event_date);
  const cur = t("common.currency");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("bookings")
        .select("*, vendor:vendors(business_name, category, city), package:packages(name, tier)")
        .eq("event_id", event.id).order("event_date", { ascending: true });
      setBookings((data ?? []) as unknown as BookingWithVendor[]);
      setLoading(false);
    })();
  }, [event.id]);

  const totalPaid = bookings.reduce((sum, b) => sum + Number(b.paid_amount ?? 0), 0);
  const totalPrice = bookings.reduce((sum, b) => sum + Number(b.total_price ?? 0), 0);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-3xl bg-gradient-olive p-8 text-primary-foreground shadow-luxury sm:p-10"
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-primary-foreground/70">
              {t("customer.overview.countdown")}
            </span>
            <h2 className="mt-3 font-arabic text-3xl font-semibold sm:text-4xl">
              {isPast ? t("customer.overview.ended")
                : isToday ? t("customer.overview.today")
                : t("customer.overview.remaining", { days: fmtNumber(days) })}
            </h2>
            <p className="mt-2 text-primary-foreground/80">
              {fmtDateTime(event.event_date)}
              {event.city ? ` • ${event.city}` : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-2">
            <div className="rounded-2xl bg-primary-foreground/10 px-5 py-3 backdrop-blur">
              <div className="font-arabic text-3xl font-bold">{fmtNumber(days)}</div>
              <div className="text-[11px] uppercase tracking-widest text-primary-foreground/70">
                {t("customer.overview.day")}
              </div>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 px-5 py-3 backdrop-blur">
              <div className="font-arabic text-3xl font-bold">{fmtNumber(hours)}</div>
              <div className="text-[11px] uppercase tracking-widest text-primary-foreground/70">
                {t("customer.overview.hour")}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Calendar} label={t("customer.overview.expectedGuests")} value={fmtNumber(event.guest_count ?? 0)} />
        <StatCard icon={CheckCircle2} label={t("customer.overview.confirmedBookings")}
          value={fmtNumber(bookings.filter((b) => b.status === "confirmed").length)} />
        <StatCard icon={CreditCard} label={t("customer.overview.paidBudget")}
          value={`${fmtNumber(totalPaid)} ${cur}`}
          sub={t("customer.overview.outOf", { total: fmtNumber(totalPrice) })} />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-arabic text-xl font-semibold">{t("customer.overview.yourBookings")}</h3>
          <span className="text-xs text-foreground/60">{t("customer.overview.vendorCount", { count: bookings.length })}</span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-foreground/60">{t("common.loading")}</div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-foreground/65">
            {t("customer.overview.noBookings")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {bookings.map((b) => {
              const Icon = categoryIcons[b.vendor?.category ?? ""] ?? Building2;
              const statusKey = b.status as keyof typeof statusClasses;
              const fullyPaid = Number(b.paid_amount) > 0 && Number(b.paid_amount) >= Number(b.total_price ?? 0);
              return (
                <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-arabic text-sm font-semibold">
                          {b.vendor?.business_name ?? t("customer.overview.vendorFallback")}
                        </div>
                        <div className="mt-0.5 text-xs text-foreground/65">
                          {b.vendor?.category ? t(`categories.${b.vendor.category}`) : t("customer.overview.serviceFallback")}
                          {b.package?.name ? ` • ${b.package.name}` : ""}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClasses[statusKey] ?? statusClasses.pending}`}>
                        <Clock className="h-3 w-3" />
                        {t(`customer.bookingStatus.${b.status}`)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-foreground/65">
                      <span>{fmtNumber(Number(b.total_price ?? 0))} {cur}</span>
                      {fullyPaid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                          {t("customer.overview.fullyPaid")}
                        </span>
                      ) : Number(b.paid_amount) > 0 ? (
                        <span className="text-amber-700">
                          {t("customer.overview.partiallyPaid", { amount: fmtNumber(Number(b.paid_amount)) })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const statusClasses: Record<string, string> = {
  confirmed: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  completed: "bg-primary/15 text-primary border-primary/20",
};

const StatCard = ({ icon: Icon, label, value, sub }: {
  icon: typeof Calendar; label: string; value: string; sub?: string;
}) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs text-foreground/65">{label}</div>
        <div className="font-arabic text-lg font-semibold text-foreground">{value}</div>
        {sub && <div className="text-[11px] text-foreground/55">{sub}</div>}
      </div>
    </div>
  </div>
);
