import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type CSSProperties } from "react";

// ---------------------------------------------------------------------------
// SketchArt — reusable luxury line-art elements rendered as SVG.
// Each path "draws itself" when scrolled into view (stroke-dashoffset trick).
// Olive ink (#1A3A1A area = primary-deep) with subtle gold accents.
// ---------------------------------------------------------------------------

const drawVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2.4, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.6, delay: i * 0.15 },
    },
  }),
};

type SketchProps = {
  className?: string;
  style?: CSSProperties;
  ariaHidden?: boolean;
};

const useDraw = () => {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return { ref, animate: inView ? "visible" : "hidden" };
};

const olive = "hsl(var(--primary-deep))";
const gold = "hsl(var(--gold))";

// --- Wedding arch (hero centerpiece) ----------------------------------------
export const SketchArch = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  return (
    <svg
      ref={ref}
      viewBox="0 0 600 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    >
      {/* Floor line */}
      <motion.line
        x1="40" y1="440" x2="560" y2="440"
        stroke={olive} strokeWidth="1.2" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0}
      />
      {/* Left column */}
      <motion.path
        d="M150 440 L150 180 Q150 150 175 140"
        stroke={olive} strokeWidth="1.6" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1}
      />
      {/* Right column */}
      <motion.path
        d="M450 440 L450 180 Q450 150 425 140"
        stroke={olive} strokeWidth="1.6" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1}
      />
      {/* Arch top */}
      <motion.path
        d="M175 140 Q300 30 425 140"
        stroke={olive} strokeWidth="1.8" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={2}
      />
      {/* Floral cluster left */}
      <motion.path
        d="M180 140 q-10 -18 -28 -22 q14 -6 22 -22 q6 18 24 24 q-12 6 -18 20 z"
        stroke={olive} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={3}
      />
      <motion.path
        d="M155 110 q-12 6 -22 0 M170 90 q-6 -10 0 -22"
        stroke={olive} strokeWidth="1" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={3.4}
      />
      {/* Floral cluster right */}
      <motion.path
        d="M420 140 q10 -18 28 -22 q-14 -6 -22 -22 q-6 18 -24 24 q12 6 18 20 z"
        stroke={olive} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={3}
      />
      <motion.path
        d="M445 110 q12 6 22 0 M430 90 q6 -10 0 -22"
        stroke={olive} strokeWidth="1" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={3.4}
      />
      {/* Hanging strand center (gold accent) */}
      <motion.path
        d="M300 60 Q295 100 305 140 Q298 180 302 220"
        stroke={gold} strokeWidth="1" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={4}
      />
      {/* Tiny gold drops */}
      <motion.circle cx="300" cy="230" r="3" fill={gold}
        initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }}
        transition={{ delay: 1.6, duration: 0.6 }} />
      <motion.circle cx="282" cy="200" r="2" fill={gold}
        initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }}
        transition={{ delay: 1.8, duration: 0.6 }} />
      <motion.circle cx="318" cy="200" r="2" fill={gold}
        initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }}
        transition={{ delay: 1.8, duration: 0.6 }} />
    </svg>
  );
};

// --- Palm tree --------------------------------------------------------------
export const SketchPalm = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  return (
    <svg ref={ref} viewBox="0 0 200 280" fill="none" className={className} style={style} aria-hidden={ariaHidden}>
      {/* Trunk */}
      <motion.path
        d="M100 270 Q96 200 102 140 Q98 100 100 70"
        stroke={olive} strokeWidth="1.6" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0}
      />
      {/* Trunk rings */}
      {[230, 200, 170, 140, 110].map((y, i) => (
        <motion.path key={y}
          d={`M${94 + (i % 2)} ${y} q6 -3 12 0`}
          stroke={olive} strokeWidth="0.9" strokeLinecap="round"
          variants={drawVariants} initial="hidden" animate={animate} custom={0.3 + i * 0.05}
        />
      ))}
      {/* Fronds */}
      <motion.path d="M100 70 Q40 40 10 60 Q50 50 100 78" stroke={olive} strokeWidth="1.2" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1} />
      <motion.path d="M100 70 Q160 40 190 60 Q150 50 100 78" stroke={olive} strokeWidth="1.2" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.1} />
      <motion.path d="M100 70 Q70 20 50 0 Q80 30 102 70" stroke={olive} strokeWidth="1.2" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.2} />
      <motion.path d="M100 70 Q130 20 150 0 Q120 30 98 70" stroke={olive} strokeWidth="1.2" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.3} />
      <motion.path d="M100 70 Q60 60 20 90 Q70 70 100 80" stroke={olive} strokeWidth="1" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.4} />
      <motion.path d="M100 70 Q140 60 180 90 Q130 70 100 80" stroke={olive} strokeWidth="1" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.5} />
      {/* Gold dates */}
      <motion.circle cx="96" cy="86" r="2" fill={gold}
        initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }} transition={{ delay: 1.8 }} />
      <motion.circle cx="104" cy="90" r="2" fill={gold}
        initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }} transition={{ delay: 1.9 }} />
      <motion.circle cx="100" cy="80" r="2" fill={gold}
        initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }} transition={{ delay: 2.0 }} />
    </svg>
  );
};

