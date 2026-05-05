// ---------------------------------------------------------------------------
// SaduBorder — fixed vertical Najdi (مثلثات نجدية) heritage border.
// High-visibility decorative ribbon anchored to the viewport edge so it frames
// the entire scroll experience. Deep emerald + gold over a cream wash.
// Hidden on small mobile to preserve content width.
// ---------------------------------------------------------------------------

interface Props {
  className?: string;
  side?: "left" | "right";
  /** 0–1, default 0.45 — clearly visible but professional */
  opacity?: number;
  /** When true, ribbon is fixed to the viewport (frames the whole page). */
  fixed?: boolean;
}

export const SaduBorder = ({
  className = "",
  side = "left",
  opacity = 0.45,
  fixed = false,
}: Props) => {
  const green = "#043927"; // Deep emerald
  const gold = "#D4AF37"; // Heritage gold
  const cream = "hsl(var(--cream))";

  // Soft fade toward the centre of the page so the ribbon never crowds text.
  const fadeMask =
    side === "left"
      ? "linear-gradient(to right, hsl(0 0% 0% / 1) 0%, hsl(0 0% 0% / 1) 60%, hsl(0 0% 0% / 0.4) 90%, hsl(0 0% 0% / 0) 100%)"
      : "linear-gradient(to left, hsl(0 0% 0% / 1) 0%, hsl(0 0% 0% / 1) 60%, hsl(0 0% 0% / 0.4) 90%, hsl(0 0% 0% / 0) 100%)";

  const positionClass = fixed
    ? `fixed inset-y-0 ${side === "left" ? "left-0" : "right-0"}`
    : `absolute inset-y-0 ${side === "left" ? "left-0" : "right-0"}`;

  return (
    <div
      aria-hidden
      className={`pointer-events-none ${positionClass} ${className}`}
      style={{
        opacity,
        zIndex: 30,
        WebkitMaskImage: fadeMask,
        maskImage: fadeMask,
        backgroundColor: cream,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Najdi triangle + diamond ribbon — interlocking مثلثات نجدية */}
          <pattern
            id={`najdi-${side}`}
            x="0"
            y="0"
            width="100"
            height="160"
            patternUnits="userSpaceOnUse"
          >
            {/* Outer green frame bars */}
            <rect x="0" y="0" width="100" height="6" fill={green} />
            <rect x="0" y="154" width="100" height="6" fill={green} />

            {/* Gold hairlines */}
            <rect x="0" y="9" width="100" height="1.5" fill={gold} />
            <rect x="0" y="149.5" width="100" height="1.5" fill={gold} />

            {/* Top interlocking triangle row (Najdi teeth) */}
            <g fill={green}>
              <polygon points="0,14 12.5,34 25,14" />
              <polygon points="25,14 37.5,34 50,14" />
              <polygon points="50,14 62.5,34 75,14" />
              <polygon points="75,14 87.5,34 100,14" />
            </g>
            {/* Inverted gold teeth nested inside */}
            <g fill={gold}>
              <polygon points="6,14 12.5,24 19,14" />
              <polygon points="31,14 37.5,24 44,14" />
              <polygon points="56,14 62.5,24 69,14" />
              <polygon points="81,14 87.5,24 94,14" />
            </g>

            {/* Diamond chain row (large central motif) */}
            <g>
              <polygon
                points="50,46 86,80 50,114 14,80"
                fill={green}
              />
              <polygon
                points="50,54 78,80 50,106 22,80"
                fill={cream}
                stroke={gold}
                strokeWidth="1.4"
              />
              <polygon
                points="50,66 68,80 50,94 32,80"
                fill={green}
              />
              <circle cx="50" cy="80" r="4" fill={gold} />
            </g>

            {/* Side step bars flanking the diamond */}
            <g fill={green}>
              <rect x="0" y="66" width="10" height="4" />
              <rect x="0" y="74" width="14" height="4" />
              <rect x="0" y="82" width="14" height="4" />
              <rect x="0" y="90" width="10" height="4" />
              <rect x="90" y="66" width="10" height="4" />
              <rect x="86" y="74" width="14" height="4" />
              <rect x="86" y="82" width="14" height="4" />
              <rect x="90" y="90" width="10" height="4" />
            </g>
            {/* Gold accent dots */}
            <g fill={gold}>
              <circle cx="5" cy="80" r="1.6" />
              <circle cx="95" cy="80" r="1.6" />
            </g>

            {/* Bottom inverted triangle row */}
            <g fill={green}>
              <polygon points="0,146 12.5,126 25,146" />
              <polygon points="25,146 37.5,126 50,146" />
              <polygon points="50,146 62.5,126 75,146" />
              <polygon points="75,146 87.5,126 100,146" />
            </g>
            <g fill={gold}>
              <polygon points="6,146 12.5,136 19,146" />
              <polygon points="31,146 37.5,136 44,146" />
              <polygon points="56,146 62.5,136 69,146" />
              <polygon points="81,146 87.5,136 94,146" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#najdi-${side})`} />
      </svg>
    </div>
  );
};
