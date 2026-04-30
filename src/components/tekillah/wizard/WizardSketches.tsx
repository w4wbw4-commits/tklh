import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type CSSProperties } from "react";

// ---------------------------------------------------------------------------
// WizardSketches — full-scene & icon sketches dedicated to the planning wizard.
// Each scene tells the story of one step in olive ink + gold accents on cream.
// All paths self-draw on enter; ambient elements (candles, sparkles) loop softly.
// ---------------------------------------------------------------------------

const olive = "hsl(var(--primary-deep))";
const gold = "hsl(var(--gold))";
const brown = "hsl(var(--brown))";
const cream = "hsl(var(--cream))";

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2.0, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.5, delay: i * 0.12 },
    },
  }),
};

type Props = { className?: string; style?: CSSProperties };

const useDraw = () => {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  return { ref, animate: inView ? "visible" : "hidden" } as const;
};

// Shared <defs> snippets ----------------------------------------------------
const SceneDefs = ({ id }: { id: string }) => (
  <defs>
    <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={gold} stopOpacity="0.55" />
      <stop offset="45%" stopColor={gold} stopOpacity="0.18" />
      <stop offset="100%" stopColor={gold} stopOpacity="0" />
    </radialGradient>
    <radialGradient id={`${id}-bloom`} cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={gold} stopOpacity="0.32" />
      <stop offset="100%" stopColor={gold} stopOpacity="0" />
    </radialGradient>
    <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={cream} stopOpacity="0" />
      <stop offset="100%" stopColor={olive} stopOpacity="0.06" />
    </linearGradient>
  </defs>
);

// ===========================================================================
// SCENE 1 — DETAILS  (date, location, guests)
// A hand-drawn invitation card with seal, calendar marker and small map pin.
// ===========================================================================
export const WizardSceneDetails = ({ className, style }: Props) => {
  const { ref, animate } = useDraw();
  return (
    <svg
      ref={ref}
      viewBox="0 0 600 600"
      className={className}
      style={style}
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <SceneDefs id="s1" />
      {/* warm ambient glow */}
      <circle cx="300" cy="300" r="220" fill="url(#s1-bloom)" />

      {/* === Invitation card (slight tilt) === */}
      <g transform="rotate(-4 300 310)">
        <motion.rect
          x="170" y="160" width="260" height="320" rx="6"
          stroke={olive} strokeWidth="1.6" fill={cream} fillOpacity="0.9"
          variants={draw} initial="hidden" animate={animate} custom={0.1}
        />
        {/* inner border */}
        <motion.rect
          x="184" y="174" width="232" height="292" rx="4"
          stroke={gold} strokeWidth="0.7" strokeDasharray="3 3" opacity="0.7"
          variants={draw} initial="hidden" animate={animate} custom={0.4}
        />
        {/* top ornament */}
        <motion.path
          d="M220 210 q40 -22 80 0 q40 -22 80 0"
          stroke={olive} strokeWidth="1.1" strokeLinecap="round"
          variants={draw} initial="hidden" animate={animate} custom={0.6}
        />
        <motion.circle cx="300" cy="218" r="3" fill={gold}
          initial={{ opacity: 0 }} animate={{ opacity: animate === "visible" ? 1 : 0 }}
          transition={{ delay: 1.4 }} />

        {/* "save the date" lines (abstract calligraphic lines) */}
        <motion.path
          d="M210 252 L390 252 M226 274 L374 274 M240 296 L360 296"
          stroke={olive} strokeWidth="1.1" strokeLinecap="round"
          variants={draw} initial="hidden" animate={animate} custom={0.9}
        />

        {/* central monogram circle */}
        <motion.circle cx="300" cy="350" r="34"
          stroke={gold} strokeWidth="1" fill="none"
          variants={draw} initial="hidden" animate={animate} custom={1.2} />
        <motion.path
          d="M286 366 L286 334 M300 366 L300 334 M286 350 L300 350 M306 366 L314 334 M314 366 L322 334"
          stroke={olive} strokeWidth="1.2" strokeLinecap="round" fill="none"
          variants={draw} initial="hidden" animate={animate} custom={1.4}
        />

        {/* footer line */}
        <motion.path d="M220 432 L380 432" stroke={olive} strokeWidth="0.9"
          variants={draw} initial="hidden" animate={animate} custom={1.6} />
        <motion.path d="M260 446 L340 446" stroke={olive} strokeWidth="0.7"
          variants={draw} initial="hidden" animate={animate} custom={1.7} />
      </g>

      {/* === Floating map pin (top-right) === */}
      <g transform="translate(440 150)">
        <motion.path
          d="M0 0 c14 0 24 10 24 22 c0 18 -24 36 -24 36 c0 0 -24 -18 -24 -36 c0 -12 10 -22 24 -22 z"
          stroke={olive} strokeWidth="1.4" fill={cream} fillOpacity="0.95"
          variants={draw} initial="hidden" animate={animate} custom={1.0}
        />
        <motion.circle cx="0" cy="22" r="6" stroke={gold} strokeWidth="1" fill="none"
          variants={draw} initial="hidden" animate={animate} custom={1.3} />
      </g>

      {/* === Floating mini calendar (bottom-left) === */}
      <g transform="translate(110 420) rotate(-8)">
        <motion.rect x="0" y="0" width="80" height="72" rx="4"
          stroke={olive} strokeWidth="1.3" fill={cream} fillOpacity="0.9"
          variants={draw} initial="hidden" animate={animate} custom={1.1} />
        <motion.path d="M0 22 L80 22" stroke={olive} strokeWidth="1"
          variants={draw} initial="hidden" animate={animate} custom={1.4} />
        {/* binding rings */}
        <motion.path d="M16 -4 L16 10 M64 -4 L64 10"
          stroke={olive} strokeWidth="1.2" strokeLinecap="round"
          variants={draw} initial="hidden" animate={animate} custom={1.2} />
        {/* date dots */}
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <motion.circle key={`${r}-${c}`} cx={14 + c * 18} cy={36 + r * 12} r="1.6"
              fill={olive} opacity="0.55"
              initial={{ opacity: 0 }}
              animate={{ opacity: animate === "visible" ? 0.55 : 0 }}
              transition={{ delay: 1.6 + (r * 4 + c) * 0.04 }}
            />
          ))
        )}
        {/* highlighted day */}
        <motion.circle cx="50" cy="48" r="6" fill={gold} fillOpacity="0.85"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: animate === "visible" ? 1 : 0, opacity: animate === "visible" ? 1 : 0 }}
          transition={{ delay: 2.0, type: "spring", stiffness: 200 }}
        />
      </g>

      {/* eucalyptus accent — bottom right */}
      <motion.path
        d="M520 480 q-30 -20 -60 -8 q-22 8 -36 28 M484 478 q4 -10 14 -14 M474 488 q4 -10 14 -14 M464 498 q4 -10 14 -14"
        stroke={olive} strokeWidth="0.9" strokeLinecap="round" fill="none"
        variants={draw} initial="hidden" animate={animate} custom={1.8}
      />
    </svg>
  );
};

