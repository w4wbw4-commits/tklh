import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { WaxSeal } from "./WaxSeal";

const LINES_AR = [
  "فريق تكله يراجع رؤيتك الآن...",
  "نبحث عن الأنسب لتاريخك بين مزودينا...",
  "نطابق التفاصيل بأسلوبك...",
  "نجهّز لك أفضل الاقتراحات...",
];
const LINES_EN = [
  "The Tklh team is reviewing your vision...",
  "Looking for the best fit for your date...",
  "Matching the details to your style...",
  "Preparing our best suggestions...",
];

/** Warm human-team transition shown between the vision step and the final screen. */
export const MatchingOverlay = ({ onDone }: { onDone: () => void }) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const lines = isAr ? LINES_AR : LINES_EN;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const step = setInterval(() => setIndex((i) => Math.min(i + 1, lines.length - 1)), 700);
    const done = setTimeout(onDone, 2800);
    return () => { clearInterval(step); clearTimeout(done); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[60] grid place-items-center bg-background/95 px-6 backdrop-blur-md"
    >
      <div className="flex flex-col items-center text-center">
        <WaxSeal size={120} />
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-sm font-arabic text-lg font-semibold text-foreground"
        >
          {lines[index]}
        </motion.p>
        <div className="mt-5 flex gap-1.5">
          {lines.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors duration-500 ${
                i <= index ? "bg-primary" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
