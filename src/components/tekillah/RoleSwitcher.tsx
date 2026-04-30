import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Building2, Home, ChevronUp, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const PRIMARY_ADMIN_PHONES = ["+966554430196", "+966544057854"];
const PRIMARY_ADMIN_EMAILS = PRIMARY_ADMIN_PHONES.map(
  (p) => `${p.replace("+", "")}@phone.tekillah.app`,
);

/**
 * RoleSwitcher — floating quick-switch panel visible only to admins.
 * Lets the same admin account jump seamlessly between Admin Console,
 * Partner Dashboard, and the public site to test both experiences.
 */
export const RoleSwitcher = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const isAr = i18n.language?.startsWith("ar");
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const allowlisted =
      (user.email && PRIMARY_ADMIN_EMAILS.includes(user.email)) ||
      (user.phone && PRIMARY_ADMIN_PHONES.includes(user.phone));
    if (allowlisted) {
      setIsAdmin(true);
      return;
    }
    (async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(Boolean(data));
    })();
  }, [user]);

  // Hide on auth pages — switcher is for authenticated admins only.
  if (!isAdmin || hidden || pathname.startsWith("/auth")) return null;

  const items = [
    {
      to: "/admin",
      label: isAr ? "لوحة المسؤول" : "Admin Console",
      icon: ShieldCheck,
      active: pathname.startsWith("/admin"),
    },
    {
      to: "/partner",
      label: isAr ? "بوابة الشريك" : "Partner Dashboard",
      icon: Building2,
      active: pathname.startsWith("/partner") || pathname.startsWith("/vendor"),
    },
    {
      to: "/",
      label: isAr ? "العرض العام" : "Public Site",
      icon: Home,
      active: pathname === "/",
    },
  ];

  return (
    <div
      className="fixed bottom-5 z-50"
      style={{ [isAr ? "left" : "right"]: "1rem" } as React.CSSProperties}
    >
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mb-2 w-64 rounded-2xl border border-gold/30 bg-card/95 p-3 shadow-[0_18px_40px_-12px_hsl(var(--green)/0.4)] backdrop-blur-xl"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-deep">
                {isAr ? "تبديل سريع للأدوار" : "Quick role switch"}
              </span>
              <button
                type="button"
                onClick={() => setHidden(true)}
                aria-label={isAr ? "إخفاء" : "Hide"}
                className="grid h-6 w-6 place-items-center rounded-full text-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {items.map(({ to, label, icon: Icon, active }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-primary-deep text-gold shadow-md"
                        : "text-foreground/75 hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-lg ${
                        active
                          ? "bg-gold text-primary-deep"
                          : "bg-muted text-primary-deep"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{label}</span>
                    {active && (
                      <span className="text-[10px] font-bold text-gold">
                        ●
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-2 px-2 text-[10px] text-foreground/50">
              {isAr
                ? "هذه اللوحة مرئية للمسؤولين فقط."
                : "Visible to admins only."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.94 }}
        className="flex items-center gap-2 rounded-full border border-gold/50 bg-primary-deep px-4 py-3 text-gold shadow-[0_10px_24px_-6px_hsl(var(--green)/0.55)] transition-transform"
        aria-expanded={open}
        aria-label={isAr ? "تبديل الأدوار" : "Switch role"}
      >
        <ShieldCheck className="h-4 w-4" />
        <span className="text-xs font-bold">
          {isAr ? "تبديل الدور" : "Switch role"}
        </span>
        <motion.span
          animate={{ rotate: open ? 0 : 180 }}
          transition={{ duration: 0.2 }}
          className="grid h-5 w-5 place-items-center"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </motion.span>
      </motion.button>
    </div>
  );
};
