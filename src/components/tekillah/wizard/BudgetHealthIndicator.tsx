import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { CheckCircle2, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fmtNumber } from "@/i18n/format";
import {
  allocationCatalog,
  realisticMinimum,
  type AllocationItem,
  type ServiceKey,
} from "./types";

// ---------------------------------------------------------------------------
// BudgetHealthIndicator
// ---------------------------------------------------------------------------
// Real-time consultative gauge that translates the user's running total into a
// 0–100 "health" score against the realistic minimum cost of their selected
// services. Tone is advisory, never punitive — we want users to feel guided
// toward a budget that delivers a great experience, not lectured.
//
// Health bands:
//   under     (< 70%  of min)  → muted gold    "below realistic floor"
//   tight     (70-99% of min)  → amber-gold    "covers basics, no buffer"
//   healthy   (100-129% of min)→ deep emerald  "comfortable & realistic"
//   premium   (130%+    of min)→ deep emerald  "premium quality assured"
//
// Colors live in CSS tokens (`--health-emerald`, `--health-gold`) so the
// indicator stays in sync with the brand if the palette ever shifts.
// ---------------------------------------------------------------------------

export type HealthBand = "under" | "tight" | "healthy" | "premium";

interface Breakdown {
  key: ServiceKey;
  label: string;
  allocated: number;
  minimum: number;
  /** 0..1 — how well this single service is funded */
  ratio: number;
  enabled: boolean;
}

interface Props {
  total: number;
  minimum: number;
  guests: number;
  /** Optional market average budget for the same guest count — drives the
   *  "premium" badge. Falls back to `minimum * 1.5` if not provided. */
  marketAvg?: number;
  enabledServices: Record<ServiceKey, boolean>;
  allocations: Record<ServiceKey, number>;
  /** Live market data for vendor-derived effective minimums. */
  effectiveMin: (item: AllocationItem) => number;
}

