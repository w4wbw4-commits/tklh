import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  Calendar,
  Plus,
  FileText,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Bell,
  Search,
  Settings,
  CircleDot,
} from "lucide-react";

// Marketing-style live preview of the Partner Portal — placed on the public
// vendor landing page so visitors immediately understand the product before
// signing up. All colors use semantic tokens (primary = olive, secondary = gold-beige).

const revenuePoints = [
  { m: "يناير", v: 42 },
  { m: "فبراير", v: 55 },
  { m: "مارس", v: 48 },
  { m: "أبريل", v: 70 },
  { m: "مايو", v: 82 },
  { m: "يونيو", v: 95 },
  { m: "يوليو", v: 110 },
];

const maxV = 120;
const chartW = 520;
const chartH = 180;
const pad = 28;
const xAt = (i: number) => pad + (i * (chartW - pad * 2)) / (revenuePoints.length - 1);
const yAt = (v: number) => chartH - pad - (v / maxV) * (chartH - pad * 2);
const linePath = revenuePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.v)}`).join(" ");
const areaPath =
  `M ${xAt(0)} ${chartH - pad} ` +
  revenuePoints.map((p, i) => `L ${xAt(i)} ${yAt(p.v)}`).join(" ") +
  ` L ${xAt(revenuePoints.length - 1)} ${chartH - pad} Z`;

type Status = "booked" | "hold" | "free" | "today";
const calendar: Status[] = [
  "free", "free", "booked", "free", "hold", "booked", "free",
  "free", "booked", "booked", "free", "free", "hold", "free",
  "booked", "free", "today", "free", "booked", "free", "hold",
  "booked", "booked", "free", "free", "booked", "free", "hold",
];

const statusStyles: Record<Status, string> = {
  booked: "bg-primary text-primary-foreground border-primary",
  hold: "bg-secondary text-primary-deep border-secondary",
  free: "bg-background text-foreground/60 border-border",
  today: "bg-secondary text-primary-deep border-secondary ring-2 ring-primary/40",
};

export const PartnerDashboardPreview = () => {
  const { t } = useTranslation();

  const sidebar = [
    t("partnerPreview.nav.bookings", { defaultValue: "الحجوزات" }),
    t("partnerPreview.nav.customers", { defaultValue: "العملاء" }),
    t("partnerPreview.nav.offers", { defaultValue: "العروض" }),
    t("partnerPreview.nav.invoices", { defaultValue: "الفواتير" }),
    t("partnerPreview.nav.reports", { defaultValue: "التقارير" }),
  ];

  const quickActions = [
    { Icon: Plus, label: t("partnerPreview.actions.offer", { defaultValue: "إضافة عرض موسمي" }) },
    { Icon: FileText, label: t("partnerPreview.actions.invoice", { defaultValue: "إصدار فاتورة ضريبية" }) },
    { Icon: CreditCard, label: t("partnerPreview.actions.payments", { defaultValue: "ربط تابي / تمارا" }) },
  ];

  return (
    <section dir="rtl" className="relative overflow-hidden bg-background py-20 sm:py-24">
      <div className="pointer-events-none absolute -top-24 -start-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -end-24 h-96 w-96 rounded-full bg-secondary/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-primary">
            {t("partnerPreview.kicker", { defaultValue: "منصة الشركاء" })}
          </span>
          <h2 className="mt-5 font-arabic text-3xl font-black leading-tight sm:text-5xl text-primary-deep">
            {t("partnerPreview.title", { defaultValue: "تحول من الإدارة التقليدية إلى" })}{" "}
            <span className="text-primary">{t("partnerPreview.titleHighlight", { defaultValue: "الأتمتة الكاملة" })}</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {t("partnerPreview.subtitle", {
              defaultValue: "لوحة تحكم متكاملة لأصحاب القاعات: عوائد لحظية، حجوزات مزامنة، وإجراءات بضغطة زر — بدون أي حجز مزدوج.",
            })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 overflow-hidden rounded-3xl border border-border bg-card shadow-luxury"
        >
          {/* Browser chrome */}
          <div className="flex items-center justify-between border-b border-border bg-muted/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-destructive/70" />
              <span className="h-3 w-3 rounded-full bg-secondary" />
              <span className="h-3 w-3 rounded-full bg-primary/70" />
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              partner.tiklh.com / dashboard
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Search className="h-4 w-4" />
              <Bell className="h-4 w-4" />
              <Settings className="h-4 w-4" />
            </div>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-12 md:p-7">
            {/* Sidebar */}
            <aside className="hidden flex-col gap-2 border-s border-border ps-4 lg:col-span-2 lg:flex">
              <div className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
                <BarChart3 className="h-4 w-4" /> {t("partnerPreview.nav.overview", { defaultValue: "النظرة العامة" })}
              </div>
              {sidebar.map((s) => (
                <div
                  key={s}
                  className="cursor-default rounded-xl px-3 py-2 text-sm text-foreground/70 hover:bg-muted"
                >
                  {s}
                </div>
              ))}
            </aside>

            {/* Main */}
            <div className="space-y-5 lg:col-span-10">
              {/* KPI row */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Kpi label={t("partnerPreview.kpi.revenue", { defaultValue: "عوائد الشهر" })} value="312,400 " trend="+18%" />
                <Kpi label={t("partnerPreview.kpi.bookings", { defaultValue: "حجوزات مؤكدة" })} value="42" trend="+6" />
                <Kpi label={t("partnerPreview.kpi.occupancy", { defaultValue: "معدل الإشغال" })} value="78%" trend="+12%" />
                <Kpi label={t("partnerPreview.kpi.rating", { defaultValue: "تقييم العملاء" })} value="4.8 / 5" trend={t("partnerPreview.kpi.excellent", { defaultValue: "ممتاز" })} soft />
              </div>

              <div className="grid gap-5 lg:grid-cols-5">
                {/* Revenue chart */}
                <div className="rounded-2xl border border-border bg-muted/40 p-5 lg:col-span-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-primary">
                        <TrendingUp className="h-5 w-5" />
                        <h3 className="font-black">{t("partnerPreview.chart.title", { defaultValue: "نمو العوائد الشهرية" })}</h3>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("partnerPreview.chart.sub", { defaultValue: "آخر 7 أشهر — بآلاف" })} <RiyalSymbol />
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">+24% MoM</span>
                  </div>

                  <div className="mt-4">
                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-auto w-full">
                      <defs>
                        <linearGradient id="areaGradPartner" x1="0" x2="0" y1="0" y2="1">
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
                      <motion.path
                        d={areaPath}
                        fill="url(#areaGradPartner)"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                      />
                      <motion.path
                        d={linePath}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.4, ease: "easeInOut" }}
                      />
                      {revenuePoints.map((p, i) => (
                        <motion.circle
                          key={i}
                          cx={xAt(i)}
                          cy={yAt(p.v)}
                          r="4"
                          fill="hsl(var(--secondary))"
                          stroke="hsl(var(--card))"
                          strokeWidth="2"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 300 }}
                        />
                      ))}
                      {revenuePoints.map((p, i) => (
                        <text
                          key={p.m}
                          x={xAt(i)}
                          y={chartH - 6}
                          textAnchor="middle"
                          style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        >
                          {p.m}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Calendar */}
                <div className="rounded-2xl border border-border bg-muted/40 p-5 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      <Calendar className="h-5 w-5" />
                      <h3 className="font-black">{t("partnerPreview.calendar.title", { defaultValue: "حالة الحجوزات اللحظية" })}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {t("partnerPreview.calendar.month", { defaultValue: "أبريل 2026" })}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-1.5" dir="rtl">
                    {["س", "ح", "ن", "ث", "ر", "خ", "ج"].map((d) => (
                      <div key={d} className="text-center text-[10px] font-bold text-muted-foreground">
                        {d}
                      </div>
                    ))}
                    {calendar.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.6 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.02 * i }}
                        className={`flex aspect-square items-center justify-center rounded-md border text-[11px] font-bold ${statusStyles[s]}`}
                      >
                        {i + 1}
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-foreground/70">
                    <Legend className="bg-primary" label={t("partnerPreview.legend.booked", { defaultValue: "محجوز" })} />
                    <Legend className="bg-secondary" label={t("partnerPreview.legend.hold", { defaultValue: "معلق" })} />
                    <Legend className="border border-border bg-background" label={t("partnerPreview.legend.free", { defaultValue: "متاح" })} />
                  </div>
                </div>
              </div>

              {/* Quick actions + value prop */}
              <div className="grid gap-5 md:grid-cols-5">
                <div className="rounded-2xl border border-border bg-muted/40 p-5 md:col-span-3">
                  <h3 className="font-black text-primary">
                    {t("partnerPreview.quick.title", { defaultValue: "إجراءات سريعة" })}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("partnerPreview.quick.sub", { defaultValue: "كل ما تحتاجه بضغطة وحدة" })}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {quickActions.map(({ Icon, label }) => (
                      <button
                        key={label}
                        type="button"
                        className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 text-right transition-all hover:-translate-y-0.5 hover:border-primary"
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
                    <h3 className="mt-3 text-lg font-black">
                      {t("partnerPreview.value.title", { defaultValue: "صفر حجز مزدوج" })}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
                      {t("partnerPreview.value.body", {
                        defaultValue: "مزامنة لحظية للحجوزات تمنع التعارض، مع تحليلات عميقة لسلوك العملاء وأكثر الباقات طلباً.",
                      })}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-secondary">
                      <CircleDot className="h-3 w-3 animate-pulse" />
                      {t("partnerPreview.value.live", { defaultValue: "متصل لحظياً" })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Kpi = ({
  label,
  value,
  trend,
  soft = false,
}: {
  label: string;
  value: string;
  trend: string;
  soft?: boolean;
}) => (
  <div className="rounded-2xl border border-border bg-muted/40 p-4">
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
