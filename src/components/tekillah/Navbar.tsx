import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { WhatsAppFloating } from "./WhatsAppFloating";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Globe, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { SiteMenuSheet } from "./SiteMenuSheet";


// Primary admin allowlist — phone +966554430196 (synthetic email used by phone-OTP login).
const PRIMARY_ADMIN_EMAIL = "966554430196@phone.tekillah.app";
const PRIMARY_ADMIN_PHONE = "+966554430196";

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAr = i18n.language === "ar";
  const welcomedRef = useRef(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isPrimaryAdmin =
    !!user && (user.email === PRIMARY_ADMIN_EMAIL || user.phone === PRIMARY_ADMIN_PHONE);

  // Diagnostic welcome toast — fires once per session for the primary admin.
  useEffect(() => {
    if (!isPrimaryAdmin || welcomedRef.current) return;
    const key = "tekillah:adminWelcomed";
    if (sessionStorage.getItem(key)) {
      welcomedRef.current = true;
      return;
    }
    welcomedRef.current = true;
    sessionStorage.setItem(key, "1");
    toast.success(t("nav.adminWelcome"), { duration: 6000 });
  }, [isPrimaryAdmin, t]);

  const toggleLang = () => {
    i18n.changeLanguage(isAr ? "en" : "ar");
  };

  const navItems = [
    { key: "home", href: "/", type: "route" as const },
    { key: "about", href: "/about", type: "route" as const, labelOverride: t("nav.aboutFull") },
    {
      key: "packages",
      href: "/packages",
      type: "route" as const,
      labelOverride: t("nav.packages"),
      disabled: !isPrimaryAdmin,
      badge: { ar: "قريباً", en: "Soon" },
    },
  ];


  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className={`mx-auto px-4 transition-all duration-500 ${scrolled ? "mt-2 max-w-6xl" : "mt-4 max-w-6xl"}`}>
        <div
          className={`flex items-center justify-between gap-2 rounded-full px-3 py-2 transition-all duration-500 border sm:px-4 sm:py-2.5`}
          style={{
            background: "#163726",
            borderColor: scrolled ? "hsl(var(--gold) / 0.55)" : "hsl(var(--gold) / 0.28)",
          }}
        >
          <div className="flex shrink-0 items-center gap-2">
            <Logo />
            <span className="hidden sm:inline-flex">
              <WhatsAppFloating />
            </span>
          </div>


          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const label = ("labelOverride" in item && item.labelOverride) || t(`nav.${item.key}`);
              const cls =
                "relative rounded-full px-4 py-2 text-sm font-medium transition-all after:absolute after:bottom-1 after:left-1/2 after:h-px after:w-0 after:-translate-x-1/2 after:transition-all hover:after:w-1/2";
              const linkStyle = { color: "hsl(var(--cream) / 0.86)" } as const;
              const disabledCls =
                "relative flex cursor-not-allowed items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium opacity-70";
              const disabledStyle = { color: "hsl(var(--cream) / 0.45)" } as const;
              const badge = "badge" in item && item.badge ? (isAr ? item.badge.ar : item.badge.en) : null;
              if ("disabled" in item && item.disabled) {
                return (
                  <span key={item.href} aria-disabled="true" className={disabledCls} style={disabledStyle}>
                    {label}
                    {badge && (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{ border: "1px solid hsl(var(--gold) / 0.5)", color: "hsl(var(--gold))" }}
                      >
                        {badge}
                      </span>
                    )}
                  </span>
                );
              }
              if (item.type === "route") {
                return (
                  <Link key={item.href} to={item.href} className={cls} style={linkStyle}>
                    {label}
                  </Link>
                );
              }
              return (
                <a key={item.href} href={item.href} className={cls} style={linkStyle}>
                  {label}
                </a>
              );
            })}

          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Primary CTA — the header's job on mobile: one clear action. */}
            <Button
              asChild
              size="sm"
              className="h-9 rounded-full px-3 text-[12.5px] font-bold shadow-sm hover:opacity-90 sm:h-9 sm:px-4 sm:text-[13px]"
              style={{ backgroundColor: "hsl(var(--gold))", color: "#163726" }}
            >
              <Link to="/planner">
                <CalendarCheck className="me-1 h-4 w-4" />
                {t("nav.planBook")}
              </Link>
            </Button>

            {/* Follow-up plan — icon-only on mobile, labelled on desktop. */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              aria-label={t("nav.myDashboard")}
              className="h-9 w-9 rounded-full p-0 text-[hsl(var(--cream))] hover:bg-white/10 sm:h-9 sm:w-auto sm:px-3 sm:text-xs"
            >
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4 sm:me-1 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">{t("nav.myDashboard")}</span>
              </Link>
            </Button>

            {isPrimaryAdmin && (
              <Button
                size="sm"
                asChild
                aria-label={t("nav.admin")}
                className="h-9 w-9 rounded-full bg-primary-foreground p-0 text-primary hover:bg-primary-foreground/90 sm:w-auto sm:px-3"
              >
                <Link to="/admin">
                  <ShieldCheck className="h-4 w-4 sm:me-1 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">{t("nav.admin")}</span>
                </Link>
              </Button>
            )}

            {/* Compact AR/EN language toggle — visible on every breakpoint.
                Uses i18next changeLanguage; persistence + dir flip handled in src/i18n/index.ts. */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label={isAr ? "Switch to English" : "التبديل إلى العربية"}
              className="inline-flex h-9 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold uppercase tracking-wide transition hover:bg-white/10"
              style={{ borderColor: "hsl(var(--gold) / 0.5)", color: "hsl(var(--cream))" }}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{isAr ? "EN" : "ع"}</span>
            </button>

            {/* Hamburger pinned at the very END of the cluster — in RTL this
                renders at the far-right (start edge), which is where the user
                expects the primary menu in Arabic. Visible on every breakpoint. */}
            <SiteMenuSheet isPrimaryAdmin={isPrimaryAdmin} />
          </div>

        </div>
      </div>
    </motion.header>
  );
};
