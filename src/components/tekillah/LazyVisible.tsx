import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Defers mounting `children` until the placeholder scrolls near the viewport.
 * Used on the homepage so below-the-fold sections (and their JS chunks) do
 * not compete with the hero for main-thread time on first paint.
 *
 * - `rootMargin` gives us early warmup so the chunk downloads before the user
 *   physically sees the section, keeping the reveal seamless.
 * - Falls back to eager render if IntersectionObserver is unavailable
 *   (very old browsers / SSR snapshot).
 */
export const LazyVisible = ({
  children,
  fallback = null,
  rootMargin = "400px 0px",
  minHeight,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  minHeight?: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(
    typeof window === "undefined" || typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (visible || !ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  // The reserved height is only a placeholder guard against layout shift; once
  // the real section mounts we drop it so short sections don't leave dead space.
  return (
    <div ref={ref} style={!visible && minHeight ? { minHeight } : undefined}>
      {visible ? children : fallback}
    </div>
  );

};
