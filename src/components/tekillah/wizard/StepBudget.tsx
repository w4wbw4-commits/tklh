import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sparkles, AlertTriangle, TrendingUp, Users, Gem } from "lucide-react";
import {
  allocationCatalog,
  realisticMinimum,
  tierForBudget,
  BUDGET_TIER_THRESHOLDS,
  type BudgetMode,
  type ServiceKey,
} from "./types";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { useTranslation } from "react-i18next";
import { fmtNumber } from "@/i18n/format";

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
  const isBelowMinimum = total < globalMinimum;
  const cur = t("common.currency");

  // Smart matching tier — derived from running total so vendor list updates live.
  const tier = tierForBudget(total);
  const tierMeta = {
    economy: {
      label: t("wizard.budget.tierEconomy"),
      desc: t("wizard.budget.tierEconomyDesc", { max: fmtNumber(BUDGET_TIER_THRESHOLDS.economyMax) }),
    },
    standard: {
      label: t("wizard.budget.tierStandard"),
      desc: t("wizard.budget.tierStandardDesc", {
        min: fmtNumber(BUDGET_TIER_THRESHOLDS.economyMax),
        max: fmtNumber(BUDGET_TIER_THRESHOLDS.standardMax),
      }),
    },
    luxury: {
      label: t("wizard.budget.tierLuxury"),
      desc: t("wizard.budget.tierLuxuryDesc", { min: fmtNumber(BUDGET_TIER_THRESHOLDS.standardMax) }),
    },
  }[tier];

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

      {/* Smart Budget is the only planning mode now — keeps the flow focused
          on personalised "تنسيق خاص" planning. Ready-made packages live on
          the home page instead and bypass the wizard entirely. */}

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
                  <Slider
                    value={[budget]} onValueChange={(v) => setBudget(v[0])}
                    min={20000} max={500000} step={5000} className="mt-3"
                  />
                </div>
              </div>

              {/* Smart-matching tier banner — updates live with the running total */}
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Gem className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/80">
                    {t("wizard.budget.tierLabel")}
                  </div>
                  <div className="font-arabic text-base font-semibold text-foreground">{tierMeta.label}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-foreground/70">{tierMeta.desc}</div>
                </div>
              </motion.div>

              <AnimatePresence>
                {isBelowMinimum && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                  >
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div className="font-arabic leading-relaxed">
                      {t("wizard.budget.warning", { min: fmt(globalMinimum) })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
