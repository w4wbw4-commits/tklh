import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  Check,
  Building2,
  UtensilsCrossed,
  Camera,
  Music2,
  Flower2,
  Car,
  MapPin,
  BadgeCheck,
  Sparkles,
  Plus,
  X,
  AlertTriangle,
  Users,
  Users2,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { tierForBudget, type BudgetTier, type ServiceKey } from "./types";
import { fmtNumber, toLatinDigits } from "@/i18n/format";
import { pickLocalized, pickLocalizedArray } from "@/i18n/localized";
import { VendorRatingBadge } from "@/components/tekillah/reviews/VendorRatingBadge";
import { VendorMediaCarousel, type MediaItem } from "./VendorMediaCarousel";
import { EXTRA_SERVICE_LABELS, EXTRA_SERVICE_ICONS } from "@/components/tekillah/vendor/types";

const ICONS: Record<ServiceKey, typeof Building2> = {
  hall: Building2, catering: UtensilsCrossed, photography: Camera,
  dj: Music2, decor: Flower2, cars: Car,
};

export interface VendorOption {
  id: string;
  business_name: string;
  bio: string | null;
  bio_en: string | null;
  category: ServiceKey;
  city: string | null;
  region: string | null;
  region_en: string | null;
  district: string | null;
  district_en: string | null;
  starting_price: number;
  weekday_price: number;
  weekend_price: number;
  men_capacity: number | null;
  women_capacity: number | null;
  extra_services: string[];
  extra_services_en: string[];
  verified: boolean;
  avg_rating: number;
  reviews_count: number;
  completed_bookings: number;
  packages: { id: string; name: string; tier: string; price: number; description: string | null }[];
  media: MediaItem[];
}

export interface VendorPick {
  vendorId: string;
  /** Null for "Book Now" (no package) — finalisePlan stores it as null. */
  packageId: string | null;
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
  /**
   * One-click "احجز" — selects this vendor (using the cheapest available
   * package, or a synthetic on-request entry) and advances the wizard to
   * the confirmation/checkout step.
   */
  onBookNow?: (pick: VendorPick) => void;
}

// Matches the package_tier enum on the DB. Indexed by total-budget tier.
const TIER_TO_PACKAGE_TIERS: Record<BudgetTier, string[]> = {
  economy: ["basic"],
  standard: ["basic", "premium"],
  luxury: ["premium", "royal"],
};

type RawPackage = {
  id: string;
  name: string;
  tier: string;
  price: number;
  description: string | null;
  active: boolean;
  approval_status: string;
};

type RawPortfolioItem = {
  vendor_id: string;
  url: string;
  media_type: "image" | "video";
  caption: string | null;
  sort_order: number | null;
};

