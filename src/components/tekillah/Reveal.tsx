// ---------------------------------------------------------------------------
// Reveal — scroll-triggered fade-up wrapper using the brand luxury easing.
// Wrap any section block to get the signature TKLH entrance animation.
// Honours prefers-reduced-motion: skips the transform/opacity ramp entirely.
// ---------------------------------------------------------------------------

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Stagger delay in seconds (e.g. 0.15 for a sequence). */
  delay?: number;
  /** Distance to translate from. Defaults to 30px. */
  y?: number;
  className?: string;
}

const buildVariants = (y: number, delay: number): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  },
});

export const Reveal = ({ children, delay = 0, y = 30, className = "" }: Props) => {
  const reduce = useReducedMotion();
  // Reduced-motion users get instant content without the slide.
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={buildVariants(y, delay)}
      className={className}
    >
      {children}
    </motion.div>
  );
};
