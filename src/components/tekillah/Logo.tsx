import { motion } from "framer-motion";
import logoAsset from "@/assets/tklh-logo.png.asset.json";

/**
 * Official TKLH logo — exact brand artwork (wordmark + chair mark) on a
 * transparent background. In dark mode the dark-olive ink is inverted to a
 * warm cream so it stays readable against the dark canvas.
 */
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
        className="h-9 w-auto object-contain transition-[filter] duration-300 sm:h-10 dark:brightness-[2.4] dark:contrast-110 dark:saturate-50"
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </motion.div>
  );
};