export const BudgetHealthIndicator = ({
  total,
  minimum,
  guests,
  marketAvg,
  enabledServices,
  allocations,
  effectiveMin,
}: Props) => {
  const { t } = useTranslation();
  const cur = t("common.currency");
  const fmt = (n: number) => fmtNumber(Math.round(n));

  // Score: ratio of total allocated to the realistic minimum, clamped 0..1.5.
  // We allow >100% so the "premium" band has somewhere to go.
  const ratio = useMemo(() => {
    if (minimum <= 0) return 0;
    return Math.min(1.5, total / minimum);
  }, [total, minimum]);

  const band: HealthBand = useMemo(() => {
    if (ratio < 0.7) return "under";
    if (ratio < 1) return "tight";
    if (ratio < 1.3) return "healthy";
    return "premium";
  }, [ratio]);

  // Per-service breakdown — drives the live "what's affecting health" list.
  const breakdown: Breakdown[] = useMemo(
    () =>
      allocationCatalog
        .filter((it) => enabledServices[it.key])
        .map((it) => {
          const min = effectiveMin(it);
          const allocated = allocations[it.key] ?? 0;
          return {
            key: it.key,
            label: t(`wizard.budget.items.${it.key}`),
            allocated,
            minimum: min,
            ratio: min > 0 ? allocated / min : 1,
            enabled: true,
          };
        })
        .sort((a, b) => a.ratio - b.ratio), // weakest first — most actionable
    [enabledServices, allocations, effectiveMin, t],
  );

  const bandMeta = {
    under: {
      // Muted gold — warm, advisory, not aggressive
      bg: "bg-amber-50 dark:bg-amber-950/20",
      ring: "border-amber-300/60 dark:border-amber-700/40",
      accent: "bg-amber-500",
      accentText: "text-amber-700 dark:text-amber-300",
      icon: Lightbulb,
      label: t("wizard.budget.health.underTitle", { defaultValue: "اقتراح لتحسين تجربتك" }),
      message: t("wizard.budget.health.underMsg", {
        defaultValue:
          "هذا المبلغ يعتبر أقل من الحد الأدنى لتغطية التكاليف الأساسية لهذه القاعة والخدمات. قد لا تلبي هذه الميزانية احتياجاتك الكاملة — ننصح برفعها قليلاً للحصول على تجربة متكاملة.",
      }),
    },
    tight: {
      bg: "bg-amber-50/70 dark:bg-amber-950/15",
      ring: "border-amber-300/50 dark:border-amber-700/35",
      accent: "bg-amber-400",
      accentText: "text-amber-700 dark:text-amber-300",
      icon: TrendingUp,
      label: t("wizard.budget.health.tightTitle", { defaultValue: "ميزانية قريبة من الواقع" }),
      message: t("wizard.budget.health.tightMsg", {
        defaultValue:
          "ميزانيتك تغطي الأساسيات بشكل جيد. زيادة بسيطة (10–20%) ستمنحك مرونة أكبر في اختيار المزوّدين وتحسين الجودة.",
      }),
    },
    healthy: {
      // Deep Emerald — brand positive
      bg: "bg-[hsl(var(--health-emerald)/0.08)]",
      ring: "border-[hsl(var(--health-emerald)/0.45)]",
      accent: "bg-[hsl(var(--health-emerald))]",
      accentText: "text-[hsl(var(--health-emerald))] dark:text-[hsl(var(--health-emerald-light))]",
      icon: CheckCircle2,
      label: t("wizard.budget.health.healthyTitle", { defaultValue: "ميزانية ممتازة" }),
      message: t("wizard.budget.health.healthyMsg", {
        defaultValue:
          "ميزانية ممتازة! هذا المبلغ يغطي احتياجاتك بشكل واقعي ويضمن لك جودة عالية في الخدمات المختارة.",
      }),
    },
    premium: {
      bg: "bg-[hsl(var(--health-emerald)/0.12)]",
      ring: "border-[hsl(var(--health-emerald)/0.55)]",
      accent: "bg-[hsl(var(--health-emerald))]",
      accentText: "text-[hsl(var(--health-emerald))] dark:text-[hsl(var(--health-emerald-light))]",
      icon: Sparkles,
      label: t("wizard.budget.health.premiumTitle", { defaultValue: "تجربة فاخرة مضمونة" }),
      message: t("wizard.budget.health.premiumMsg", {
        defaultValue:
          "ميزانية رائعة! تتيح لك اختيار أفضل المزوّدين وإضافة لمسات مميزة ترتقي بمناسبتك إلى مستوى استثنائي.",
      }),
    },
  }[band];

  const Icon = bandMeta.icon;
  // Visual bar fill — saturate at 100% for the "min met" milestone, then add
  // a subtle premium glow above that.
  const barFill = Math.min(100, (ratio / 1.3) * 100);

  return (
    <div className={`overflow-hidden rounded-2xl border ${bandMeta.ring} ${bandMeta.bg} p-5 transition-colors duration-500`}>
      {/* Header row — score + label */}
      <div className="flex items-start gap-3">
        <motion.span
          key={band}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${bandMeta.accent} text-white shadow-soft`}
        >
          <Icon className="h-5 w-5" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${bandMeta.accentText}`}>
            {t("wizard.budget.health.label", { defaultValue: "مؤشر صحة الميزانية" })}
          </div>
          <div className="font-arabic text-base font-bold text-foreground">{bandMeta.label}</div>
        </div>
        {/* Score chip */}
        <div className="text-end">
          <div className={`font-arabic text-2xl font-bold tabular-nums ${bandMeta.accentText}`}>
            {Math.round(ratio * 100)}
            <span className="ms-0.5 text-sm font-medium opacity-70">%</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-foreground/55">
            {t("wizard.budget.health.ofRealistic", { defaultValue: "من الواقعي" })}
          </div>
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="mt-4">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <motion.div
            className={`h-full ${bandMeta.accent} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${barFill}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Realistic-minimum tick mark at 77% (= 100% / 1.3) */}
          <div
            className="absolute top-0 h-full w-px bg-foreground/30"
            style={{ left: `${(1 / 1.3) * 100}%` }}
            aria-hidden
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-foreground/55">
          <span>{fmt(0)} {cur}</span>
          <span>
            {t("wizard.budget.health.realisticMark", { defaultValue: "الحد الواقعي" })} · {fmt(minimum)} {cur}
          </span>
          <span>{fmt(minimum * 1.3)} {cur}</span>
        </div>
      </div>

      {/* Consultative message — animates on band change */}
      <AnimatePresence mode="wait">
        <motion.p
          key={band}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35 }}
          className="mt-4 font-arabic text-[13px] leading-relaxed text-foreground/85"
        >
          {bandMeta.message}
        </motion.p>
      </AnimatePresence>

      {/* Live breakdown — shows the 3 weakest funded services so the user
          knows exactly which slider to nudge. */}
      {breakdown.length > 0 && (
        <div className="mt-4 rounded-xl border border-border/60 bg-background/60 p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
            <span>{t("wizard.budget.health.breakdown", { defaultValue: "تأثير اختياراتك" })}</span>
            <span>
              {t("wizard.budget.health.guestsLabel", {
                count: guests,
                defaultValue: `${fmtNumber(guests)} ضيف`,
              })}
            </span>
          </div>
          <div className="space-y-2">
            {breakdown.slice(0, 4).map((b) => {
              const pct = Math.min(100, b.ratio * 100);
              const isHealthy = b.ratio >= 1;
              return (
                <div key={b.key} className="flex items-center gap-2 text-xs">
                  <span className="w-20 shrink-0 truncate font-arabic text-foreground/80">{b.label}</span>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
                    <motion.div
                      className={`h-full rounded-full ${
                        isHealthy
                          ? "bg-[hsl(var(--health-emerald))]"
                          : b.ratio >= 0.7
                            ? "bg-amber-400"
                            : "bg-amber-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span
                    className={`w-12 shrink-0 text-end font-arabic text-[11px] font-semibold tabular-nums ${
                      isHealthy ? bandMeta.accentText : "text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {Math.round(b.ratio * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
