import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  SketchIconInvitation,
  SketchIconServices,
  SketchIconPalette,
  SketchIconHandshake,
} from "./wizard/WizardSketches";
import { StepEventDetails } from "./wizard/StepEventDetails";
import { StepJourneyServices } from "./wizard/StepJourneyServices";
import {
  StepVisionPaths,
  type VisionPath,
  type VisionBlocks,
  type VisionBlockGroup,
} from "./wizard/StepVisionPaths";
import type { VisionRef } from "./wizard/VisionReferences";
import { StepComingSoon } from "./wizard/StepComingSoon";
import { MatchingOverlay } from "./wizard/MatchingOverlay";
import { WizardVisual } from "./wizard/WizardVisual";
import {
  CATEGORIES, EVENT_TYPES, type EventTypeKey,
} from "./wizard/journeyData";
import { SAUDI_CITIES } from "./vendor/saudiPlaces";
import { fmtDate } from "@/i18n/format";

/**
 * Tklh planning journey — 4 steps, one single destination.
 * details → services → vision → coming soon + interest form.
 * No prices are ever shown in any step, by design.
 */
export const PlanningWizard = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  const [step, setStep] = useState(0);
  const [matching, setMatching] = useState(false);

  // Step 1
  const [eventType, setEventType] = useState<EventTypeKey | "">("");
  const [customEventName, setCustomEventName] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flexibleDate, setFlexibleDate] = useState(false);
  const [guests, setGuests] = useState(0);
  const [menGuests, setMenGuests] = useState(0);
  const [womenGuests, setWomenGuests] = useState(0);
  const [splitGuests, setSplitGuests] = useState(false);
  const totalGuests = splitGuests ? menGuests + womenGuests : guests;

  

  // Step 2
  const [selected, setSelected] = useState<string[]>([]);
  const toggleService = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // Step 3
  const [visionPath, setVisionPath] = useState<VisionPath>("team");
  const [vision, setVision] = useState("");
  const [blocks, setBlocks] = useState<VisionBlocks>({ venue: null, dinner: null, photo: null, mood: null });
  const setBlock = (g: VisionBlockGroup, v: string | null) =>
    setBlocks((b) => ({ ...b, [g]: v }));
  const [visionRefs, setVisionRefs] = useState<VisionRef[]>([]);

  const formAnchorRef = useRef<HTMLDivElement>(null);
  const scrollFormIntoView = () => {
    const el = formAnchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top >= 80 && rect.top < window.innerHeight * 0.6) return;
    window.scrollTo({ top: window.scrollY + rect.top - 100, behavior: "smooth" });
  };

  const eventDef = EVENT_TYPES.find((e) => e.key === eventType);
  const cityLabel = useMemo(() => {
    const found = SAUDI_CITIES.find((c) => c.en === city);
    return found ? (isAr ? found.ar : found.en) : "";
  }, [city, isAr]);

  const missing = useMemo(() => {
    const miss: string[] = [];
    if (step === 0) {
      if (!eventType) miss.push(isAr ? "نوع المناسبة" : "Event type");
      if (eventType === "other" && !customEventName.trim())
        miss.push(isAr ? "اكتب نوع مناسبتك" : "Type your event type");
      if (!date) miss.push(isAr ? "التاريخ" : "Date");
      if (eventDef?.dateMode === "range" && !endDate) miss.push(isAr ? "تاريخ النهاية" : "End date");
      if (!city) miss.push(isAr ? "المدينة" : "City");
      if (totalGuests <= 0) miss.push(isAr ? "عدد الضيوف" : "Guest count");
    } else if (step === 1) {
      if (selected.length === 0) miss.push(isAr ? "خدمة واحدة على الأقل" : "At least one service");
    }
    return miss;
  }, [step, eventType, customEventName, date, endDate, city, totalGuests, selected, eventDef, isAr]);


  const canProceed = missing.length === 0;
  const nextHint = canProceed
    ? ""
    : (isAr ? "المطلوب: " : "Required: ") + missing.join(isAr ? "، " : ", ");

  const goToFinal = () => {
    setMatching(true);
  };

  const next = () => {
    if (!canProceed) {
      toast.error(isAr ? "أكمل الحقول المطلوبة عشان نكمل معك" : "Please complete the required fields");
      return;
    }
    if (step === 2) { goToFinal(); return; }
    setStep((s) => Math.min(s + 1, 3));
    requestAnimationFrame(scrollFormIntoView);
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    requestAnimationFrame(scrollFormIntoView);
  };

  // Summary shown above the wax seal on the final screen.
  const summary = useMemo(() => {
    const out: string[] = [];
    if (eventDef) out.push(eventType === "other" && customEventName.trim() ? customEventName.trim() : (isAr ? eventDef.ar : eventDef.en));
    if (date) out.push(endDate ? `${fmtDate(date)} → ${fmtDate(endDate)}` : fmtDate(date));
    if (cityLabel) out.push(cityLabel);
    if (totalGuests > 0) {
      out.push(
        splitGuests
          ? (isAr
              ? `${menGuests} رجال · ${womenGuests} نساء`
              : `${menGuests} men · ${womenGuests} women`)
          : (isAr ? `${totalGuests} ضيف` : `${totalGuests} guests`),
      );
    }
    if (selected.length && eventType) {
      out.push(
        CATEGORIES[eventType as EventTypeKey]
          .filter((c) => selected.includes(c.key))
          .map((c) => (isAr ? c.ar : c.en))
          .join(isAr ? "، " : ", "),
      );
    }
    return out;
  }, [eventDef, customEventName, date, endDate, cityLabel, totalGuests, splitGuests, menGuests, womenGuests, selected, eventType, isAr]);

  const payload = useMemo(
    () => ({
      eventType, customEventName: eventType === "other" ? customEventName.trim() : "",
      city, date, endDate, flexibleDate,
      guests: totalGuests, menGuests: splitGuests ? menGuests : null,
      womenGuests: splitGuests ? womenGuests : null,
      services: selected, visionPath, vision, visionBlocks: blocks,
      language: i18n.language,
    }),
    [eventType, customEventName, city, date, endDate, flexibleDate, totalGuests, splitGuests, menGuests, womenGuests, selected, visionPath, vision, blocks, i18n.language],
  );


  const stepLabels = [
    isAr ? "تفاصيل المناسبة" : "Event details",
    isAr ? "اختيار الخدمات" : "Services",
    isAr ? "ارسم رؤيتك" : "Your vision",
    isAr ? "قريبًا" : "Coming soon",
  ];
  const stepIcons = [SketchIconInvitation, SketchIconServices, SketchIconPalette, SketchIconHandshake];

  const PrevIcon = isAr ? ArrowRight : ArrowLeft;
  const NextIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section id="wizard" className="relative overflow-x-hidden bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="font-arabic text-balance text-3xl font-semibold text-foreground sm:text-5xl">
            {t("wizard.title")}
          </h2>
        </motion.div>

        <AnimatePresence>
          {matching && (
            <MatchingOverlay
              key="matching"
              onDone={() => {
                setMatching(false);
                setStep(3);
                requestAnimationFrame(scrollFormIntoView);
              }}
            />
          )}
        </AnimatePresence>

        <div className="mx-auto mt-10 max-w-3xl lg:hidden">
          <WizardVisual step={step} variant="header" />
        </div>

        {/* Stepper — 4 steps */}
        <div className="mx-auto mt-8 w-full max-w-3xl px-1">
          <div className="flex items-center justify-center gap-1.5">
            {stepLabels.map((label, i) => {
              const isActive = i === step;
              const isComplete = i < step;
              const StepIcon = stepIcons[i];
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ scale: isActive ? 1.06 : 1 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className={`grid h-11 w-11 place-items-center rounded-full transition-colors duration-500 ${
                        isComplete || isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground/55"
                      } ${isActive ? "ring-1 ring-[hsl(var(--gold))]/60 ring-offset-2 ring-offset-background" : ""}`}
                    >
                      {isComplete ? <Check className="h-4 w-4" /> : <StepIcon className="h-5 w-5" />}
                    </motion.div>
                    <span
                      className={`mt-2 hidden whitespace-nowrap font-arabic text-[11px] font-medium sm:block ${
                        isActive ? "text-primary" : "text-foreground/55"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className="relative h-[3px] w-9 overflow-hidden rounded-full bg-primary/15 sm:w-14">
                      <motion.div
                        initial={false}
                        animate={{ scaleX: i < step ? 1 : 0 }}
                        style={{ originX: isAr ? 1 : 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 rounded-full bg-primary"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          ref={formAnchorRef}
          className="mt-10 grid gap-0 overflow-hidden rounded-3xl border border-border bg-card shadow-luxury lg:grid-cols-[minmax(0,340px),1fr]"
        >
          <WizardVisual step={step} variant="side" />

          <div className="flex min-w-0 flex-col">
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <StepEventDetails
                    eventType={eventType}
                    setEventType={(v) => {
                      setEventType(v); setSelected([]); setEndDate("");
                      if (v !== "other") setCustomEventName("");
                      setSplitGuests(v === "wedding" || v === "malka");
                    }}
                    customEventName={customEventName} setCustomEventName={setCustomEventName}
                    city={city} setCity={setCity}
                    date={date} setDate={setDate}
                    endDate={endDate} setEndDate={setEndDate}
                    flexibleDate={flexibleDate} setFlexibleDate={setFlexibleDate}
                    guests={guests} setGuests={setGuests}
                    menGuests={menGuests} setMenGuests={setMenGuests}
                    womenGuests={womenGuests} setWomenGuests={setWomenGuests}
                    splitGuests={splitGuests} setSplitGuests={setSplitGuests}
                  />

                )}
                {step === 1 && eventType && (
                  <StepJourneyServices
                    eventType={eventType}
                    selected={selected}
                    toggle={toggleService}
                  />
                )}
                {step === 2 && (
                  <StepVisionPaths
                    path={visionPath}
                    setPath={setVisionPath}
                    vision={vision}
                    setVision={setVision}
                    blocks={blocks}
                    setBlock={setBlock}
                  />
                )}
                {step === 3 && <StepComingSoon summary={summary} payload={payload} />}
              </AnimatePresence>
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/30 px-4 py-4 sm:px-8">
              <Button
                variant="ghost"
                onClick={prev}
                disabled={step === 0}
                size="sm"
                className="min-h-[44px] rounded-full text-foreground"
              >
                <PrevIcon className="me-2 h-4 w-4" />
                {step === 3 ? (isAr ? "رجوع للتعديل" : "Back to edit") : t("common.previous")}
              </Button>
              {step < 3 && (
                <div className="flex flex-col items-end gap-1">
                  <Button
                    onClick={next}
                    size="sm"
                    disabled={!canProceed}
                    className="min-h-[44px] rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {t("common.next")}
                    <NextIcon className="ms-2 h-4 w-4" />
                  </Button>
                  {nextHint && (
                    <span className="font-arabic text-[11px] font-medium text-foreground/60">{nextHint}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
