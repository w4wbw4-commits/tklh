// ---------------------------------------------------------------------------
// ArabicPattern — subtle 80×80 repeating Najdi geometric tile.
// Layered at low opacity over hero / dark sections as a cultural anchor.
// ---------------------------------------------------------------------------

interface Props {
  className?: string;
  /** 0–1, defaults to 0.06 per the brand guide */
  opacity?: number;
  /** Stroke color — defaults to current brand green */
  stroke?: string;
}

export const ArabicPattern = ({
  className = "",
  opacity = 0.06,
  stroke = "hsl(var(--green))",
}: Props) => {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ opacity }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="najdi-tile"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* rotated square */}
            <rect
              x="20"
              y="20"
              width="40"
              height="40"
              transform="rotate(45 40 40)"
              fill="none"
              stroke={stroke}
              strokeWidth="1"
            />
            {/* inner cross */}
            <line x1="40" y1="20" x2="40" y2="60" stroke={stroke} strokeWidth="0.8" />
            <line x1="20" y1="40" x2="60" y2="40" stroke={stroke} strokeWidth="0.8" />
            {/* center dot */}
            <circle cx="40" cy="40" r="1.5" fill={stroke} />
            {/* corner dots */}
            <circle cx="0" cy="0" r="1" fill={stroke} />
            <circle cx="80" cy="0" r="1" fill={stroke} />
            <circle cx="0" cy="80" r="1" fill={stroke} />
            <circle cx="80" cy="80" r="1" fill={stroke} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#najdi-tile)" />
      </svg>
    </div>
  );
};
