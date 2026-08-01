// ---------------------------------------------------------------------------
// BrandMarks — the new TKLH brand element kit.
//
//  • CornerSeal        thin corner stamp built on the brand chair silhouette
//  • ZariEdge          single-side geometric gold braid (bisht hem motif)
//  • CompositePattern  scattered seal + zari wallpaper (hero / social only)
//  • SignatureLine     leaning hand-signature divider that draws itself once
//  • DuotoneImage      two-tone brand treatment for any photo
//
// Motion rule: one curve everywhere — cubic-bezier(0.4, 0, 0.2, 1), no bounce.
// ---------------------------------------------------------------------------

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

export const BRAND_EASE = [0.4, 0, 0.2, 1] as const;

/* ------------------------------------------------------------------ */
/* Chair silhouette — the site-wide base shape for every seal.        */
/* ------------------------------------------------------------------ */
const ChairGlyph = () => (
  <g
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* backrest */}
    <path d="M32 20 Q50 8 68 20 L68 46 Q50 52 32 46 Z" />
    {/* seat */}
    <path d="M28 52 H72 L70 62 H30 Z" />
    {/* legs */}
    <path d="M33 62 V82 M67 62 V82" />
    {/* arms */}
    <path d="M28 46 V56 M72 46 V56" />
  </g>
);

type SealProps = {
  className?: string;
  style?: CSSProperties;
  /** Which corner the seal is pinned to. One fixed corner per card. */
  corner?: "start-top" | "end-top" | "start-bottom" | "end-bottom";
  /** Optional custom glyph (a sector icon on its own page). */
  children?: ReactNode;
  color?: string;
};

const cornerClass: Record<NonNullable<SealProps["corner"]>, string> = {
  "start-top": "top-3 start-3",
  "end-top": "top-3 end-3",
  "start-bottom": "bottom-3 start-3",
  "end-bottom": "bottom-3 end-3",
};

/** Small, thin corner stamp — replaces oversized centred icons. */
export const CornerSeal = ({
  className = "",
  style,
  corner = "end-top",
  children,
  color,
}: SealProps) => (
  <span
    aria-hidden
    className={`pointer-events-none absolute ${cornerClass[corner]} ${className}`}
    style={{ color, ...style }}
  >
    <svg viewBox="0 0 100 100" className="h-9 w-9 opacity-80">
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.55"
      />
      <circle
        cx="50"
        cy="50"
        r="39"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.35"
      />
      <g transform="translate(50 52) scale(0.62) translate(-50 -50)">
        {children ?? <ChairGlyph />}
      </g>
    </svg>
  </span>
);

/** Single-side gold braid. Never wraps the whole element. */
export const ZariEdge = ({
  side = "top",
  className = "",
  color,
}: {
  side?: "top" | "bottom" | "start" | "end";
  className?: string;
  color?: string;
}) => {
  const vertical = side === "start" || side === "end";
  const pos =
    side === "top"
      ? "top-0 start-0 end-0"
      : side === "bottom"
        ? "bottom-0 start-0 end-0"
        : side === "start"
          ? "top-0 bottom-0 start-0"
          : "top-0 bottom-0 end-0";
  const braid = `repeating-linear-gradient(${vertical ? "180deg" : "90deg"},
      ${color ?? "hsl(var(--brass) / 0.95)"} 0 7px,
      transparent 7px 11px,
      ${color ?? "hsl(var(--brass) / 0.45)"} 11px 14px,
      transparent 14px 21px)`;
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute ${pos} ${vertical ? "w-[3px]" : "h-[3px]"} ${className}`}
      style={{ backgroundImage: braid }}
    />
  );
};

/** Scattered seal + zari wallpaper. Hero section & social covers only. */
export const CompositePattern = ({
  className = "",
  opacity = 0.07,
}: {
  className?: string;
  opacity?: number;
}) => (
  <svg
    aria-hidden
    className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    style={{ opacity }}
    viewBox="0 0 800 600"
    preserveAspectRatio="xMidYMid slice"
  >
    <g stroke="hsl(var(--brass))" fill="none" strokeWidth="1.4">
      {[
        [60, 90, 0.55, -18],
        [240, 40, 0.35, 12],
        [430, 130, 0.7, 24],
        [660, 60, 0.4, -8],
        [120, 320, 0.45, 32],
        [330, 400, 0.6, -26],
        [560, 330, 0.3, 8],
        [720, 440, 0.5, 18],
        [190, 530, 0.32, -12],
        [480, 560, 0.42, 20],
      ].map(([x, y, s, r], i) => (
        <g
          key={i}
          transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
          opacity={0.4 + (i % 3) * 0.22}
          color="hsl(var(--brass))"
        >
          <circle cx="50" cy="50" r="46" strokeWidth="1.6" />
          <g transform="translate(50 52) scale(0.6) translate(-50 -50)">
            <ChairGlyph />
          </g>
        </g>
      ))}
      {[
        [30, 210, 160, 6],
        [520, 240, 210, -9],
        [260, 470, 180, 14],
        [600, 520, 140, -4],
      ].map(([x, y, w, r], i) => (
        <g key={`z${i}`} transform={`translate(${x} ${y}) rotate(${r})`} opacity={0.5}>
          {Array.from({ length: Math.round(w / 18) }).map((_, k) => (
            <path key={k} d={`M${k * 18} 0 h7 M${k * 18 + 11} 0 h3`} strokeWidth="2" />
          ))}
        </g>
      ))}
    </g>
  </svg>
);

/**
 * SignatureLine — a leaning, hand-drawn stroke that replaces straight rules
 * under headings. Draws itself once on first reveal, then stays still.
 */
export const SignatureLine = ({
  className = "",
  color = "hsl(var(--brass))",
  width = 180,
}: {
  className?: string;
  color?: string;
  width?: number;
}) => {
  const reduce = useReducedMotion();
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 26"
      width={width}
      height={(26 / 200) * width}
      className={className}
      fill="none"
    >
      <motion.path
        d="M4 20 C 34 22, 52 6, 86 8 C 118 10, 136 22, 168 14 C 180 11, 190 8, 196 5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: BRAND_EASE }}
      />
    </svg>
  );
};

/** Two-tone brand treatment for any photograph. */
export const DuotoneImage = ({
  src,
  alt,
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) => (
  <span className={`relative block overflow-hidden ${className}`}>
    <img src={src} alt={alt} loading="lazy" className={`duotone-brand block h-full w-full object-cover ${imgClassName}`} />
    <span aria-hidden className="duotone-brand-overlay absolute inset-0" />
  </span>
);
