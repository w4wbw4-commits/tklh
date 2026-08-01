// ---------------------------------------------------------------------------
// Reveal — scroll-triggered fade-up wrapper using the brand luxury easing.
// Wrap any section block to get the signature TKLH entrance animation.
// Honours prefers-reduced-motion: skips the transform/opacity ramp entirely.
// ---------------------------------------------------------------------------

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  children: ReactNode;
  /** Stagger delay in seconds (e.g. 0.15 for a sequence). */
  delay?: number;
  /** Distance to translate from. Defaults to 30px. */
  y?: number;
  className?: string;
}

// Site-wide motion rules: single curve (no bounce), 300-500ms max, triggered
// as soon as 15% of the element enters the viewport, 60-100ms stagger.
const buildVariants = (y: number, delay: number, duration: number): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.4, 0, 0.2, 1] },
  },
});

export const Reveal = ({ children, delay = 0, y = 16, className = "" }: Props) => {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  // Reduced-motion users (and mobile) get instant content without the slide.
  if (reduce || isMobile) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={buildVariants(y, Math.min(delay, 0.3), 0.4)}
      className={className}
    >
      {children}
    </motion.div>
  );
};

