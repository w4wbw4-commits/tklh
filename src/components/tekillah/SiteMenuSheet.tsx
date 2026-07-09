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
  Globe,
  Phone,
  FileText,
  Building2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "./Logo";

interface NavLinkItem {
  type: "anchor" | "route";
  href: string;
  icon: ComponentType<{ className?: string }>;
  labelKey: string;
  fallback: { ar: string; en: string };
  disabled?: boolean;
  badge?: { ar: string; en: string };
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
    { type: "route", href: "/", icon: Home, labelKey: "nav.home", fallback: { ar: "الرئيسية", en: "Home" } },
    { type: "route", href: "/about", icon: Info, labelKey: "nav.about", fallback: { ar: "تعرف على تِكله", en: "About TKLH" } },
    { type: "route", href: "/planner", icon: Sparkles, labelKey: "nav.plan", fallback: { ar: "خطط ليلتك", en: "Plan your night" } },
    ...(isPrimaryAdmin
      ? [{ type: "route" as const, href: "/packages", icon: FileText, labelKey: "nav.packages", fallback: { ar: "الباقات", en: "Packages" } }]
      : [{ type: "route" as const, href: "/packages", icon: FileText, labelKey: "nav.packages", fallback: { ar: "الباقات", en: "Packages" }, disabled: true, badge: { ar: "قريباً", en: "Soon" } }]),
    { type: "anchor", href: "https://wa.me/966530466460?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D8%AA%D9%90%D9%83%D9%84%D9%87", icon: Phone, labelKey: "nav.contact", fallback: { ar: "تواصل معنا", en: "Contact" } },
  ];

  const accountLinks: NavLinkItem[] = [
    ...(user
      ? [{ type: "route" as const, href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.myDashboard", fallback: { ar: "لوحتي", en: "My Dashboard" } }]
      : []),
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
      "group flex items-center gap-3 rounded-2xl border border-[rgba(250,250,247,0.25)] bg-[#163726] px-4 py-3 text-sm font-medium text-[#fafaf7] transition-all hover:border-[rgba(250,250,247,0.45)] hover:bg-[#1f4532] hover:text-[#fafaf7]";
    const disabledCls =
      "flex items-center gap-3 rounded-2xl border border-[rgba(250,250,247,0.15)] bg-[#163726]/60 px-4 py-3 text-sm font-medium text-[#fafaf7]/60 cursor-not-allowed opacity-80";
    const inner = (
      <>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors ${item.disabled ? "bg-[rgba(255,247,174,0.1)] text-[#fff7ae]/60" : "bg-[rgba(255,247,174,0.15)] text-[#fff7ae] group-hover:bg-[rgba(255,247,174,0.25)] group-hover:text-[#fff7ae]"}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1">{label}</span>
        {item.badge ? (
          <span className="rounded-full bg-[#fff7ae] px-2 py-0.5 text-[10px] font-semibold text-[#163726]">
            {isAr ? item.badge.ar : item.badge.en}
          </span>
        ) : null}
      </>
    );
    if (item.disabled) {
      return (
        <span key={item.href} aria-disabled="true" className={disabledCls}>
          {inner}
        </span>
      );
    }
    if (item.type === "route") {
      return (
        <Link key={item.href} to={item.href} onClick={close} className={cls}>
          {inner}
        </Link>
      );
    }
    const isExternal = /^https?:\/\//.test(item.href);
    return (
      <a
        key={item.href}
        href={item.href}
        onClick={close}
        className={cls}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
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
          className="rounded-full border border-[rgba(255,247,174,0.35)] bg-[#163726] text-[#fff7ae] hover:border-[rgba(255,247,174,0.65)] hover:bg-[#1f4532] hover:text-[#fff7ae]"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isAr ? "right" : "left"}
        className="w-[88vw] max-w-sm border-[rgba(22,55,38,0.15)] bg-[#fafaf7] p-0 backdrop-blur-xl"
      >
        <SheetHeader className="border-b border-[rgba(255,247,174,0.2)] bg-[#163726] px-5 py-4 text-start">
          <SheetTitle className="flex items-center justify-between gap-2">
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100dvh-72px)] flex-col overflow-y-auto p-5">
          {/* Site sections */}
          <div className="space-y-1.5">
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#163726]/60">
              {t("nav.sections", { defaultValue: isAr ? "أقسام الموقع" : "Sections" })}
            </div>
            {sectionLinks.map(renderItem)}
          </div>

          {/* Account / Roles */}
          <div className="mt-6 space-y-1.5">
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#163726]/60">
              {t("nav.account", { defaultValue: isAr ? "حسابي" : "Account" })}
            </div>
            {accountLinks.map(renderItem)}
          </div>

          {/* Language toggle */}
          <div className="mt-auto pt-6 space-y-1.5">
            <button
              onClick={toggleLang}
              className="group flex w-full items-center gap-3 rounded-2xl border border-[rgba(255,247,174,0.25)] bg-[#163726] px-4 py-3 text-sm font-medium text-[#fff7ae] transition-all hover:border-[rgba(255,247,174,0.45)] hover:bg-[#1f4532] hover:text-[#fff7ae]"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[rgba(255,247,174,0.15)] text-[#fff7ae] transition-colors group-hover:bg-[rgba(255,247,174,0.25)] group-hover:text-[#fff7ae]">
                <Globe className="h-4 w-4" />
              </span>
              <span className="flex-1 text-start">{t("nav.lang")}</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
