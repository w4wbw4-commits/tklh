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
const brown = "hsl(var(--brown))";
const brownSoft = "hsl(var(--brown-soft))";

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

// --- Ginkgo leaf fan (corner accent, inspired by ref) ----------------------
export const SketchGinkgo = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  // Fan-shaped ginkgo leaf with radiating ribs.
  const ribs = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10; // 0..1
    const angle = -70 + t * 140; // -70deg .. 70deg
    const rad = (angle * Math.PI) / 180;
    const cx = 110, cy = 200;
    const len = 150;
    const x2 = cx + Math.sin(rad) * len;
    const y2 = cy - Math.cos(rad) * len;
    return { d: `M${cx} ${cy} L${x2.toFixed(1)} ${y2.toFixed(1)}`, i };
  });
  return (
    <svg ref={ref} viewBox="0 0 220 240" fill="none" className={className} style={style} aria-hidden={ariaHidden}>
      {/* Stem (brown) */}
      <motion.path d="M110 235 Q108 218 110 200"
        stroke={brown} strokeWidth="1.6" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0} />
      {/* Outer fan outline — olive ink with soft gold wash */}
      <motion.path
        d="M30 110 Q40 50 110 30 Q180 50 190 110 Q170 130 110 134 Q50 130 30 110 Z"
        stroke={olive} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
        fill={gold} fillOpacity={0.08}
        variants={drawVariants} initial="hidden" animate={animate} custom={0.4} />
      {/* Ribs — alternating olive / brown for depth */}
      {ribs.map((r) => (
        <motion.path key={r.i} d={r.d}
          stroke={r.i % 3 === 0 ? brownSoft : olive} strokeWidth="0.8" strokeLinecap="round"
          variants={drawVariants} initial="hidden" animate={animate} custom={0.8 + r.i * 0.05} />
      ))}
      {/* Notch (brown) */}
      <motion.path d="M100 50 Q110 60 120 50" stroke={brown} strokeWidth="1" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.6} />
    </svg>
  );
};

// --- Candelabra (bottom accent) ---------------------------------------------
export const SketchCandelabra = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  return (
    <svg ref={ref} viewBox="0 0 220 280" fill="none" className={className} style={style} aria-hidden={ariaHidden}>
      {/* Base — antique brown */}
      <motion.path d="M70 270 L150 270 M85 270 L85 260 Q110 254 135 260 L135 270"
        stroke={brown} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0} />
      {/* Stem with knobs — brown */}
      <motion.path d="M110 260 L110 130 M104 230 q6 -4 12 0 M104 200 q6 -4 12 0 M100 170 q10 -6 20 0"
        stroke={brown} strokeWidth="1.4" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0.4} />
      {/* Cross arms — brown */}
      <motion.path d="M110 140 Q70 120 50 90 M110 140 Q150 120 170 90 M110 140 L110 90"
        stroke={brown} strokeWidth="1.4" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0.9} />
      {/* Cups — gold accent */}
      <motion.path d="M44 90 q6 -4 12 0 M104 90 q6 -4 12 0 M164 90 q6 -4 12 0"
        stroke={gold} strokeWidth="1.4" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.2} />
      {/* Candles — soft cream/olive */}
      <motion.path d="M50 90 L50 50 M110 90 L110 40 M170 90 L170 50"
        stroke={olive} strokeWidth="1.1" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.4} />
      {/* Wicks — brown */}
      <motion.path d="M50 50 L50 44 M110 40 L110 34 M170 50 L170 44"
        stroke={brown} strokeWidth="0.9" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.7} />
      {/* Flames (gold) */}
      {[
        { cx: 50, cy: 38 },
        { cx: 110, cy: 28 },
        { cx: 170, cy: 38 },
      ].map((f, i) => (
        <motion.path key={i}
          d={`M${f.cx} ${f.cy + 8} q-4 -4 0 -10 q4 6 0 10 z`}
          fill={gold} stroke={gold} strokeWidth="0.6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: animate === "visible" ? [0, 1, 0.85, 1] : 0,
            scale: animate === "visible" ? [0.8, 1.05, 0.95, 1] : 0.8,
          }}
          transition={{ delay: 1.9 + i * 0.1, duration: 1.6, repeat: Infinity, repeatType: "reverse" }}
          style={{ transformOrigin: `${f.cx}px ${f.cy + 4}px` }}
        />
      ))}
    </svg>
  );
};

