import { motion } from "framer-motion";
import logoAsset from "@/assets/tklh-logo.png.asset.json";

/**
 * Official TKLH logo — exact brand artwork (wordmark + chair mark) on a
 * transparent background. In dark mode the dark-olive ink is recolored to a
 * warm gold via a tuned CSS filter so the mark feels luxurious on a dark canvas.
 */
const DARK_GOLD_FILTER =
  "invert(78%) sepia(38%) saturate(520%) hue-rotate(5deg) brightness(92%) contrast(92%) drop-shadow(0 0 8px hsl(var(--gold) / 0.25))";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center ${className}`}
    >
      <img
        src={logoAsset.url}
        alt="تِكلَه — TKLH"
        className="h-10 w-auto object-contain transition-[filter] duration-500 sm:h-11 dark:[filter:var(--logo-dark-filter)]"
        style={{ ["--logo-dark-filter" as never]: DARK_GOLD_FILTER }}
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </motion.div>
  );
};

