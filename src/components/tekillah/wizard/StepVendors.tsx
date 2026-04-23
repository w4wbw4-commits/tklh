import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Loader2, Check, Building2, UtensilsCrossed, Camera, Music2, Flower2, Car, MapPin, BadgeCheck, Sparkles, Plus, X, AlertTriangle, Users, Users2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  weekday_price: number;
  weekend_price: number;
  men_capacity: number | null;
  women_capacity: number | null;
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
          .select("id, business_name, category, city, starting_price, weekday_price, weekend_price, men_capacity, women_capacity, verified, packages(id, name, tier, price, description, active, approval_status)")
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
          // Keep ONLY approved + active packages, but DO NOT drop the vendor when
          // they have none yet — we surface them with a "Price upon request" card
          // so admin-approved vendors appear instantly in the public listing.
          packages: ((x as unknown as { packages: (VendorOption["packages"][number] & { active: boolean; approval_status: string })[] }).packages ?? [])
            .filter((p) => p.active && p.approval_status === "approved")
            .sort((a, b) => Number(a.price) - Number(b.price)),
        };
      }) as unknown as VendorOption[];
      setVendors(mapped);
      setLoading(false);
    })();

    // Re-fetch instantly when admin approves a vendor or package so newly
    // approved entries show up without a manual refresh.
    const ch = supabase
      .channel("public-vendors-listing")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendors" }, () => {
        // Trigger a re-run by updating loading state via the effect's closure.
        setLoading(true);
        // Small refetch helper inline (kept simple to avoid restructuring).
        (async () => {
          const { data: vv } = await supabase
            .from("vendors")
            .select("id, business_name, category, city, starting_price, weekday_price, weekend_price, men_capacity, women_capacity, verified, packages(id, name, tier, price, description, active, approval_status)")
            .eq("active", true)
            .eq("approval_status", "approved")
            .in("category", selectedServices.length ? selectedServices : ["hall"]);
          const mapped2 = (vv ?? []).map((x) => ({
            ...x,
            avg_rating: 0,
            reviews_count: 0,
            completed_bookings: 0,
            packages: ((x as unknown as { packages: (VendorOption["packages"][number] & { active: boolean; approval_status: string })[] }).packages ?? [])
              .filter((p) => p.active && p.approval_status === "approved")
              .sort((a, b) => Number(a.price) - Number(b.price)),
          })) as unknown as VendorOption[];
          setVendors(mapped2);
          setLoading(false);
        })();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, () => {
        // Same lightweight refetch on package approval changes.
        setLoading(true);
        (async () => {
          const { data: vv } = await supabase
            .from("vendors")
            .select("id, business_name, category, city, starting_price, weekday_price, weekend_price, men_capacity, women_capacity, verified, packages(id, name, tier, price, description, active, approval_status)")
            .eq("active", true)
            .eq("approval_status", "approved")
            .in("category", selectedServices.length ? selectedServices : ["hall"]);
          const mapped2 = (vv ?? []).map((x) => ({
            ...x,
            avg_rating: 0,
            reviews_count: 0,
            completed_bookings: 0,
            packages: ((x as unknown as { packages: (VendorOption["packages"][number] & { active: boolean; approval_status: string })[] }).packages ?? [])
              .filter((p) => p.active && p.approval_status === "approved")
              .sort((a, b) => Number(a.price) - Number(b.price)),
          })) as unknown as VendorOption[];
          setVendors(mapped2);
          setLoading(false);
        })();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
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

  // ---------------------------------------------------------------------------
  // Running total + missing-category detection (Tasks 2 & 3).
  // - runningTotal: sum of every selected package price (English numerals).
  // - missingCats: services chosen earlier but with no provider pick yet.
  // ---------------------------------------------------------------------------
  const pickedList = Object.values(picks);
  const runningTotal = pickedList.reduce((sum, p) => sum + Number(p.price ?? 0), 0);
  const missingCats = selectedServices.filter((cat) => !picks[cat]);

  return (
    <motion.div
      key="step-vendors"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 sm:p-10"
    >
      <h3 className="font-arabic text-2xl font-semibold text-foreground">{t("wizard.vendors.title")}</h3>
      <p className="mt-2 text-sm text-foreground/70">{t("wizard.vendors.desc")}</p>

      {/* Smart-matching status pill — reflects current budget tier in real time */}
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        {t("wizard.vendors.filterAllInRange")} · {tierLabel}
      </div>

      {/* Missing-category alert (Task 3) — one row per uncovered service. */}
      {missingCats.length > 0 && (
        <Alert className="mt-5 border-destructive/40 bg-destructive/5 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-arabic text-sm font-semibold">
            {t("wizard.vendors.missingTitle")}
          </AlertTitle>
          <AlertDescription className="mt-1 space-y-1 text-xs">
            {missingCats.map((cat) => (
              <div key={cat}>
                {t("wizard.vendors.missingDesc", { service: t(`wizard.services.${cat}`) })}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}
      {missingCats.length === 0 && pickedList.length > 0 && (
        <Alert className="mt-5 border-primary/30 bg-primary/5 text-primary">
          <Check className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {t("wizard.vendors.allCovered")}
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8 space-y-8">
        {selectedServices.map((cat) => {
          const Icon = ICONS[cat];
          const list = grouped[cat] ?? [];
          const pick = picks[cat];
          const cap = allocations[cat] ?? 0;
          return (
            <section key={cat}>
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
                    return (
                      <div key={v.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
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
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] tabular-nums text-foreground/55" dir="ltr">
                              {v.city && <span className="inline-flex items-center gap-1 font-arabic"><MapPin className="h-3 w-3" />{v.city}</span>}
                              {v.city && <span>•</span>}
                              {(() => {
                                // Fallback chain: starting_price → weekday_price → weekend_price.
                                // If everything is missing/zero we show "Price upon request" so
                                // newly-approved vendors without packages still look professional.
                                const priceFrom = Number(v.starting_price) || Number(v.weekday_price) || Number(v.weekend_price) || 0;
                                return priceFrom > 0 ? (
                                  <span className="font-arabic">
                                    <span className="text-foreground/55">{t("wizard.vendors.from")}</span>{" "}
                                    <span className="font-semibold text-primary">{fmtNumber(priceFrom)}</span>{" "}
                                    {t("common.currency")}
                                  </span>
                                ) : (
                                  <span className="font-arabic font-medium text-primary">
                                    {t("wizard.vendors.priceOnRequest")}
                                  </span>
                                );
                              })()}
                              {cat === "hall" && (Number(v.men_capacity ?? 0) > 0 || Number(v.women_capacity ?? 0) > 0) && (
                                <>
                                  <span>•</span>
                                  {Number(v.men_capacity ?? 0) > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                                      <Users className="h-3 w-3" />
                                      <span className="font-semibold">{fmtNumber(Number(v.men_capacity))}</span>
                                    </span>
                                  )}
                                  {Number(v.women_capacity ?? 0) > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                                      <Users2 className="h-3 w-3" />
                                      <span className="font-semibold">{fmtNumber(Number(v.women_capacity))}</span>
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2">
                          {v.packages.length === 0 && (
                            // Vendor approved but hasn't published packages yet — show
                            // a non-clickable "Price upon request" tile so the listing
                            // never feels broken right after approval.
                            <div className="flex items-center justify-between rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-3 text-start">
                              <div className="min-w-0">
                                <div className="font-arabic text-sm font-medium text-foreground">
                                  {t("wizard.vendors.priceOnRequest")}
                                </div>
                                <div className="text-[11px] text-foreground/55">
                                  {t("wizard.vendors.priceOnRequestDesc")}
                                </div>
                              </div>
                              <span className="ms-3 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                {t("wizard.vendors.contactSoon")}
                              </span>
                            </div>
                          )}
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
                                  <span className="font-arabic text-sm font-semibold tabular-nums text-primary">
                                    {fmtNumber(Number(p.price))} {t("common.currency")}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                                      isPicked
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-primary/10 text-primary"
                                    }`}
                                  >
                                    {isPicked ? (
                                      <>
                                        <X className="h-3 w-3" />
                                        {t("wizard.vendors.remove")}
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="h-3 w-3" />
                                        {t("wizard.vendors.addProvider")}
                                      </>
                                    )}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
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

      {/* Sticky running-total bar (Task 2) — always English numerals via fmtNumber. */}
      <div className="sticky bottom-2 z-10 mt-8 rounded-2xl border border-primary/30 bg-card/95 p-4 shadow-luxury backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-foreground/75">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-arabic">{t("wizard.vendors.runningTotal")}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-primary">
              {t("wizard.vendors.providersCount", { count: pickedList.length })}
            </span>
          </div>
          <div className="font-arabic text-xl font-semibold tabular-nums text-primary">
            {fmtNumber(runningTotal)} <span className="text-sm font-medium text-foreground/70">{t("common.currency")}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