// --- Leafy branch (top accent) ----------------------------------------------
export const SketchBranch = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  const leaves = [
    { x: 70, y: 60, r: -25 }, { x: 110, y: 75, r: 20 },
    { x: 150, y: 60, r: -15 }, { x: 190, y: 90, r: 30 },
    { x: 230, y: 70, r: -10 }, { x: 270, y: 100, r: 25 },
    { x: 90, y: 100, r: 40 }, { x: 170, y: 110, r: -30 },
    { x: 240, y: 120, r: 50 },
  ];
  return (
    <svg ref={ref} viewBox="0 0 320 180" fill="none" className={className} style={style} aria-hidden={ariaHidden}>
      <motion.path d="M10 30 Q80 50 150 60 Q230 70 310 110"
        stroke={brown} strokeWidth="1.5" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0} />
      {leaves.map((l, i) => (
        <motion.path key={i}
          d={`M${l.x} ${l.y} q-8 -10 0 -22 q8 12 0 22 z`}
          stroke={olive} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
          fill={olive} fillOpacity={0.05}
          transform={`rotate(${l.r} ${l.x} ${l.y - 11})`}
          variants={drawVariants} initial="hidden" animate={animate} custom={0.4 + i * 0.08} />
      ))}
    </svg>
  );
};

// --- Banquet table with chairs (centerpiece) --------------------------------
export const SketchBanquet = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  const chairXs = [60, 110, 160, 210, 260, 310, 360, 410];
  return (
    <svg ref={ref} viewBox="0 0 480 220" fill="none" className={className} style={style} aria-hidden={ariaHidden}>
      {/* Table top — wood brown with subtle gold wash */}
      <motion.path d="M40 130 L440 130 L420 160 L60 160 Z"
        stroke={brown} strokeWidth="1.5" strokeLinejoin="round"
        fill={gold} fillOpacity={0.08}
        variants={drawVariants} initial="hidden" animate={animate} custom={0} />
      {/* Runner */}
      <motion.path d="M70 145 L410 145"
        stroke={gold} strokeWidth="0.9" strokeLinecap="round" strokeDasharray="2 4"
        variants={drawVariants} initial="hidden" animate={animate} custom={0.6} />
      {/* Centerpieces (florals) */}
      {[140, 240, 340].map((x, i) => (
        <g key={x}>
          <motion.path d={`M${x} 130 q-10 -8 -6 -22 q14 0 12 16 M${x} 130 q10 -8 6 -22 q-14 0 -12 16 M${x} 116 q-4 -8 0 -18 q4 8 0 18`}
            stroke={olive} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={0.8 + i * 0.1} />
          <motion.circle cx={x} cy="105" r="2" fill={gold}
            initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }} transition={{ delay: 1.8 + i * 0.1 }} />
        </g>
      ))}
      {/* Tall candles */}
      {[100, 200, 300, 400].map((x, i) => (
        <g key={x}>
          <motion.path d={`M${x} 130 L${x} 70`} stroke={olive} strokeWidth="1" strokeLinecap="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={1 + i * 0.05} />
          <motion.path d={`M${x} 70 q-3 -5 0 -9 q3 4 0 9 z`} fill={gold} stroke={gold} strokeWidth="0.5"
            initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? [0, 1, 0.85, 1] : 0 }}
            transition={{ delay: 1.8 + i * 0.1, duration: 1.4, repeat: Infinity, repeatType: "reverse" }} />
        </g>
      ))}
      {/* Chairs (round-back) */}
      {chairXs.map((x, i) => (
        <g key={x}>
          <motion.path d={`M${x - 14} 165 q14 -22 28 0`}
            stroke={olive} strokeWidth="1.1" strokeLinecap="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={1.2 + i * 0.05} />
          <motion.path d={`M${x - 14} 165 L${x - 14} 200 L${x + 14} 200 L${x + 14} 165`}
            stroke={olive} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={1.3 + i * 0.05} />
          <motion.path d={`M${x - 12} 200 L${x - 12} 215 M${x + 12} 200 L${x + 12} 215`}
            stroke={olive} strokeWidth="0.9" strokeLinecap="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={1.4 + i * 0.05} />
        </g>
      ))}
    </svg>
  );
};

