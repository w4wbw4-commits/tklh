// ---------------------------------------------------------------------------
// WaxSeal — Tklh's signature visual system.
//
// A real wax seal is never identical twice: every seal here gets its own
// irregular, organically-jittered edge (deterministic per `variant`), soft top
// lighting, an inner shadow that hugs the rim, and an outer shadow that lifts
// it off the page. The category icon is *embossed* — pressed into the wax in a
// darker shade of the same wax colour, never a coloured icon sitting on top.
//
// Icons are hand-drawn thin-line paths in the same stroke family as the Tklh
// chair mark (uniform ~1.6 stroke, rounded caps) — deliberately not a generic
// icon set.
//
// SCARCITY RULE: this component is only allowed in three places —
//   1. the occasion category cards,
//   2. the booking-confirmation "stamped" moment,
//   3. the verified-vendor micro badge.
// Do not scatter seals anywhere else; rarity is what keeps it premium.
// ---------------------------------------------------------------------------

import { useId } from "react";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Palette per category
// ---------------------------------------------------------------------------
export type SealCategory =
  | "wedding"
  | "engagement"
  | "graduation"
  | "kids"
  | "hospitality"
  | "events"
  | "brand";

export interface SealPalette {
  /** Mid-tone wax */
  wax: string;
  /** Deep wax — used for the embossed icon + inner rim shadow */
  waxDark: string;
  /** Lit wax — top-left highlight */
  waxLight: string;
  /** Card surface that pairs with this seal */
  card: string;
  /** Card hairline */
  border: string;
}

export const SEAL_PALETTES: Record<SealCategory, SealPalette> = {
  // Quiet gold on light beige
  wedding:     { wax: "#C9A227", waxDark: "#7E610F", waxLight: "#EFD684", card: "#FBF5E7", border: "rgba(126,97,15,0.18)" },
  // Burgundy on soft rose
  engagement:  { wax: "#7C2035", waxDark: "#48101E", waxLight: "#B25266", card: "#FBEEF0", border: "rgba(72,16,30,0.16)" },
  // Navy on pale blue
  graduation:  { wax: "#1F3A63", waxDark: "#10203A", waxLight: "#5A7CAC", card: "#EDF2FA", border: "rgba(16,32,58,0.16)" },
  // Golden yellow on pale yellow
  kids:        { wax: "#E0A81C", waxDark: "#8E6608", waxLight: "#F7D470", card: "#FDF5DD", border: "rgba(142,102,8,0.18)" },
  // Dark brown on earthy beige
  hospitality: { wax: "#5A3A22", waxDark: "#33200F", waxLight: "#946C48", card: "#F5EDE3", border: "rgba(51,32,15,0.16)" },
  // Terracotta on light apricot
  events:      { wax: "#B45A34", waxDark: "#71311A", waxLight: "#DC9670", card: "#FCEDE4", border: "rgba(113,49,26,0.16)" },
  // Deep brand green — confirmation + verified marks only
  brand:       { wax: "#163726", waxDark: "#0B2016", waxLight: "#4E7A5F", card: "#EEF3EF", border: "rgba(11,32,22,0.18)" },
};

// ---------------------------------------------------------------------------
// Irregular edge generator — deterministic pseudo-random per variant seed, so
// each seal keeps a stable but unique silhouette across renders.
// ---------------------------------------------------------------------------
const seeded = (seed: number) => {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

/** Smooth closed blob path with jittered radii (viewBox 0 0 100 100). */
const blobPath = (seed: number, points = 20, base = 45, jitter = 2.6) => {
  const rand = seeded(seed + 1);
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const r = base + (rand() - 0.5) * 2 * jitter + Math.sin(a * (2 + (seed % 3))) * 0.8;
    pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r * 0.985]);
  }
  // Catmull-Rom → cubic bezier for organic, non-polygonal edges.
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return `${d} Z`;
};

const SEAL_SEEDS: Record<SealCategory, number> = {
  wedding: 3,
  engagement: 11,
  graduation: 19,
  kids: 27,
  hospitality: 35,
  events: 43,
  brand: 51,
};

// ---------------------------------------------------------------------------
// Embossed icons — thin-line, Tklh chair-mark stroke family.
// Each returns raw path geometry inside a 0 0 100 100 space, centred on 50,50.
// ---------------------------------------------------------------------------
const ICONS: Record<SealCategory, JSX.Element> = {
  // Two interlocking rings
  wedding: (
    <>
      <circle cx="43" cy="53" r="11" />
      <circle cx="57" cy="53" r="11" />
      <path d="M39 39 L43 33 L47 39" />
    </>
  ),
  // Slim crown
  engagement: (
    <>
      <path d="M33 60 L30 40 L41 49 L50 36 L59 49 L70 40 L67 60 Z" />
      <path d="M33 65 H67" />
    </>
  ),
  // Graduation cap
  graduation: (
    <>
      <path d="M28 47 L50 38 L72 47 L50 56 Z" />
      <path d="M36 51 V62 C36 62 42 66 50 66 C58 66 64 62 64 62 V51" />
      <path d="M70 48 V62" />
    </>
  ),
  // Balloon with ribbon
  kids: (
    <>
      <path d="M50 33 C58 33 63 40 63 46 C63 53 56 59 50 59 C44 59 37 53 37 46 C37 40 42 33 50 33 Z" />
      <path d="M47 59 L50 63 L53 59" />
      <path d="M50 63 C50 68 46 69 47 72" />
    </>
  ),
  // Dallah (Arabic coffee pot)
  hospitality: (
    <>
      <path d="M42 66 C40 58 41 48 46 43 L54 43 C59 48 60 58 58 66 Z" />
      <path d="M46 43 L48 36 L52 36 L54 43" />
      <path d="M48 36 L38 31" />
      <path d="M58 50 C64 51 64 59 58 60" />
      <path d="M38 68 H62" />
    </>
  ),
  // Event stage arch with pennants
  events: (
    <>
      <path d="M32 68 V50 C32 40 41 34 50 34 C59 34 68 40 68 50 V68" />
      <path d="M28 68 H72" />
      <path d="M40 68 V54 H60 V68" />
      <path d="M50 34 V27" />
    </>
  ),
  // Brand mark — Tklh check, drawn in the chair stroke family
  brand: (
    <>
      <path d="M36 51 L46 61 L65 41" />
      <circle cx="50" cy="50" r="22" />
    </>
  ),
};

