import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Globe, Building2, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const toggleLang = () => {
    i18n.changeLanguage(isAr ? "en" : "ar");
  };

  const navItems = [
    { key: "home", href: "#home" },
    { key: "features", href: "#features" },
    { key: "plan", href: "#wizard" },
    { key: "dashboard", href: "#dashboard" },
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
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden rounded-full text-xs text-foreground/80 hover:text-primary sm:inline-flex"
            >
              <Link to="/vendor">
                <Building2 className="me-1 h-3.5 w-3.5" />
                {t("nav.partners")}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="rounded-full text-xs"
            >
              <Globe className="me-1 h-3.5 w-3.5" />
              {t("nav.lang")}
            </Button>
            <Button size="sm" asChild className="hidden rounded-full bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex">
              <a href="#wizard">{t("nav.start")}</a>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