// --- Tied-back classical curtain (slim side accent) ------------------------
// A narrow drape gathered at the middle by a tieback, hourglass silhouette.
// Kilim diamonds run softly along the upper and lower halves.
export const SketchCurtain = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  // Motifs along the drape — fewer + smaller for a softer feel
  const upperMotifs = [110, 200, 290];
  const lowerMotifs = [640, 740, 850];
  return (
    <svg
      ref={ref}
      viewBox="0 0 90 1000"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    >
      <defs>
        <linearGradient id="curtain-fade-soft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--cream))" stopOpacity="1" />
          <stop offset="80%" stopColor="hsl(var(--cream))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--cream))" stopOpacity="0" />
        </linearGradient>
        <mask id="curtain-mask-soft">
          <rect width="90" height="1000" fill="url(#curtain-fade-soft)" />
        </mask>
      </defs>

      <g mask="url(#curtain-mask-soft)">
        {/* Curtain rod */}
        <motion.path d="M4 14 L86 14"
          stroke={brown} strokeWidth="1.1" strokeLinecap="round"
          variants={drawVariants} initial="hidden" animate={animate} custom={0} />
        <motion.circle cx="6" cy="14" r="2.2" stroke={gold} strokeWidth="0.7" fill={gold} fillOpacity={0.25}
          initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }} transition={{ delay: 0.2 }} />
        <motion.circle cx="84" cy="14" r="2.2" stroke={gold} strokeWidth="0.7" fill={gold} fillOpacity={0.25}
          initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }} transition={{ delay: 0.2 }} />

        {/* Curtain rings */}
        {[16, 30, 44, 58, 72].map((x, i) => (
          <motion.circle key={x} cx={x} cy="20" r="2.2" stroke={brown} strokeWidth="0.6" fill="none"
            variants={drawVariants} initial="hidden" animate={animate} custom={0.1 + i * 0.04} />
        ))}

        {/* Drape silhouette — hourglass: wider top & bottom, cinched at y=470 (tieback) */}
        {/* Left edge */}
        <motion.path
          d="M8 26 Q4 240 30 470 Q4 720 12 950"
          stroke={brown} strokeWidth="0.8" fill="none" strokeLinejoin="round"
          variants={drawVariants} initial="hidden" animate={animate} custom={0.4} />
        {/* Right edge */}
        <motion.path
          d="M82 26 Q86 240 60 470 Q86 720 78 950"
          stroke={brown} strokeWidth="0.8" fill="none" strokeLinejoin="round"
          variants={drawVariants} initial="hidden" animate={animate} custom={0.4} />
        {/* Soft fabric fill */}
        <motion.path
          d="M8 26 Q4 240 30 470 Q4 720 12 950 L78 950 Q86 720 60 470 Q86 240 82 26 Z"
          fill={gold} fillOpacity={0.05} stroke="none"
          initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }} transition={{ delay: 0.5, duration: 1 }} />

        {/* Pleat lines — follow the hourglass curve, very subtle */}
        {[24, 36, 48, 60, 72].map((x, i) => {
          const offsetTop = (x - 45) * 0.6;
          const offsetBot = (x - 45) * 0.6;
          return (
            <motion.path key={x}
              d={`M${x} 28 Q${45 + offsetTop * 0.4} 240 ${45 + (x - 45) * 0.35} 470 Q${45 + offsetBot * 0.4} 720 ${x} 945`}
              stroke={olive} strokeWidth="0.4" fill="none" strokeLinecap="round" opacity={0.5}
              variants={drawVariants} initial="hidden" animate={animate} custom={0.5 + i * 0.05} />
          );
        })}

        {/* Tieback band — thick gold rope wrapping at y=470 */}
        <motion.path
          d="M28 462 Q45 458 62 462 Q66 470 62 478 Q45 482 28 478 Q24 470 28 462 Z"
          stroke={gold} strokeWidth="1.2" fill={gold} fillOpacity={0.18} strokeLinejoin="round"
          variants={drawVariants} initial="hidden" animate={animate} custom={1.1} />
        {/* Knot detail */}
        <motion.path
          d="M40 466 Q45 472 50 466 M40 474 Q45 468 50 474"
          stroke={brown} strokeWidth="0.6" fill="none" strokeLinecap="round"
          variants={drawVariants} initial="hidden" animate={animate} custom={1.2} />
        {/* Tassel hanging from the knot */}
        <motion.path
          d="M45 482 L45 510 M42 484 L42 508 M48 484 L48 508"
          stroke={gold} strokeWidth="0.6" strokeLinecap="round"
          variants={drawVariants} initial="hidden" animate={animate} custom={1.3} />
        <motion.circle cx="45" cy="513" r="2.5" fill={gold}
          initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }} transition={{ delay: 1.4 }} />

        {/* Kilim diamond motifs — upper half */}
        {upperMotifs.map((cy, i) => {
          const accent = i % 2 === 0 ? brown : olive;
          const cx = 45;
          const w = 14 - i * 2; // smaller toward the cinch
          return (
            <g key={`u-${cy}`}>
              <motion.path
                d={`M${cx} ${cy - w} L${cx + w} ${cy} L${cx} ${cy + w} L${cx - w} ${cy} Z`}
                stroke={accent} strokeWidth="0.6" fill={accent} fillOpacity={0.08} strokeLinejoin="round"
                variants={drawVariants} initial="hidden" animate={animate} custom={0.7 + i * 0.05} />
              <motion.path
                d={`M${cx - 2} ${cy} L${cx + 2} ${cy} M${cx} ${cy - 2} L${cx} ${cy + 2}`}
                stroke={gold} strokeWidth="0.5" strokeLinecap="round"
                variants={drawVariants} initial="hidden" animate={animate} custom={0.85 + i * 0.05} />
            </g>
          );
        })}

        {/* Kilim motifs — lower half */}
        {lowerMotifs.map((cy, i) => {
          const accent = i % 2 === 0 ? olive : brown;
          const cx = 45;
          const w = 10 + i * 2; // grow downward
          return (
            <g key={`l-${cy}`}>
              <motion.path
                d={`M${cx} ${cy - w} L${cx + w} ${cy} L${cx} ${cy + w} L${cx - w} ${cy} Z`}
                stroke={accent} strokeWidth="0.6" fill={accent} fillOpacity={0.08} strokeLinejoin="round"
                variants={drawVariants} initial="hidden" animate={animate} custom={1.4 + i * 0.05} />
              <motion.path
                d={`M${cx - 2} ${cy} L${cx + 2} ${cy} M${cx} ${cy - 2} L${cx} ${cy + 2}`}
                stroke={gold} strokeWidth="0.5" strokeLinecap="round"
                variants={drawVariants} initial="hidden" animate={animate} custom={1.55 + i * 0.05} />
            </g>
          );
        })}

        {/* Bottom hem — soft scallop */}
        <motion.path
          d="M12 945 Q26 955 40 947 Q54 955 68 947 Q76 952 78 950"
          stroke={brown} strokeWidth="0.6" fill="none" strokeLinecap="round" strokeLinejoin="round"
          variants={drawVariants} initial="hidden" animate={animate} custom={1.7} />
        {/* Light fringe */}
        {[16, 24, 32, 40, 48, 56, 64, 72].map((x, i) => (
          <motion.path key={x}
            d={`M${x} 952 L${x} 962`}
            stroke={brown} strokeWidth="0.45" strokeLinecap="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={1.8 + i * 0.02} />
        ))}
      </g>
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

