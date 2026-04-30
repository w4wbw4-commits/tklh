import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

/**
 * PartnerFloatingCTA — sticky vertical pill anchored to the start edge
 * (right in RTL Arabic). Invites visitors to enter the Partner Portal or
 * register as a vendor. Hidden on partner/auth/admin/dashboard routes
 * where it would be redundant.
 */
export const PartnerFloatingCTA = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isAr = i18n.language?.startsWith("ar");
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Show after scrolling a bit so it doesn't fight the hero on first load.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Routes where the CTA would be noise.
  const hiddenRoutes = ["/vendor", "/partner", "/auth", "/admin", "/dashboard", "/checkout"];
  const shouldHide = hiddenRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  if (shouldHide || dismissed) return null;

  const href = user ? "/vendor" : "/vendor";
  const label = isAr ? "انضم كمزوّد خدمة" : "Join as Vendor";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: isAr ? 80 : -80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isAr ? 80 : -80 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-1/2 z-40 -translate-y-1/2 hidden md:block"
          style={{ [isAr ? "right" : "left"]: "0.75rem" } as React.CSSProperties}
        >
          <div className="group relative flex flex-col items-center gap-1 rounded-2xl border border-gold/40 bg-gradient-to-b from-primary-deep to-primary p-2 shadow-[0_10px_30px_-10px_hsl(var(--green)/0.45)] backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label={isAr ? "إغلاق" : "Dismiss"}
              className="absolute -top-2 -end-2 grid h-5 w-5 place-items-center rounded-full border border-gold/40 bg-background text-foreground/60 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
            <Link
              to={href}
              aria-label={label}
              className="flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-gold transition-all hover:scale-[1.04]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-primary-deep shadow-md">
                <Building2 className="h-5 w-5" />
              </span>
              <span
                className="text-[11px] font-bold tracking-wider"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                {label}
              </span>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Mobile: bottom-right floating bubble */}
      {visible && !dismissed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.35 }}
          className="fixed bottom-5 z-40 md:hidden"
          style={{ [isAr ? "right" : "left"]: "1rem" } as React.CSSProperties}
        >
          <Link
            to={href}
            aria-label={label}
            className="flex items-center gap-2 rounded-full border border-gold/50 bg-primary-deep px-4 py-3 text-gold shadow-[0_8px_24px_-6px_hsl(var(--green)/0.5)] transition-transform active:scale-95"
          >
            <Building2 className="h-4 w-4" />
            <span className="text-xs font-bold">{label}</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
