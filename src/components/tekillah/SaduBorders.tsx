import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// ---------------------------------------------------------------------------
// SaduBorders — slim vertical Najdi/Sadu woven borders on far edges.
// Authentic palette pulled from traditional Saudi Sadu textiles:
//   • Deep terracotta red   (#9B2E25)
//   • Dark burnt brown      (#3A2418)
//   • Muted forest green    (#3F5B3A)
//   • Cream/off-white       (#F5EBD8)
// Parallax: borders translate slower than scroll for a 3D feel.
// Inner edge softly fades to background so the stripe blends in.
// ---------------------------------------------------------------------------

const SADU_RED = "#9B2E25";
const SADU_BROWN = "#3A2418";
const SADU_GREEN = "#3F5B3A";
const SADU_CREAM = "#F5EBD8";

/**
 * One repeating Sadu tile — diamonds & triangles in traditional layered bands.
 * Tile is 60×120 to read as a tall woven strip.
 */
const SaduSVG = () => (
  <svg
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    aria-hidden
  >
    <defs>
      <pattern id="sadu-tile" x="0" y="0" width="60" height="240" patternUnits="userSpaceOnUse">
        {/* cream backing */}
        <rect width="60" height="240" fill={SADU_CREAM} />

        {/* === Band 1: brown solid bar with cream notches === */}
        <rect x="0" y="0" width="60" height="14" fill={SADU_BROWN} />
        <rect x="6" y="4" width="6" height="6" fill={SADU_CREAM} />
        <rect x="24" y="4" width="6" height="6" fill={SADU_CREAM} />
        <rect x="42" y="4" width="6" height="6" fill={SADU_CREAM} />

        {/* === Band 2: red zigzag triangles === */}
        <rect x="0" y="14" width="60" height="22" fill={SADU_RED} />
        <polygon points="0,14 15,36 30,14" fill={SADU_CREAM} />
        <polygon points="30,14 45,36 60,14" fill={SADU_CREAM} />
        <polygon points="7.5,25 15,14 22.5,25 15,36" fill={SADU_BROWN} />
        <polygon points="37.5,25 45,14 52.5,25 45,36" fill={SADU_BROWN} />

        {/* === Band 3: brown thin stripe === */}
        <rect x="0" y="36" width="60" height="4" fill={SADU_BROWN} />

        {/* === Band 4: green diamonds row === */}
        <rect x="0" y="40" width="60" height="40" fill={SADU_GREEN} />
        <polygon points="15,40 30,60 15,80 0,60" fill={SADU_CREAM} />
        <polygon points="45,40 60,60 45,80 30,60" fill={SADU_CREAM} />
        <polygon points="15,48 22,60 15,72 8,60" fill={SADU_RED} />
        <polygon points="45,48 52,60 45,72 38,60" fill={SADU_RED} />
        <circle cx="15" cy="60" r="2" fill={SADU_BROWN} />
        <circle cx="45" cy="60" r="2" fill={SADU_BROWN} />

        {/* === Band 5: brown thin stripe === */}
        <rect x="0" y="80" width="60" height="4" fill={SADU_BROWN} />

        {/* === Band 6: red triangles pointing inward === */}
        <rect x="0" y="84" width="60" height="22" fill={SADU_CREAM} />
        <polygon points="0,84 15,84 7.5,106" fill={SADU_RED} />
        <polygon points="15,84 30,84 22.5,106" fill={SADU_BROWN} />
        <polygon points="30,84 45,84 37.5,106" fill={SADU_RED} />
        <polygon points="45,84 60,84 52.5,106" fill={SADU_BROWN} />

        {/* === Band 7: brown solid bar === */}
        <rect x="0" y="106" width="60" height="10" fill={SADU_BROWN} />

        {/* === Band 8: green/red checker diamonds === */}
        <rect x="0" y="116" width="60" height="44" fill={SADU_CREAM} />
        <polygon points="10,116 20,138 10,160 0,138" fill={SADU_GREEN} />
        <polygon points="30,116 40,138 30,160 20,138" fill={SADU_RED} />
        <polygon points="50,116 60,138 50,160 40,138" fill={SADU_GREEN} />
        <polygon points="10,126 16,138 10,150 4,138" fill={SADU_CREAM} />
        <polygon points="30,126 36,138 30,150 24,138" fill={SADU_CREAM} />
        <polygon points="50,126 56,138 50,150 44,138" fill={SADU_CREAM} />

        {/* === Band 9: brown thin stripe === */}
        <rect x="0" y="160" width="60" height="4" fill={SADU_BROWN} />

        {/* === Band 10: red bar with green dashes === */}
        <rect x="0" y="164" width="60" height="14" fill={SADU_RED} />
        <rect x="4" y="170" width="8" height="2" fill={SADU_GREEN} />
        <rect x="20" y="170" width="8" height="2" fill={SADU_GREEN} />
        <rect x="36" y="170" width="8" height="2" fill={SADU_GREEN} />
        <rect x="52" y="170" width="6" height="2" fill={SADU_GREEN} />

        {/* === Band 11: brown thin stripe === */}
        <rect x="0" y="178" width="60" height="3" fill={SADU_BROWN} />

        {/* === Band 12: zigzag chevrons === */}
        <rect x="0" y="181" width="60" height="22" fill={SADU_CREAM} />
        <polyline points="0,192 10,184 20,192 30,184 40,192 50,184 60,192" fill="none" stroke={SADU_RED} strokeWidth="3" />
        <polyline points="0,200 10,192 20,200 30,192 40,200 50,192 60,200" fill="none" stroke={SADU_BROWN} strokeWidth="2" />

        {/* === Band 13: brown solid bar with cream dots === */}
        <rect x="0" y="203" width="60" height="14" fill={SADU_BROWN} />
        <circle cx="10" cy="210" r="2" fill={SADU_CREAM} />
        <circle cx="30" cy="210" r="2" fill={SADU_CREAM} />
        <circle cx="50" cy="210" r="2" fill={SADU_CREAM} />

        {/* === Band 14: green endcap === */}
        <rect x="0" y="217" width="60" height="23" fill={SADU_GREEN} />
        <polygon points="0,217 15,240 30,217" fill={SADU_CREAM} />
        <polygon points="30,217 45,240 60,217" fill={SADU_CREAM} />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#sadu-tile)" />
  </svg>
);

