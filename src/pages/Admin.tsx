import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import * as XLSX from "xlsx";
import { RiyalSymbol } from "@/components/tekillah/RiyalSymbol";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2, ShieldAlert, Wallet, TrendingUp, Lock, ListChecks,
  CheckCircle2, Receipt, Percent, HandCoins, Inbox, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { fmtNumber, fmtDate } from "@/i18n/format";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdminReviewsPanel } from "@/components/tekillah/admin/AdminReviewsPanel";
import { AdminModerationQueue } from "@/components/tekillah/admin/AdminModerationQueue";
import { AdminVerificationQueue } from "@/components/tekillah/admin/AdminVerificationQueue";
import { AdminGrandControl } from "@/components/tekillah/admin/AdminGrandControl";
import { AdminLeadsPanel } from "@/components/tekillah/admin/AdminLeadsPanel";
import { AdminLateAlerts } from "@/components/tekillah/admin/AdminLateAlerts";
import { AdminIncidentReports } from "@/components/tekillah/admin/AdminIncidentReports";
import { AdminAddVendorDialog } from "@/components/tekillah/admin/AdminAddVendorDialog";
import { AdminVendorsPanel } from "@/components/tekillah/admin/AdminVendorsPanel";
import { AdminPackagesPanel } from "@/components/tekillah/admin/AdminPackagesPanel";
import { AdminPendingBookings } from "@/components/tekillah/admin/AdminPendingBookings";
import { AdminLayout } from "@/components/tekillah/admin/AdminLayout";
import { EmptyState } from "@/components/tekillah/EmptyState";

// Primary admin phones (allowlist) → synthetic emails used by phone-OTP login.
// Combined with the user_roles 'admin' check (auto-granted via DB trigger).
const PRIMARY_ADMIN_PHONES = ["+966554430196", "+966544057854"];
const PRIMARY_ADMIN_EMAILS = PRIMARY_ADMIN_PHONES.map(
  (p) => `${p.replace("+", "")}@phone.tekillah.app`,
);

interface PaymentRow {
  id: string;
  amount: number;
  vat_amount: number;
  platform_fee: number;
  vendor_net: number;
  total_charged: number;
  status: "held" | "released" | "refunded" | "failed";
  created_at: string;
  booking_id: string;
  vendor_id: string;
  customer_id: string;
}