// --- Wedding banquet side table (long, draped, candelabra + lush florals) --
// Inspired by formal wedding setups: long rectangular table with floor-length
// linen, a large 5-arm candelabra centerpiece, soft eucalyptus + flowers,
// and tall taper candles flanking it.
export const SketchSideTable = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  // 5-arm candelabra arm endpoints (relative to center x=200)
  const arms = [
    { x: 130, y: 150 }, // far left
    { x: 165, y: 130 }, // mid left
    { x: 200, y: 110 }, // center (tallest)
    { x: 235, y: 130 }, // mid right
    { x: 270, y: 150 }, // far right
  ];
  // Side taper candles
  const tapers = [
    { x: 80, h: 90 }, { x: 105, h: 120 },
    { x: 295, h: 120 }, { x: 320, h: 90 },
  ];
  return (
    <svg ref={ref} viewBox="0 0 400 420" fill="none" className={className} style={style} aria-hidden={ariaHidden}>
      {/* ===== Candelabra ===== */}
      {/* Base */}
      <motion.path d="M180 290 L220 290 M186 290 L186 282 Q200 277 214 282 L214 290"
        stroke={brown} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0} />
      {/* Stem with knobs */}
      <motion.path d="M200 282 L200 175 M194 260 q6 -4 12 0 M194 230 q6 -4 12 0 M192 200 q8 -4 16 0"
        stroke={brown} strokeWidth="1.5" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0.3} />
      {/* Curved arms reaching out to each cup */}
      <motion.path
        d="M200 175 Q165 165 130 150 M200 175 Q183 160 165 130 M200 175 L200 110 M200 175 Q217 160 235 130 M200 175 Q235 165 270 150"
        stroke={brown} strokeWidth="1.4" fill="none" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0.7} />
      {/* Cups (gold) + tall candles + flames */}
      {arms.map((a, i) => (
        <g key={i}>
          {/* cup */}
          <motion.path d={`M${a.x - 6} ${a.y} q6 -4 12 0`}
            stroke={gold} strokeWidth="1.4" strokeLinecap="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={1.0 + i * 0.05} />
          {/* candle */}
          <motion.path d={`M${a.x} ${a.y} L${a.x} ${a.y - 50}`}
            stroke={olive} strokeWidth="1.2" strokeLinecap="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={1.15 + i * 0.05} />
          {/* wick */}
          <motion.path d={`M${a.x} ${a.y - 50} L${a.x} ${a.y - 56}`}
            stroke={brown} strokeWidth="0.9" strokeLinecap="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={1.3 + i * 0.05} />
          {/* flame */}
          <motion.path
            d={`M${a.x} ${a.y - 48} q-4 -5 0 -12 q4 7 0 12 z`}
            fill={gold} stroke={gold} strokeWidth="0.6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: animate === "visible" ? [0, 1, 0.85, 1] : 0,
              scale: animate === "visible" ? [0.8, 1.05, 0.95, 1] : 0.8,
            }}
            transition={{ delay: 1.6 + i * 0.1, duration: 1.6, repeat: Infinity, repeatType: "reverse" }}
            style={{ transformOrigin: `${a.x}px ${a.y - 52}px` }}
          />
        </g>
      ))}

      {/* ===== Floral garland at base of candelabra ===== */}
      {/* Lush spray of leaves & flowers spilling left + right across the table */}
      <motion.path
        d="M120 285 Q160 275 200 282 Q240 275 280 285"
        stroke={olive} strokeWidth="1" fill="none" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0.6} />
      {/* Eucalyptus leaves spreading outward */}
      {[
        { x: 110, y: 282, r: -40 }, { x: 130, y: 278, r: -25 },
        { x: 150, y: 276, r: -10 }, { x: 175, y: 274, r: 5 },
        { x: 225, y: 274, r: -5 }, { x: 250, y: 276, r: 10 },
        { x: 270, y: 278, r: 25 }, { x: 290, y: 282, r: 40 },
        { x: 140, y: 290, r: -50 }, { x: 260, y: 290, r: 50 },
      ].map((l, i) => (
        <motion.path key={`gl-${i}`}
          d={`M${l.x} ${l.y} q-5 -10 0 -20 q5 10 0 20 z`}
          stroke={olive} strokeWidth="0.7" fill={olive} fillOpacity={0.1} strokeLinejoin="round"
          transform={`rotate(${l.r} ${l.x} ${l.y - 10})`}
          variants={drawVariants} initial="hidden" animate={animate} custom={0.9 + i * 0.04} />
      ))}
      {/* Roses (gold + brown) along the garland */}
      {[
        { x: 155, y: 282 }, { x: 200, y: 280 }, { x: 245, y: 282 },
      ].map((p, i) => (
        <g key={`rose-${i}`}>
          <motion.circle cx={p.x} cy={p.y} r="4.5"
            stroke={brown} strokeWidth="0.7" fill={gold} fillOpacity={0.18}
            variants={drawVariants} initial="hidden" animate={animate} custom={1.3 + i * 0.1} />
          <motion.path d={`M${p.x - 2} ${p.y} q2 -3 4 0 q-2 3 -4 0 z`}
            stroke={brown} strokeWidth="0.5" fill="none"
            variants={drawVariants} initial="hidden" animate={animate} custom={1.45 + i * 0.1} />
        </g>
      ))}

      {/* ===== Side taper candles ===== */}
      {tapers.map((c, i) => (
        <g key={`tp-${i}`}>
          {/* holder */}
          <motion.path d={`M${c.x - 5} 290 L${c.x + 5} 290 M${c.x - 4} 290 L${c.x - 4} 285 Q${c.x} 282 ${c.x + 4} 285 L${c.x + 4} 290`}
            stroke={brown} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={0.4 + i * 0.05} />
          {/* candle */}
          <motion.path d={`M${c.x} 285 L${c.x} ${285 - c.h}`}
            stroke={olive} strokeWidth="1.1" strokeLinecap="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={0.55 + i * 0.05} />
          {/* wick */}
          <motion.path d={`M${c.x} ${285 - c.h} L${c.x} ${285 - c.h - 5}`}
            stroke={brown} strokeWidth="0.8" strokeLinecap="round"
            variants={drawVariants} initial="hidden" animate={animate} custom={0.7 + i * 0.05} />
          {/* flame */}
          <motion.path
            d={`M${c.x} ${285 - c.h + 3} q-3 -4 0 -10 q3 6 0 10 z`}
            fill={gold} stroke={gold} strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: animate === "visible" ? [0, 1, 0.85, 1] : 0 }}
            transition={{ delay: 1.4 + i * 0.12, duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          />
        </g>
      ))}

      {/* ===== Long rectangular wedding table ===== */}
      {/* Table top — perspective rectangle */}
      <motion.path
        d="M30 295 L370 295 L355 315 L45 315 Z"
        stroke={brown} strokeWidth="1.3" fill={gold} fillOpacity={0.08} strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.6} />
      {/* Gold runner on the table top */}
      <motion.path d="M75 305 L325 305"
        stroke={gold} strokeWidth="0.8" strokeLinecap="round" strokeDasharray="3 5"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.8} />
      {/* Floor-length linen drape */}
      <motion.path
        d="M45 315 Q35 360 30 410 L370 410 Q365 360 355 315"
        stroke={brown} strokeWidth="1" fill={gold} fillOpacity={0.05} strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={1.9} />
      {/* Soft drape pleats falling down */}
      {[60, 100, 140, 180, 220, 260, 300, 340].map((x, i) => (
        <motion.path key={`pl-${x}`}
          d={`M${x} 318 Q${x + (x < 200 ? -2 : 2)} 365 ${x + (x < 200 ? -4 : 4)} 408`}
          stroke={olive} strokeWidth="0.4" fill="none" opacity={0.45}
          variants={drawVariants} initial="hidden" animate={animate} custom={2.0 + i * 0.04} />
      ))}
      {/* Soft swag along the front of the linen */}
      <motion.path
        d="M45 320 Q120 345 200 332 Q280 345 355 320"
        stroke={gold} strokeWidth="0.7" fill="none" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={2.2} />
    </svg>
  );
};