export const StepVendors = ({ selectedServices, picks, setPick, budget, allocations, onBookNow }: Props) => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(true);

  const tier = useMemo(() => tierForBudget(budget), [budget]);
  const allowedPackageTiers = TIER_TO_PACKAGE_TIERS[tier];

  // ---------------------------------------------------------------------------
  // Data fetcher — pulls vendors, ratings AND portfolio media in parallel.
  // Memoised so the realtime subscription handlers can call it without
  // duplicating logic. Strict category filter ensures the public catalog
  // ONLY surfaces vendors in the user's wizard-selected services.
  // ---------------------------------------------------------------------------
  const refetch = useCallback(async () => {
    if (!selectedServices.length) {
      setVendors([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: v }, { data: ratings }] = await Promise.all([
      supabase
        .from("vendors")
        .select(
          "id, business_name, bio, bio_en, category, city, region, region_en, district, district_en, starting_price, weekday_price, weekend_price, men_capacity, women_capacity, extra_services, extra_services_en, verified, portfolio_urls, packages(id, name, tier, price, description, active, approval_status)",
        )
        .eq("active", true)
        .eq("approval_status", "approved")
        .in("category", selectedServices),
      supabase
        .from("vendor_ratings_summary" as never)
        .select("vendor_id, avg_rating, reviews_count, completed_bookings"),
    ]);

    const vendorIds = (v ?? []).map((row) => (row as { id: string }).id);
    const { data: portfolio } = vendorIds.length
      ? await supabase
          .from("vendor_portfolio_items")
          .select("vendor_id, url, media_type, caption, sort_order")
          .in("vendor_id", vendorIds)
          .order("sort_order", { ascending: true })
      : { data: [] as RawPortfolioItem[] };

    const ratingMap = new Map<string, { avg: number; count: number; done: number }>();
    ((ratings ?? []) as { vendor_id: string; avg_rating: number; reviews_count: number; completed_bookings: number }[]).forEach((r) =>
      ratingMap.set(r.vendor_id, {
        avg: Number(r.avg_rating ?? 0),
        count: Number(r.reviews_count ?? 0),
        done: Number(r.completed_bookings ?? 0),
      }),
    );

    // Group portfolio items by vendor — videos first feels too aggressive for a
    // catalog, so we keep the vendor's intended sort_order.
    const mediaMap = new Map<string, MediaItem[]>();
    ((portfolio ?? []) as RawPortfolioItem[]).forEach((p) => {
      const list = mediaMap.get(p.vendor_id) ?? [];
      list.push({ url: p.url, type: p.media_type, caption: p.caption });
      mediaMap.set(p.vendor_id, list);
    });

    const mapped = (v ?? []).map((x) => {
      const row = x as unknown as {
        id: string;
        business_name: string;
        bio: string | null;
        bio_en: string | null;
        category: ServiceKey;
        city: string | null;
        region: string | null;
        region_en: string | null;
        district: string | null;
        district_en: string | null;
        starting_price: number;
        weekday_price: number;
        weekend_price: number;
        men_capacity: number | null;
        women_capacity: number | null;
        extra_services: string[] | null;
        extra_services_en: string[] | null;
        verified: boolean;
        portfolio_urls: string[] | null;
        packages: RawPackage[];
      };
      const r = ratingMap.get(row.id) ?? { avg: 0, count: 0, done: 0 };

      // Merge structured portfolio items with legacy portfolio_urls so older
      // vendors still get a gallery. Dedupe on URL to avoid showing the same
      // image twice when both sources happened to be populated.
      const structured = mediaMap.get(row.id) ?? [];
      const seen = new Set(structured.map((m) => m.url));
      const legacy: MediaItem[] = (row.portfolio_urls ?? [])
        .filter((u) => u && !seen.has(u))
        .map((u) => ({ url: u, type: "image" as const, caption: null }));

      return {
        id: row.id,
        business_name: row.business_name,
        bio: row.bio,
        bio_en: row.bio_en,
        category: row.category,
        city: row.city,
        region: row.region,
        region_en: row.region_en,
        district: row.district,
        district_en: row.district_en,
        starting_price: row.starting_price,
        weekday_price: row.weekday_price,
        weekend_price: row.weekend_price,
        men_capacity: row.men_capacity,
        women_capacity: row.women_capacity,
        extra_services: row.extra_services ?? [],
        extra_services_en: row.extra_services_en ?? [],
        verified: row.verified,
        avg_rating: r.avg,
        reviews_count: r.count,
        completed_bookings: r.done,
        // Keep ONLY approved + active packages, but DO NOT drop the vendor when
        // they have none yet — we still surface them so the customer can hit
        // "Book Now" and request a custom quote.
        packages: (row.packages ?? [])
          .filter((p) => p.active && p.approval_status === "approved")
          .sort((a, b) => Number(a.price) - Number(b.price))
          .map(({ id, name, tier, price, description }) => ({ id, name, tier, price, description })),
        media: [...structured, ...legacy],
      } satisfies VendorOption;
    });

    setVendors(mapped);
    setLoading(false);
  }, [selectedServices]);

  useEffect(() => {
    refetch();

    // Live updates when admin approves vendors / packages or vendors edit their
    // portfolios — keeps the public catalog fresh without manual refresh.
    const ch = supabase
      .channel("public-vendors-listing")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendors" }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "vendor_portfolio_items" }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refetch]);

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
            x.avg_rating * 20 + x.completed_bookings * 2 + (x.verified ? 5 : 0);
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

  // Strict gate: if the user landed here without picking services in step 2,
  // send a clear prompt instead of showing an empty page.
  if (!selectedServices.length) {
    return (
      <motion.div className="p-10 text-center">
        <Alert className="mx-auto max-w-md border-primary/30 bg-primary/5 text-primary">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-arabic text-sm font-semibold">
            {t("wizard.vendors.pickServicesFirstTitle")}
          </AlertTitle>
          <AlertDescription className="mt-1 text-xs text-foreground/70">
            {t("wizard.vendors.noServices")}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  const tierLabel = {
    economy: t("wizard.budget.tierEconomy"),
    standard: t("wizard.budget.tierStandard"),
    luxury: t("wizard.budget.tierLuxury"),
  }[tier];

  // ---------------------------------------------------------------------------
  // Running total + missing-category detection.
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

      {/* Missing-category alert — one row per uncovered service. */}
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

      <div className="mt-8 space-y-10">
        {selectedServices.map((cat) => {
          const Icon = ICONS[cat];
          const list = grouped[cat] ?? [];
          const pick = picks[cat];
          const cap = allocations[cat] ?? 0;
          return (
            <section key={cat}>
              <div className="mb-4 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h4 className="font-arabic text-base font-semibold text-foreground">
                  {t(`wizard.services.${cat}`)}
                </h4>
                <span className="ms-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-foreground/60">
                  {fmtNumber(list.length)}
                </span>
                {pick && <Badge className="ms-auto bg-primary/15 text-primary">{t("wizard.vendors.selected")}</Badge>}
              </div>

              {list.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-foreground/55">
                  {t("wizard.vendors.empty")}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {list.map((v) => {
                    const vendorMatches = v.packages.some(
                      (p) => allowedPackageTiers.includes(p.tier) || (cap > 0 && Number(p.price) <= cap),
                    );
                    const weekday = Number(v.weekday_price) || 0;
                    const weekend = Number(v.weekend_price) || 0;
                    const isHall = cat === "hall";

                    return (
                      <div
                        key={v.id}
                        className={`overflow-hidden rounded-2xl border bg-card shadow-card transition-all ${
                          pick?.vendorId === v.id
                            ? "border-primary ring-1 ring-primary/30"
                            : "border-border"
                        }`}
                      >
                        {/* Visual media gallery — images + videos uploaded by vendor */}
                        <VendorMediaCarousel items={v.media} vendorName={v.business_name} />

                        {/* Provider description — placed right under the gallery so the
                            visuals get textual context. Uses Arabic sans-serif and
                            wraps gracefully for long copy. */}
                        {v.bio && v.bio.trim().length > 0 && (
                          <div className="border-b border-border/60 bg-secondary/30 px-4 py-3">
                            <div className="text-[10px] uppercase tracking-wide text-foreground/55">
                              <span className="font-arabic">{t("wizard.vendors.description")}</span>
                            </div>
                            <p className="mt-1 whitespace-pre-line break-words font-arabic text-[13px] leading-relaxed text-foreground/80">
                              {v.bio}
                            </p>
                          </div>
                        )}

                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-arabic text-sm font-semibold text-foreground">
                                  {v.business_name}
                                </span>
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
                              {(v.city || v.region || v.district) && (
                                <div className="mt-1 inline-flex items-center gap-1 font-arabic text-[11px] text-foreground/60">
                                  <MapPin className="h-3 w-3 text-primary/70" />
                                  <span>
                                    {[v.city, v.district, v.region].filter(Boolean).join("، ")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Features & Services — shown for ALL categories.
                              Vendors can now type free-text tags (lighting,
                              4K video, ذبائح, …). Known keys still get a
                              matching icon; free-text shows the olive-green
                              checkmark badge. */}
                          {v.extra_services && v.extra_services.length > 0 && (
                            <div className="mt-3 rounded-xl border border-border/60 bg-secondary/40 p-3">
                              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-foreground/60">
                                <Check className="h-3 w-3 text-primary" />
                                <span className="font-arabic">{t("wizard.vendors.whatIncluded")}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {v.extra_services.map((key) => {
                                  const Icon = EXTRA_SERVICE_ICONS[key];
                                  const label = EXTRA_SERVICE_LABELS[key] ?? key;
                                  return (
                                    <span
                                      key={key}
                                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-arabic text-[11px] font-medium text-primary-foreground shadow-card"
                                    >
                                      {Icon ? (
                                        <Icon className="h-3 w-3 shrink-0" />
                                      ) : (
                                        <Check className="h-3 w-3 shrink-0" />
                                      )}
                                      <span className="truncate">{label}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Pricing & capacity grid — always Latin digits via fmtNumber */}
                          <div className="mt-3 grid grid-cols-2 gap-2" dir="ltr">
                            {weekday > 0 && (
                              <div className="rounded-xl border border-border bg-background/50 p-2.5">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-foreground/55">
                                  <CalendarDays className="h-3 w-3" />
                                  <span className="font-arabic">{t("wizard.vendors.weekdayPrice")}</span>
                                </div>
                                <div className="mt-1 font-arabic text-sm font-semibold tabular-nums text-foreground">
                                  {fmtNumber(weekday)}{" "}
                                  <span className="text-[11px] font-medium text-foreground/60">{t("common.currency")}</span>
                                </div>
                              </div>
                            )}
                            {weekend > 0 && (
                              <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-2.5">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-primary">
                                  <CalendarRange className="h-3 w-3" />
                                  <span className="font-arabic">{t("wizard.vendors.weekendPrice")}</span>
                                </div>
                                <div className="mt-1 font-arabic text-sm font-semibold tabular-nums text-primary">
                                  {fmtNumber(weekend)}{" "}
                                  <span className="text-[11px] font-medium text-primary/70">{t("common.currency")}</span>
                                </div>
                              </div>
                            )}
                            {/* Removed: "Price upon request" placeholder per spec —
                                the "Book Now" button below now serves as the CTA. */}


                            {/* Hall capacity tiles */}
                            {isHall && (Number(v.men_capacity ?? 0) > 0 || Number(v.women_capacity ?? 0) > 0) && (
                              <>
                                {Number(v.men_capacity ?? 0) > 0 && (
                                  <div className="rounded-xl border border-border bg-background/50 p-2.5">
                                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-foreground/55">
                                      <Users className="h-3 w-3" />
                                      <span className="font-arabic">{t("wizard.vendors.menCapacity")}</span>
                                    </div>
                                    <div className="mt-1 font-arabic text-sm font-semibold tabular-nums text-foreground">
                                      {fmtNumber(Number(v.men_capacity))}
                                    </div>
                                  </div>
                                )}
                                {Number(v.women_capacity ?? 0) > 0 && (
                                  <div className="rounded-xl border border-border bg-background/50 p-2.5">
                                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-foreground/55">
                                      <Users2 className="h-3 w-3" />
                                      <span className="font-arabic">{t("wizard.vendors.womenCapacity")}</span>
                                    </div>
                                    <div className="mt-1 font-arabic text-sm font-semibold tabular-nums text-foreground">
                                      {fmtNumber(Number(v.women_capacity))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Package picker / Add provider buttons */}
                          <div className="mt-3 grid grid-cols-1 gap-2">
                            {v.packages.length === 0 && (
                              // Vendor approved but hasn't published packages yet —
                              // surface a one-click "Book Now" CTA that picks this
                              // vendor (using their weekday price as the indicative
                              // amount, falling back to 0) and advances the wizard.
                              <button
                                type="button"
                                onClick={() => {
                                  const indicativePrice = weekday || weekend || 0;
                                  const newPick: VendorPick = {
                                    vendorId: v.id,
                                    packageId: null,
                                    category: cat,
                                    price: indicativePrice,
                                  };
                                  setPick(cat, newPick);
                                  onBookNow?.(newPick);
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-arabic text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              >
                                <Check className="h-4 w-4" />
                                {t("wizard.vendors.bookNow")}
                              </button>
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
                                        : { vendorId: v.id, packageId: p.id, category: cat, price: Number(p.price) },
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
                                    <div className="truncate text-[11px] text-foreground/55">{p.description}</div>
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
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Sticky running-total bar — always English numerals via fmtNumber. */}
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