// ===========================================================================
// SCENE 2 — SERVICES  (catering, lighting, sound, flowers)
// A circular service medallion with 4 quadrant icons orbiting a central plate.
// ===========================================================================
export const WizardSceneServices = ({ className, style }: Props) => {
  const { ref, animate } = useDraw();
  return (
    <svg ref={ref} viewBox="0 0 600 600" className={className} style={style}
      fill="none" aria-hidden preserveAspectRatio="xMidYMid slice">
      <SceneDefs id="s2" />
      <circle cx="300" cy="300" r="240" fill="url(#s2-bloom)" />

      {/* dashed orbit ring */}
      <motion.circle cx="300" cy="300" r="190"
        stroke={gold} strokeWidth="0.7" strokeDasharray="2 6" opacity="0.65"
        variants={draw} initial="hidden" animate={animate} custom={0.1} />
      <motion.circle cx="300" cy="300" r="155"
        stroke={olive} strokeWidth="0.6" opacity="0.4"
        variants={draw} initial="hidden" animate={animate} custom={0.2} />

      {/* === Center: dinner plate with cloche === */}
      <motion.ellipse cx="300" cy="320" rx="80" ry="14"
        stroke={olive} strokeWidth="1.4" fill={cream} fillOpacity="0.7"
        variants={draw} initial="hidden" animate={animate} custom={0.3} />
      <motion.ellipse cx="300" cy="316" rx="68" ry="10"
        stroke={olive} strokeWidth="0.8" fill="none" opacity="0.55"
        variants={draw} initial="hidden" animate={animate} custom={0.45} />
      {/* cloche dome */}
      <motion.path
        d="M240 316 q60 -100 120 0"
        stroke={olive} strokeWidth="1.6" fill={cream} fillOpacity="0.85"
        variants={draw} initial="hidden" animate={animate} custom={0.6}
      />
      <motion.circle cx="300" cy="226" r="7" stroke={gold} strokeWidth="1.2" fill={gold} fillOpacity="0.4"
        variants={draw} initial="hidden" animate={animate} custom={0.85} />
      {/* steam wisps */}
      <motion.path d="M280 220 q-4 -12 4 -22 q-4 -10 2 -20 M300 214 q-4 -12 4 -22 q-4 -10 2 -20 M320 220 q-4 -12 4 -22 q-4 -10 2 -20"
        stroke={olive} strokeWidth="0.7" strokeLinecap="round" opacity="0.5"
        variants={draw} initial="hidden" animate={animate} custom={1.0} />

      {/* === 4 quadrant icons === */}
      {/* Top: chandelier / lighting */}
      <g transform="translate(300 100)">
        <motion.path d="M-30 0 L30 0 M0 0 L0 -22"
          stroke={olive} strokeWidth="1.2" strokeLinecap="round"
          variants={draw} initial="hidden" animate={animate} custom={1.1} />
        <motion.path d="M-30 0 L-30 14 M-15 0 L-15 18 M0 0 L0 22 M15 0 L15 18 M30 0 L30 14"
          stroke={olive} strokeWidth="1" strokeLinecap="round"
          variants={draw} initial="hidden" animate={animate} custom={1.2} />
        {[-30, -15, 0, 15, 30].map((x, i) => (
          <motion.circle key={x} cx={x} cy={20 + (i % 2 === 0 ? 0 : 4)} r="5"
            fill="url(#s2-glow)" stroke={gold} strokeWidth="0.6"
            initial={{ opacity: 0 }}
            animate={{ opacity: animate === "visible" ? [0.6, 1, 0.7, 1] : 0 }}
            transition={{ delay: 1.4 + i * 0.1, duration: 2.4, repeat: Infinity, repeatType: "mirror" }}
          />
        ))}
      </g>

      {/* Right: speaker / sound */}
      <g transform="translate(490 300)">
        <motion.rect x="-20" y="-30" width="40" height="60" rx="4"
          stroke={olive} strokeWidth="1.3" fill={cream} fillOpacity="0.7"
          variants={draw} initial="hidden" animate={animate} custom={1.3} />
        <motion.circle cx="0" cy="-12" r="5" stroke={olive} strokeWidth="1"
          variants={draw} initial="hidden" animate={animate} custom={1.45} />
        <motion.circle cx="0" cy="12" r="9" stroke={olive} strokeWidth="1.2"
          variants={draw} initial="hidden" animate={animate} custom={1.5} />
        {/* sound waves */}
        <motion.path d="M30 0 q10 -10 0 -22 M30 0 q10 10 0 22 M40 0 q15 -16 0 -36 M40 0 q15 16 0 36"
          stroke={gold} strokeWidth="0.8" strokeLinecap="round" fill="none"
          variants={draw} initial="hidden" animate={animate} custom={1.65} />
      </g>

      {/* Bottom: floral bouquet */}
      <g transform="translate(300 510)">
        <motion.path d="M-20 0 L0 -30 L20 0 Z"
          stroke={olive} strokeWidth="1.2" fill={cream} fillOpacity="0.6" strokeLinejoin="round"
          variants={draw} initial="hidden" animate={animate} custom={1.4} />
        <motion.circle cx="-10" cy="-22" r="6" stroke={olive} strokeWidth="1" fill={gold} fillOpacity="0.3"
          variants={draw} initial="hidden" animate={animate} custom={1.55} />
        <motion.circle cx="0" cy="-32" r="7" stroke={olive} strokeWidth="1" fill={gold} fillOpacity="0.4"
          variants={draw} initial="hidden" animate={animate} custom={1.6} />
        <motion.circle cx="10" cy="-22" r="6" stroke={olive} strokeWidth="1" fill={gold} fillOpacity="0.3"
          variants={draw} initial="hidden" animate={animate} custom={1.65} />
        <motion.path d="M-14 -16 q-6 -10 -2 -22 M14 -16 q6 -10 2 -22"
          stroke={olive} strokeWidth="0.9" fill="none" opacity="0.7"
          variants={draw} initial="hidden" animate={animate} custom={1.7} />
      </g>

      {/* Left: camera / photography */}
      <g transform="translate(110 300)">
        <motion.rect x="-26" y="-18" width="52" height="36" rx="4"
          stroke={olive} strokeWidth="1.3" fill={cream} fillOpacity="0.7"
          variants={draw} initial="hidden" animate={animate} custom={1.4} />
        <motion.path d="M-12 -18 L-8 -26 L8 -26 L12 -18"
          stroke={olive} strokeWidth="1.2" fill={cream} fillOpacity="0.7" strokeLinejoin="round"
          variants={draw} initial="hidden" animate={animate} custom={1.5} />
        <motion.circle cx="0" cy="0" r="9" stroke={olive} strokeWidth="1.2"
          variants={draw} initial="hidden" animate={animate} custom={1.6} />
        <motion.circle cx="0" cy="0" r="4" stroke={gold} strokeWidth="1" fill={gold} fillOpacity="0.3"
          variants={draw} initial="hidden" animate={animate} custom={1.7} />
        <motion.circle cx="18" cy="-12" r="1.5" fill={gold}
          initial={{ opacity: 0 }}
          animate={{ opacity: animate === "visible" ? [0, 1, 0.4, 1] : 0 }}
          transition={{ delay: 2.0, duration: 1.6, repeat: Infinity }}
        />
      </g>
    </svg>
  );
};

