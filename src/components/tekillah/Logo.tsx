import { motion } from "framer-motion";

/**
 * Brand Logo — premium stacked wordmark.
 *  ┌────────────┐
 *  │   TKLH     │  ← Cinzel serif, uppercase, tight tracking
 *  │   تِكله     │  ← Thmanyah Serif Display, Arabic wordmark
 *  └────────────┘
 */
export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex flex-col items-center justify-center gap-0.5 leading-none ${className}`}
      aria-label="TKLH تِكله"
    >
      <span
        className="font-cinzel font-bold uppercase tracking-[0.18em] text-[0.95rem] sm:text-base text-primary-deep"
        style={{ color: "hsl(var(--primary-deep))", WebkitTextFillColor: "hsl(var(--primary-deep))" }}
      >
        TKLH
      </span>
      <span
        className="font-wordmark text-lg sm:text-xl font-black text-primary-deep"
        style={{ color: "hsl(var(--primary-deep))", WebkitTextFillColor: "hsl(var(--primary-deep))" }}
      >
        تِكله
      </span>
    </motion.div>
  );
};
