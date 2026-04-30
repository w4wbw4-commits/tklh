import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sparkles, AlertTriangle, TrendingUp, Users } from "lucide-react";
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

  // Smart Budget is the only mode — auto-default on mount so the user lands
  // straight on the planner without seeing a packages/smart toggle.
  useEffect(() => {
    if (budgetMode !== "smart") setBudgetMode("smart");
  }, [budgetMode, setBudgetMode]);

  const effectiveMin = (item: typeof allocationCatalog[number]) => {
    const staticMin = realisticMinimum(item, guests);
    const marketAvg = market[item.key]?.avg ?? null;
    return marketAvg ? Math.max(staticMin, Math.round(marketAvg)) : staticMin;
  };

  // Total only counts services the user has enabled.
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
              <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {t("wizard.budget.totalSmart")}
                  </div>
                  <div className="mt-2 font-arabic text-4xl font-semibold text-foreground">
                    {fmt(total)} <span className="text-base font-normal text-foreground/60">{cur}</span>
                  </div>
                  <div className="mt-1 text-xs text-foreground/60">
                    {t("wizard.budget.perGuest", { guests: fmtNumber(guests), perGuest: fmt(total / Math.max(guests, 1)) })}
                  </div>
                  <div className="mt-1 text-xs text-foreground/70">
                    {t("wizard.budget.minimum")} <span className="font-semibold text-foreground">{fmt(globalMinimum)} {cur}</span>
                  </div>
                </div>
                <div className="w-full sm:w-72">
                  <div className="flex items-center justify-between text-xs text-foreground/70">
                    <span>{t("wizard.budget.reference")}</span>
                    <span className="font-medium text-foreground">{fmt(budget)} {cur}</span>
                  </div>
                  <div className="mt-3 px-2.5">
                    <Slider
                      value={[budget]} onValueChange={(v) => setBudget(v[0])}
                      min={20000} max={500000} step={5000}
                    />
                  </div>
                </div>
              </div>

              {/* === Budget Health Indicator ===
                  Real-time consultative gauge — replaces the old static tier
                  banner + raw warning. Auto-updates as the user toggles
                  services or drags allocation sliders below. */}
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

              <div className="mt-6 space-y-5">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {t("wizard.budget.distribution")}
                </div>

                {allocationCatalog.map((item) => {
                  const enabled = enabledServices[item.key];
                  const value = allocations[item.key];
                  const min = effectiveMin(item);
                  const isLow = enabled && value < min;
                  const pct = Math.min(100, (value / Math.max(min * 2, 1)) * 100);
                  const vendorCount = market[item.key]?.count ?? 0;
                  return (
                    <div
                      key={item.key}
                      className={`rounded-2xl border bg-background p-4 transition-opacity sm:p-5 ${
                        enabled ? "border-border/70" : "border-border/40 opacity-60"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={enabled}
                            onCheckedChange={() => toggleEnabled(item.key)}
                            aria-label={t("wizard.budget.includeService")}
                          />
                          <div>
                            <div className="font-arabic text-base font-semibold text-foreground">
                              {t(`wizard.budget.items.${item.key}`)}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                              {enabled ? (
                                <>
                                  <span>
                                    {t("wizard.budget.minRealistic")}{" "}
                                    <span className="font-medium text-foreground/80">{fmt(min)} {cur}</span>
                                  </span>
                                  {vendorCount > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                      <Users className="h-2.5 w-2.5" /> {t("wizard.budget.vendorAvg", { count: vendorCount })}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="italic">{t("wizard.budget.excludedHint")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            disabled={!enabled}
                            value={value}
                            onChange={(e) => setAllocation(item.key, Math.max(0, Number(e.target.value) || 0))}
                            className={`h-10 w-32 rounded-lg text-end font-medium ${
                              isLow ? "border-destructive/60 focus-visible:ring-destructive" : ""
                            }`}
                          />
                          <span className="text-sm text-foreground/60">{cur}</span>
                        </div>
                      </div>

                      <div className="mt-4 px-2.5">
                        <Slider
                          value={[value]}
                          disabled={!enabled}
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
                            className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
                          >
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span className="font-arabic leading-relaxed">
                              {t("wizard.budget.lowWarning")}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
      </motion.div>
    </motion.div>
  );
};
