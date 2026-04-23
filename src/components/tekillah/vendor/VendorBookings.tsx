import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Check, X, CalendarDays, Users, Inbox, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/tekillah/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

type TabKey = "new" | "active" | "completed";

export const VendorBookings = ({ vendorId }: { vendorId: string }) => {
  const { t } = useTranslation();
  const [list, setList] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("new");

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

  const grouped = useMemo(() => {
    const newOnes = list.filter((b) => b.status === "pending");
    const active = list.filter((b) => b.status === "confirmed");
    const completed = list.filter((b) => b.status === "completed" || b.status === "rejected" || b.status === "cancelled");
    return { newOnes, active, completed };
  }, [list]);

  const setStatus = async (id: string, status: "confirmed" | "rejected") => {
    setActing(id);
    // Optimistic update so the card moves between tabs immediately
    setList((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    setActing(null);
    if (error) {
      toast.error(error.message);
      load(); // revert by reloading truth
      return;
    }
    toast.success(t(`vendor.bookings.${status === "confirmed" ? "confirmed" : "rejected"}`));
    if (status === "confirmed") setTab("active");
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

  const renderList = (rows: BookingRow[]) => {
    if (rows.length === 0) {
      return (
        <EmptyState
          icon={Inbox}
          title={t("vendor.bookings.empty")}
          description={t("vendor.bookings.emptyDesc")}
        />
      );
    }
    return (
      <div className="space-y-3">
        {rows.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-arabic text-sm font-semibold text-foreground" dir="ltr">
                  #{b.id.slice(0, 8).toUpperCase()}
                </div>
                <div className="text-[11px] text-foreground/55">{b.package?.name ?? "—"}</div>
              </div>
              <Badge className={badgeFor(b.status)}>{t(`customer.bookingStatus.${b.status}`)}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
              <Stat icon={CalendarDays} label={t("vendor.bookings.eventDate")} value={fmtDate(b.event_date)} />
              <Stat icon={Users} label={t("vendor.bookings.guests")} value={fmtNumber(Number(b.guest_count ?? 0))} />
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
                  <Badge className="bg-primary/15 text-primary border-primary/20">
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
    );
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
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-card p-1 shadow-card">
            <TabsTrigger
              value="new"
              className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t("vendor.bookings.tabs.new")}
              <span className="ms-1 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold" dir="ltr">
                {fmtNumber(grouped.newOnes.length)}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t("vendor.bookings.tabs.active")}
              <span className="ms-1 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold" dir="ltr">
                {fmtNumber(grouped.active.length)}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t("vendor.bookings.tabs.completed")}
              <span className="ms-1 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold" dir="ltr">
                {fmtNumber(grouped.completed.length)}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="new">{renderList(grouped.newOnes)}</TabsContent>
            <TabsContent value="active">{renderList(grouped.active)}</TabsContent>
            <TabsContent value="completed">{renderList(grouped.completed)}</TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, highlight }: { icon?: typeof CalendarDays; label: string; value: string; highlight?: boolean }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-foreground/50 inline-flex items-center gap-1">
      {Icon && <Icon className="h-3 w-3" />}{label}
    </div>
    <div className={`font-arabic ${highlight ? "font-semibold text-primary" : "font-medium text-foreground"}`} dir="ltr">{value}</div>
  </div>
);

const badgeFor = (s: string) => {
  // Olive Green (primary) for accepted/confirmed per brand
  if (s === "confirmed") return "bg-primary/15 text-primary border-primary/20";
  if (s === "pending") return "bg-amber-500/15 text-amber-700 border-amber-500/20";
  if (s === "completed") return "bg-primary/20 text-primary border-primary/30";
  return "bg-destructive/15 text-destructive border-destructive/20";
};