// --- Floral spray (hibiscus-like) -------------------------------------------
export const SketchFloral = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  return (
    <svg ref={ref} viewBox="0 0 240 200" fill="none" className={className} style={style} aria-hidden={ariaHidden}>
      <motion.path d="M30 170 Q90 150 130 100 Q160 60 210 40"
        stroke={olive} strokeWidth="1.2" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0} />
      {/* Petals */}
      <motion.path
        d="M120 100 q-22 -10 -28 -32 q22 -8 38 6 q-2 16 -10 26 z"
        stroke={olive} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1} />
      <motion.path
        d="M130 95 q22 -2 36 -22 q-4 22 -22 32 q-12 -2 -16 -10 z"
        stroke={olive} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.2} />
      <motion.path
        d="M125 110 q-18 14 -42 12 q14 -18 36 -22 z"
        stroke={olive} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.4} />
      {/* Stamen */}
      <motion.circle cx="125" cy="100" r="2.5" fill={gold}
        initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }} transition={{ delay: 1.6 }} />
      {/* Leaves */}
      <motion.path d="M70 160 q-10 -22 6 -38 q14 16 -2 38" stroke={olive} strokeWidth="1" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.6} />
      <motion.path d="M180 70 q14 -8 28 4 q-12 14 -28 -2" stroke={olive} strokeWidth="1" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.8} />
    </svg>
  );
};

// --- Banquet table ----------------------------------------------------------
export const SketchTable = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  return (
    <svg ref={ref} viewBox="0 0 320 200" fill="none" className={className} style={style} aria-hidden={ariaHidden}>
      {/* Table top */}
      <motion.ellipse cx="160" cy="120" rx="130" ry="18"
        stroke={olive} strokeWidth="1.4"
        variants={drawVariants} initial="hidden" animate={animate} custom={0} />
      {/* Drape */}
      <motion.path d="M30 120 Q40 170 60 180 M290 120 Q280 170 260 180 M160 138 L160 195"
        stroke={olive} strokeWidth="1.1" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0.5} />
      {/* Centerpiece base */}
      <motion.path d="M140 110 q20 -6 40 0 l-6 -22 q-14 -4 -28 0 z"
        stroke={olive} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1} />
      {/* Flowers */}
      <motion.path d="M160 86 q-12 -10 -8 -24 q14 0 16 14 M160 86 q12 -10 8 -24 q-14 0 -16 14 M160 70 q-6 -10 0 -22 q6 12 0 22"
        stroke={olive} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.3} />
      {/* Candles */}
      <motion.path d="M105 110 l0 -28 M215 110 l0 -28"
        stroke={olive} strokeWidth="1" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.5} />
      <motion.path d="M105 82 q-3 -6 0 -10 q3 4 0 10 z M215 82 q-3 -6 0 -10 q3 4 0 10 z"
        fill={gold} stroke={gold} strokeWidth="0.8"
        initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }} transition={{ delay: 1.8 }} />
    </svg>
  );
};

// --- Hairline divider with star (gold) --------------------------------------
export const SketchDivider = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-3 ${className ?? ""}`}>
    <span className="h-px w-24 bg-gradient-to-r from-transparent via-gold/70 to-gold" />
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
      <path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z"
        fill={gold} />
    </svg>
    <span className="h-px w-24 bg-gradient-to-l from-transparent via-gold/70 to-gold" />
  </div>
);
