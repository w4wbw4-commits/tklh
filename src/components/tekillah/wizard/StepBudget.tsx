import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { PackageCheck, Calculator, Sparkles, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { allocationCatalog, realisticMinimum, type BudgetMode, type ServiceKey } from "./types";
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
}

export const StepBudget = ({
  budgetMode, setBudgetMode, budget, setBudget,
  guests, allocations, setAllocation,
}: Props) => {
  const { t } = useTranslation();
  const { prices: market } = useMarketPrices();
  const fmt = (n: number) => fmtNumber(Math.round(n));

  const effectiveMin = (item: typeof allocationCatalog[number]) => {
    const staticMin = realisticMinimum(item, guests);
    const marketAvg = market[item.key]?.avg ?? null;
    return marketAvg ? Math.max(staticMin, Math.round(marketAvg)) : staticMin;
  };

  const total = useMemo(
    () => Object.values(allocations).reduce((s, v) => s + v, 0),
    [allocations]
  );

  const globalMinimum = useMemo(
    () => allocationCatalog.reduce((s, item) => s + effectiveMin(item), 0),
    [guests, market] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const isBelowMinimum = total < globalMinimum;
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

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { key: "packages" as const, icon: PackageCheck, title: t("wizard.budget.packagesTitle"), desc: t("wizard.budget.packagesDesc") },
          { key: "smart" as const, icon: Calculator, title: t("wizard.budget.smartTitle"), desc: t("wizard.budget.smartDesc") },
        ].map((opt) => {
          const isOn = budgetMode === opt.key;
          return (
            <motion.button
              key={opt.key}
              whileHover={{ y: -3 }}
              onClick={() => setBudgetMode(opt.key)}
              className={`rounded-2xl border p-6 text-start transition-all ${
                isOn ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                isOn ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
              }`}>
                <opt.icon className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div className="font-arabic text-lg font-semibold text-foreground">{opt.title}</div>
              <div className="mt-1 text-sm text-foreground/65">{opt.desc}</div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {budgetMode === "smart" && (
          <motion.div
            key="smart"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
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
                  const value = allocations[item.key];
                  const min = effectiveMin(item);
                  const isLow = value < min;
                  const pct = Math.min(100, (value / Math.max(min * 2, 1)) * 100);
                  const vendorCount = market[item.key]?.count ?? 0;
                  return (
                    <div key={item.key} className="rounded-2xl border border-border/70 bg-background p-4 sm:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-arabic text-base font-semibold text-foreground">{t(`wizard.budget.items.${item.key}`)}</div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-foreground/60">
                            <span>{t("wizard.budget.minRealistic")} <span className="font-medium text-foreground/80">{fmt(min)} {cur}</span></span>
                            {vendorCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                <Users className="h-2.5 w-2.5" /> {t("wizard.budget.vendorAvg", { count: vendorCount })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => setAllocation(item.key, Math.max(0, Number(e.target.value) || 0))}
                            className={`h-10 w-32 rounded-lg text-end font-medium ${
                              isLow ? "border-destructive/60 focus-visible:ring-destructive" : ""
                            }`}
                          />
                          <span className="text-sm text-foreground/60">{cur}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Slider
                          value={[value]}
                          onValueChange={(v) => setAllocation(item.key, v[0])}
                          min={0}
                          max={Math.max(min * 3, 50000)}
                          step={500}
                        />
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary/60">
                          <motion.div
                            initial={false}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={`h-full rounded-full ${isLow ? "bg-destructive/70" : "bg-primary"}`}
                          />
                        </div>
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
        )}

        {budgetMode === "packages" && (
          <motion.div
            key="packages"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { name: t("wizard.budget.pkgClassic"), price: 45000, tag: t("wizard.budget.tagEconomic") },
                { name: t("wizard.budget.pkgPremium"), price: 95000, tag: t("wizard.budget.tagPopular") },
                { name: t("wizard.budget.pkgRoyal"), price: 180000, tag: t("wizard.budget.tagLuxury") },
              ].map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-2xl border p-5 ${
                    i === 1 ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-primary">{p.tag}</div>
                  <div className="mt-2 font-arabic text-2xl font-semibold text-foreground">{p.name}</div>
                  <div className="mt-3 font-arabic text-3xl font-semibold text-foreground">
                    {fmtNumber(p.price)}
                    <span className="ms-1 text-sm font-normal text-foreground/60">{cur}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
