/**
 * Floating primary CTA — "خطّط واحجز الآن" — routes users straight to the
 * planning wizard. Positioned bottom-left so it doesn't collide with the
 * scroll-to-top affordance on the right.
 */
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export const WhatsAppFloating = () => (
  <Link
    to="/planner"
    aria-label="خطّط واحجز الآن"
    className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-[0_12px_30px_-8px_rgba(22,55,38,0.55)] ring-2 ring-white/70 transition-transform hover:scale-105 active:scale-95"
    style={{ background: "#163726", color: "#cba45c" }}
  >
    <Sparkles className="h-4 w-4" aria-hidden="true" />
    <span>خطّط واحجز الآن</span>
    <span className="absolute -top-1 -right-1 flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "hsl(var(--green))" }} />
      <span className="relative inline-flex h-3 w-3 rounded-full ring-2 ring-white" style={{ background: "hsl(var(--green))" }} />
    </span>
  </Link>
);