// --- Eucalyptus / leafy branch (slim soft accent) --------------------------
export const SketchEucalyptus = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  const leaves = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const x = 30 + t * 240;
    const y = 30 + Math.sin(t * Math.PI) * 70 + t * 20;
    const side = i % 2 === 0 ? -1 : 1;
    return { x, y, side, rot: side * (35 + (i % 3) * 10) };
  });
  return (
    <svg ref={ref} viewBox="0 0 300 180" fill="none" className={className} style={style} aria-hidden={ariaHidden}>
      <motion.path d="M10 40 Q90 90 180 100 Q240 105 290 130"
        stroke={brown} strokeWidth="0.9" fill="none" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0} />
      {leaves.map((l, i) => {
        const lx = l.x + l.side * 6;
        const ly = l.y + l.side * 6;
        return (
          <motion.path key={i}
            d={`M${lx} ${ly} q-6 -10 0 -20 q6 10 0 20 z`}
            stroke={olive} strokeWidth="0.7" fill={olive} fillOpacity={0.08} strokeLinejoin="round"
            transform={`rotate(${l.rot} ${lx} ${ly - 10})`}
            variants={drawVariants} initial="hidden" animate={animate} custom={0.3 + i * 0.07} />
        );
      })}
    </svg>
  );
};

// --- Lotus pad cluster (small bottom-corner accent) ------------------------
export const SketchLotus = ({ className, style, ariaHidden = true }: SketchProps) => {
  const { ref, animate } = useDraw();
  return (
    <svg ref={ref} viewBox="0 0 200 160" fill="none" className={className} style={style} aria-hidden={ariaHidden}>
      <motion.path
        d="M30 110 Q20 90 40 78 Q70 70 96 86 Q108 102 92 118 Q60 130 30 110 Z"
        stroke={olive} strokeWidth="0.9" fill={olive} fillOpacity={0.08} strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0} />
      <motion.path d="M62 96 L62 116 M70 92 L82 110 M54 92 L46 110"
        stroke={olive} strokeWidth="0.5" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0.4} />
      <motion.path
        d="M120 130 Q108 110 130 100 Q160 96 180 116 Q186 132 168 142 Q140 148 120 130 Z"
        stroke={olive} strokeWidth="0.9" fill={olive} fillOpacity={0.06} strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0.3} />
      <motion.path
        d="M100 80 q-8 -10 -2 -22 q8 6 6 18 M100 80 q8 -10 2 -22 q-8 6 -6 18 M100 80 q-3 -8 0 -22 q3 14 0 22"
        stroke={olive} strokeWidth="0.8" fill="none" strokeLinejoin="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0.6} />
      <motion.circle cx="100" cy="78" r="2" fill={gold}
        initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }} transition={{ delay: 1.2 }} />
      <motion.path d="M155 150 Q158 110 152 70 M170 150 Q172 120 168 88 M140 150 Q142 120 138 90"
        stroke={olive} strokeWidth="0.6" fill="none" strokeLinecap="round"
        variants={drawVariants} initial="hidden" animate={animate} custom={0.8} />
    </svg>
  );
};
