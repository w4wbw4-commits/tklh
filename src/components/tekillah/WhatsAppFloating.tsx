/**
 * Compact primary CTA — "خطّط واحجز الآن" — routes users straight to the
 * planning wizard. Rendered inside the navbar next to the logo so it is
 * visible on every page without overlapping content.
 */
import { Link } from "react-router-dom";

export const WhatsAppFloating = () => (
  <Link
    to="/planner"
    aria-label="خطّط واحجز الآن"
    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm ring-1 ring-white/60 transition-transform hover:scale-105 active:scale-95"
    style={{ background: "#163726", color: "#A7CAA1" }}
  >
    <Sparkles className="h-3 w-3" aria-hidden="true" />
    <span>خطّط واحجز الآن</span>
  </Link>
);
