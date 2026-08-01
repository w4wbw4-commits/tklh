import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import cardBgUrl from "@/assets/invite-card-green.jpg";

/**
 * Fullscreen splash — an invitation card that unseals and opens.
 *
 * Phase 1: the faded vintage invitation ground with the olive wax seal
 *          (official TKLH chair mark, untouched) pressed in the centre.
 * Phase 2: the seal lifts and the card splits open like two doors,
 *          revealing the site behind it.
 */
const SEAL_MS = 1900;
const OPEN_MS = 1400;

/** Organic wavy wax-seal outline built from polar coordinates. */
const useSealPath = (radius: number, lobes: number, amp: number, seed: number) =>
  useMemo(() => {
    const steps = 240;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const r =
        radius *
        (1 + amp * Math.sin(a * lobes + seed) + amp * 0.35 * Math.sin(a * (lobes * 2 + 1) + seed * 2));
      pts.push(`${(100 + r * Math.cos(a)).toFixed(2)},${(100 + r * Math.sin(a)).toFixed(2)}`);
    }
    return `M${pts.join(" L")} Z`;
  }, [radius, lobes, amp, seed]);

export const Preloader = () => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"seal" | "opening" | "done">("seal");

  const outerPath = useSealPath(88, 11, 0.035, 0.6);
  const innerPath = useSealPath(80, 11, 0.03, 0.6);

  useEffect(() => {
    const a = window.setTimeout(() => setPhase("opening"), SEAL_MS);
    const b = window.setTimeout(() => setPhase("done"), SEAL_MS + OPEN_MS);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  const opening = phase !== "seal";
  const done = phase === "done";

  const half = (side: "left" | "right") => (
    <div
      className="absolute inset-y-0 w-1/2 overflow-hidden"
      style={{
        [side]: 0,
        transformOrigin: side === "left" ? "left center" : "right center",
        transform: opening
          ? `perspective(1600px) rotateY(${side === "left" ? "" : "-"}72deg) translateX(${side === "left" ? "-" : ""}6%)`
          : "perspective(1600px) rotateY(0deg)",
        transition: `transform ${OPEN_MS}ms cubic-bezier(0.65,0,0.35,1), opacity ${OPEN_MS}ms ease-in`,
        opacity: opening ? 0 : 1,
        boxShadow: "0 0 80px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="absolute inset-y-0 w-[200%]"
        style={{
          [side]: 0,
          backgroundImage: `url(${cardBgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* soft crease along the fold */}
      <div
        className="pointer-events-none absolute inset-y-0 w-16"
        style={{
          [side === "left" ? "right" : "left"]: 0,
          background:
            side === "left"
              ? "linear-gradient(to right, transparent, rgba(0,0,0,0.22))"
              : "linear-gradient(to left, transparent, rgba(0,0,0,0.22))",
        }}
      />
    </div>
  );

  return (
    <div
      aria-hidden={done}
      role="status"
      className={`fixed inset-0 z-[9999] overflow-hidden ${done ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{ backgroundColor: "#163726", transition: "opacity 300ms ease-out" }}
    >
      {half("left")}
      {half("right")}

      {/* seal + slogan */}
      <div
        className="absolute inset-0 grid place-items-center"
        style={{
          transform: opening ? "scale(1.35) translateY(-8px)" : "scale(1)",
          opacity: opening ? 0 : 1,
          transition: `transform ${OPEN_MS}ms cubic-bezier(0.22,1,0.36,1), opacity 700ms ease-out`,
        }}
      >
        <div className="flex flex-col items-center gap-7">
          <div className="animate-[sealPress_900ms_cubic-bezier(0.22,1,0.36,1)_both]">
            <svg
              viewBox="0 0 200 200"
              className="h-44 w-44 sm:h-56 sm:w-56 drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
              aria-label="TKLH تِكله"
              role="img"
            >
              <defs>
                <radialGradient id="waxFill" cx="0.38" cy="0.32" r="0.85">
                  <stop offset="0%" stopColor="#f3ecd9" />
                  <stop offset="55%" stopColor="#e8dfc6" />
                  <stop offset="100%" stopColor="#d6c8a4" />
                </radialGradient>
              </defs>

              <path d={outerPath} fill="url(#waxFill)" />
              <path d={innerPath} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="2.5" />
              <circle cx="100" cy="100" r="66" fill="none" stroke="#A7CAA1" strokeWidth="1.4" opacity="0.85" />

              {/* official TKLH chair mark — unchanged */}
              <g
                stroke="#A7CAA1"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
              >
                <ellipse cx="100" cy="76" rx="17" ry="22" />
                <ellipse cx="100" cy="76" rx="12" ry="16.5" opacity="0.55" />
                <path d="M88 92 L86 112" />
                <path d="M112 92 L114 112" />
                <path d="M78 114 Q100 106 122 114 Q100 124 78 114 Z" />
                <path d="M78 118 Q100 128 122 118" opacity="0.6" />
                <path d="M82 120 L79 146" />
                <path d="M118 120 L121 146" />
                <path d="M94 123 L93 142" opacity="0.7" />
                <path d="M106 123 L107 142" opacity="0.7" />
                <path d="M81 136 Q100 141 119 136" opacity="0.5" />
              </g>

              <path
                d={outerPath}
                fill="none"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="1.6"
                transform="translate(-1,-1)"
              />
            </svg>
          </div>

          <span
            className="font-tagline text-center text-base font-medium tracking-[0.14em] sm:text-lg animate-[sealFade_1.2s_ease-out_400ms_both]"
            style={{ color: "#163726" }}
          >
            {t("preloader.slogan")}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes sealPress {
          0%   { opacity: 0; transform: scale(1.5) rotate(-9deg); }
          60%  { opacity: 1; transform: scale(0.96) rotate(1.5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes sealFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
