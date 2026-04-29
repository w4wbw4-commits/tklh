import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Globe, LayoutDashboard, ShieldCheck, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Primary admin allowlist — phone +966554430196 (synthetic email used by phone-OTP login).
const PRIMARY_ADMIN_EMAIL = "966554430196@phone.tekillah.app";
const PRIMARY_ADMIN_PHONE = "+966554430196";

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAr = i18n.language === "ar";
  const welcomedRef = useRef(false);

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
    { key: "home", href: "#home" },
    { key: "features", href: "#features" },
    { key: "plan", href: "#wizard" },
  ] as const;

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <div className="glass flex items-center justify-between rounded-full border border-border/60 px-4 py-2.5 shadow-soft">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-foreground/75 transition-colors hover:bg-secondary hover:text-foreground"
              >
                {t(`nav.${item.key}`)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden rounded-full text-xs text-foreground/80 hover:text-primary sm:inline-flex"
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="me-1 h-3.5 w-3.5" />
                  {t("nav.myDashboard")}
                </Link>
              </Button>
            )}
            {/* Partner portal entry — visible to everyone so partners can always log in */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden rounded-full border-primary/30 text-xs text-primary hover:bg-primary hover:text-primary-foreground sm:inline-flex"
            >
              <Link to={user ? "/partner" : "/auth?redirect=/partner&role=vendor"}>
                <Building2 className="me-1 h-3.5 w-3.5" />
                {t("nav.partnerPortal", { defaultValue: isAr ? "بوابة الشركاء" : "Partner Portal" })}
              </Link>
            </Button>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="rounded-full text-xs"
            >
              <Globe className="me-1 h-3.5 w-3.5" />
              {t("nav.lang")}
            </Button>
            {!user && (
              <Button size="sm" asChild className="hidden rounded-full bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex">
                <Link to="/auth">{t("nav.start")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
