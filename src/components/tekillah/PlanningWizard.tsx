import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, ArrowRight, Loader2, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StepDetails } from "./wizard/StepDetails";
import { StepServices } from "./wizard/StepServices";
import { StepVision } from "./wizard/StepVision";
import { StepBudget } from "./wizard/StepBudget";
import { StepVendors, type VendorPick } from "./wizard/StepVendors";
import { StepPackageDetail } from "./wizard/StepPackageDetail";
import {
  allocationCatalog,
  realisticMinimum,
  type BudgetMode,
  type ServiceKey,
} from "./wizard/types";
import { WizardVisual } from "./wizard/WizardVisual";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { upsertCustomerLead } from "@/lib/leads";
import { clearPendingPlan, loadPendingPlan, savePendingPlan, type PackageSelection } from "@/lib/pendingPlan";
import { finalisePlan } from "@/lib/finalisePlan";

// ---------------------------------------------------------------------------
// Catalog mirroring the cards rendered in StepBudget — kept in sync manually
// because the prices/translation keys live there. When a card is picked we
// look up the full record by key to drive the fast-track detail page.
// ---------------------------------------------------------------------------
const PACKAGE_CATALOG: Array<Omit<PackageSelection, "name"> & { nameKey: string }> = [
  { key: "classic", nameKey: "wizard.budget.pkgClassic", price: 45000, includesKey: "wizard.budget.pkgClassicIncludes" },
  { key: "premium", nameKey: "wizard.budget.pkgPremium", price: 95000, includesKey: "wizard.budget.pkgPremiumIncludes" },
  { key: "royal",   nameKey: "wizard.budget.pkgRoyal",   price: 180000, includesKey: "wizard.budget.pkgRoyalIncludes" },
];

