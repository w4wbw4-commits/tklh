import { useEffect, useState } from "react";
const logoAsset = { url: "https://id-preview--d978ea61-fed9-4b34-bbe9-757c7793d22b.lovable.app/__l5e/assets-v1/0da52b6a-f45a-4029-8e0a-98613e28b596/tklh-logo-transparent.png" };

/**
 * Fullscreen splash shown on the homepage while the initial paint settles.
 *
 * Dismissal logic:
 * - Displays the splash for exactly 2.5 seconds so the branding animation is
 *   fully experienced, regardless of how fast the page loads.
 * - The main homepage data fetching continues asynchronously in the background.
 *
 * Brand: the whole logo group is forced to Luxury Olive Green (#233324).
 * The chair PNG is tinted via CSS mask so it inherits the exact brand color.
 */
const MIN_VISIBLE_MS = 2500;
const MAX_VISIBLE_MS = 2500;
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
      <div className="flex flex-col items-center gap-4">
        <img
          src={logoAsset.url}
          alt="TKLH تِكله"
          className="h-24 w-auto sm:h-28 object-contain select-none"
          draggable={false}
        />
        <span className="font-tagline text-lg font-medium tracking-wide text-[#A7CAA1] sm:text-xl">
          لجميع مناسباتك
        </span>
      </div>
    </div>
  );
};
