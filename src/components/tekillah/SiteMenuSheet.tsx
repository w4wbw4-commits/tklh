import { useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Home,
  Info,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  LogIn,
  Globe,
  Phone,
  FileText,
  Building2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

interface NavLinkItem {
  type: "anchor" | "route";
  href: string;
  icon: ComponentType<{ className?: string }>;
  labelKey: string;
  fallback: { ar: string; en: string };
}

interface Props {
  isPrimaryAdmin?: boolean;
}

/**
 * SiteMenuSheet — slide-in side menu triggered by a hamburger button.
 *
 * Why a Sheet (not the full Sidebar shell)? The marketing site is a single
 * scrollable page; we don't need the persistent app-shell behaviour. A Sheet
 * gives us a polished slide-over on every breakpoint with auto-close, focus
 * trap and ESC handling out of the box.
 *
 * Direction-aware: opens from the start edge (right in RTL, left in LTR) so
 * it feels native to Arabic users.
 */
export const SiteMenuSheet = ({ isPrimaryAdmin }: Props) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAr = i18n.language === "ar";
  const [open, setOpen] = useState(false);

  // Section anchors — clicking them auto-closes the sheet so the user lands
  // on the section without an overlay covering it.
  const sectionLinks: NavLinkItem[] = [
    { type: "anchor", href: "#home", icon: Home, labelKey: "nav.home", fallback: { ar: "الرئيسية", en: "Home" } },
    { type: "anchor", href: "#about", icon: Info, labelKey: "nav.about", fallback: { ar: "تعرف على تِكله", en: "About TKLH" } },
    { type: "anchor", href: "#packages", icon: FileText, labelKey: "nav.packages", fallback: { ar: "الباقات", en: "Packages" } },
    { type: "anchor", href: "#wizard", icon: Sparkles, labelKey: "nav.plan", fallback: { ar: "خطط ليلتك", en: "Plan your night" } },
    { type: "anchor", href: "#features", icon: FileText, labelKey: "nav.features", fallback: { ar: "المزايا", en: "Features" } },
    { type: "anchor", href: "#contact", icon: Phone, labelKey: "nav.contact", fallback: { ar: "تواصل معنا", en: "Contact" } },
  ];

  const accountLinks: NavLinkItem[] = [
    user
      ? { type: "route", href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.myDashboard", fallback: { ar: "لوحتي", en: "My Dashboard" } }
      : { type: "route", href: "/auth", icon: LogIn, labelKey: "nav.start", fallback: { ar: "ابدأ الآن", en: "Get started" } },
    { type: "route", href: "/vendor", icon: Building2, labelKey: "nav.joinAsVendor", fallback: { ar: "انضم كمزود خدمة", en: "Join as Vendor" } },
    ...(isPrimaryAdmin
      ? [{ type: "route" as const, href: "/admin", icon: ShieldCheck, labelKey: "nav.admin", fallback: { ar: "الإدارة", en: "Admin" } }]
      : []),
  ];

  const close = () => setOpen(false);
  const toggleLang = () => i18n.changeLanguage(isAr ? "en" : "ar");

  // Render a single row — mirrors the same look for anchor + Link variants.
  const renderItem = (item: NavLinkItem) => {
    const Icon = item.icon;
    const label = t(item.labelKey, { defaultValue: isAr ? item.fallback.ar : item.fallback.en });
    const cls =
      "group flex items-center gap-3 rounded-2xl border border-transparent bg-card/50 px-4 py-3 text-sm font-medium text-foreground/85 transition-all hover:border-gold/40 hover:bg-cream hover:text-primary-deep";
    const inner = (
      <>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gold/20 group-hover:text-primary-deep">
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1">{label}</span>
      </>
    );
    if (item.type === "route") {
      return (
        <Link key={item.href} to={item.href} onClick={close} className={cls}>
          {inner}
        </Link>
      );
    }
    return (
      <a key={item.href} href={item.href} onClick={close} className={cls}>
        {inner}
      </a>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("nav.openMenu", { defaultValue: isAr ? "فتح القائمة" : "Open menu" })}
          className="rounded-full border border-gold/30 bg-cream/40 text-foreground hover:border-gold hover:bg-gold/15 hover:text-gold dark:border-gold/40 dark:bg-card/60"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isAr ? "right" : "left"}
        className="w-[88vw] max-w-sm border-gold/20 bg-background/95 p-0 backdrop-blur-xl"
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4 text-start">
          <SheetTitle className="flex items-center justify-between gap-2">
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100dvh-72px)] flex-col overflow-y-auto p-5">
          {/* Site sections */}
          <div className="space-y-1.5">
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/50">
              {t("nav.sections", { defaultValue: isAr ? "أقسام الموقع" : "Sections" })}
            </div>
            {sectionLinks.map(renderItem)}
          </div>

          {/* Account / Roles */}
          <div className="mt-6 space-y-1.5">
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/50">
              {t("nav.account", { defaultValue: isAr ? "حسابي" : "Account" })}
            </div>
            {accountLinks.map(renderItem)}
          </div>

          {/* Preferences row pinned to the bottom */}
          <div className="mt-auto pt-6">
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/50">
              {t("nav.preferences", { defaultValue: isAr ? "التفضيلات" : "Preferences" })}
            </div>
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 bg-card/60 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLang}
                className="flex-1 rounded-xl text-xs text-foreground/80 hover:text-gold"
              >
                <Globe className="me-1 h-3.5 w-3.5" />
                {t("nav.lang")}
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="relative flex flex-1 items-center justify-center">
                <ThemeToggle className="!relative" />
                <span className="ms-1 text-xs text-foreground/70">
                  {t("nav.theme", { defaultValue: isAr ? "المظهر" : "Theme" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
