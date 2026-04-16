import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useState } from "react";

const navItems = [
  { ar: "الرئيسية", en: "Home", href: "#home" },
  { ar: "المميزات", en: "Features", href: "#features" },
  { ar: "خطّط الآن", en: "Plan", href: "#wizard" },
  { ar: "لوحة التحكم", en: "Dashboard", href: "#dashboard" },
];

export const Navbar = () => {
  const [lang, setLang] = useState<"ar" | "en">("ar");

  const toggleLang = () => {
    const next = lang === "ar" ? "en" : "ar";
    setLang(next);
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
  };

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
                {lang === "ar" ? item.ar : item.en}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="rounded-full text-xs"
            >
              <Globe className="me-1 h-3.5 w-3.5" />
              {lang === "ar" ? "EN" : "ع"}
            </Button>
            <Button size="sm" className="hidden rounded-full bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex">
              {lang === "ar" ? "ابدأ" : "Start"}
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
