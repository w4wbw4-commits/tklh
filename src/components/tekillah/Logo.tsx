import { motion } from "framer-motion";
import logoAsset from "/tklh-logo-light.png";

/**
 * Brand Logo — official TKLH / تِكله lockup (Arabic wordmark + Latin "Tklh"
 * + chair mark) rendered as a single image so every surface uses the exact
 * approved typography, color, and spacing.
 */
export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex items-center leading-none ${className}`}
      aria-label="TKLH تِكله — Event Planning Platform"
    >
      <img
        src={logoAsset}
        alt="TKLH تِكله"
        className="h-8 w-auto sm:h-9 object-contain select-none"
        draggable={false}
      />

    </motion.div>
  );
};
