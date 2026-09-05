import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { type ComponentType } from "react";
import {
  WizardSceneDetails,
  WizardSceneServices,
  WizardSceneVision,
  WizardSceneVendors,
  WizardSceneFinal,
} from "./WizardSketches";

/**
 * Maps the wizard step index (0..4) to its visual scene + caption.
 * Order matches PlanningWizard: details → services → vision → budget → vendors.
 * Each scene is a hand-drawn olive-ink sketch on a warm cream wash, in keeping
 * with the rest of the site's hand-illustrated language.
 */
type Scene = ComponentType<{ className?: string; style?: React.CSSProperties }>;

const visuals: Array<{ Scene: Scene; captionKey: string }> = [
  { Scene: WizardSceneDetails, captionKey: "wizard.visuals.step1Caption" },
  { Scene: WizardSceneServices, captionKey: "wizard.visuals.step2Caption" },
  { Scene: WizardSceneVision, captionKey: "wizard.visuals.step3Caption" },
  { Scene: WizardSceneVendors, captionKey: "wizard.visuals.step5Caption" },
  { Scene: WizardSceneFinal, captionKey: "wizard.visuals.finalCaption" },
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
  const Scene = v.Scene;

  const isHeader = variant === "header";

  return (
    <div
      className={
        isHeader
          ? "relative h-44 w-full overflow-hidden rounded-2xl border border-primary/15 bg-cream sm:h-56"
          : "relative hidden h-full min-h-[560px] w-full overflow-hidden rounded-l-3xl border-r border-primary/10 bg-cream lg:block"
      }
    >
      {/* Soft paper texture wash (subtle dotted grain) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--primary-deep)) 0.4px, transparent 0.4px)",
          backgroundSize: "5px 5px",
        }}
        aria-hidden
      />
      {/* Edge vignette for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-deep/10" />

      {/* === Sketch scene (cross-fades on step change) — fits any container === */}
      <AnimatePresence mode="wait">
        <motion.div
          key={v.captionKey}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={
            isHeader
              ? "absolute inset-0 flex items-center justify-center pb-12"
              : "absolute inset-0 flex items-center justify-center pb-20"
          }
        >
          {/* The SVG uses preserveAspectRatio="meet" so it always fits inside
              its box without cropping. We give it max width/height so it can
              scale up freely on large panels and shrink cleanly on mobile. */}
          <Scene className="h-full w-full max-h-full max-w-full" />
        </motion.div>
      </AnimatePresence>

      {/* Bottom soft caption strip — keeps hand-drawn feel without an image overlay */}
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 ${isHeader ? "h-14" : "h-20"} bg-gradient-to-t from-cream via-cream/90 to-transparent`} />

      <AnimatePresence mode="wait">
        <motion.div
          key={`cap-${v.captionKey}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={
            isHeader
              ? "absolute inset-x-4 bottom-3 sm:inset-x-6 sm:bottom-5"
              : "absolute inset-x-6 bottom-6"
          }
        >
          <div className="mb-1 flex items-center gap-2 sm:mb-2">
            <span className="h-px w-6 bg-primary-deep/60 sm:w-8" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary-deep sm:text-xs">
              {String(safeIndex + 1).padStart(2, "0")}
            </span>
          </div>
          <p
            className={`font-arabic text-balance font-semibold leading-snug text-primary-deep ${
              isHeader ? "text-sm sm:text-base" : "text-base sm:text-lg"
            }`}
          >
            {t(v.captionKey)}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/** Final celebration sketch shown after the wizard is completed. */
export const WizardFinalSketch = ({ className }: { className?: string }) => (
  <WizardSceneFinal className={className} />
);
