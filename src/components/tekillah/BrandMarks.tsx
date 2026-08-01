// ---------------------------------------------------------------------------
// BrandMarks — the TKLH brand element kit, reduced to what the identity file
// actually sanctions:
//
//  • WaxSeal      pressed wax disc with the chair mark debossed in the centre
//  • ZariRule     one horizontal gold zari boundary line (never a frame)
//  • DuotoneImage two-tone brand treatment for a photograph
//
// Deliberately removed: CornerSeal (thin empty rings), ZariEdge (dashed
// borders on every card), SignatureLine (repeated squiggle), CompositePattern
// (scattered wallpaper). They read as clutter, not as a system.
//
// Motion rule: one curve everywhere — cubic-bezier(0.4, 0, 0.2, 1), no bounce.
// ---------------------------------------------------------------------------

import type { CSSProperties } from "react";

export const BRAND_EASE = [0.4, 0, 0.2, 1] as const;

/* ------------------------------------------------------------------ */
/* Chair silhouette — the brand mark debossed inside the wax.          */
/* ------------------------------------------------------------------ */
const ChairGlyph = ({ stroke, width = 3 }: { stroke: string; width?: number }) => (
  <g fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 22 Q50 10 68 22 L68 46 Q50 52 32 46 Z" />
    <path d="M28 52 H72 L70 61 H30 Z" />
    <path d="M34 61 V80 M66 61 V80" />
    <path d="M28 46 V55 M72 46 V55" />
  </g>
);

// Irregular wax rim — hand-shaped, never a perfect circle.
const WAX_RIM =
  "M50 3 C63 3 70 9 78 13 C88 18 97 26 96 39 C95 50 99 58 95 68 C91 78 82 84 72 90 C63 95 55 98 45 96 C34 94 25 96 17 89 C8 81 5 71 3 60 C1 49 2 39 6 29 C10 19 19 11 30 7 C37 4 43 3 50 3 Z";

type WaxSealProps = {
  className?: string;
  style?: CSSProperties;
  /** Wax colour. Defaults to the brand green. */
  color?: string;
  /** Size in px. One small size across the product. */
  size?: number;
  /** Colourless pressed-emboss variant for quiet ivory surfaces. */
  emboss?: boolean;
  title?: string;
};

/**
 * WaxSeal — a small pressed-wax stamp. One size, one placement per surface.
 * Used as a signature, not as decoration.
 */
export const WaxSeal = ({
  className = "",
  style,
  color = "hsl(var(--green))",
  size = 40,
  emboss = false,
  title,
}: WaxSealProps) => {
  const uid = `${color}-${size}-${emboss}`.replace(/[^a-z0-9]/gi, "");
  const bodyId = `wax-body-${uid}`;
  const glossId = `wax-gloss-${uid}`;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <radialGradient id={bodyId} cx="0.36" cy="0.3" r="0.85">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={emboss ? 0.35 : 0.34} />
          <stop offset="45%" stopColor={emboss ? "hsl(var(--bone))" : color} stopOpacity={emboss ? 0.16 : 1} />
          <stop offset="100%" stopColor={emboss ? "hsl(var(--green))" : "#000000"} stopOpacity={emboss ? 0.14 : 0.55} />
        </radialGradient>
        <linearGradient id={glossId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* wax body */}
      <path d={WAX_RIM} fill={emboss ? "hsl(var(--bone))" : color} />
      <path d={WAX_RIM} fill={`url(#${bodyId})`} />
      <path d={WAX_RIM} fill={`url(#${glossId})`} />

      {/* pressed inner ring */}
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke={emboss ? "hsl(var(--green))" : "#000000"}
        strokeOpacity={emboss ? 0.16 : 0.22}
        strokeWidth="2"
      />

      {/* debossed chair mark: dark press shadow + light lift */}
      <g transform="translate(50 51) scale(0.68) translate(-50 -50)">
        <g transform="translate(0 1.6)">
          <ChairGlyph stroke={emboss ? "hsl(var(--green))" : "#000000"} width={3.8} />
        </g>
        <g opacity={emboss ? 0.9 : 0.85}>
          <ChairGlyph stroke={emboss ? "hsl(var(--bone))" : "#ffffff"} width={3} />
        </g>
      </g>
    </svg>
  );
};

/**
 * ZariRule — the gold bisht-hem braid, allowed only as a boundary line
 * between two surfaces. Never wraps an element.
 */
export const ZariRule = ({
  className = "",
  color = "hsl(var(--brass))",
  height = 3,
}: {
  className?: string;
  color?: string;
  height?: number;
}) => (
  <span
    aria-hidden
    className={`pointer-events-none block w-full ${className}`}
    style={{
      height,
      backgroundImage: `repeating-linear-gradient(90deg,
        ${color} 0 9px,
        transparent 9px 13px,
        color-mix(in srgb, ${color} 45%, transparent) 13px 17px,
        transparent 17px 26px)`,
    }}
  />
);

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
