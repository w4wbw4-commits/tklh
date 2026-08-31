import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShieldCheck, CalendarCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { SiteMenuSheet } from "./SiteMenuSheet";
import { isAllowlistedAdmin } from "@/lib/admins";

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

  const isPrimaryAdmin = isAllowlistedAdmin(user);

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
    const adminName =
      (user?.user_metadata?.full_name as string | undefined)?.trim() ||
      user?.email?.split("@")[0] ||
      (isAr ? "مدير" : "admin");
    toast.success(t("nav.adminWelcome", { name: adminName }), { duration: 6000 });
  }, [isPrimaryAdmin, t, user, isAr]);

  const toggleLang = () => {
    i18n.changeLanguage(isAr ? "en" : "ar");
  };

  // One product, one journey — the old "Packages" entry is gone for good.
  const navItems = [
    { key: "home", href: "/", type: "route" as const },
    { key: "about", href: "/about", type: "route" as const, labelOverride: t("nav.aboutFull") },
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
          className={`flex items-center justify-between gap-2 rounded-full px-3 py-1 transition-all duration-500 border sm:px-4 sm:py-1.5`}

          style={{
            background: "#163726",
            borderColor: scrolled ? "hsl(var(--gold) / 0.55)" : "hsl(var(--gold) / 0.28)",
          }}
        >
          {/* Start edge: hamburger menu. In RTL this sits on the right; in LTR on the left. */}
          <div className="flex shrink-0 items-center">
            <SiteMenuSheet isPrimaryAdmin={isPrimaryAdmin} />
          </div>

          {/* Center cluster: logo, nav links, and action buttons. */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            <div className="flex shrink-0 items-center gap-2">
              <Logo />
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const label = ("labelOverride" in item && item.labelOverride) || t(`nav.${item.key}`);
                const cls =
                  "relative rounded-full px-4 py-1 text-sm font-medium transition-all after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-0 after:-translate-x-1/2 after:transition-all hover:after:w-1/2";

                const linkStyle = { color: "hsl(var(--cream) / 0.86)" } as const;
                void 0;

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
              {/* Primary CTA — compact pill in the top corner. */}
              <Button
                size="sm"
                asChild
                className="h-7 rounded-full border px-3 text-xs font-semibold sm:h-8 sm:px-4 sm:text-sm"
                style={{
                  background: "transparent",
                  borderColor: "hsl(var(--gold) / 0.65)",
                  color: "hsl(var(--cream))",
                }}
              >
                <Link to="/planner">
                  <CalendarCheck className="h-3.5 w-3.5 sm:me-1.5" />
                  <span>{t("common.planAndBook")}</span>
                </Link>
              </Button>

              {/* Follow-up plan — icon-only on mobile, labelled on desktop. */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                aria-label={t("nav.myDashboard")}
                className="hidden h-7 w-7 rounded-full p-0 text-[hsl(var(--cream))] hover:bg-white/10 sm:inline-flex sm:h-8 sm:w-auto sm:px-3 sm:text-xs"
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
                  className="hidden h-7 w-7 rounded-full bg-primary-foreground p-0 text-primary hover:bg-primary-foreground/90 sm:inline-flex sm:h-8 sm:w-auto sm:px-3"
                >
                  <Link to="/admin">
                    <ShieldCheck className="h-4 w-4 sm:me-1 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">{t("nav.admin")}</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* End edge: language toggle. In RTL this sits on the left; in LTR on the right. */}
          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              aria-label={isAr ? "Switch to English" : "التبديل للعربية"}
              className="h-7 w-7 rounded-full p-0 text-[10px] font-bold text-[hsl(var(--cream))] hover:bg-white/10 sm:h-8 sm:w-8 sm:text-xs"
            >
              {isAr ? "EN" : "AR"}
            </Button>
          </div>

        </div>
      </div>
    </motion.header>
  );
};
