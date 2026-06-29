import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Globe, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { SiteMenuSheet } from "./SiteMenuSheet";
import { ThemeToggle } from "./ThemeToggle";

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
    { key: "about", href: "/about", type: "route" as const, labelOverride: isAr ? "تعرف على تِكله" : "About TKLH" },
    { key: "packages", href: "/packages", type: "route" as const, labelOverride: isAr ? "الباقات" : "Packages" },
    { key: "plan", href: "/planner", type: "route" as const, disabled: true },
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
          className={`flex items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ${
            scrolled
              ? "border border-gold/30 shadow-[0_8px_30px_-12px_hsl(var(--green)/0.3)]"
              : "border border-gold/20 shadow-soft"
          }`}
          style={{
            background: scrolled
              ? "hsl(var(--background) / 0.78)"
              : "hsl(var(--background) / 0.6)",
            backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "blur(14px) saturate(1.2)",
            WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "blur(14px) saturate(1.2)",
          }}
        >
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const label = ("labelOverride" in item && item.labelOverride) || t(`nav.${item.key}`);
              const cls =
                "relative rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-all hover:text-primary-deep after:absolute after:bottom-1 after:left-1/2 after:h-px after:w-0 after:-translate-x-1/2 after:bg-gold after:transition-all hover:after:w-1/2";
              const isDisabled = "disabled" in item && item.disabled;
              if (isDisabled) {
                return (
                  <span
                    key={item.href}
                    aria-disabled="true"
                    className="relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-foreground/50 cursor-not-allowed select-none"
                  >
                    {label}
                    <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold text-neutral-600 ring-1 ring-neutral-300">
                      قَرِيبًا
                    </span>
                  </span>
                );
              }
              if (item.type === "route") {
                return (
                  <Link key={item.href} to={item.href} className={cls}>
                    {label}
                  </Link>
                );
              }
              return (
                <a key={item.href} href={item.href} className={cls}>
                  {label}
                </a>
              );
            })}

          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden rounded-full text-xs text-foreground hover:bg-primary/10 hover:text-primary sm:inline-flex"
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="me-1 h-3.5 w-3.5" />
                  {t("nav.myDashboard")}
                </Link>
              </Button>
            )}
            {isPrimaryAdmin && (
              <Button
                size="sm"
                asChild
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/admin">
                  <ShieldCheck className="me-1 h-3.5 w-3.5" />
                  {t("nav.admin")}
                </Link>
              </Button>
            )}
            {!user && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden rounded-full text-xs font-semibold text-foreground/85 hover:bg-transparent hover:text-primary-deep sm:inline-flex"
              >
                <Link to="/auth">{t("nav.start")}</Link>
              </Button>
            )}
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
