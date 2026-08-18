import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, ArrowRight, Loader2, Sparkles, Zap } from "lucide-react";
import {
  SketchIconInvitation,
  SketchIconServices,
  SketchIconPalette,
  SketchIconCoin,
  SketchIconHandshake,
} from "./wizard/WizardSketches";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StepDetails } from "./wizard/StepDetails";
import { StepServices } from "./wizard/StepServices";
import { StepVision, type VisionBlocks, type VisionBlockGroup } from "./wizard/StepVision";
import { StepProviders, type ProviderPick } from "./wizard/StepProviders";
import type { ProviderCategory, VisionPrefs } from "./wizard/mockProviders";
import { AiSearchingOverlay } from "./wizard/AiSearchingOverlay";


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
  const [endDate, setEndDate] = useState("");
  const [men, setMen] = useState(0);
  const [women, setWomen] = useState(0);

  // Step 1
  const [selected, setSelected] = useState<string[]>([]);
  const toggleService = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // Step 2 — Vision
  const [vision, setVision] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const toggleChip = (chip: string) =>
    setSelectedChips((s) => (s.includes(chip) ? s.filter((x) => x !== chip) : [...s, chip]));

  // Vision building blocks (one choice per group) — feed the provider ranking.
  const [visionBlocks, setVisionBlocks] = useState<VisionBlocks>({
    dinner: null, photo: null, mood: null,
  });
  const setVisionBlock = (group: VisionBlockGroup, value: string | null) =>
    setVisionBlocks((b) => ({ ...b, [group]: value }));

  const visionPrefs: VisionPrefs = useMemo(
    () => ({ ...visionBlocks, text: vision }),
    [visionBlocks, vision],
  );

  const visionChipsSummary = useMemo(
    () => [visionBlocks.dinner, visionBlocks.photo, visionBlocks.mood]
      .filter(Boolean)
      .map((v) => String(v)),
    [visionBlocks],
  );

  // Step 3 — Provider picks (one provider per category)
  const [providerPicks, setProviderPicks] = useState<Record<string, ProviderPick>>({});
  const setProviderPick = (category: ProviderCategory, pick: ProviderPick | null) =>
    setProviderPicks((p) => {
      const copy = { ...p };
      if (pick) copy[category] = pick;
      else delete copy[category];
      return copy;
    });
  const providersTotal = useMemo(
    () => Object.values(providerPicks).reduce((s, p) => s + p.total, 0),
    [providerPicks],
  );


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
    setEndDate(snap.endDate ?? "");
    setMen(snap.men ?? 0);
    setWomen(snap.women ?? 0);
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
      city, eventType, date, endDate, men, women,
      selected, vision, selectedChips,
      budgetMode, budget,
      allocations, enabledServices, picks,
      packageSelection,
    });
  }, [city, eventType, date, endDate, men, women, selected, vision, selectedChips, budgetMode, budget, allocations, enabledServices, picks, packageSelection]);

  // Anchor the form area on step change so the user keeps reading from the
  // top of the current step — but only scroll if the form is out of viewport.
  // Critically: we use `scrollTo` with `behavior: auto` to bypass the global
  // smooth-scroll which causes the page to "jump" up/down on next/prev.
  const formAnchorRef = useRef<HTMLDivElement>(null);
  const scrollFormIntoView = () => {
    const el = formAnchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // If the anchor is already comfortably in view, do nothing.
    const fullyVisible = rect.top >= 80 && rect.top < window.innerHeight * 0.6;
    if (fullyVisible) return;
    const target = window.scrollY + rect.top - 100;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  // Per-step validation — keeps "Next" disabled until required fields are filled.
  const missingFields = useMemo(() => {
    const miss: string[] = [];
    if (step === 0) {
      if (!city) miss.push(isAr ? "المدينة" : "City");
      if (!eventType) miss.push(isAr ? "نوع المناسبة" : "Event type");
      if (!date) miss.push(isAr ? "تاريخ المناسبة" : "Event date");
      if ((men + women) <= 0) miss.push(isAr ? "عدد الضيوف" : "Guest count");
    } else if (step === 1) {
      if (selected.length === 0) miss.push(isAr ? "خدمة واحدة على الأقل" : "At least one service");
    } else if (step === 2) {
      if (vision.trim().length === 0 && visionChipsSummary.length === 0) {
        miss.push(isAr ? "رؤيتك أو لبنات رؤيتك" : "Vision or building blocks");
      }
    } else if (step === 3) {
      if (Object.keys(providerPicks).length === 0) {
        miss.push(isAr ? "مزود واحد على الأقل" : "At least one provider");
      }
    }
    return miss;
  }, [step, city, eventType, date, men, women, selected, vision, visionChipsSummary, providerPicks, isAr]);

  const canProceed = missingFields.length === 0;

  const nextHint = useMemo(() => {
    if (canProceed) return "";
    return (isAr ? "المطلوب: " : "Required: ") + missingFields.join(isAr ? "، " : ", ");
  }, [canProceed, missingFields, isAr]);

  // Shown between the vision step and the provider marketplace so the customer
  // feels their written vision actually triggered a search.
  const [searching, setSearching] = useState(false);

  const next = () => {
    if (!canProceed) {
      toast.error(
        isAr
          ? "الرجاء إكمال الحقول المطلوبة للانتقال للخطوة التالية"
          : "Please complete the required fields to proceed",
      );
      return;
    }
    if (step === 2) {
      setSearching(true);
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
    requestAnimationFrame(scrollFormIntoView);
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    requestAnimationFrame(scrollFormIntoView);
  };

  const handleFinish = async () => {
    if (!user) {
      // Persist the latest snapshot so the dashboard can finalise after sign-in.
      savePendingPlan({
        city, eventType, date, endDate, men, women,
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
        : `/planner?resume=1&step=${step}`;
      navigate(`/auth?redirect=${encodeURIComponent(resumeTarget)}`);
      return;
    }
    if (!date) { toast.error(t("customer.create.futureDate")); setStep(0); return; }

    setSubmitting(true);
    try {
      await finalisePlan({
        userId: user.id,
        t,
        plan: {
          version: 1, savedAt: Date.now(),
          city, eventType, date, endDate, men, women,
          selected, vision, selectedChips,
          budgetMode, budget,
          allocations, enabledServices, picks,
          packageSelection,
        },
      });
      // Build a WhatsApp summary of the confirmed request so the concierge
      // team receives the details immediately after the customer finishes.
      const lines: string[] = [];
      lines.push(isAr ? "🌿 طلب حجز جديد من موقع تِكله" : "🌿 New booking request from Tekillah");
      lines.push("");
      const cityLabel = isAr ? "المدينة" : "City";
      const typeLabel = isAr ? "نوع المناسبة" : "Event type";
      const dateLabel = isAr ? "التاريخ" : "Date";
      const guestsLabel = isAr ? "عدد الضيوف" : "Guests";
      const menLabel = isAr ? "رجال" : "men";
      const womenLabel = isAr ? "نساء" : "women";
      const servicesLabel = isAr ? "الخدمات" : "Services";
      const themeLabel = isAr ? "الطابع" : "Theme";
      const sep = isAr ? "، " : ", ";
      if (city) lines.push(`• ${cityLabel}: ${t(`cities.${city}`, { defaultValue: city })}`);
      if (eventType) lines.push(`• ${typeLabel}: ${t(`eventTypes.${eventType}`, { defaultValue: eventType })}`);
      if (date) lines.push(`• ${dateLabel}: ${date}${endDate ? ` → ${endDate}` : ""}`);
      lines.push(`• ${guestsLabel}: ${men + women} (${menLabel} ${men} / ${womenLabel} ${women})`);
      if (selected.length) lines.push(`• ${servicesLabel}: ${selected.map((s) => t(`wizard.services.${s}`, { defaultValue: s })).join(sep)}`);
      if (visionChipsSummary.length) lines.push(`• ${themeLabel}: ${visionChipsSummary.join(sep)}`);
      if (vision.trim()) lines.push(`• ${isAr ? "الرؤية" : "Vision"}: ${vision.trim()}`);
      if (packageSelection) {
        lines.push("");
        lines.push(`📦 ${isAr ? "الباقة المختارة" : "Selected package"}: ${packageSelection.name} — ${packageSelection.price.toLocaleString(isAr ? "ar-SA" : "en-US")} ${isAr ? "ر.س" : "SAR"}`);
      } else {
        const pickEntries = Object.values(providerPicks);
        if (pickEntries.length) {
          lines.push("");
          lines.push(`✅ ${isAr ? "المزودون المختارون" : "Selected providers"} (${pickEntries.length}):`);
          pickEntries.forEach((p) => {
            lines.push(`   - ${t(`wizard.services.${p.category}`, { defaultValue: p.category })}: ${isAr ? p.name : p.name_en} — ${p.total.toLocaleString(isAr ? "ar-SA" : "en-US")} ${isAr ? "ر.س" : "SAR"}`);
          });
          lines.push(`   ${isAr ? "الإجمالي" : "Total"}: ${providersTotal.toLocaleString(isAr ? "ar-SA" : "en-US")} ${isAr ? "ر.س" : "SAR"}`);
        }
      }
      const waMessage = encodeURIComponent(lines.join("\n"));
      window.open(`https://wa.me/966530466460?text=${waMessage}`, "_blank", "noopener,noreferrer");

      clearPendingPlan();
      toast.success(
        isAr
          ? "تم استلام طلبك، سوف يتم التواصل معك لتأكيد حجزك"
          : "Request received. We will contact you to confirm your booking.",
      );
      navigate("/dashboard");
    } catch {
      toast.error(t("wizard.bookingsFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = [
    t("wizard.step1"),
    t("wizard.step2"),
    t("wizard.step3"),
    t("wizard.step4"),
    isAr ? "تأكيد الطلب" : "Confirm Request",
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

        {/* Progress — refined creative stepper with step icons + soft track */}
        <div className="mx-auto mt-10 w-full max-w-3xl overflow-x-auto px-1 pb-2 sm:overflow-visible sm:pb-0">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            {stepLabels.map((label, i) => {
              const isLast = i === stepLabels.length - 1;
              const isFastTrackBadge = isFastTrack && isLast;
              const isActive = i === step;
              const isComplete = i < step;
              const StepIcon = [SketchIconInvitation, SketchIconServices, SketchIconPalette, SketchIconCoin, SketchIconHandshake][i] ?? SketchIconHandshake;
              return (
                <div key={i} className="flex items-center gap-1 sm:gap-1.5">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.08 : 1,
                        boxShadow: isActive
                          ? "0 8px 24px -10px hsl(var(--gold) / 0.55)"
                          : "0 0px 0px 0 transparent",
                      }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={`relative grid h-11 w-11 place-items-center rounded-full text-sm font-semibold transition-colors ${
                        isComplete
                          ? "bg-[#163726] text-[#fff7ae]"
                          : isActive
                          ? "bg-[#163726] text-[#fff7ae] ring-2 ring-[#fff7ae]/60 ring-offset-2 ring-offset-background"
                          : "bg-secondary text-foreground/60"
                      }`}
                    >
                      {isFastTrackBadge ? (
                        <Zap className="h-4 w-4" strokeWidth={2.5} />
                      ) : isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </motion.div>
                    <span
                      className={`mt-2 hidden whitespace-nowrap text-[11px] font-medium transition-colors sm:block ${
                        isActive ? "text-primary" : "text-foreground/55"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className="relative h-[3px] w-10 overflow-hidden rounded-full bg-[#fff7ae]/40 sm:w-14">
                      <motion.div
                        initial={false}
                        animate={{ scaleX: i < step ? 1 : 0 }}
                        style={{ originX: isAr ? 1 : 0 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 rounded-full bg-[#fff7ae]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side-by-side visual + form on desktop */}
        <div ref={formAnchorRef} className="mt-10 grid gap-0 overflow-hidden rounded-3xl border border-border bg-card shadow-luxury lg:grid-cols-[minmax(0,360px),1fr]">
          <WizardVisual step={step} variant="side" />

          <div className="flex min-w-0 flex-col">
            <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepDetails
                  city={city} setCity={setCity}
                  eventType={eventType} setEventType={setEventType}
                  date={date} setDate={setDate}
                  endDate={endDate} setEndDate={setEndDate}
                  men={men} setMen={setMen}
                  women={women} setWomen={setWomen}
                />
              )}
              {step === 1 && <StepServices selected={selected} toggleService={toggleService} />}
              {step === 2 && (
                <StepVision
                  vision={vision} setVision={setVision}
                  blocks={visionBlocks} setBlock={setVisionBlock}
                />
              )}
              {step === 3 && (
                <StepProviders
                  categories={selected}
                  guests={men + women}
                  date={date}
                  setDate={setDate}
                  prefs={visionPrefs}
                  picks={providerPicks}
                  setPick={setProviderPick}
                />
              )}
              {step === 4 && (
                <motion.div
                  key="step-4-confirm"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="p-6 sm:p-10"
                >
                  <h3 className="font-arabic text-2xl font-semibold text-foreground">
                    {isAr ? "تأكيد طلبك" : "Confirm your request"}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/70">
                    {isAr
                      ? "راجع تفاصيل طلبك، وعند الضغط على تأكيد سوف يتم التواصل معك لتأكيد الحجز."
                      : "Review your details. After confirming, we will contact you to finalise your booking."}
                  </p>

                  <div className="mt-6 space-y-3 rounded-2xl border border-border bg-secondary/40 p-5">
                    <SummaryRow label={isAr ? "المدينة" : "City"} value={city ? t(`cities.${city}`, { defaultValue: city }) : "—"} />
                    <SummaryRow label={isAr ? "نوع المناسبة" : "Event type"} value={eventType ? t(`eventTypes.${eventType}`, { defaultValue: eventType }) : "—"} />
                    <SummaryRow label={isAr ? "تاريخ البداية" : "Start date"} value={date || "—"} valueDir="ltr" />
                    <SummaryRow label={isAr ? "تاريخ النهاية" : "End date"} value={endDate || "—"} valueDir="ltr" />
                    <SummaryRow label={isAr ? "عدد الرجال" : "Men"} value={String(men)} />
                    <SummaryRow label={isAr ? "عدد النساء" : "Women"} value={String(women)} />
                    {(vision || visionChipsSummary.length > 0) && (
                      <SummaryRow
                        label={isAr ? "الرؤية / الطابع" : "Vision / theme"}
                        value={[vision, visionChipsSummary.join("، ")].filter(Boolean).join(" — ")}
                      />
                    )}
                  </div>

                  {/* Per-category provider summary */}
                  <div className="mt-5 space-y-2 rounded-2xl border border-primary/20 bg-card p-5">
                    <h4 className="font-arabic text-sm font-semibold text-foreground">
                      {isAr ? "مزودوك المختارون" : "Your selected providers"}
                    </h4>
                    {Object.values(providerPicks).length === 0 ? (
                      <p className="font-arabic text-sm text-foreground/65">
                        {isAr ? "لم تختر مزودين بعد." : "No providers selected yet."}
                      </p>
                    ) : (
                      Object.values(providerPicks).map((p) => (
                        <SummaryRow
                          key={p.category}
                          label={t(`wizard.services.${p.category}`, { defaultValue: p.category })}
                          value={`${isAr ? p.name : p.name_en} — ${p.total.toLocaleString(isAr ? "ar-SA" : "en-US")}`}
                        />
                      ))
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-arabic text-sm font-semibold text-foreground">
                        {isAr ? "الإجمالي النهائي" : "Final total"}
                      </span>
                      <span className="font-arabic text-xl font-bold text-primary">
                        {providersTotal.toLocaleString(isAr ? "ar-SA" : "en-US")} {isAr ? "ر.س" : "SAR"}
                      </span>
                    </div>
                  </div>

                  <p className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/80 font-arabic">
                    {isAr
                      ? "بعد تأكيد الطلب سيتواصل معك فريقنا في أقرب وقت لإكمال تفاصيل الحجز."
                      : "After confirming, our team will contact you shortly to complete your booking."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>


            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/30 px-4 py-4 sm:px-10">
              <Button
                variant="ghost"
                onClick={prev}
                disabled={step === 0}
                size="sm"
                className="rounded-full text-foreground sm:size-default"
              >
                <PrevIcon className="me-2 h-4 w-4" />
                {t("common.previous")}
              </Button>
              {step < 4 ? (
                <div className="flex flex-col items-end gap-1">
                  <Button
                    onClick={next}
                    size="sm"
                    disabled={!canProceed}
                    className="rounded-full bg-primary px-5 text-primary-foreground shadow-[0_6px_18px_-8px_hsl(var(--gold)/0.5)] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:size-default sm:px-6"
                  >
                    {t("common.next")}
                    <NextIcon className="ms-2 h-4 w-4" />
                  </Button>
                  {nextHint && (
                    <span className="text-[11px] font-medium text-foreground/60">{nextHint}</span>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={submitting}
                  size="sm"
                  className="rounded-full bg-primary px-5 text-primary-foreground shadow-[0_6px_18px_-8px_hsl(var(--gold)/0.5)] hover:bg-primary/90 sm:size-default sm:px-6"
                >
                  {submitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Check className="me-2 h-4 w-4" />}
                  {isAr ? "تأكيد الطلب" : "Confirm Request"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SummaryRow = ({ label, value, valueDir }: { label: string; value: string; valueDir?: "ltr" | "rtl" }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
    <span className="font-arabic text-xs text-foreground/60">{label}</span>
    <span className="text-sm font-medium text-foreground" dir={valueDir}>{value}</span>
  </div>
);
