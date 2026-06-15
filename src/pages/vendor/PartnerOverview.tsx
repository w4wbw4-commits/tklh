import { useEffect, useMemo, useState } from "react";
import { RiyalSymbol } from "@/components/tekillah/RiyalSymbol";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PortalLayout, PortalHeader } from "@/components/tekillah/vendor/PortalLayout";
import { StatusBanner } from "@/components/tekillah/vendor/StatusBanner";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import {
  TrendingUp,
  Calendar as CalendarIcon,
  Plus,
  FileText,
  CreditCard,
  ShieldCheck,
  CircleDot,
} from "lucide-react";

const fmtMoney = (n: number) => Math.round(n).toLocaleString("en-US");

type BookingLite = {
  id: string;
  event_date: string;
  total_price: number | null;
  status: string;
};

const monthLabel = (d: Date) => d.toLocaleDateString("ar-SA", { month: "short" });

const PartnerOverview = () => {
  const { vendor, loading } = usePartnerVendor();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingLite[]>([]);

  useEffect(() => {
    if (!vendor) return;
    (async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, event_date, total_price, status")
        .eq("vendor_id", vendor.id);
      setBookings((data as BookingLite[] | null) ?? []);
    })();
  }, [vendor]);

  // === KPIs ===
  const stats = useMemo(() => {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    const monthBookings = bookings.filter(
      (b) => b.event_date >= startMonth && b.event_date <= endMonth,
    );
    const monthRevenue = monthBookings
      .filter((b) => ["confirmed", "completed"].includes(b.status))
      .reduce((s, b) => s + Number(b.total_price ?? 0), 0);
    const confirmedCount = monthBookings.filter((b) => b.status === "confirmed").length;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const occupancy = Math.min(100, Math.round((monthBookings.length / daysInMonth) * 100));

    // 7-month chart data (current + previous 6)
    const chart: { month: string; v: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const start = `${y}-${m}-01`;
      const end = new Date(y, d.getMonth() + 1, 0).toISOString().slice(0, 10);
      const sum = bookings
        .filter(
          (b) =>
            b.event_date >= start &&
            b.event_date <= end &&
            ["confirmed", "completed"].includes(b.status),
        )
        .reduce((s, b) => s + Number(b.total_price ?? 0), 0);
      chart.push({ month: monthLabel(d), v: Math.round(sum / 1000) });
    }
    const mom =
      chart.length >= 2 && chart[chart.length - 2].v > 0
        ? Math.round(((chart[chart.length - 1].v - chart[chart.length - 2].v) / chart[chart.length - 2].v) * 100)
        : 0;

    return { monthRevenue, confirmedCount, occupancy, chart, mom };
  }, [bookings]);

  // === Calendar grid (current month) ===
  const calendar = useMemo(() => {
    const now = new Date();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDow = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    type Cell = { day: number | null; status: "free" | "booked" | "hold" | "today" };
    const cells: Cell[] = Array(firstDow)
      .fill(null)
      .map(() => ({ day: null, status: "free" }));
    for (let d = 1; d <= days; d++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const b = bookings.find((bk) => bk.event_date === dateStr);
      let status: Cell["status"] = "free";
      if (d === now.getDate()) status = "today";
      else if (b?.status === "confirmed" || b?.status === "completed") status = "booked";
      else if (b?.status === "pending") status = "hold";
      cells.push({ day: d, status });
    }
    return cells;
  }, [bookings]);

  const statusStyles: Record<"booked" | "hold" | "free" | "today", string> = {
    booked: "bg-primary text-primary-foreground border-primary",
    hold: "bg-secondary text-primary-deep border-secondary",
    free: "bg-background text-foreground/60 border-border",
    today: "bg-secondary text-primary-deep border-secondary ring-2 ring-primary/40",
  };

  // SVG chart geometry
  const maxV = Math.max(10, ...stats.chart.map((p) => p.v));
  const chartW = 520;
  const chartH = 180;
  const pad = 28;
  const xAt = (i: number) => pad + (i * (chartW - pad * 2)) / Math.max(1, stats.chart.length - 1);
  const yAt = (v: number) => chartH - pad - (v / maxV) * (chartH - pad * 2);
  const linePath = stats.chart.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.v)}`).join(" ");
  const areaPath =
    `M ${xAt(0)} ${chartH - pad} ` +
    stats.chart.map((p, i) => `L ${xAt(i)} ${yAt(p.v)}`).join(" ") +
    ` L ${xAt(stats.chart.length - 1)} ${chartH - pad} Z`;

  const quickActions = [
    { Icon: Plus, label: "إضافة عرض موسمي", to: "/vendor/pricing" },
    { Icon: CreditCard, label: "إدارة الباقات", to: "/vendor/profile" },
  ];

  return (
    <PortalLayout>
      <PortalHeader
        title={vendor ? `أهلاً ${vendor.business_name}` : "النظرة العامة"}
        subtitle="نظرة لحظية على أداء قاعتك — العوائد، الحجوزات، والتقويم"
        badge="لوحة الشريك"
      />
      <StatusBanner vendor={vendor} />

      {loading ? (
        <div className="grid place-items-center py-24 text-muted-foreground">جارٍ التحميل…</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="عوائد الشهر" value={`${fmtMoney(stats.monthRevenue)} `} trend={`${stats.mom >= 0 ? "+" : ""}${stats.mom}%`} />
            <Kpi label="حجوزات مؤكدة" value={String(stats.confirmedCount)} trend={`+${stats.confirmedCount}`} />
            <Kpi label="معدل الإشغال" value={`${stats.occupancy}%`} trend={`${stats.occupancy}%`} />
            <Kpi label="تقييم العملاء" value="—" trend="مرتفع" soft />
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            {/* Revenue chart */}
            <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    <h3 className="font-black">نمو العوائد الشهرية</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">آخر 7 أشهر — بآلاف <RiyalSymbol /></p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {stats.mom >= 0 ? "+" : ""}
                  {stats.mom}% MoM
                </span>
              </div>
              <div className="mt-4">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-auto w-full">
                  <defs>
                    <linearGradient id="overviewArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0.25, 0.5, 0.75].map((g) => (
                    <line
                      key={g}
                      x1={pad}
                      x2={chartW - pad}
                      y1={pad + g * (chartH - pad * 2)}
                      y2={pad + g * (chartH - pad * 2)}
                      stroke="hsl(var(--border))"
                      strokeDasharray="3 4"
                    />
                  ))}
                  <path d={areaPath} fill="url(#overviewArea)" />
                  <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {stats.chart.map((p, i) => (
                    <circle key={i} cx={xAt(i)} cy={yAt(p.v)} r="4" fill="hsl(var(--secondary))" stroke="hsl(var(--card))" strokeWidth="2" />
                  ))}
                  {stats.chart.map((p, i) => (
                    <text key={p.month + i} x={xAt(i)} y={chartH - 6} textAnchor="middle" style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}>
                      {p.month}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Calendar */}
            <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <CalendarIcon className="h-5 w-5" />
                  <h3 className="font-black">حالة الحجوزات اللحظية</h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1.5" dir="rtl">
                {["س", "ح", "ن", "ث", "ر", "خ", "ج"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-muted-foreground">
                    {d}
                  </div>
                ))}
                {calendar.map((cell, i) =>
                  cell.day === null ? (
                    <div key={`empty-${i}`} />
                  ) : (
                    <div
                      key={i}
                      className={`flex aspect-square items-center justify-center rounded-md border text-[11px] font-bold ${statusStyles[cell.status]}`}
                    >
                      {cell.day}
                    </div>
                  ),
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-foreground/70">
                <Legend className="bg-primary" label="محجوز" />
                <Legend className="bg-secondary" label="معلق" />
                <Legend className="border border-border bg-background" label="متاح" />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid gap-5 md:grid-cols-5">
            <div className="rounded-2xl border border-border bg-card p-5 md:col-span-3">
              <h3 className="font-black text-primary">إجراءات سريعة</h3>
              <p className="mt-1 text-xs text-muted-foreground">كل ما تحتاجه بضغطة وحدة</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {quickActions.map(({ Icon, label, to }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(to)}
                    className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-background p-4 text-right transition-all hover:-translate-y-0.5 hover:border-primary"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary-deep transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground md:col-span-2">
              <div className="absolute -bottom-12 -start-12 h-40 w-40 rounded-full bg-primary-glow/40 blur-2xl" />
              <div className="relative">
                <ShieldCheck className="h-7 w-7 text-secondary" />
                <h3 className="mt-3 text-lg font-black">صفر حجز مزدوج</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
                  مزامنة لحظية للحجوزات تمنع التعارض، مع تحليلات عميقة لسلوك العملاء.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-secondary">
                  <CircleDot className="h-3 w-3 animate-pulse" />
                  متصل لحظياً
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </PortalLayout>
  );
};

const Kpi = ({ label, value, trend, soft = false }: { label: string; value: string; trend: string; soft?: boolean }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <div className="text-xs font-bold text-muted-foreground">{label}</div>
    <div className="mt-1.5 text-xl font-black text-primary md:text-2xl">{value}</div>
    <div
      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
        soft ? "bg-secondary text-primary-deep" : "bg-primary/10 text-primary"
      }`}
    >
      {trend}
    </div>
  </div>
);

const Legend = ({ className, label }: { className: string; label: string }) => (
  <div className="flex items-center gap-1.5">
    <span className={`h-3 w-3 rounded ${className}`} />
    {label}
  </div>
);

export default PartnerOverview;