// ===========================================================================
// SCENE 3 — VISION  (mood, palette, style)
// An artist's palette with brush + flowing color swatches.
// ===========================================================================
export const WizardSceneVision = ({ className, style }: Props) => {
  const { ref, animate } = useDraw();
  const swatches = [
    { x: 150, c: "hsl(var(--primary-deep))", o: 0.85 },
    { x: 220, c: "hsl(var(--gold))", o: 0.75 },
    { x: 290, c: "hsl(var(--cream))", o: 1, stroke: true },
    { x: 360, c: "hsl(var(--brown))", o: 0.7 },
    { x: 430, c: "hsl(var(--primary))", o: 0.6 },
  ];
  return (
    <svg ref={ref} viewBox="0 0 600 600" className={className} style={style}
      fill="none" aria-hidden preserveAspectRatio="xMidYMid slice">
      <SceneDefs id="s3" />
      <circle cx="300" cy="300" r="230" fill="url(#s3-bloom)" />

      {/* === Painter's palette (kidney shape) === */}
      <motion.path
        d="M200 220 Q140 240 130 320 Q130 410 220 430 Q310 446 380 408 Q450 370 460 300 Q468 230 400 210 Q320 192 260 200 Q230 204 200 220 Z"
        stroke={olive} strokeWidth="1.6" fill={cream} fillOpacity="0.85"
        variants={draw} initial="hidden" animate={animate} custom={0.2}
      />
      {/* thumb hole */}
      <motion.ellipse cx="240" cy="320" rx="22" ry="16"
        stroke={olive} strokeWidth="1.2" fill="none"
        variants={draw} initial="hidden" animate={animate} custom={0.5}
      />

      {/* === Paint dollops === */}
      {[
        { cx: 300, cy: 250, r: 22, fill: "hsl(var(--primary-deep))", o: 0.85 },
        { cx: 360, cy: 270, r: 18, fill: "hsl(var(--gold))", o: 0.75 },
        { cx: 410, cy: 310, r: 20, fill: "hsl(var(--brown))", o: 0.7 },
        { cx: 380, cy: 370, r: 16, fill: "hsl(var(--cream))", o: 1, stroke: true },
        { cx: 320, cy: 390, r: 14, fill: "hsl(var(--primary))", o: 0.6 },
      ].map((d, i) => (
        <motion.circle key={i} cx={d.cx} cy={d.cy} r={d.r}
          fill={d.fill} fillOpacity={d.o}
          stroke={d.stroke ? olive : "none"} strokeWidth={d.stroke ? 1 : 0}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: animate === "visible" ? 1 : 0, opacity: animate === "visible" ? d.o : 0 }}
          transition={{ delay: 0.7 + i * 0.12, type: "spring", stiffness: 180, damping: 14 }}
          style={{ transformOrigin: `${d.cx}px ${d.cy}px` }}
        />
      ))}

      {/* === Paintbrush, diagonal === */}
      <g transform="translate(420 180) rotate(35)">
        {/* handle */}
        <motion.rect x="0" y="-4" width="120" height="8" rx="2"
          stroke={olive} strokeWidth="1.2" fill={cream} fillOpacity="0.9"
          variants={draw} initial="hidden" animate={animate} custom={1.3} />
        {/* ferrule */}
        <motion.rect x="120" y="-7" width="22" height="14" rx="1"
          stroke={olive} strokeWidth="1.2" fill={gold} fillOpacity="0.45"
          variants={draw} initial="hidden" animate={animate} custom={1.45} />
        {/* bristles */}
        <motion.path d="M142 -7 L162 -12 L168 0 L162 12 L142 7 Z"
          stroke={olive} strokeWidth="1.2" fill={olive} fillOpacity="0.55" strokeLinejoin="round"
          variants={draw} initial="hidden" animate={animate} custom={1.55} />
      </g>

      {/* === Color swatches floating bottom === */}
      {swatches.map((s, i) => (
        <motion.rect key={i}
          x={s.x} y="495" width="46" height="58" rx="3"
          fill={s.c} fillOpacity={s.o}
          stroke={s.stroke ? olive : "none"} strokeWidth={s.stroke ? 1 : 0}
          initial={{ y: 540, opacity: 0 }}
          animate={{ y: animate === "visible" ? 495 : 540, opacity: animate === "visible" ? 1 : 0 }}
          transition={{ delay: 1.0 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}

      {/* sparkle accents */}
      {[{ x: 130, y: 160 }, { x: 480, y: 140 }, { x: 460, y: 460 }].map((p, i) => (
        <motion.path key={i}
          d={`M${p.x} ${p.y - 8} L${p.x} ${p.y + 8} M${p.x - 8} ${p.y} L${p.x + 8} ${p.y}`}
          stroke={gold} strokeWidth="1.2" strokeLinecap="round"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: animate === "visible" ? [0.4, 1, 0.5, 1] : 0, scale: animate === "visible" ? 1 : 0 }}
          transition={{ delay: 1.6 + i * 0.2, duration: 2.0, repeat: Infinity, repeatType: "mirror" }}
          style={{ transformOrigin: `${p.x}px ${p.y}px` }}
        />
      ))}
    </svg>
  );
};

