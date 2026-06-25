import type { SVGProps } from "react";

/**
 * Tekillah brand mark — elegant event chair outline.
 * Stroke uses `currentColor` so it inherits the parent text color.
 */
export const ChairIcon = ({
  className = "",
  strokeWidth = 1.5,
  ...props
}: SVGProps<SVGSVGElement> & { strokeWidth?: number }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Oval backrest (outer + inner detail) */}
      <ellipse cx="32" cy="18" rx="10" ry="13" />
      <ellipse cx="32" cy="18" rx="7.5" ry="10.5" />
      {/* Connectors between backrest and seat */}
      <path d="M27 30.5 L25 38" />
      <path d="M37 30.5 L39 38" />
      {/* Seat cushion */}
      <path d="M18 40 C 24 36, 40 36, 46 40 L 44 44 C 38 42, 26 42, 20 44 Z" />
      {/* Front legs with decorative joints */}
      <path d="M22 44 L 18 60" />
      <circle cx="20.5" cy="50" r="1.4" />
      <path d="M42 44 L 46 60" />
      <circle cx="43.5" cy="50" r="1.4" />
      {/* Back legs */}
      <path d="M28 44 L 27 60" />
      <circle cx="27.5" cy="50" r="1.2" />
      <path d="M36 44 L 37 60" />
      <circle cx="36.5" cy="50" r="1.2" />
    </svg>
  );
};

export default ChairIcon;
