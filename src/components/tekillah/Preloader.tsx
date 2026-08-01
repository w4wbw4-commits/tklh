import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

/**
 * Preloader — "TKLH invitation seal" opening experience.
 *
 * Bone Ivory paper backdrop with four faint crease lines dividing the screen
 * like a folded invitation. A debossed olive wax seal (chair glyph + circular
 * letter-spaced text) presses into the paper, then the four flaps ease open
 * outwards to reveal the page underneath.
 *
 * prefers-reduced-motion: the seal is shown still for a beat, then we cut
 * straight to the content — no flap animation at all.
 */
const PRESS_MS = 900;    // seal press-in
const HOLD_MS = 700;     // beat before the flaps open
const OPEN_MS = 900;     // flaps easing outwards
const OLIVE = "hsl(var(--green))";

export const Preloader = () => {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"press" | "open" | "done">("press");

  useEffect(() => {
    const timers: number[] = [];
    if (reduce) {
      timers.push(window.setTimeout(() => setPhase("done"), PRESS_MS + HOLD_MS));
    } else {
      timers.push(window.setTimeout(() => setPhase("open"), PRESS_MS + HOLD_MS));
      timers.push(window.setTimeout(() => setPhase("done"), PRESS_MS + HOLD_MS + OPEN_MS));
    }
    return () => timers.forEach(window.clearTimeout);
  }, [reduce]);

  const opening = phase === "open" || phase === "done";
  const done = phase === "done";

  const flap = (transform: string) =>
    ({
      transform: opening ? transform : "translate(0,0)",
      transition: `transform ${OPEN_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    }) as React.CSSProperties;

  return (
    <div
      aria-hidden={done}
      role="status"
      className={`fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* === Four envelope flaps (Bone Ivory paper) === */}
      {[
        { cls: "left-0 top-0 h-1/2 w-1/2", to: "translate(-52%, -52%)" },
        { cls: "right-0 top-0 h-1/2 w-1/2", to: "translate(52%, -52%)" },
        { cls: "left-0 bottom-0 h-1/2 w-1/2", to: "translate(-52%, 52%)" },
        { cls: "right-0 bottom-0 h-1/2 w-1/2", to: "translate(52%, 52%)" },
      ].map((f, i) => (
        <div
          key={i}
          className={`absolute ${f.cls}`}
          style={{
            ...flap(reduce ? "translate(0,0)" : f.to),
            background: "hsl(var(--bone))",
            // Light paper grain + a faint crease along the inner edges.
            backgroundImage:
              "radial-gradient(hsl(var(--brass) / 0.05) 1px, transparent 1px), radial-gradient(hsl(var(--green) / 0.04) 1px, transparent 1px)",
            backgroundSize: "7px 7px, 11px 11px",
            backgroundPosition: "0 0, 3px 4px",
          }}
        />
      ))}

      {/* Crease lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: opening ? 0 : 1,
          transition: `opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)`,
          background:
            "linear-gradient(90deg, transparent calc(50% - 1px), hsl(var(--brass) / 0.22) 50%, transparent calc(50% + 1px)), linear-gradient(180deg, transparent calc(50% - 1px), hsl(var(--brass) / 0.22) 50%, transparent calc(50% + 1px))",
        }}
      />

      {/* === Seal + opening lines === */}
      <div
        className="absolute inset-0 grid place-items-center px-6 text-center"
        style={{
          opacity: opening ? 0 : 1,
          transform: opening ? "scale(0.98)" : "scale(1)",
          transition: `opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <div className="flex flex-col items-center gap-5">
          <span
            className="text-[10px] font-light uppercase tracking-[0.42em]"
            style={{ color: "hsl(var(--green) / 0.7)" }}
          >
            {t("preloader.above", { defaultValue: "دعوة خاصة" })}
          </span>

          {/* Debossed wax seal */}
          <div
            className="relative grid h-32 w-32 place-items-center rounded-full sm:h-36 sm:w-36"
            style={{
              background: "hsl(var(--green))",
              boxShadow:
                "inset 0 3px 6px hsl(var(--bone) / 0.28), inset 0 -4px 10px rgba(0,0,0,0.45), 0 2px 3px hsl(var(--bone) / 0.9)",
              transform: reduce ? "scale(1)" : phase === "press" ? "scale(1)" : "scale(1)",
              animation: reduce ? undefined : `sealPress ${PRESS_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both`,
            }}
          >
            <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
              <defs>
                <path id="sealArc" d="M60,60 m-42,0 a42,42 0 1,1 84,0" fill="none" />
              </defs>
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="hsl(var(--bone) / 0.35)"
                strokeWidth="1"
              />
              <text
                fontSize="9"
                letterSpacing="4.5"
                fill="hsl(var(--bone) / 0.75)"
                fontWeight="600"
              >
                <textPath href="#sealArc" startOffset="50%" textAnchor="middle">
                  تِكله ٢٠٢٦
                </textPath>
              </text>
              <g
                transform="translate(60 66) scale(0.5) translate(-50 -50)"
                fill="none"
                stroke="hsl(var(--bone) / 0.85)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.5))" }}
              >
                <path d="M32 20 Q50 8 68 20 L68 46 Q50 52 32 46 Z" />
                <path d="M28 52 H72 L70 62 H30 Z" />
                <path d="M33 62 V82 M67 62 V82" />
                <path d="M28 46 V56 M72 46 V56" />
              </g>
            </svg>
          </div>

          <span
            className="text-[10px] font-light uppercase tracking-[0.42em]"
            style={{ color: "hsl(var(--green) / 0.7)" }}
          >
            {t("preloader.slogan")}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes sealPress {
          0%   { transform: scale(1.16); opacity: 0; }
          70%  { transform: scale(0.985); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes sealPress { from { opacity: 1 } to { opacity: 1 } }
        }
      `}</style>
    </div>
  );
};