export const SaduBorders = () => {
  const isMobile = useIsMobile();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (isMobile) return; // skip parallax on mobile to keep it smooth
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // patterns drift slower than scroll (0.35× speed)
        setOffset(window.scrollY * 0.35);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  // Inner-edge fade masks (left strip fades on its right edge; right strip on its left edge)
  const fadeLeft =
    "linear-gradient(to right, hsl(0 0% 0% / 1) 0%, hsl(0 0% 0% / 1) 60%, hsl(0 0% 0% / 0) 100%)";
  const fadeRight =
    "linear-gradient(to left, hsl(0 0% 0% / 1) 0%, hsl(0 0% 0% / 1) 60%, hsl(0 0% 0% / 0) 100%)";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 right-0 z-[1]">
      {/* Left border */}
      <div
        className="absolute inset-y-0 left-0 w-[28px] sm:w-[40px] md:w-[52px] lg:w-[60px] overflow-hidden"
        style={{ WebkitMaskImage: fadeLeft, maskImage: fadeLeft }}
      >
        <div
          className="absolute inset-x-0 -top-[240px] -bottom-[240px]"
          style={{ transform: `translate3d(0, ${offset}px, 0)`, willChange: "transform" }}
        >
          <SaduSVG />
        </div>
      </div>

      {/* Right border */}
      <div
        className="absolute inset-y-0 right-0 w-[28px] sm:w-[40px] md:w-[52px] lg:w-[60px] overflow-hidden"
        style={{ WebkitMaskImage: fadeRight, maskImage: fadeRight }}
      >
        <div
          className="absolute inset-x-0 -top-[240px] -bottom-[240px]"
          style={{ transform: `translate3d(0, ${-offset}px, 0)`, willChange: "transform" }}
        >
          <SaduSVG />
        </div>
      </div>
    </div>
  );
};
