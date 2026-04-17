import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StepDetails } from "./wizard/StepDetails";
import { StepServices } from "./wizard/StepServices";
import { StepVision } from "./wizard/StepVision";
import { StepBudget } from "./wizard/StepBudget";
import {
  allocationCatalog,
  realisticMinimum,
  type BudgetMode,
  type ServiceKey,
} from "./wizard/types";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = async () => {
    if (!user) {
      toast.info(t("wizard.signInToSave"));
      navigate("/auth?redirect=/dashboard");
      return;
    }
    if (!date) { toast.error(t("customer.create.futureDate")); setStep(0); return; }
    setSubmitting(true);
    const visionNote = [vision, selectedChips.join(" • ")].filter(Boolean).join("\n");
    const { data, error } = await supabase.from("events").insert({
      customer_id: user.id,
      title: eventType ? t(`eventTypes.${eventType}`) : t("customer.create.defaultTitle"),
      event_date: date,
      city: city ? t(`cities.${city}`) : null,
      guest_count: guests,
      total_budget: budget,
      theme: selectedChips[0] || null,
      notes: visionNote || null,
    }).select("id").single();
    setSubmitting(false);
    if (error || !data) { toast.error(t("customer.create.createFailed")); return; }
    toast.success(t("customer.create.createSuccess"));
    navigate("/dashboard");
  };

  const stepLabels = [
    t("wizard.step1"),
    t("wizard.step2"),
    t("wizard.step3"),
    t("wizard.step4"),
  ];

  // In LTR, "previous" arrow points left and "next" points right.
  // In RTL, the visual semantics flip.
  const PrevIcon = isAr ? ArrowRight : ArrowLeft;
  const NextIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section id="wizard" className="relative bg-gradient-soft py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
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

        {/* Progress */}
        <div className="mx-auto mt-12 flex max-w-3xl items-center justify-between gap-2">
          {stepLabels.map((label, i) => (
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
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
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
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-luxury">
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
              />
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-6 py-4 sm:px-10">
            <Button variant="ghost" onClick={prev} disabled={step === 0} className="rounded-full text-foreground">
              <PrevIcon className="me-2 h-4 w-4" />
              {t("common.previous")}
            </Button>
            {step < 3 ? (
              <Button onClick={next} className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                {t("common.next")}
                <NextIcon className="ms-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={submitting}
                className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                {submitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Check className="me-2 h-4 w-4" />}
                {t("wizard.finish")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
