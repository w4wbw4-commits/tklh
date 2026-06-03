import { motion } from "framer-motion";
import logoAsset from "@/assets/tklh-logo.png.asset.json";

/**
 * Official TKLH logo — exact brand artwork (wordmark + chair mark).
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
        className="h-10 w-auto object-contain sm:h-11"
        loading="eager"
        decoding="async"
      />
    </motion.div>
  );
};