// ===========================================================================
// SCENE 4 — BUDGET  (smart budget allocation)
// Coin stacks + a flowing line chart + a wallet outline.
// ===========================================================================
export const WizardSceneBudget = ({ className, style }: Props) => {
  const { ref, animate } = useDraw();
  return (
    <svg ref={ref} viewBox="0 0 600 600" className={className} style={style}
      fill="none" aria-hidden preserveAspectRatio="xMidYMid slice">
      <SceneDefs id="s4" />
      <circle cx="300" cy="300" r="230" fill="url(#s4-bloom)" />

      {/* === Wallet (top center, slightly tilted) === */}
      <g transform="translate(300 200) rotate(-3)">
        <motion.path
          d="M-110 -50 L110 -50 Q120 -50 120 -40 L120 50 Q120 60 110 60 L-110 60 Q-120 60 -120 50 L-120 -40 Q-120 -50 -110 -50 Z"
          stroke={olive} strokeWidth="1.6" fill={cream} fillOpacity="0.9" strokeLinejoin="round"
          variants={draw} initial="hidden" animate={animate} custom={0.2}
        />
        {/* fold seam */}
        <motion.path d="M-120 -10 L120 -10" stroke={olive} strokeWidth="0.9" opacity="0.6"
          variants={draw} initial="hidden" animate={animate} custom={0.5} />
        {/* clasp */}
        <motion.circle cx="80" cy="25" r="8" stroke={gold} strokeWidth="1.2" fill={gold} fillOpacity="0.35"
          variants={draw} initial="hidden" animate={animate} custom={0.7} />
        {/* card peeking */}
        <motion.rect x="-90" y="-44" width="80" height="20" rx="2"
          stroke={olive} strokeWidth="1" fill={gold} fillOpacity="0.25"
          variants={draw} initial="hidden" animate={animate} custom={0.9} />
      </g>

      {/* === Coin stacks (bottom-left) === */}
      <g transform="translate(150 430)">
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <motion.ellipse cx={i * 38} cy={-i * 8 - 30} rx="22" ry="6"
              stroke={olive} strokeWidth="1.2" fill={gold} fillOpacity={0.35 - i * 0.04}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animate === "visible" ? 1 : 0, y: animate === "visible" ? 0 : 20 }}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d={`M${i * 38 - 22} ${-i * 8 - 30} L${i * 38 - 22} ${-i * 8 - 22} A22 6 0 0 0 ${i * 38 + 22} ${-i * 8 - 22} L${i * 38 + 22} ${-i * 8 - 30}`}
              stroke={olive} strokeWidth="1.2" fill={gold} fillOpacity={0.2 - i * 0.03}
              initial={{ opacity: 0 }}
              animate={{ opacity: animate === "visible" ? 1 : 0 }}
              transition={{ delay: 0.9 + i * 0.15 }}
            />
            <motion.text x={i * 38} y={-i * 8 - 25} textAnchor="middle" fontSize="9"
              fill={olive} opacity="0.8" fontFamily="serif"
              initial={{ opacity: 0 }}
              animate={{ opacity: animate === "visible" ? 0.8 : 0 }}
              transition={{ delay: 1.2 + i * 0.15 }}>
              ر.س
            </motion.text>
          </g>
        ))}
      </g>

      {/* === Chart line (bottom-right) === */}
      <g transform="translate(330 360)">
        {/* axes */}
        <motion.path d="M0 120 L0 0 M0 120 L210 120"
          stroke={olive} strokeWidth="1" strokeLinecap="round" opacity="0.7"
          variants={draw} initial="hidden" animate={animate} custom={1.0} />
        {/* gridlines */}
        <motion.path d="M0 30 L210 30 M0 60 L210 60 M0 90 L210 90"
          stroke={olive} strokeWidth="0.4" strokeDasharray="2 4" opacity="0.4"
          variants={draw} initial="hidden" animate={animate} custom={1.15} />
        {/* line */}
        <motion.path d="M5 95 L40 80 L75 90 L110 50 L145 60 L180 25 L205 35"
          stroke={gold} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
          variants={draw} initial="hidden" animate={animate} custom={1.3} />
        {/* dots */}
        {[[5, 95], [40, 80], [75, 90], [110, 50], [145, 60], [180, 25], [205, 35]].map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r="3"
            fill={gold} stroke={olive} strokeWidth="0.8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: animate === "visible" ? 1 : 0, opacity: animate === "visible" ? 1 : 0 }}
            transition={{ delay: 2.0 + i * 0.08, type: "spring", stiffness: 250 }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        ))}
      </g>

      {/* floating sparkle */}
      <motion.path d="M520 200 L520 220 M510 210 L530 210"
        stroke={gold} strokeWidth="1.4" strokeLinecap="round"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: animate === "visible" ? [0.4, 1, 0.5] : 0, rotate: animate === "visible" ? 90 : 0 }}
        transition={{ delay: 1.8, duration: 2.5, repeat: Infinity, repeatType: "mirror" }}
        style={{ transformOrigin: "520px 210px" }}
      />
    </svg>
  );
};

