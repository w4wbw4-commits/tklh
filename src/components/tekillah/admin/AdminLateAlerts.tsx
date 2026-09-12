import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Phone, Loader2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { bookingsService, usersService } from "@/domain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtDate, toLatinDigits } from "@/i18n/format";

// Late-attendance threshold (minutes after the event date "starts")
const LATE_THRESHOLD_MIN = 15;

interface LateBooking {
  id: string;
  event_date: string;
  attendance_confirmed_at: string | null;
  status: string;
  notes: string | null;
  customer_id: string;
  vendor: { business_name: string; category: string; phone: string | null } | null;
  customer_phone: string | null;
}

export const AdminLateAlerts = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<LateBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // Re-evaluate every 30s so the threshold check stays live
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const load = async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    // Confirmed bookings whose event date is today or in the past, no attendance yet
    const { data } = await bookingsService.listConfirmedAwaitingAttendance(today);

    const list = (data ?? []) as unknown as LateBooking[];

    // Hydrate customer phone from profiles (best-effort, no-op if missing)
    const customerIds = Array.from(new Set(list.map((b) => b.customer_id)));
    let phoneByUser: Record<string, string | null> = {};
    if (customerIds.length > 0) {
      const { data: profs } = await usersService.listProfilesByIds(customerIds, "user_id, phone");
      phoneByUser = Object.fromEntries((profs ?? []).map((p) => [p.user_id, p.phone]));
    }
    setRows(list.map((b) => ({ ...b, customer_phone: phoneByUser[b.customer_id] ?? null })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    return bookingsService.subscribeAllBookings(load);
  }, []);

  // Compute lateness based on local time vs event date midnight + threshold
  const late = useMemo(() => {
    const now = Date.now();
    return rows.filter((b) => {
      const eventStart = new Date(b.event_date + "T00:00:00").getTime();
      return now - eventStart >= LATE_THRESHOLD_MIN * 60 * 1000;
    });
  }, [rows, tick]);

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-arabic text-xl font-semibold text-foreground">
            {t("admin.late.title")}
          </h2>
          <p className="mt-1 text-sm text-foreground/60">
            {t("admin.late.subtitle", { mins: LATE_THRESHOLD_MIN })}
          </p>
        </div>
        <Badge className="gap-1 bg-destructive/15 text-destructive">
          <AlertTriangle className="h-3 w-3" /> {late.length} {t("admin.late.alertsCount")}
        </Badge>
      </div>

      {late.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-foreground/55">
          <Clock className="mx-auto mb-2 h-5 w-5 text-primary" />
          {t("admin.late.empty")}
        </div>
      ) : (
        <div className="space-y-3">
          {late.map((b) => (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border-2 border-destructive/60 bg-destructive/5 p-4 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <motion.span
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="mt-1 h-3 w-3 rounded-full bg-destructive"
                  />
                  <div>
                    <div className="font-arabic text-base font-semibold text-foreground">
                      {b.vendor?.business_name ?? "—"}
                    </div>
                    <div className="mt-1 text-xs text-foreground/65">
                      {b.vendor?.category ? t(`categories.${b.vendor.category}`) : ""} ·{" "}
                      {fmtDate(b.event_date)} · #{b.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>
                </div>
                <Badge className="gap-1 bg-destructive text-destructive-foreground">
                  <AlertTriangle className="h-3 w-3" /> {t("admin.late.silentBadge")}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {b.vendor?.phone && (
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <a href={`tel:${toLatinDigits(b.vendor.phone)}`}>
                      <Phone className="me-1 h-4 w-4" /> {t("admin.late.callVendor")}
                    </a>
                  </Button>
                )}
                {b.customer_phone && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-full border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <a href={`tel:${toLatinDigits(b.customer_phone)}`}>
                      <Phone className="me-1 h-4 w-4" /> {t("admin.late.callCustomer")}
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};
