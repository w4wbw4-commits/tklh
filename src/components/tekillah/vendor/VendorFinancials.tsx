import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Loader2,
  TrendingUp,
  Wallet,
  CalendarCheck,
  Hash,
  Download,
  CalendarDays,
  User,
  Package as PackageIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, fmtNumber } from "@/i18n/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/tekillah/EmptyState";
import { toast } from "sonner";

interface BookingRow {
  id: string;
  event_date: string;
  status: string;
  total_price: number | null;
  paid_amount: number;
  customer_id: string;
  package: { name: string } | null;
}

interface CustomerProfile {
  user_id: string;
  display_name: string | null;
}

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const VendorFinancials = ({ vendorId }: { vendorId: string }) => {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("id, event_date, status, total_price, paid_amount, customer_id, package:packages(name)")
      .eq("vendor_id", vendorId)
      .order("event_date", { ascending: false });
    const rows = (data ?? []) as unknown as BookingRow[];
    setBookings(rows);

    const ids = Array.from(new Set(rows.map((b) => b.customer_id)));
    if (ids.length) {
      const { data: ps } = await supabase
        .from("public_profiles" as any)
        .select("user_id, display_name")
        .in("user_id", ids);
      const map: Record<string, string> = {};
      ((ps ?? []) as unknown as CustomerProfile[]).forEach((p) => {
        if (p.user_id) map[p.user_id] = p.display_name ?? "—";
      });
      setProfiles(map);
    } else {
      setProfiles({});
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`vendor-financials-${vendorId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `vendor_id=eq.${vendorId}` },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line
  }, [vendorId]);

  const stats = useMemo(() => {
    let totalEarned = 0;
    let upcomingValue = 0;
    let processed = 0;
    bookings.forEach((b) => {
      const price = Number(b.total_price ?? 0);
      if (b.status === "completed") {
        totalEarned += price;
        processed += 1;
      } else if (b.status === "confirmed") {
        upcomingValue += price;
        processed += 1;
      }
    });
    return { totalEarned, upcomingValue, processed };
  }, [bookings]);

  const chartData = useMemo(() => {
    const buckets: { key: string; label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = new Intl.DateTimeFormat(i18n.language?.startsWith("ar") ? "ar-SA-u-nu-latn" : "en-US", {
        month: "short",
      }).format(d);
      buckets.push({ key: monthKey(d), label, value: 0 });
    }
    const map = Object.fromEntries(buckets.map((b) => [b.key, b]));
    bookings.forEach((b) => {
      if (b.status !== "completed") return;
      const k = monthKey(new Date(b.event_date));
      if (map[k]) map[k].value += Number(b.total_price ?? 0);
    });
    return buckets;
  }, [bookings, i18n.language]);

  const upcomingCount = useMemo(
    () => bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length,
    [bookings],
  );

  const handleExportCSV = () => {
    if (!bookings.length) {
      toast.error(t("vendor.financials.noData"));
      return;
    }
    const header = [
      t("vendor.financials.export.eventDate"),
      t("vendor.financials.export.customer"),
      t("vendor.financials.export.service"),
      t("vendor.financials.export.status"),
      t("vendor.financials.export.amount"),
      t("vendor.financials.export.paid"),
    ];
    const rows = bookings.map((b) => [
      fmtDate(b.event_date),
      profiles[b.customer_id] ?? "—",
      b.package?.name ?? t("vendor.financials.customQuote"),
      t(`customer.bookingStatus.${b.status}`, { defaultValue: b.status }),
      String(Number(b.total_price ?? 0)),
      String(Number(b.paid_amount ?? 0)),
    ]);
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tekillah-financials-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t("vendor.financials.exportSuccess"));
  };

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-arabic text-2xl font-semibold text-foreground">
            {t("vendor.financials.title")}
          </h2>
          <p className="mt-1 text-sm text-foreground/65">{t("vendor.financials.subtitle")}</p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="me-1 h-4 w-4" />
          {t("vendor.financials.download")}
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Wallet}
          label={t("vendor.financials.totalEarned")}
          value={`${fmtNumber(stats.totalEarned)} ${t("common.currency")}`}
          tone="primary"
        />
        <StatCard
          icon={CalendarCheck}
          label={t("vendor.financials.upcomingValue")}
          value={`${fmtNumber(stats.upcomingValue)} ${t("common.currency")}`}
          tone="primary"
        />
        <StatCard
          icon={Hash}
          label={t("vendor.financials.processed")}
          value={fmtNumber(stats.processed)}
        />
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border bg-card p-5 shadow-card"
      >
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-arabic text-base font-semibold text-foreground">
            {t("vendor.financials.chartTitle")}
          </h3>
        </div>
        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                tickFormatter={(v) => fmtNumber(Number(v))}
                width={56}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${fmtNumber(Number(value))} ${t("common.currency")}`, t("vendor.financials.earnings")]}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Booking history */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-arabic text-base font-semibold text-foreground">
              {t("vendor.financials.historyTitle")}
            </h3>
            <p className="text-xs text-foreground/55">
              {fmtNumber(upcomingCount)} {t("vendor.financials.upcomingCountSuffix")}
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={t("vendor.financials.empty")}
            description={t("vendor.financials.emptyDesc")}
          />
        ) : (
          <div className="divide-y divide-border">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"
              >
                <Cell icon={CalendarDays} value={fmtDate(b.event_date)} />
                <Cell icon={User} value={profiles[b.customer_id] ?? "—"} />
                <Cell
                  icon={PackageIcon}
                  value={b.package?.name ?? t("vendor.financials.customQuote")}
                />
                <div
                  className="font-arabic text-sm font-semibold text-primary justify-self-start sm:justify-self-end"
                  dir="ltr"
                >
                  {fmtNumber(Number(b.total_price ?? 0))} {t("common.currency")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone?: "primary";
}) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-border bg-card p-5 shadow-card"
  >
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-foreground/55">{label}</div>
        <div
          className={`font-arabic text-lg font-semibold ${tone === "primary" ? "text-primary" : "text-foreground"}`}
          dir="ltr"
        >
          {value}
        </div>
      </div>
    </div>
  </motion.div>
);

const Cell = ({ icon: Icon, value }: { icon: typeof CalendarDays; value: string }) => (
  <div className="flex items-center gap-2 text-sm text-foreground/80">
    <Icon className="h-4 w-4 text-foreground/45" />
    <span className="truncate" dir="auto">
      {value}
    </span>
  </div>
);
