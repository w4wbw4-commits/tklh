// ---------------------------------------------------------------------------
// AiSearchingOverlay — the short "we're actually searching" moment shown right
// after the vision step, before the provider marketplace opens.
// Honours prefers-reduced-motion: one static line, no animation.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Props {
  /** Called once the sequence finishes. */
  onDone: () => void;
}

const STEP_MS = 900;

export const AiSearchingOverlay = ({ onDone }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const reduce = useReducedMotion();

  const lines = isAr
    ? ["نحلل رؤيتك...", "نبحث عن أنسب المزودين بتاريخك...", "نطابق التفاصيل بأسلوبك...", "نجهّز باقاتك..."]
    : [
        "Analysing your vision...",
        "Searching providers available on your date...",
        "Matching details to your style...",
        "Preparing your packages...",
      ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) {
      const t = window.setTimeout(onDone, 1200);
      return () => window.clearTimeout(t);
    }
    const tick = window.setInterval(() => {
      setIndex((i) => (i + 1 < lines.length ? i + 1 : i));
    }, STEP_MS);
    const finish = window.setTimeout(onDone, STEP_MS * lines.length);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[80] grid place-items-center bg-background/97 px-6"
    >
      <div className="flex flex-col items-center gap-7 text-center">
        {reduce ? (
          <span className="h-3 w-3 rounded-full bg-primary" aria-hidden />
        ) : (
          <span className="relative grid h-16 w-16 place-items-center" aria-hidden>
            <motion.span
              className="absolute inset-0 rounded-full border border-primary/30"
              animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0.2, 0.9] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute inset-2 rounded-full border border-primary/50"
              animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
            <motion.span
              className="h-3 w-3 rounded-full bg-primary"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        )}

        <div className="min-h-[2.2rem]">
          {reduce ? (
            <p className="font-arabic text-base text-foreground/85">{lines[lines.length - 1]}</p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="font-arabic text-base text-foreground/85 sm:text-lg"
              >
                {lines[index]}
              </motion.p>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
};
