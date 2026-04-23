import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Loader2, Check, Building2, UtensilsCrossed, Camera, Music2, Flower2, Car, MapPin, BadgeCheck, Sparkles, AlertTriangle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tierForBudget, type BudgetTier, type ServiceKey } from "./types";
import { fmtNumber } from "@/i18n/format";
import { VendorRatingBadge } from "@/components/tekillah/reviews/VendorRatingBadge";

const ICONS: Record<ServiceKey, typeof Building2> = {
  hall: Building2, catering: UtensilsCrossed, photography: Camera,
  dj: Music2, decor: Flower2, cars: Car,
};

export interface VendorOption {
  id: string;
  business_name: string;
  category: ServiceKey;
  city: string | null;
  starting_price: number;
  verified: boolean;
  avg_rating: number;
  reviews_count: number;
  completed_bookings: number;
  packages: { id: string; name: string; tier: string; price: number; description: string | null }[];
}

export interface VendorPick {
  vendorId: string;
  packageId: string;
  category: ServiceKey;
  price: number;
}

interface Props {
  selectedServices: ServiceKey[];
  picks: Record<string, VendorPick>;
  setPick: (category: ServiceKey, pick: VendorPick | null) => void;
  /** Total budget (sum of enabled allocations) used to pick the matching tier. */
  budget: number;
  /** Per-category caps used for "Matches your budget" tagging. */
  allocations: Record<ServiceKey, number>;
}

// Matches the package_tier enum on the DB. Indexed by total-budget tier.
const TIER_TO_PACKAGE_TIERS: Record<BudgetTier, string[]> = {
  economy: ["basic"],
  standard: ["basic", "premium"],
  luxury: ["premium", "royal"],
};

