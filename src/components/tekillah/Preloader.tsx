import { useEffect, useState } from "react";
import chairIcon from "@/assets/tklh-chair.png";

/**
 * Fullscreen splash shown on the homepage while the initial paint settles.
 *
 * Dismissal logic (no arbitrary long timeout):
 * - Waits for `window.load` (all critical assets flushed) AND a 500ms minimum
 *   so the fade never feels jarring on an instant cache hit.
 * - Hard safety cap at 1200ms — if the load event is delayed by a slow font
 *   or third-party, we still reveal the app.
 *
 * Brand: the whole logo group is forced to Luxury Olive Green (#233324).
 * The chair PNG is tinted via CSS mask so it inherits the exact brand color.
 */
const MIN_VISIBLE_MS = 500;
const MAX_VISIBLE_MS = 1200;
const OLIVE = "#233324";

export const Preloader = () => {
  const [ready, setReady] = useState(false);

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
      className={`fixed inset-0 z-[9999] grid place-items-center transition-all duration-500 ease-out ${
        ready ? "pointer-events-none scale-95 opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "hsl(var(--background))", willChange: "opacity, transform" }}
    >
      <div
        className="flex flex-col items-center gap-4 animate-[splashBreath_2.4s_ease-in-out_infinite]"
        style={{ color: OLIVE }}
      >
        {/* Chair icon — masked so it renders as a solid olive silhouette */}
        <span
          aria-hidden="true"
          className="block h-14 w-14 sm:h-16 sm:w-16"
          style={{
            backgroundColor: OLIVE,
            WebkitMaskImage: `url(${chairIcon})`,
            maskImage: `url(${chairIcon})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
        <div className="flex flex-col items-center leading-none">
          <span className="font-cinzel text-lg font-bold uppercase tracking-[0.32em] sm:text-xl">
            TKLH
          </span>
          <span className="font-wordmark mt-2 text-2xl font-black sm:text-3xl">
            تِكله
          </span>
        </div>
      </div>
      <style>{`
        @keyframes splashBreath {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
};