interface BookingRow {
  id: string;
  event_date: string;
  status: string;
  total_price: number | null;
  paid_amount: number;
  created_at: string;
  vendor: { business_name: string; category: string } | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("verification");
  const [period, setPeriod] = useState<"all" | "month">("all");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/admin", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Hardcoded phone allowlist OR admin role. The primary admin phone is
      // always granted access; other admins must have the 'admin' role.
      const isPrimaryPhone =
        (user.email && PRIMARY_ADMIN_EMAILS.includes(user.email)) ||
        (user.phone && PRIMARY_ADMIN_PHONES.includes(user.phone));
      if (isPrimaryPhone) {
        setIsAdmin(true);
        // Best-effort self-heal: ensure the role row exists for RLS-protected writes.
        await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" }).then(() => {}, () => {});
        return;
      }
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(Boolean(data));
    })();
  }, [user]);

  // Admin uses the standard light olive theme — no dark-mode toggle.

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: b }] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings")
        .select("id, event_date, status, total_price, paid_amount, created_at, vendor:vendors(business_name, category)")
        .order("created_at", { ascending: false }),
    ]);
    setPayments((p ?? []) as unknown as PaymentRow[]);
    setBookings((b ?? []) as unknown as BookingRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    load();
    // realtime subscription on payments and bookings
    const ch = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const releasePayment = async (id: string) => {
    setReleasingId(id);
    const { error } = await supabase.from("payments")
      .update({ status: "released", released_at: new Date().toISOString(), released_by: user?.id })
      .eq("id", id);
    setReleasingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(t("admin.releaseSuccess"));
  };

  if (authLoading || isAdmin === null) {
    return (
      <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false} storageKey="tekillah-admin-theme">
        <div className="grid min-h-screen place-items-center bg-gradient-soft"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </ThemeProvider>
    );
  }

  if (!isAdmin) {
    return (
      <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false} storageKey="tekillah-admin-theme">
        <div className="grid min-h-screen place-items-center bg-gradient-soft p-6">
          <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-card">
            <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 font-arabic text-xl font-semibold">{t("admin.deniedTitle")}</h1>
            <p className="mt-2 text-sm text-foreground/65">{t("admin.deniedDesc")}</p>
            <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/">{t("common.backToHome")}</Link>
            </Button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Financial split: separate VAT, platform commission, and vendor net payouts
  // `period` lets the admin scope KPIs to the current calendar month.
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const scopedPayments = period === "month"
    ? payments.filter((p) => new Date(p.created_at) >= monthStart)
    : payments;
  const scopedBookings = period === "month"
    ? bookings.filter((b) => new Date(b.created_at) >= monthStart)
    : bookings;
  const totalRevenue   = scopedPayments.reduce((s, p) => s + Number(p.total_charged ?? 0), 0);
  const heldFunds      = scopedPayments.filter((p) => p.status === "held").reduce((s, p) => s + Number(p.vendor_net ?? 0), 0);
  const platformProfit = scopedPayments.reduce((s, p) => s + Number(p.platform_fee ?? 0), 0);   // commission only, excl VAT
  const vatCollected   = scopedPayments.reduce((s, p) => s + Number(p.vat_amount ?? 0), 0);     // 15% VAT line item
  const vendorPayouts  = scopedPayments.reduce((s, p) => s + Number(p.vendor_net ?? 0), 0);     // net to vendors
  const totalBookings  = scopedBookings.length;
  const pendingCount   = bookings.filter((b) => b.status === "pending").length;

  const renderSection = () => {
    switch (activeTab) {
      case "verification": return <AdminVerificationQueue />;
      case "pending":      return <AdminPendingBookings />;
      case "vendors":      return <AdminVendorsPanel />;
      case "late":         return <AdminLateAlerts />;
      case "incidents":    return <AdminIncidentReports />;
      case "leads":        return <AdminLeadsPanel />;
      case "reviews":      return <AdminReviewsPanel />;
      case "packages":     return <AdminPackagesPanel />;
      case "moderation":   return <AdminModerationQueue />;
      case "payments":
        if (loading) return <Spinner />;
        if (payments.length === 0)
          return <EmptyState icon={Receipt} title={t("admin.noPayments")} description={t("admin.noPaymentsDesc")} />;
        return (
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-arabic text-sm font-semibold text-foreground">
                      #{p.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div className="text-[11px] text-foreground/55">{fmtDate(p.created_at)}</div>
                  </div>
                  <Badge className={statusBadge(p.status)}>{t(`admin.payStatus.${p.status}`)}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <Field label={t("admin.amount")} value={`${fmtNumber(Number(p.amount))} $<RiyalSymbol />`} />
                  <Field label={t("admin.vat")} value={`${fmtNumber(Number(p.vat_amount))} $<RiyalSymbol />`} />
                  <Field label={t("admin.fee")} value={`${fmtNumber(Number(p.platform_fee))} $<RiyalSymbol />`} />
                  <Field label={t("admin.vendorNet")} value={`${fmtNumber(Number(p.vendor_net))} $<RiyalSymbol />`} highlight />
                </div>
                {p.status === "held" && (
                  <div className="mt-3 flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" disabled={releasingId === p.id}
                          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                          {releasingId === p.id ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="me-1 h-4 w-4" />}
                          {t("admin.releasePayment")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("admin.releaseConfirmTitle")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("admin.releaseConfirmDesc")}
                            <span className="mt-3 block rounded-lg bg-secondary p-3 font-arabic font-semibold text-foreground">
                              {fmtNumber(Number(p.vendor_net))} <RiyalSymbol />
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">{t("common.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => releasePayment(p.id)}
                            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                            {t("admin.releaseConfirmCta")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case "bookings":
        if (loading) return <Spinner />;
        if (bookings.length === 0)
          return <EmptyState icon={Inbox} title={t("admin.noBookings")} description={t("admin.noBookingsDesc")} />;
        return (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-arabic text-sm font-semibold text-foreground">
                      {b.vendor?.business_name ?? "—"}
                    </div>
                    <div className="text-[11px] text-foreground/55">
                      {b.vendor?.category ? t(`categories.${b.vendor.category}`) : ""} · #{b.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>
                  <Badge className={bookingBadge(b.status)}>
                    {t(`customer.bookingStatus.${b.status}`)}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  <Field label={t("admin.eventDate")} value={fmtDate(b.event_date)} />
                  <Field label={t("admin.totalPrice")} value={`${fmtNumber(Number(b.total_price ?? 0))} $<RiyalSymbol />`} />
                  <Field label={t("admin.paid")} value={`${fmtNumber(Number(b.paid_amount))} $<RiyalSymbol />`} />
                </div>
              </div>
            ))}
          </div>
        );
      default: return null;
    }
  };

  return (
    <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false} storageKey="tekillah-admin-theme">
      <AdminLayout
        active={activeTab}
        onChange={setActiveTab}
        badges={{ pending: pendingCount }}
        headerAction={user && <AdminAddVendorDialog adminUserId={user.id} onCreated={load} />}
      >
        {/* Period filter + Excel export */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPeriod("all")}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              period === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/70 hover:bg-secondary/40"
            }`}
          >
            {t("admin.periodAll")}
          </button>
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              period === "month"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/70 hover:bg-secondary/40"
            }`}
          >
            {t("admin.periodMonth")}
          </button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              // Build an editable workbook with 3 sheets: Sales/Revenue, Held Funds, Summary.
              // Rows respect the active period filter so the export matches the on-screen KPIs.
              const fmt = (n: number | null | undefined) => Number(n ?? 0);
              const dateOnly = (iso: string) => new Date(iso).toISOString().slice(0, 10);

              const salesRows = scopedPayments.map((p) => ({
                [t("admin.amount")]: fmt(p.amount),
                [t("admin.vatCollected")]: fmt(p.vat_amount),
                [t("admin.platformProfit")]: fmt(p.platform_fee),
                [t("admin.vendorPayouts")]: fmt(p.vendor_net),
                [t("admin.totalRevenue")]: fmt(p.total_charged),
                "status": p.status,
                "booking_id": p.booking_id,
                "vendor_id": p.vendor_id,
                "customer_id": p.customer_id,
                "created_at": dateOnly(p.created_at),
              }));

              const heldRows = scopedPayments
                .filter((p) => p.status === "held")
                .map((p) => ({
                  [t("admin.heldFunds")]: fmt(p.vendor_net),
                  [t("admin.totalRevenue")]: fmt(p.total_charged),
                  "booking_id": p.booking_id,
                  "vendor_id": p.vendor_id,
                  "created_at": dateOnly(p.created_at),
                }));

              const summary = [
                { metric: t("admin.totalRevenue"), value: totalRevenue },
                { metric: t("admin.platformProfit"), value: platformProfit },
                { metric: t("admin.vatCollected"), value: vatCollected },
                { metric: t("admin.vendorPayouts"), value: vendorPayouts },
                { metric: t("admin.heldFunds"), value: heldFunds },
                { metric: t("admin.totalBookings"), value: totalBookings },
              ];

              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Summary");
              XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesRows), "Sales");
              XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(heldRows), "Escrow");

              const stamp = new Date().toISOString().slice(0, 10);
              const suffix = period === "month" ? "month" : "all";
              XLSX.writeFile(wb, `tklh-financials-${suffix}-${stamp}.xlsx`);
            }}
            className="ms-auto h-8 rounded-full text-xs"
          >
            <Download className="me-1 h-3.5 w-3.5" /> {t("admin.exportExcel")}
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <Kpi icon={TrendingUp} label={t("admin.totalRevenue")}   value={fmtNumber(totalRevenue)}   currency highlight />
          <Kpi icon={Percent}    label={t("admin.platformProfit")} value={fmtNumber(platformProfit)} currency />
          <Kpi icon={Receipt}    label={t("admin.vatCollected")}   value={fmtNumber(vatCollected)}   currency />
          <Kpi icon={HandCoins}  label={t("admin.vendorPayouts")}  value={fmtNumber(vendorPayouts)}  currency />
          <Kpi icon={Lock}       label={t("admin.heldFunds")}      value={fmtNumber(heldFunds)}      currency />
          <Kpi icon={ListChecks} label={t("admin.totalBookings")}  value={fmtNumber(totalBookings)} />
        </div>

        {/* Grand control summary */}
        <div className="mt-5">
          <AdminGrandControl onJump={setActiveTab} />
        </div>

        {/* Active section */}
        <section className="mt-6">
          {renderSection()}
        </section>
      </AdminLayout>
    </ThemeProvider>
  );
};

