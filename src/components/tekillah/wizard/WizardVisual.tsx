import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
// Order matches PlanningWizard steps: details → services → vision → budget → vendors
import detailsImg from "@/assets/wizard-step-1-details.jpg";
import servicesImg from "@/assets/wizard-step-4-services.jpg";
import visionImg from "@/assets/wizard-step-2-vision.jpg";
import budgetImg from "@/assets/wizard-step-3-budget.jpg";
import vendorsImg from "@/assets/wizard-step-5-vendors.jpg";
import finalImg from "@/assets/wizard-step-6-celebration.jpg";

/**
 * Maps the wizard step index (0..4) to its visual + caption.
 * Order matches PlanningWizard: details → services → vision → budget → vendors.
 * The "final" celebration image is shown when the last step is complete (or could be
 * surfaced on a success screen in the future).
 */
const visuals = [
  { src: detailsImg, captionKey: "wizard.visuals.step1Caption" },
  { src: servicesImg, captionKey: "wizard.visuals.step2Caption" },
  { src: visionImg, captionKey: "wizard.visuals.step3Caption" },
  { src: budgetImg, captionKey: "wizard.visuals.step4Caption" },
  { src: vendorsImg, captionKey: "wizard.visuals.step5Caption" },
];

interface Props {
  step: number;
  /** When true, render as a horizontal mobile header; otherwise as a tall side panel. */
  variant?: "side" | "header";
}

export const WizardVisual = ({ step, variant = "side" }: Props) => {
  const { t } = useTranslation();
  const safeIndex = Math.min(Math.max(step, 0), visuals.length - 1);
  const v = visuals[safeIndex];

  const isHeader = variant === "header";

  return (
    <div
      className={
        isHeader
          ? "relative h-44 w-full overflow-hidden rounded-2xl border border-primary/15 sm:h-56"
          : "relative hidden h-full min-h-[520px] w-full overflow-hidden rounded-l-3xl border-r border-primary/10 lg:block"
      }
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={v.src}
          src={v.src}
          alt=""
          width={1024}
          height={1024}
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* Soft cream + olive wash for legibility and palette harmony */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/55 via-primary-deep/15 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-transparent to-primary/10" />

      {/* Step caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={v.captionKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-6 bottom-6"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-8 bg-background/80" />
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-background/80">
              {String(safeIndex + 1).padStart(2, "0")}
            </span>
          </div>
          <p className="font-arabic text-balance text-lg font-semibold leading-snug text-background drop-shadow-md sm:text-xl">
            {t(v.captionKey)}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export const wizardFinalImage = finalImg;