export const PlanningWizard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const isAr = i18n.language === "ar";

  // Step 0
  const [city, setCity] = useState("");
  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState("");
  const [men, setMen] = useState(150);
  const [women, setWomen] = useState(150);

  // Step 1
  const [selected, setSelected] = useState<string[]>([]);
  const toggleService = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // Step 2 — Vision
  const [vision, setVision] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const toggleChip = (chip: string) =>
    setSelectedChips((s) => (s.includes(chip) ? s.filter((x) => x !== chip) : [...s, chip]));

  // Step 3 — Budget
  const [budgetMode, setBudgetMode] = useState<BudgetMode>(null);
  const [budget, setBudget] = useState(80000);
  const guests = men + women;

  const initialAllocations = useMemo(() => {
    const out = {} as Record<ServiceKey, number>;
    allocationCatalog.forEach((item) => {
      const suggested = Math.round((budget * item.pct) / 100);
      out[item.key] = Math.max(suggested, realisticMinimum(item, guests));
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [allocations, setAllocations] =
    useState<Record<ServiceKey, number>>(initialAllocations);

  const setAllocation = (key: ServiceKey, value: number) =>
    setAllocations((a) => ({ ...a, [key]: value }));

  // Per-service on/off toggle for the Smart Budget. All on by default so the
  // estimator behaves the same as before until the user opts a service out.
  const [enabledServices, setEnabledServices] = useState<Record<ServiceKey, boolean>>(() => {
    const out = {} as Record<ServiceKey, boolean>;
    allocationCatalog.forEach((it) => { out[it.key] = true; });
    return out;
  });
  const toggleEnabled = (key: ServiceKey) =>
    setEnabledServices((s) => ({ ...s, [key]: !s[key] }));

  // Live total of enabled allocations — drives smart-matching tier in StepVendors.
  const liveBudget = useMemo(
    () => allocationCatalog.reduce(
      (s, it) => s + (enabledServices[it.key] ? (allocations[it.key] ?? 0) : 0),
      0,
    ),
    [allocations, enabledServices],
  );

  // Step 4 — Vendor picks
  const [picks, setPicks] = useState<Record<string, VendorPick>>({});
  const setPick = (category: ServiceKey, pick: VendorPick | null) => {
    setPicks((p) => {
      const copy = { ...p };
      if (pick) copy[category] = pick;
      else delete copy[category];
      return copy;
    });
  };

  // Fast-track package booking — when set, step 4 renders the package detail
  // page instead of the manual vendor picker. Cleared if the user backs out.
  const [packageSelection, setPackageSelection] = useState<PackageSelection | null>(null);
  const isFastTrack = !!packageSelection;

  // ---------------------------------------------------------------------------
  // Hydrate from a previously-saved snapshot (e.g. guest finished wizard,
  // signed in, came back). Runs once on mount.
  // ---------------------------------------------------------------------------
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const snap = loadPendingPlan();
    if (!snap) return;
    setCity(snap.city ?? "");
    setEventType(snap.eventType ?? "");
    setDate(snap.date ?? "");
    setMen(snap.men ?? 150);
    setWomen(snap.women ?? 150);
    setSelected(snap.selected ?? []);
    setVision(snap.vision ?? "");
    setSelectedChips(snap.selectedChips ?? []);
    setBudgetMode(snap.budgetMode ?? null);
    setBudget(snap.budget ?? 80000);
    if (snap.allocations) setAllocations(snap.allocations);
    if (snap.enabledServices) setEnabledServices(snap.enabledServices);
    if (snap.picks) setPicks(snap.picks);
    if (snap.packageSelection) setPackageSelection(snap.packageSelection);
    // Honour an explicit `?resume=1&step=N` marker from the auth redirect,
    // otherwise land them on the last meaningful step so they don't redo work.
    const params = new URLSearchParams(window.location.search);
    const resume = params.get("resume") === "1";
    const stepParam = Number(params.get("step"));
    if (resume && Number.isFinite(stepParam) && stepParam >= 0 && stepParam <= 4) {
      setStep(stepParam);
      toast.success(t("wizard.planRestored"));
      // Scroll the wizard into view so the user sees their restored state.
      requestAnimationFrame(() => {
        document.getElementById("wizard")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      // Clean the URL so a refresh doesn't re-toast.
      const url = new URL(window.location.href);
      url.searchParams.delete("resume");
      url.searchParams.delete("step");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    } else if (snap.packageSelection) setStep(4);
    else if (Object.keys(snap.picks ?? {}).length > 0) setStep(4);
    else if (snap.budget) setStep(3);
    else if (snap.selected?.length) setStep(1);
  }, []);

  // ---------------------------------------------------------------------------
  // Fast-track from URL: when the home-page PlatformPackages section sends the
  // user here with `?pkg=<id>`, fetch the admin package and jump straight to
  // the package detail step. Also re-runs on hashchange so in-page navigations
  // (no full reload) still trigger the lookup.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const consumePkgParam = async () => {
      const params = new URLSearchParams(window.location.search);
      const pkgId = params.get("pkg");
      if (!pkgId) return;

      // UUID sanity check — keeps malformed query strings from hitting Supabase.
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pkgId);
      if (!isUuid) return;

      const { data, error } = await supabase
        .from("platform_packages")
        .select("id, name, name_en, description, description_en, price, includes, includes_en, media, thumbnail_url, published")
        .eq("id", pkgId)
        .maybeSingle();

      if (error || !data || data.published === false) return;

      const mediaArr = Array.isArray(data.media)
        ? (data.media as Array<{ url: string; type: "image" | "video" }>)
        : [];

      setPackageSelection({
        key: data.id,
        kind: "admin",
        name: data.name,
        name_en: data.name_en ?? null,
        description: data.description ?? null,
        description_en: data.description_en ?? null,
        price: Number(data.price),
        includes: Array.isArray(data.includes) ? data.includes : [],
        includes_en: Array.isArray(data.includes_en) ? data.includes_en : [],
        media: mediaArr,
        thumbnail: data.thumbnail_url ?? null,
      });
      setBudget(Number(data.price));
      setBudgetMode("packages");
      setPicks({}); // Fast-track is curated — no manual vendor picks.
      setStep(4);

      // Strip the param so refreshes don't re-toast / re-jump.
      const url = new URL(window.location.href);
      url.searchParams.delete("pkg");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);

      // Smooth-scroll the wizard into view for a polished hand-off from the
      // landing page card.
      requestAnimationFrame(() => {
        document.getElementById("wizard")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    consumePkgParam();
    const onHash = () => { consumePkgParam(); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist a snapshot on every meaningful change. Cheap — JSON of <3KB.
  useEffect(() => {
    if (!hydratedRef.current) return;
    savePendingPlan({
      city, eventType, date, men, women,
      selected, vision, selectedChips,
      budgetMode, budget,
      allocations, enabledServices, picks,
      packageSelection,
    });
  }, [city, eventType, date, men, women, selected, vision, selectedChips, budgetMode, budget, allocations, enabledServices, picks, packageSelection]);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = async () => {
    if (!user) {
      // Persist the latest snapshot so the dashboard can finalise after sign-in.
      savePendingPlan({
        city, eventType, date, men, women,
        selected, vision, selectedChips,
        budgetMode, budget,
        allocations, enabledServices, picks,
        packageSelection,
      });
      toast.success(t("wizard.planSaved"));
      // Encode where to resume after auth:
      //  - If they reached the final step (have picks OR a fast-track package)
      //    → /dashboard will auto-finalise the snapshot.
      //  - Otherwise → return to the homepage wizard section on the exact step
      //    they left, with a `resume=1` marker.
      const ready = Object.keys(picks).length > 0 || !!packageSelection;
      const resumeTarget = ready
        ? "/dashboard"
        : `/?resume=1&step=${step}#wizard`;
      navigate(`/auth?redirect=${encodeURIComponent(resumeTarget)}`);
      return;
    }
    if (!date) { toast.error(t("customer.create.futureDate")); setStep(0); return; }

    const pickList = Object.values(picks);
    // Fast-track package booking has no picks but is still a valid finalisation.
    if (pickList.length === 0 && !packageSelection) {
      toast.error(t("wizard.vendors.pickAtLeastOne"));
      setStep(4);
      return;
    }

    setSubmitting(true);
    try {
      const result = await finalisePlan({
        userId: user.id,
        t,
        plan: {
          version: 1, savedAt: Date.now(),
          city, eventType, date, men, women,
          selected, vision, selectedChips,
          budgetMode, budget,
          allocations, enabledServices, picks,
          packageSelection,
        },
      });
      // Snapshot is fully consumed — clear so we don't re-run on next visit.
      clearPendingPlan();
      toast.success(t("wizard.eventCreated"));
      if (packageSelection) {
        // Fast-track: no booking row yet (admin will assign vendors). Land the
        // customer on their dashboard so they see the package they reserved.
        toast.success(t("wizard.packageDetail.confirmedToast", { name: packageSelection.name }));
        navigate("/dashboard");
      } else {
        toast.success(t("wizard.bookingsCreated", { count: result.bookingIds.length }));
        navigate(`/checkout/${result.bookingIds[0]}`);
      }
    } catch {
      toast.error(t("wizard.bookingsFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = isFastTrack
    ? [
        t("wizard.step1"),
        t("wizard.step2"),
        t("wizard.step3"),
        t("wizard.step4"),
        t("wizard.packageDetail.fastTrackStep"),
      ]
    : [
        t("wizard.step1"),
        t("wizard.step2"),
        t("wizard.step3"),
        t("wizard.step4"),
        t("wizard.step5"),
      ];

  const PrevIcon = isAr ? ArrowRight : ArrowLeft;
  const NextIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section id="wizard" className="relative bg-gradient-soft py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            {t("wizard.kicker")}
          </span>
          <h2 className="mt-4 font-arabic text-balance text-4xl font-semibold text-foreground sm:text-5xl">
            {t("wizard.title")}
          </h2>
        </motion.div>

        {/* Mobile-only visual header */}
        <div className="mx-auto mt-10 max-w-3xl lg:hidden">
          <WizardVisual step={step} variant="header" />
        </div>

        {/* Fast-Track ribbon — visible only when a package is selected so users
            understand they're skipping vendor selection. */}
        <AnimatePresence>
          {isFastTrack && (
            <motion.div
              key="fast-track-ribbon"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto mt-8 flex max-w-3xl items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary"
            >
              <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
              <span className="font-arabic">
                {t("wizard.packageDetail.fastTrackBadge", { name: packageSelection!.name })}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <div className="mx-auto mt-10 flex max-w-3xl items-center justify-between gap-2">
          {stepLabels.map((label, i) => {
            const isLast = i === stepLabels.length - 1;
            const isFastTrackBadge = isFastTrack && isLast;
            return (
              <div key={i} className="flex flex-1 items-center gap-2">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: i === step ? 1.05 : 1,
                      backgroundColor:
                        i <= step ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                    }}
                    className="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-primary-foreground transition-colors"
                  >
                    {isFastTrackBadge ? (
                      <Zap className="h-4 w-4" strokeWidth={2.5} />
                    ) : i < step ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </motion.div>
                  <span className="mt-2 hidden whitespace-nowrap text-xs font-medium text-foreground/80 sm:block">
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className="relative h-px flex-1 bg-border">
                    <motion.div
                      initial={false}
                      animate={{ scaleX: i < step ? 1 : 0 }}
                      style={{ originX: isAr ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-primary"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Side-by-side visual + form on desktop */}
        <div className="mt-10 grid gap-0 overflow-hidden rounded-3xl border border-border bg-card shadow-luxury lg:grid-cols-[minmax(0,360px),1fr]">
          <WizardVisual step={step} variant="side" />

          <div className="flex min-w-0 flex-col">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepDetails
                  city={city} setCity={setCity}
                  eventType={eventType} setEventType={setEventType}
                  date={date} setDate={setDate}
                  men={men} setMen={setMen}
                  women={women} setWomen={setWomen}
                />
              )}
              {step === 1 && <StepServices selected={selected} toggleService={toggleService} />}
              {step === 2 && (
                <StepVision
                  vision={vision} setVision={setVision}
                  selectedChips={selectedChips} toggleChip={toggleChip}
                />
              )}
              {step === 3 && (
                <StepBudget
                  budgetMode={budgetMode} setBudgetMode={setBudgetMode}
                  budget={budget} setBudget={setBudget}
                  guests={guests}
                  allocations={allocations} setAllocation={setAllocation}
                  enabledServices={enabledServices} toggleEnabled={toggleEnabled}
                />
              )}
              {step === 4 && isFastTrack && packageSelection && (
                <StepPackageDetail
                  selection={packageSelection}
                  submitting={submitting}
                  onConfirm={handleFinish}
                  onChangePackage={() => {
                    // Drop the package selection and send the user back to the
                    // budget step where they can repick or switch to smart mode.
                    setPackageSelection(null);
                    setStep(3);
                  }}
                />
              )}
              {step === 4 && !isFastTrack && (
                <StepVendors
                  selectedServices={selected as ServiceKey[]}
                  picks={picks}
                  setPick={setPick}
                  budget={liveBudget || budget}
                  allocations={allocations}
                  onBookNow={(pick) => {
                    // One-click "احجز" — register the pick and immediately
                    // finalise so the customer lands on checkout/auth.
                    setPicks((p) => ({ ...p, [pick.category]: pick }));
                    // Defer to the next tick so React commits the new pick
                    // before finalisePlan reads from the snapshot.
                    setTimeout(() => handleFinish(), 0);
                  }}
                />
              )}
            </AnimatePresence>

            <div className="mt-auto flex items-center justify-between border-t border-border bg-secondary/30 px-6 py-4 sm:px-10">
              <Button variant="ghost" onClick={prev} disabled={step === 0} className="rounded-full text-foreground">
                <PrevIcon className="me-2 h-4 w-4" />
                {t("common.previous")}
              </Button>
              {step < 4 ? (
                <Button onClick={next} className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                  {t("common.next")}
                  <NextIcon className="ms-2 h-4 w-4" />
                </Button>
              ) : isFastTrack ? (
                // Fast-track step renders its own Confirm CTA inside the card.
                <span className="text-xs text-foreground/60">{t("wizard.packageDetail.footerHint")}</span>
              ) : (
                <Button onClick={handleFinish} disabled={submitting}
                  className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                  {submitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Check className="me-2 h-4 w-4" />}
                  {t("wizard.confirmBooking")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