const Kpi = ({
  icon: Icon, label, value, currency, highlight,
}: { icon: typeof Wallet; label: string; value: string; currency?: boolean; highlight?: boolean }) => (
  <div className={`group relative overflow-hidden rounded-2xl border p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
    highlight
      ? "border-primary/30 bg-gradient-to-br from-card to-secondary/40 ring-1 ring-primary/15"
      : "border-border bg-card"
  }`}>
    <div className="flex items-start justify-between gap-2">
      <div className="min-h-[2.4rem] flex-1 text-[12px] font-semibold leading-tight text-foreground/70">
        {label}
      </div>
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
        highlight ? "bg-gradient-olive text-primary-foreground" : "bg-secondary/70 text-primary-deep"
      }`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="mt-3 flex items-baseline gap-1.5 font-arabic font-black tracking-tight text-primary-deep">
      <span className="text-2xl tabular-nums leading-none">{value}</span>
      {currency && (
        <span className="text-base leading-none text-primary-deep/80" style={{ fontFamily: "'SaudiRiyal', sans-serif" }}>
          {"\uE900"}
        </span>
      )}
    </div>
  </div>
);

const Field = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider font-semibold text-foreground/60">{label}</div>
    <div className={`font-arabic ${highlight ? "font-bold text-primary-deep" : "font-semibold text-foreground"}`}>{value}</div>
  </div>
);

const Spinner = () => (
  <div className="grid place-items-center rounded-2xl border border-primary/15 bg-card p-12">
    <Loader2 className="h-5 w-5 animate-spin text-primary" />
  </div>
);

const statusBadge = (s: string) => {
  if (s === "held") return "bg-gradient-olive text-primary-foreground border border-primary-deep/30";
  if (s === "released") return "bg-emerald-600 text-white border border-emerald-700/40";
  if (s === "refunded") return "bg-amber-500 text-white border border-amber-600/40";
  return "bg-destructive text-destructive-foreground border border-destructive/40";
};
const bookingBadge = (s: string) => {
  if (s === "confirmed") return "bg-gradient-olive text-primary-foreground border border-primary-deep/30";
  if (s === "pending") return "bg-amber-500 text-white border border-amber-600/40";
  if (s === "completed") return "bg-emerald-600 text-white border border-emerald-700/40";
  return "bg-destructive text-destructive-foreground border border-destructive/40";
};

export default Admin;
