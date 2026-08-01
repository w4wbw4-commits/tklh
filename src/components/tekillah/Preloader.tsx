import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Fullscreen splash — wax-seal opening.
 *
 * A hand-pressed olive wax seal (organic wavy edge) stamped on a warm
 * cream paper ground, with the official TKLH chair mark embossed inside.
 * Text content is unchanged.
 */
const MIN_VISIBLE_MS = 2500;
const MAX_VISIBLE_MS = 2500;

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
  const [ready, setReady] = useState(false);

  const outerPath = useSealPath(88, 11, 0.035, 0.6);
  const innerPath = useSealPath(80, 11, 0.03, 0.6);

  useEffect(() => {
    const start = performance.now();

    const finish = () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      window.setTimeout(() => setReady(true), wait);
    };

    if (document.readyState === "complete") {
      finish();
      return;
    }

    let done = false;
    const onLoad = () => {
      if (done) return;
      done = true;
      finish();
    };

    window.addEventListener("load", onLoad, { once: true });
    const cap = window.setTimeout(onLoad, MAX_VISIBLE_MS);

    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(cap);
    };
  }, []);

  return (
    <div
      aria-hidden={ready}
      role="status"
      className={`fixed inset-0 z-[9999] grid place-items-center transition-all duration-700 ease-out ${
        ready ? "pointer-events-none scale-[1.03] opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "#f6f1e8", willChange: "opacity, transform" }}
    >
      {/* paper texture + soft vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.7), transparent 60%), radial-gradient(circle at 50% 55%, rgba(22,55,38,0.06), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-7">
        <div className="animate-[sealPress_900ms_cubic-bezier(0.22,1,0.36,1)_both]">
          <svg
            viewBox="0 0 200 200"
            className="h-40 w-40 sm:h-52 sm:w-52 drop-shadow-[0_18px_34px_rgba(22,55,38,0.28)]"
            aria-label="TKLH تِكله"
            role="img"
          >
            <defs>
              <radialGradient id="waxFill" cx="0.38" cy="0.32" r="0.85">
                <stop offset="0%" stopColor="#2b4732" />
                <stop offset="55%" stopColor="#1d3826" />
                <stop offset="100%" stopColor="#12281b" />
              </radialGradient>
            </defs>

            {/* wax body */}
            <path d={outerPath} fill="url(#waxFill)" />
            {/* embossed inner lip */}
            <path d={innerPath} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="2.5" />
            {/* engraved ring */}
            <circle cx="100" cy="100" r="66" fill="none" stroke="#A7CAA1" strokeWidth="1.4" opacity="0.85" />

            {/* official TKLH chair mark — engraved line art */}
            <g
              stroke="#A7CAA1"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            >
              {/* medallion back */}
              <ellipse cx="100" cy="76" rx="17" ry="22" />
              <ellipse cx="100" cy="76" rx="12" ry="16.5" opacity="0.55" />
              {/* back posts down to seat */}
              <path d="M88 92 L86 112" />
              <path d="M112 92 L114 112" />
              {/* seat */}
              <path d="M78 114 Q100 106 122 114 Q100 124 78 114 Z" />
              <path d="M78 118 Q100 128 122 118" opacity="0.6" />
              {/* legs */}
              <path d="M82 120 L79 146" />
              <path d="M118 120 L121 146" />
              <path d="M94 123 L93 142" opacity="0.7" />
              <path d="M106 123 L107 142" opacity="0.7" />
              {/* stretcher */}
              <path d="M81 136 Q100 141 119 136" opacity="0.5" />
            </g>

            {/* subtle wax highlight */}
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