// ---------------------------------------------------------------------------
// WaxSeal
// ---------------------------------------------------------------------------
interface WaxSealProps {
  category: SealCategory;
  /** Rendered pixel size (square). */
  size?: number;
  className?: string;
  /** Disable the hover "press" interaction (e.g. inside a static badge). */
  interactive?: boolean;
  title?: string;
}

export const WaxSeal = ({
  category,
  size = 76,
  className,
  interactive = true,
  title,
}: WaxSealProps) => {
  const uid = useId().replace(/[:]/g, "");
  const p = SEAL_PALETTES[category];
  const d = blobPath(SEAL_SEEDS[category]);
  const strokeW = Math.max(1.3, 1.7 * (76 / Math.max(size, 28)) * 0.85);

  return (
    <motion.span
      className={`relative inline-block leading-none ${className ?? ""}`}
      style={{ width: size, height: size }}
      initial={false}
      whileHover={interactive ? "press" : undefined}
      whileTap={interactive ? "press" : undefined}
      variants={{
        press: { scale: 0.95 },
      }}
      transition={{ type: "spring", stiffness: 520, damping: 12, mass: 0.5 }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        aria-hidden={title ? undefined : true}
        role={title ? "img" : undefined}
        variants={{
          press: { filter: `drop-shadow(0 2px 4px ${p.waxDark}44)` },
        }}
        style={{ filter: `drop-shadow(0 8px 14px ${p.waxDark}3d)`, display: "block" }}
        transition={{ duration: 0.18 }}
      >
        {title ? <title>{title}</title> : null}
        <defs>
          <radialGradient id={`wax-${uid}`} cx="34%" cy="26%" r="82%">
            <stop offset="0%" stopColor={p.waxLight} />
            <stop offset="46%" stopColor={p.wax} />
            <stop offset="100%" stopColor={p.waxDark} />
          </radialGradient>
          <clipPath id={`clip-${uid}`}>
            <path d={d} />
          </clipPath>
          <filter id={`blur-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id={`blurS-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>

        {/* wax body */}
        <path d={d} fill={`url(#wax-${uid})`} />

        <g clipPath={`url(#clip-${uid})`}>
          {/* inner rim shadow — hugs the irregular edge */}
          <path
            d={d}
            fill="none"
            stroke={p.waxDark}
            strokeWidth="7"
            opacity="0.55"
            filter={`url(#blur-${uid})`}
          />
          {/* soft top lighting */}
          <ellipse
            cx="40"
            cy="26"
            rx="30"
            ry="17"
            fill="#ffffff"
            opacity="0.2"
            filter={`url(#blur-${uid})`}
          />

          {/* embossed icon — pressed into the wax, same hue, darker + lit lip */}
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeW}
          >
            <g stroke={p.waxLight} opacity="0.5" transform="translate(0.9,1.1)">
              {ICONS[category]}
            </g>
            <g stroke={p.waxDark} opacity="0.9" filter={`url(#blurS-${uid})`}>
              {ICONS[category]}
            </g>
            <g stroke={p.waxDark} opacity="0.75">
              {ICONS[category]}
            </g>
          </g>
        </g>
      </motion.svg>
    </motion.span>
  );
};

// ---------------------------------------------------------------------------
// MiniSeal — 16–20px verified-vendor mark. Replaces the generic check badge.
// ---------------------------------------------------------------------------
export const MiniSeal = ({ size = 18, title }: { size?: number; title?: string }) => (
  <WaxSeal category="brand" size={size} interactive={false} title={title} />
);

// ---------------------------------------------------------------------------
// StampedSeal — the booking-confirmation moment. A deep-green seal presses
// down onto the page once, with the "stamped" wordmark fading in beneath it.
// ---------------------------------------------------------------------------
export const StampedSeal = ({
  label,
  size = 96,
}: {
  label: string;
  size?: number;
}) => (
  <div className="flex flex-col items-center gap-2">
    <motion.div
      initial={{ scale: 2.1, opacity: 0, rotate: -14 }}
      animate={{ scale: [2.1, 0.92, 1], opacity: [0, 1, 1], rotate: [-14, -4, -6] }}
      transition={{ duration: 0.7, times: [0, 0.62, 1], ease: [0.2, 0.9, 0.2, 1] }}
      style={{ transformOrigin: "50% 50%" }}
    >
      <WaxSeal category="brand" size={size} interactive={false} />
    </motion.div>
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.4 }}
      className="font-arabic text-sm font-black"
      style={{ color: SEAL_PALETTES.brand.wax }}
    >
      {label}
    </motion.span>
  </div>
);
