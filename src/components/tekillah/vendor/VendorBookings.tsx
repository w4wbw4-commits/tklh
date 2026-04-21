import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Check, X, Clock, CalendarDays, Users, Inbox, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/tekillah/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, fmtNumber } from "@/i18n/format";

interface BookingRow {
  id: string;
  event_date: string;
  status: string;
  total_price: number | null;
  paid_amount: number;
  guest_count: number | null;
  customer_id: string;
  attendance_confirmed_at: string | null;
  package: { name: string } | null;
}

const isToday = (iso: string) => {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};

export const VendorBookings = ({ vendorId }: { vendorId: string }) => {
  const { t } = useTranslation();
  const [list, setList] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings")
      .select("id, event_date, status, total_price, paid_amount, guest_count, customer_id, attendance_confirmed_at, package:packages(name)")
      .eq("vendor_id", vendorId)
      .order("event_date", { ascending: true });
    setList((data ?? []) as unknown as BookingRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel(`vendor-bookings-${vendorId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `vendor_id=eq.${vendorId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [vendorId]);

  const setStatus = async (id: string, status: "confirmed" | "rejected") => {
    setActing(id);
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    setActing(null);
    if (error) { toast.error(error.message); return; }
    toast.success(t(`vendor.bookings.${status === "confirmed" ? "confirmed" : "rejected"}`));
  };

  const confirmAttendance = async (b: BookingRow) => {
    if (!isToday(b.event_date)) return;
    setActing(b.id);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("bookings")
      .update({
        attendance_confirmed_at: new Date().toISOString(),
        attendance_confirmed_by: auth?.user?.id ?? null,
      })
      .eq("id", b.id);
    setActing(null);
    if (error) { toast.error(t("vendor.bookings.attendanceFailed")); return; }
    toast.success(t("vendor.bookings.attendanceSaved"));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-arabic text-2xl font-semibold text-foreground">{t("vendor.bookings.title")}</h2>
        <p className="mt-1 text-sm text-foreground/65">{t("vendor.bookings.subtitle")}</p>
      </div>

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t("vendor.bookings.empty")}
          description={t("vendor.bookings.emptyDesc")}
        />
      ) : (
        <div className="space-y-3">
          {list.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-arabic text-sm font-semibold text-foreground">
                    #{b.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="text-[11px] text-foreground/55">{b.package?.name ?? "—"}</div>
                </div>
                <Badge className={badgeFor(b.status)}>{t(`customer.bookingStatus.${b.status}`)}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <Stat icon={CalendarDays} label={t("vendor.bookings.eventDate")} value={fmtDate(b.event_date)} />
                <Stat icon={Users} label={t("vendor.bookings.guests")} value={String(b.guest_count ?? 0)} />
                <Stat label={t("vendor.bookings.amount")} value={`${fmtNumber(Number(b.total_price ?? 0))} ${t("common.currency")}`} highlight />
              </div>
              {b.status === "pending" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setStatus(b.id, "confirmed")} disabled={acting === b.id}
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Check className="me-1 h-4 w-4" /> {t("vendor.bookings.accept")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "rejected")} disabled={acting === b.id}
                    className="rounded-full text-destructive hover:bg-destructive/10">
                    <X className="me-1 h-4 w-4" /> {t("vendor.bookings.reject")}
                  </Button>
                </div>
              )}
              {b.status === "confirmed" && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {b.attendance_confirmed_at ? (
                    <Badge className="bg-emerald-500/15 text-emerald-700">
                      <CheckCircle2 className="me-1 h-3 w-3" /> {t("vendor.bookings.attendanceConfirmed")}
                    </Badge>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => confirmAttendance(b)}
                        disabled={acting === b.id || !isToday(b.event_date)}
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        <CheckCircle2 className="me-1 h-4 w-4" /> {t("vendor.bookings.confirmAttendance")}
                      </Button>
                      {!isToday(b.event_date) && (
                        <span className="text-[11px] text-foreground/55">{t("vendor.bookings.attendanceLockedHint")}</span>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, highlight }: { icon?: typeof CalendarDays; label: string; value: string; highlight?: boolean }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-foreground/50 inline-flex items-center gap-1">
      {Icon && <Icon className="h-3 w-3" />}{label}
    </div>
    <div className={`font-arabic ${highlight ? "font-semibold text-primary" : "font-medium text-foreground"}`}>{value}</div>
  </div>
);

const badgeFor = (s: string) => {
  if (s === "confirmed") return "bg-primary/15 text-primary";
  if (s === "pending") return "bg-amber-500/15 text-amber-700";
  if (s === "completed") return "bg-emerald-500/15 text-emerald-700";
  return "bg-destructive/15 text-destructive";
};
