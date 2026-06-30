import { motion } from "framer-motion";
import chairIcon from "@/assets/tklh-chair.png";

/**
 * Brand Logo — chair icon + Arabic wordmark side-by-side.
 */
export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex items-center gap-2 leading-none ${className}`}
      aria-label="TKLH تِكله"
    >
      <img
        src={chairIcon}
        alt=""
        aria-hidden="true"
        className="h-9 w-auto sm:h-10 object-contain select-none"
        draggable={false}
      />
      <div className="flex flex-col items-center leading-none">
        <span className="font-cinzel font-bold uppercase tracking-[0.18em] text-xs sm:text-sm text-current">
          TKLH
        </span>
        <span className="font-wordmark text-base sm:text-lg font-black text-current">
          تِكله
        </span>
      </div>
    </motion.div>
  );
};