export const StepVendors = ({ selectedServices, picks, setPick, budget, allocations }: Props) => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(true);

  const tier = useMemo(() => tierForBudget(budget), [budget]);
  const allowedPackageTiers = TIER_TO_PACKAGE_TIERS[tier];

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: v }, { data: ratings }] = await Promise.all([
        supabase
          .from("vendors")
          .select("id, business_name, category, city, starting_price, verified, packages(id, name, tier, price, description, active, approval_status)")
          .eq("active", true)
          .eq("approval_status", "approved")
          .in("category", selectedServices.length ? selectedServices : ["hall"]),
        supabase.from("vendor_ratings_summary" as never).select("vendor_id, avg_rating, reviews_count, completed_bookings"),
      ]);
      const ratingMap = new Map<string, { avg: number; count: number; done: number }>();
      ((ratings ?? []) as { vendor_id: string; avg_rating: number; reviews_count: number; completed_bookings: number }[])
        .forEach((r) => ratingMap.set(r.vendor_id, {
          avg: Number(r.avg_rating ?? 0),
          count: Number(r.reviews_count ?? 0),
          done: Number(r.completed_bookings ?? 0),
        }));
      const mapped = (v ?? []).map((x) => {
        const r = ratingMap.get(x.id) ?? { avg: 0, count: 0, done: 0 };
        return {
          ...x,
          avg_rating: r.avg,
          reviews_count: r.count,
          completed_bookings: r.done,
          packages: ((x as unknown as { packages: (VendorOption["packages"][number] & { active: boolean; approval_status: string })[] }).packages ?? [])
            .filter((p) => p.active && p.approval_status === "approved")
            .sort((a, b) => Number(a.price) - Number(b.price)),
        };
      })
      .filter((x) => (x.packages?.length ?? 0) > 0) as unknown as VendorOption[];
      setVendors(mapped);
      setLoading(false);
    })();
  }, [selectedServices]);

  const grouped = useMemo(() => {
    const out: Record<string, VendorOption[]> = {};
    selectedServices.forEach((cat) => {
      const cap = allocations[cat] ?? 0;
      out[cat] = vendors
        .filter((v) => v.category === cat)
        // Smart tier matching: prefer vendors with at least one package within the
        // allowed tier band OR within the user's per-category allocation. We still
        // show others (sorted to the back) so the list is never empty.
        .map((v) => {
          const matchingPackages = v.packages.filter((p) => {
            const tierOk = allowedPackageTiers.includes(p.tier);
            const priceOk = cap > 0 ? Number(p.price) <= cap : true;
            return tierOk || priceOk;
          });
          return { v, hasMatch: matchingPackages.length > 0 };
        })
        .sort((a, b) => {
          // 1) Vendors with a matching package come first
          if (a.hasMatch !== b.hasMatch) return a.hasMatch ? -1 : 1;
          // 2) Then by quality score
          const score = (x: VendorOption) =>
            (x.avg_rating * 20) + (x.completed_bookings * 2) + (x.verified ? 5 : 0);
          return score(b.v) - score(a.v);
        })
        .map((x) => x.v);
    });
    return out;
  }, [vendors, selectedServices, allowedPackageTiers, allocations]);

  // Live total of all picked vendor packages — must be declared before any early
  // returns so React hook ordering stays stable across renders.
  const liveTotal = useMemo(
    () => Object.values(picks).reduce((s, p) => s + Number(p?.price ?? 0), 0),
    [picks],
  );
  const pickedCount = Object.keys(picks).length;
  const missing = selectedServices.filter((c) => !picks[c]);

  if (loading) {
    return (
      <motion.div className="grid place-items-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </motion.div>
    );
  }

  if (!selectedServices.length) {
    return (
      <motion.div className="p-10 text-center text-foreground/60">
        {t("wizard.vendors.noServices")}
      </motion.div>
    );
  }

  const tierLabel = {
    economy: t("wizard.budget.tierEconomy"),
    standard: t("wizard.budget.tierStandard"),
    luxury: t("wizard.budget.tierLuxury"),
  }[tier];


  const jumpTo = (cat: ServiceKey) => {
    document.getElementById(`vendor-section-${cat}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <motion.div
      key="step-vendors"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 sm:p-10 pb-32"
    >
      <h3 className="font-arabic text-2xl font-semibold text-foreground">{t("wizard.vendors.title")}</h3>
      <p className="mt-2 text-sm text-foreground/70">{t("wizard.vendors.desc")}</p>

      {/* Smart-matching status pill — reflects current budget tier in real time */}
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        {t("wizard.vendors.filterAllInRange")} · {tierLabel}
      </div>

      {/* Missing categories warning — only when user has at least one pick or has scrolled enough */}
      {missing.length > 0 && pickedCount > 0 && (
        <div className="mt-5 rounded-2xl border border-amber-500/40 bg-amber-50/60 p-4 dark:bg-amber-950/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <div className="font-arabic text-sm font-semibold text-amber-900 dark:text-amber-200">
                {t("wizard.vendors.missingTitle")}
              </div>
              <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
                {t("wizard.vendors.missingDesc")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {missing.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => jumpTo(c)}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-background px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:text-amber-200"
                  >
                    {t(`wizard.services.${c}`)}
                    <ArrowJump />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-8">
        {selectedServices.map((cat) => {
          const Icon = ICONS[cat];
          const list = grouped[cat] ?? [];
          const pick = picks[cat];
          const cap = allocations[cat] ?? 0;
          return (
            <section key={cat} id={`vendor-section-${cat}`} className="scroll-mt-24">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h4 className="font-arabic text-base font-semibold text-foreground">
                  {t(`wizard.services.${cat}`)}
                </h4>
                {pick && <Badge className="ms-auto bg-primary/15 text-primary">{t("wizard.vendors.selected")}</Badge>}
              </div>

              {list.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-foreground/55">
                  {t("wizard.vendors.empty")}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {list.map((v) => {
                    const vendorMatches = v.packages.some(
                      (p) => allowedPackageTiers.includes(p.tier) || (cap > 0 && Number(p.price) <= cap),
                    );
                    const vendorPicked = pick?.vendorId === v.id;
                    return (
                      <div key={v.id} className={`rounded-2xl border bg-card p-4 shadow-card transition-colors ${vendorPicked ? "border-primary ring-1 ring-primary/30" : "border-border"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-arabic text-sm font-semibold text-foreground">{v.business_name}</span>
                              {v.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                              {vendorMatches && (
                                <Badge className="ms-1 bg-primary text-primary-foreground hover:bg-primary/90">
                                  <Sparkles className="me-1 h-3 w-3" />
                                  {t("wizard.vendors.matchesBudget")}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1">
                              <VendorRatingBadge avg={v.avg_rating} count={v.reviews_count} />
                            </div>
                            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-foreground/55 tabular-nums">
                              {v.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{v.city}</span>}
                              <span>•</span>
                              <span>{t("wizard.vendors.from")} {fmtNumber(Number(v.starting_price))} {t("common.currency")}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2">
                          {v.packages.map((p) => {
                            const isPicked = pick?.vendorId === v.id && pick?.packageId === p.id;
                            const packageMatches =
                              allowedPackageTiers.includes(p.tier) || (cap > 0 && Number(p.price) <= cap);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() =>
                                  setPick(
                                    cat,
                                    isPicked
                                      ? null
                                      : { vendorId: v.id, packageId: p.id, category: cat, price: Number(p.price) }
                                  )
                                }
                                className={`flex items-center justify-between rounded-xl border p-3 text-start transition-all ${
                                  isPicked
                                    ? "border-primary bg-primary/5 shadow-soft"
                                    : packageMatches
                                      ? "border-primary/30 bg-primary/[0.03] hover:border-primary/60"
                                      : "border-border bg-background hover:border-primary/40"
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-arabic text-sm font-medium text-foreground">{p.name}</span>
                                    {packageMatches && !isPicked && (
                                      <span className="inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                        {t("wizard.vendors.matchesBudget")}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-foreground/55 truncate">{p.description}</div>
                                </div>
                                <div className="ms-3 flex flex-col items-end gap-1">
                                  <span className="font-arabic text-sm font-semibold text-primary tabular-nums">
                                    {fmtNumber(Number(p.price))} {t("common.currency")}
                                  </span>
                                  {isPicked && (
                                    <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                                      <Check className="h-3 w-3" />
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Quick Add/Remove vendor action — picks the cheapest matching package */}
                        <div className="mt-3 flex justify-end">
                          {vendorPicked ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPick(cat, null)}
                              className="rounded-full"
                            >
                              {t("wizard.vendors.removeVendor")}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                const preferred = v.packages.find(
                                  (p) => allowedPackageTiers.includes(p.tier) || (cap > 0 && Number(p.price) <= cap),
                                ) ?? v.packages[0];
                                if (!preferred) return;
                                setPick(cat, {
                                  vendorId: v.id,
                                  packageId: preferred.id,
                                  category: cat,
                                  price: Number(preferred.price),
                                });
                              }}
                              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Plus className="me-1 h-3.5 w-3.5" />
                              {t("wizard.vendors.addVendor")}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Sticky Live Total bar */}
      {selectedServices.length > 0 && (
        <div className="pointer-events-none sticky bottom-4 z-10 mt-8 flex justify-center">
          <div className="pointer-events-auto flex w-full max-w-xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-card/95 px-4 py-3 shadow-luxury backdrop-blur">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-foreground/55">
                {t("wizard.vendors.liveTotal")}
              </div>
              <div className="font-arabic text-lg font-semibold text-primary tabular-nums">
                {fmtNumber(liveTotal)} {t("common.currency")}
              </div>
            </div>
            <div className="text-xs text-foreground/70 tabular-nums">
              {t("wizard.vendors.selectedCount", { count: pickedCount, total: selectedServices.length })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Tiny inline arrow used inside the missing-categories chips. Inherits color.
const ArrowJump = () => (
  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12L11 6M11 6H6M11 6V11" />
  </svg>
);
