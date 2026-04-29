import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  /** The numeric target. Pass the digits only — separators are handled below. */
  value: number;
  /** Optional prefix (e.g. currency) */
  prefix?: string;
  /** Optional suffix (e.g. "+", "%", "ر.س") */
  suffix?: string;
  /** Animation duration in ms */
  duration?: number;
  /** Use Arabic-Indic digits */
  arabicDigits?: boolean;
  className?: string;
}

const toArabicDigits = (s: string) =>
  s.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/**
 * Lightweight scroll-triggered counter — runs once when ~30% visible.
 * Used to bring the static stats to life without disrupting layout.
 */
export const AnimatedCounter = ({
  value,
  prefix = "",
  suffix = "",
  duration = 1600,
  arabicDigits = false,
  className,
}: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  const formatted = display.toLocaleString("en-US");
  const text = arabicDigits ? toArabicDigits(formatted) : formatted;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
};
