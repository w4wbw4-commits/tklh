// ---------------------------------------------------------------------------
// ScrollProgress — fixed gradient bar at the top of the viewport that fills
// based on document scroll position. Subtle but adds a sense of progress and
// premium polish across long landing pages. Honours reduced-motion.
// ---------------------------------------------------------------------------

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

export const ScrollProgress = () => {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 22,
    mass: 0.4,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "left" }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] hidden h-[3px] bg-gradient-to-r from-primary via-gold to-primary md:block"
    />
  );

};
