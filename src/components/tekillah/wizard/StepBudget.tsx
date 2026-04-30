import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sparkles, AlertTriangle, TrendingUp, Users, Plus } from "lucide-react";
import {
  allocationCatalog,
  realisticMinimum,
  type BudgetMode,
  type ServiceKey,
} from "./types";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { useTranslation } from "react-i18next";
import { fmtNumber } from "@/i18n/format";
import { BudgetHealthIndicator } from "./BudgetHealthIndicator";

interface Props {
  budgetMode: BudgetMode;
  setBudgetMode: (m: BudgetMode) => void;
  budget: number;
  setBudget: (n: number) => void;
  guests: number;
  allocations: Record<ServiceKey, number>;
  setAllocation: (key: ServiceKey, value: number) => void;
  enabledServices: Record<ServiceKey, boolean>;
  toggleEnabled: (key: ServiceKey) => void;
}

export const StepBudget = ({
  budgetMode, setBudgetMode, budget, setBudget,
  guests, allocations, setAllocation,
  enabledServices, toggleEnabled,
}: Props) => {
  const { t } = useTranslation();
  const { prices: market } = useMarketPrices();
  const fmt = (n: number) => fmtNumber(Math.round(n));

  // Smart Budget is the only mode — auto-default on mount.
  useEffect(() => {
    if (budgetMode !== "smart") setBudgetMode("smart");
  }, [budgetMode, setBudgetMode]);

  const effectiveMin = (item: typeof allocationCatalog[number]) => {
    const staticMin = realisticMinimum(item, guests);
    const marketAvg = market[item.key]?.avg ?? null;
    return marketAvg ? Math.max(staticMin, Math.round(marketAvg)) : staticMin;
  };

  // Live total = sum of allocations for enabled services. This is the
  // single source of truth for "Total Budget".
  const total = useMemo(
    () => allocationCatalog.reduce(
      (s, it) => s + (enabledServices[it.key] ? (allocations[it.key] ?? 0) : 0),
      0,
    ),
    [allocations, enabledServices],
  );

  const globalMinimum = useMemo(
    () => allocationCatalog.reduce(
      (s, item) => s + (enabledServices[item.key] ? effectiveMin(item) : 0),
      0,
    ),
    [guests, market, enabledServices], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const cur = t("common.currency");

  // Keep `budget` (the prop used downstream for tier matching) in sync with
  // the live total so vendor filtering reacts to per-service tweaks.
  useEffect(() => {
    if (total > 0 && total !== budget) setBudget(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // Two-way binding: when the user edits the total directly (input or slider),
  // scale every enabled allocation proportionally so the per-service sliders
  // stay coherent with the new target.
  const setTotal = useCallback((nextTotal: number) => {
    const target = Math.max(0, Math.round(nextTotal));
    if (total <= 0) {
      // Distribute by suggested pct of enabled services
      const enabled = allocationCatalog.filter((it) => enabledServices[it.key]);
      const pctSum = enabled.reduce((s, it) => s + it.pct, 0) || 1;
      enabled.forEach((it) => {
        const v = Math.round((target * it.pct) / pctSum);
        setAllocation(it.key, v);
      });
    } else {
      const ratio = target / total;
      allocationCatalog.forEach((it) => {
        if (!enabledServices[it.key]) return;
        const next = Math.round((allocations[it.key] ?? 0) * ratio);
        setAllocation(it.key, next);
      });
    }
    setBudget(target);
  }, [total, allocations, enabledServices, setAllocation, setBudget]);

  // Split services into active (enabled) and inactive (available to add).
  const activeServices = allocationCatalog.filter((it) => enabledServices[it.key]);
  const inactiveServices = allocationCatalog.filter((it) => !enabledServices[it.key]);

  // Total slider bounds — adapt to current scale.
  const sliderMin = 20000;
  const sliderMax = Math.max(500000, Math.round(total * 1.5) || 500000);

  return (
    <motion.div
      key="step-budget"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 sm:p-10"
    >
      <h3 className="font-arabic text-2xl font-semibold text-foreground">{t("wizard.budget.title")}</h3>
      <p className="mt-2 text-sm text-foreground/70">{t("wizard.budget.desc")}</p>

      <motion.div
        key="smart"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card">
              {/* === Total Budget — editable, two-way bound to slider === */}
              <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {t("wizard.budget.totalSmart")}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      type="number"
                      value={total}
                      onChange={(e) => setTotal(Number(e.target.value) || 0)}
                      className="h-14 w-44 rounded-xl border-border bg-background text-end font-arabic text-3xl font-semibold tabular-nums focus-visible:ring-[hsl(var(--health-emerald)/0.4)]"
                      min={0}
                      step={500}
                      aria-label={t("wizard.budget.totalSmart")}
                    />
                    <span className="font-arabic text-base text-foreground/60">{cur}</span>
                  </div>
                  <div className="mt-2 text-xs text-foreground/60">
                    {t("wizard.budget.perGuest", { guests: fmtNumber(guests), perGuest: fmt(total / Math.max(guests, 1)) })}
                  </div>
                  <div className="mt-1 text-xs text-foreground/70">
                    {t("wizard.budget.minimum")} <span className="font-semibold text-foreground">{fmt(globalMinimum)} {cur}</span>
                  </div>
                </div>
                <div className="w-full sm:w-72">
                  <div className="flex items-center justify-between text-xs text-foreground/70">
                    <span>{t("wizard.budget.adjustTotal", { defaultValue: "اضبط الإجمالي" })}</span>
                    <span className="font-medium text-foreground tabular-nums">{fmt(total)} {cur}</span>
                  </div>
                  <div className="mt-3 px-2.5">
                    <Slider
                      value={[Math.min(Math.max(total, sliderMin), sliderMax)]}
                      onValueChange={(v) => setTotal(v[0])}
                      min={sliderMin}
                      max={sliderMax}
                      step={500}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] text-foreground/55 tabular-nums">
                    <span>{fmt(sliderMin)}</span>
                    <span>{fmt(sliderMax)}</span>
                  </div>
                </div>
              </div>

              {/* === Budget Health Indicator === */}
              <div className="mt-5">
                <BudgetHealthIndicator
                  total={total}
                  minimum={globalMinimum}
                  guests={guests}
                  enabledServices={enabledServices}
                  allocations={allocations}
                  effectiveMin={effectiveMin}
                />
              </div>

              {/* === Active services only === */}
              <div className="mt-6 space-y-5">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {t("wizard.budget.distribution")}
                </div>

                <AnimatePresence initial={false}>
                  {activeServices.map((item) => {
                    const value = allocations[item.key];
                    const min = effectiveMin(item);
                    const isLow = value < min;
                    const vendorCount = market[item.key]?.count ?? 0;
                    return (
                      <motion.div
                        key={item.key}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-2xl border border-border/70 bg-background p-4 sm:p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked
                              onCheckedChange={() => toggleEnabled(item.key)}
                              aria-label={t("wizard.budget.includeService")}
                            />
                            <div>
                              <div className="font-arabic text-base font-semibold text-foreground">
                                {t(`wizard.budget.items.${item.key}`)}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                                <span>
                                  {t("wizard.budget.minRealistic")}{" "}
                                  <span className="font-medium text-foreground/80">{fmt(min)} {cur}</span>
                                </span>
                                {vendorCount > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                    <Users className="h-2.5 w-2.5" /> {t("wizard.budget.vendorAvg", { count: vendorCount })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={value}
                              onChange={(e) => setAllocation(item.key, Math.max(0, Number(e.target.value) || 0))}
                              className={`h-10 w-32 rounded-lg text-end font-medium tabular-nums ${
                                isLow ? "border-destructive/60 focus-visible:ring-destructive" : ""
                              }`}
                            />
                            <span className="text-sm text-foreground/60">{cur}</span>
                          </div>
                        </div>

                        <div className="mt-4 px-2.5">
                          <Slider
                            value={[value]}
                            onValueChange={(v) => setAllocation(item.key, v[0])}
                            min={0}
                            max={Math.max(min * 3, 50000)}
                            step={500}
                          />
                        </div>

                        <AnimatePresence>
                          {isLow && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300"
                            >
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <span className="font-arabic leading-relaxed">
                                {t("wizard.budget.lowWarning")}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* === Add Service — inactive services as upsell pills === */}
              {inactiveServices.length > 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-background/50 p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70">
                    <Plus className="h-3.5 w-3.5" />
                    {t("wizard.budget.addService", { defaultValue: "أضف خدمة" })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {inactiveServices.map((item) => {
                      const min = effectiveMin(item);
                      return (
                        <motion.button
                          key={item.key}
                          type="button"
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -1 }}
                          onClick={() => {
                            toggleEnabled(item.key);
                            // Seed a sensible default allocation if it's empty.
                            if ((allocations[item.key] ?? 0) <= 0) {
                              setAllocation(item.key, min);
                            }
                          }}
                          className="group inline-flex items-center gap-2 rounded-full border border-[hsl(var(--health-emerald)/0.35)] bg-[hsl(var(--health-emerald)/0.06)] px-3.5 py-1.5 text-xs font-medium text-[hsl(var(--health-emerald))] transition-colors hover:bg-[hsl(var(--health-emerald)/0.12)] dark:text-[hsl(var(--health-emerald-light))]"
                        >
                          <Plus className="h-3 w-3" />
                          <span className="font-arabic">{t(`wizard.budget.items.${item.key}`)}</span>
                          <span className="text-[10px] opacity-70 tabular-nums">~{fmt(min)} {cur}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
      </motion.div>
    </motion.div>
  );
};