// ===========================================================================
// SCENE 5 — VENDORS  (hand-picked vendor cards)
// Three overlapping vendor cards with stars + a checkmark seal.
// ===========================================================================
export const WizardSceneVendors = ({ className, style }: Props) => {
  const { ref, animate } = useDraw();
  const cards = [
    { x: 130, y: 230, r: -8, d: 0.2 },
    { x: 240, y: 200, r: -2, d: 0.4 },
    { x: 350, y: 220, r: 6, d: 0.6 },
  ];
  return (
    <svg ref={ref} viewBox="0 0 600 600" className={className} style={style}
      fill="none" aria-hidden preserveAspectRatio="xMidYMid slice">
      <SceneDefs id="s5" />
      <circle cx="300" cy="300" r="230" fill="url(#s5-bloom)" />

      {/* === Vendor cards (fanned) === */}
      {cards.map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.r})`}>
          <motion.rect x="0" y="0" width="160" height="200" rx="6"
            stroke={olive} strokeWidth="1.5" fill={cream} fillOpacity="0.95"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: animate === "visible" ? 1 : 0, y: animate === "visible" ? 0 : 30 }}
            transition={{ delay: c.d, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* image placeholder */}
          <motion.rect x="12" y="12" width="136" height="84" rx="3"
            stroke={olive} strokeWidth="0.8" fill={olive} fillOpacity="0.08"
            variants={draw} initial="hidden" animate={animate} custom={c.d + 0.4} />
          {/* tiny abstract scene inside (mountain + sun) */}
          <motion.path d="M20 88 L50 60 L70 76 L100 50 L140 90"
            stroke={olive} strokeWidth="0.9" fill="none" strokeLinejoin="round"
            variants={draw} initial="hidden" animate={animate} custom={c.d + 0.55} />
          <motion.circle cx="120" cy="36" r="6" stroke={gold} strokeWidth="0.8" fill={gold} fillOpacity="0.45"
            variants={draw} initial="hidden" animate={animate} custom={c.d + 0.6} />
          {/* title lines */}
          <motion.path d="M16 116 L120 116 M16 130 L90 130"
            stroke={olive} strokeWidth="1.1" strokeLinecap="round"
            variants={draw} initial="hidden" animate={animate} custom={c.d + 0.7} />
          {/* stars */}
          {[0, 1, 2, 3, 4].map((s) => (
            <motion.path key={s}
              d={`M${20 + s * 14} 158 l3 6 6 1 -4 5 1 6 -6 -3 -6 3 1 -6 -4 -5 6 -1 z`}
              fill={gold} fillOpacity="0.85" stroke={olive} strokeWidth="0.4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: animate === "visible" ? 1 : 0, opacity: animate === "visible" ? 0.85 : 0 }}
              transition={{ delay: c.d + 0.85 + s * 0.06, type: "spring", stiffness: 250 }}
              style={{ transformOrigin: `${22 + s * 14}px 162px` }}
            />
          ))}
          {/* price tag line */}
          <motion.path d="M16 184 L70 184" stroke={olive} strokeWidth="0.9"
            variants={draw} initial="hidden" animate={animate} custom={c.d + 1.0} />
        </g>
      ))}

      {/* === Verified seal (top-right) === */}
      <g transform="translate(450 130)">
        <motion.circle cx="0" cy="0" r="40"
          stroke={gold} strokeWidth="1.4" fill={cream} fillOpacity="0.95"
          variants={draw} initial="hidden" animate={animate} custom={1.4} />
        <motion.circle cx="0" cy="0" r="32" stroke={gold} strokeWidth="0.6" strokeDasharray="2 3" opacity="0.7"
          variants={draw} initial="hidden" animate={animate} custom={1.55} />
        <motion.path d="M-14 2 L-4 12 L16 -10"
          stroke={olive} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"
          variants={draw} initial="hidden" animate={animate} custom={1.7} />
      </g>

      {/* leafy garland bottom */}
      <motion.path
        d="M120 480 q60 -24 120 -8 q60 16 120 -2 q60 -18 120 0"
        stroke={olive} strokeWidth="1" fill="none" strokeLinecap="round"
        variants={draw} initial="hidden" animate={animate} custom={1.3}
      />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = 130 + i * 42;
        const y = 478 + (i % 2 === 0 ? -4 : 4);
        const r = (i % 2 === 0 ? -1 : 1) * 35;
        return (
          <motion.path key={i}
            d={`M${x} ${y} q-3 -7 0 -14 q3 7 0 14 z`}
            stroke={olive} strokeWidth="0.7" fill={olive} fillOpacity="0.15"
            transform={`rotate(${r} ${x} ${y - 7})`}
            variants={draw} initial="hidden" animate={animate} custom={1.5 + i * 0.04}
          />
        );
      })}
    </svg>
  );
};

// ===========================================================================
// FINAL — CELEBRATION (used after last step)
// ===========================================================================
export const WizardSceneFinal = ({ className, style }: Props) => {
  const { ref, animate } = useDraw();
  return (
    <svg ref={ref} viewBox="0 0 600 600" className={className} style={style}
      fill="none" aria-hidden preserveAspectRatio="xMidYMid slice">
      <SceneDefs id="sf" />
      <circle cx="300" cy="300" r="240" fill="url(#sf-bloom)" />

      {/* arch */}
      <motion.path
        d="M150 460 L150 280 Q150 140 300 140 Q450 140 450 280 L450 460"
        stroke={olive} strokeWidth="1.8" fill="none"
        variants={draw} initial="hidden" animate={animate} custom={0.2}
      />
      {/* arch florals */}
      {Array.from({ length: 14 }).map((_, i) => {
        const t = i / 13;
        const angle = Math.PI * (1 - t);
        const cx = 300 + Math.cos(angle) * 150;
        const cy = 280 - Math.sin(angle) * 140;
        return (
          <motion.circle key={i} cx={cx} cy={cy} r="6"
            stroke={olive} strokeWidth="0.7" fill={gold} fillOpacity={0.35 + (i % 3) * 0.1}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: animate === "visible" ? 1 : 0, opacity: animate === "visible" ? 1 : 0 }}
            transition={{ delay: 0.8 + i * 0.06, type: "spring", stiffness: 220 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        );
      })}
      {/* twin candles */}
      {[230, 370].map((x, i) => (
        <g key={x}>
          <motion.path d={`M${x} 460 L${x} 360`} stroke={olive} strokeWidth="1.4"
            variants={draw} initial="hidden" animate={animate} custom={1.0 + i * 0.1} />
          <motion.circle cx={x} cy="354" r="14" fill="url(#sf-glow)"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: animate === "visible" ? [0.5, 0.95, 0.6, 1] : 0, scale: animate === "visible" ? [0.9, 1.15, 1, 1.2] : 0.7 }}
            transition={{ delay: 1.6 + i * 0.1, duration: 2.4, repeat: Infinity, repeatType: "mirror" }}
            style={{ transformOrigin: `${x}px 354px` }}
          />
          <motion.path d={`M${x} 358 q-3 -5 -1 -10 q1 -3 1 -6 q0 3 1 6 q2 5 -1 10 z`}
            fill={gold} stroke="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: animate === "visible" ? [0.8, 1, 0.85, 1] : 0 }}
            transition={{ delay: 1.6 + i * 0.1, duration: 1.4, repeat: Infinity, repeatType: "mirror" }}
          />
        </g>
      ))}
      {/* rings */}
      <motion.circle cx="280" cy="430" r="22" stroke={gold} strokeWidth="1.6"
        variants={draw} initial="hidden" animate={animate} custom={1.4} />
      <motion.circle cx="320" cy="430" r="22" stroke={gold} strokeWidth="1.6"
        variants={draw} initial="hidden" animate={animate} custom={1.5} />
      {/* confetti */}
      {Array.from({ length: 18 }).map((_, i) => {
        const x = 80 + (i * 27) % 440;
        const y = 100 + ((i * 53) % 60);
        return (
          <motion.circle key={i} cx={x} cy={y} r="2.5"
            fill={i % 2 === 0 ? gold : olive} fillOpacity="0.8"
            initial={{ y: y - 30, opacity: 0 }}
            animate={{ y: animate === "visible" ? y : y - 30, opacity: animate === "visible" ? [0, 1, 0.5, 1] : 0 }}
            transition={{ delay: 1.8 + i * 0.05, duration: 1.6, repeat: Infinity, repeatType: "mirror" }}
          />
        );
      })}
    </svg>
  );
};

// ===========================================================================
// STEPPER ICONS — small sketch icons replacing the lucide icons in stepper
// All 24x24 viewBox so they swap into existing layout cleanly.
// ===========================================================================

type IconProps = { className?: string };

const iconAnim = (i: number = 0): Variants => ({
  hidden: { pathLength: 0, opacity: 0.4 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.4, delay: i * 0.06 },
    },
  },
});

const iconStroke = "currentColor";

// 1. Details — invitation envelope
export const SketchIconInvitation = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
    <motion.rect x="3" y="6" width="18" height="13" rx="1.5"
      stroke={iconStroke} strokeWidth="1.4"
      variants={iconAnim(0)} initial="hidden" animate="visible" />
    <motion.path d="M3.5 7.2 L12 13.5 L20.5 7.2"
      stroke={iconStroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      variants={iconAnim(1)} initial="hidden" animate="visible" />
    <motion.circle cx="12" cy="14.5" r="1.4" fill="currentColor" opacity="0.7"
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.7 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
      style={{ transformOrigin: "12px 14.5px" }} />
  </svg>
);

// 2. Services — domed cloche / serving plate
export const SketchIconServices = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
    <motion.path d="M4 17 Q12 5 20 17"
      stroke={iconStroke} strokeWidth="1.4" strokeLinecap="round"
      variants={iconAnim(0)} initial="hidden" animate="visible" />
    <motion.path d="M3 17 L21 17"
      stroke={iconStroke} strokeWidth="1.4" strokeLinecap="round"
      variants={iconAnim(1)} initial="hidden" animate="visible" />
    <motion.circle cx="12" cy="6.5" r="1" fill="currentColor"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      style={{ transformOrigin: "12px 6.5px" }} />
    <motion.path d="M12 5.5 L12 4"
      stroke={iconStroke} strokeWidth="1.2" strokeLinecap="round"
      variants={iconAnim(2)} initial="hidden" animate="visible" />
    <motion.path d="M5 19.5 L19 19.5"
      stroke={iconStroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.7"
      variants={iconAnim(3)} initial="hidden" animate="visible" />
  </svg>
);

// 3. Vision — painter's palette
export const SketchIconPalette = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
    <motion.path
      d="M12 3.5 C7 3.5 3.5 7 3.5 11.5 C3.5 15 6 17 8.5 16.5 C10 16.2 9.5 14.5 10.8 14 C12 13.6 13 14.8 14.5 14.5 C18 14 20.5 12 20.5 9 C20.5 5.5 17 3.5 12 3.5 Z"
      stroke={iconStroke} strokeWidth="1.4" strokeLinejoin="round"
      variants={iconAnim(0)} initial="hidden" animate="visible" />
    <motion.circle cx="8" cy="8.5" r="1" fill="currentColor"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 220 }}
      style={{ transformOrigin: "8px 8.5px" }} />
    <motion.circle cx="12" cy="6.5" r="1" fill="currentColor"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 220 }}
      style={{ transformOrigin: "12px 6.5px" }} />
    <motion.circle cx="16" cy="8" r="1" fill="currentColor"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 0.7, type: "spring", stiffness: 220 }}
      style={{ transformOrigin: "16px 8px" }} />
    <motion.path d="M11 17.5 L13 21 L15 19.5"
      stroke={iconStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      variants={iconAnim(2)} initial="hidden" animate="visible" />
  </svg>
);

// 4. Budget — coin with riyal mark
export const SketchIconCoin = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
    <motion.circle cx="12" cy="12" r="8.5"
      stroke={iconStroke} strokeWidth="1.4"
      variants={iconAnim(0)} initial="hidden" animate="visible" />
    <motion.circle cx="12" cy="12" r="6.2"
      stroke={iconStroke} strokeWidth="0.7" strokeDasharray="1.5 2" opacity="0.6"
      variants={iconAnim(1)} initial="hidden" animate="visible" />
    {/* abstract riyal-like glyph (vertical strokes + baseline) */}
    <motion.path d="M9.5 8.5 L9.5 15.5 M11.5 8.5 L11.5 15.5 M13.5 8.5 L13.5 15.5 M8.5 13 L14.5 13"
      stroke={iconStroke} strokeWidth="1.1" strokeLinecap="round"
      variants={iconAnim(2)} initial="hidden" animate="visible" />
  </svg>
);

// 5. Vendors — handshake / partnership ribbon (two interlocking circles + check)
export const SketchIconHandshake = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
    <motion.circle cx="9" cy="11" r="4"
      stroke={iconStroke} strokeWidth="1.4"
      variants={iconAnim(0)} initial="hidden" animate="visible" />
    <motion.circle cx="15" cy="11" r="4"
      stroke={iconStroke} strokeWidth="1.4"
      variants={iconAnim(1)} initial="hidden" animate="visible" />
    <motion.path d="M7 17 L17 17"
      stroke={iconStroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"
      variants={iconAnim(2)} initial="hidden" animate="visible" />
    <motion.path d="M10 11 L11.5 12.5 L14 10"
      stroke={iconStroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      variants={iconAnim(3)} initial="hidden" animate="visible" />
  </svg>
);
