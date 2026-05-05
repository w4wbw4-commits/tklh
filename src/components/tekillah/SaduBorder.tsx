// ---------------------------------------------------------------------------
// SaduBorder — vertical Al-Sadu / Najdi inspired geometric border.
// Deep emerald + muted gold motifs stacked into a tall ribbon. Used as a
// watermark down the extreme edges of the hero. Mobile-hidden by default.
// ---------------------------------------------------------------------------

interface Props {
  className?: string;
  side?: "left" | "right";
  /** 0–1, default 0.12 — keep it whisper-quiet behind content */
  opacity?: number;
}

export const SaduBorder = ({ className = "", side = "left", opacity = 0.12 }: Props) => {
  const green = "hsl(var(--primary-deep))";
  const gold = "hsl(var(--gold))";

  // Mask fades the band away from the edge towards the centre.
  const fadeMask =
    side === "left"
      ? "linear-gradient(to right, hsl(0 0% 0% / 1) 0%, hsl(0 0% 0% / 0.9) 40%, hsl(0 0% 0% / 0) 100%)"
      : "linear-gradient(to left, hsl(0 0% 0% / 1) 0%, hsl(0 0% 0% / 0.9) 40%, hsl(0 0% 0% / 0) 100%)";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 ${side === "left" ? "left-0" : "right-0"} ${className}`}
      style={{
        opacity,
        WebkitMaskImage: fadeMask,
        maskImage: fadeMask,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 60 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Repeating Sadu-inspired tile — diamond + zigzag + bars */}
          <pattern
            id={`sadu-${side}`}
            x="0"
            y="0"
            width="60"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* top solid bar */}
            <rect x="0" y="0" width="60" height="4" fill={green} />
            {/* gold hairline */}
            <rect x="0" y="6" width="60" height="1.2" fill={gold} />

            {/* zigzag row */}
            <polyline
              points="0,18 10,12 20,18 30,12 40,18 50,12 60,18"
              fill="none"
              stroke={green}
              strokeWidth="1.4"
            />

            {/* diamond chain */}
            <g fill="none" stroke={green} strokeWidth="1.3">
              <polygon points="30,28 44,42 30,56 16,42" />
              <polygon points="30,32 40,42 30,52 20,42" stroke={gold} strokeWidth="1" />
              <circle cx="30" cy="42" r="1.6" fill={gold} stroke="none" />
            </g>

            {/* side ticks flanking the diamond */}
            <g stroke={green} strokeWidth="1.2">
              <line x1="2" y1="36" x2="10" y2="36" />
              <line x1="2" y1="42" x2="10" y2="42" />
              <line x1="2" y1="48" x2="10" y2="48" />
              <line x1="50" y1="36" x2="58" y2="36" />
              <line x1="50" y1="42" x2="58" y2="42" />
              <line x1="50" y1="48" x2="58" y2="48" />
            </g>

            {/* gold hairline */}
            <rect x="0" y="66" width="60" height="1.2" fill={gold} />

            {/* triangle teeth row */}
            <g fill={green}>
              <polygon points="0,72 6,80 12,72" />
              <polygon points="12,72 18,80 24,72" />
              <polygon points="24,72 30,80 36,72" />
              <polygon points="36,72 42,80 48,72" />
              <polygon points="48,72 54,80 60,72" />
            </g>

            {/* cross-stitch row */}
            <g stroke={green} strokeWidth="1.1">
              <line x1="6" y1="92" x2="14" y2="100" />
              <line x1="14" y1="92" x2="6" y2="100" />
              <line x1="22" y1="92" x2="30" y2="100" />
              <line x1="30" y1="92" x2="22" y2="100" />
              <line x1="38" y1="92" x2="46" y2="100" />
              <line x1="46" y1="92" x2="38" y2="100" />
            </g>
            <g stroke={gold} strokeWidth="0.9">
              <line x1="50" y1="92" x2="58" y2="100" />
              <line x1="58" y1="92" x2="50" y2="100" />
            </g>

            {/* gold hairline */}
            <rect x="0" y="108" width="60" height="1.2" fill={gold} />
            {/* bottom bar */}
            <rect x="0" y="114" width="60" height="4" fill={green} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#sadu-${side})`} />
      </svg>
    </div>
  );
};
