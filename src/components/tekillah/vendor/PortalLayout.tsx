import { ReactNode, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import {
  LayoutDashboard,
  ListChecks,
  Building2,
  LogOut,
  PanelRightClose,
  PanelRightOpen,
  FileSpreadsheet,
  Bell,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";
import { notificationsService } from "@/domain";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import chairMark from "@/assets/tklh-chair.png";

// Sidebar layout for the partner (vendor) portal — inspired by Ahad Laila
// Uses our semantic tokens (primary = olive, secondary = warm beige).

interface NavItem {
  to: string;
  labelKey: string;
  Icon: typeof LayoutDashboard;
  fallback: string;
}

// Five entries only. Calendar, manual booking and packages live inside the
// bookings experience; invoices and sales live inside the reports experience.
const partnerNav: NavItem[] = [
  { to: "/partner", labelKey: "portal.nav.overview", fallback: "النظرة العامة", Icon: LayoutDashboard },
  { to: "/partner/bookings", labelKey: "portal.nav.bookings", fallback: "الحجوزات", Icon: ListChecks },
  { to: "/partner/reviews", labelKey: "portal.nav.reviews", fallback: "التقييمات", Icon: Star },
  { to: "/partner/reports", labelKey: "portal.nav.reports", fallback: "التقارير", Icon: FileSpreadsheet },
  { to: "/partner/profile", labelKey: "portal.nav.profile", fallback: "بياناتي", Icon: Building2 },
];

const SIDEBAR_COLLAPSE_KEY = "tklh_partner_sidebar_collapsed";

export const PortalLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const toggleLang = () => i18n.changeLanguage(isAr ? "en" : "ar");
  const langLabel = isAr ? "English" : "العربية";
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "true";
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  const toggleSidebar = () => setCollapsed((v) => !v);

  // Account status light: green when the profile is approved, red otherwise.
  const { vendor } = usePartnerVendor();
  const isApproved = vendor?.approval_status === "approved";
  const statusLabel = isApproved
    ? t("portal.status.active", { defaultValue: "حسابك مفعل ويظهر للعملاء" })
    : t("portal.status.inactive", { defaultValue: "حسابك غير مفعل" });

  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    const refresh = async () => {
      const res = await notificationsService.listForVendorUser(user.id, 50);
      if (!alive) return;
      if (!res.error && res.data) setUnread(res.data.filter((n) => !n.read).length);
    };
    refresh();
    const unsubscribe = notificationsService.subscribeUnique(user.id, () => refresh());
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div dir="rtl" className="flex min-h-screen w-full bg-muted/30">
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen flex-col bg-primary text-primary-foreground transition-all duration-300 ease-out md:flex ${
          collapsed ? "w-16 px-2 py-4" : "w-64 p-5"
        }`}
      >
        <div className={`mb-6 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link to="/partner" className="flex items-center gap-2.5">
              <Logo variant="light" />
              <img
                src={chairMark}
                alt=""
                aria-hidden
                className="h-7 w-7 shrink-0 rounded-md object-contain"
                draggable={false}
              />
              <span className="text-[11px] font-black leading-tight text-secondary">
                {t("portal.title", { defaultValue: "لوحة تحكم الشريك" })}
              </span>
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="flex items-center justify-center">
              <img
                src={chairMark}
                alt="تِكله"
                className="h-8 w-8 rounded-md object-contain"
                draggable={false}
              />
            </Link>
          )}
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              aria-label={t("portal.sidebar.collapse", { defaultValue: "طي القائمة" })}
              title={t("portal.sidebar.collapse", { defaultValue: "طي القائمة" })}
            >
              <PanelRightClose className="h-5 w-5" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mb-4 rounded-lg p-1.5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label={t("portal.sidebar.expand", { defaultValue: "فتح القائمة" })}
            title={t("portal.sidebar.expand", { defaultValue: "فتح القائمة" })}
          >
            <PanelRightOpen className="h-5 w-5" />
          </button>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {partnerNav.map(({ to, labelKey, fallback, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              title={t(labelKey, { defaultValue: fallback })}
              className={({ isActive }) =>
                `flex items-center rounded-xl transition-colors ${
                  collapsed
                    ? "justify-center px-2 py-2.5"
                    : "gap-3 px-3 py-2.5 text-sm font-bold"
                } ${
                  isActive
                    ? "bg-primary-foreground text-primary"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{t(labelKey, { defaultValue: fallback })}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={`mt-6 space-y-3 border-t border-primary-foreground/15 pt-5 ${collapsed ? "flex flex-col items-center" : ""}`}>
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}
            title={statusLabel}
            aria-label={statusLabel}
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${
                  isApproved ? "bg-emerald-400" : "bg-red-400"
                } animate-ping`}
              />
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  isApproved ? "bg-emerald-400" : "bg-red-500"
                }`}
              />
            </span>
            {!collapsed && (
              <span className="truncate text-xs font-bold text-primary-foreground/75">{statusLabel}</span>
            )}
          </div>
          {!collapsed && (
            <div className="truncate text-xs text-primary-foreground/60" title={user?.email ?? ""}>
              {user?.email}
            </div>
          )}
          <Button
            variant="secondary"
            className={`border-0 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 ${
              collapsed ? "h-9 w-9 justify-center rounded-full p-0" : "w-full"
            }`}
            onClick={toggleLang}
            title={langLabel}
            aria-label={langLabel}
          >
            <Languages className={`h-4 w-4 ${collapsed ? "" : "ml-2"}`} />
            {!collapsed && langLabel}
          </Button>
          <Button
            variant="secondary"
            className={`border-0 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 ${
              collapsed ? "h-9 w-9 justify-center rounded-full p-0" : "w-full"
            }`}
            onClick={handleLogout}
            title={t("common.logout", { defaultValue: "تسجيل الخروج" })}
          >
            <LogOut className={`h-4 w-4 ${collapsed ? "" : "ml-2"}`} />
            {!collapsed && t("common.logout", { defaultValue: "تسجيل الخروج" })}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Persistent notifications bell — top-left of every partner page */}
        <Link
          to="/partner/notifications"
          className="fixed left-4 top-4 z-40 hidden h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 md:flex"
          aria-label={t("portal.nav.notifications", { defaultValue: "الإشعارات" })}
          title={t("portal.nav.notifications", { defaultValue: "الإشعارات" })}
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-black text-destructive-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between bg-primary p-4 text-primary-foreground md:hidden">
          <Link to="/partner" className="flex items-center gap-2">
            <Logo variant="light" />
            <img
              src={chairMark}
              alt=""
              aria-hidden
              className="h-6 w-6 shrink-0 rounded-md object-contain"
              draggable={false}
            />
            <span className="text-[10px] font-black leading-tight text-secondary">
              {t("portal.title", { defaultValue: "لوحة تحكم الشريك" })}
            </span>
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${isApproved ? "bg-emerald-400" : "bg-red-500"}`}
              title={statusLabel}
              aria-label={statusLabel}
            />
          </Link>
          <div className="flex items-center gap-1">
          <Link
            to="/partner/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-primary-foreground hover:bg-primary-foreground/10"
            aria-label={t("portal.nav.notifications", { defaultValue: "الإشعارات" })}
            title={t("portal.nav.notifications", { defaultValue: "الإشعارات" })}
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -left-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-black text-destructive-foreground">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleLang}
            title={langLabel}
            aria-label={langLabel}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Languages className="h-4 w-4" />
            <span className="ms-1 text-[11px] font-bold">{isAr ? "EN" : "ع"}</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="h-4 w-4" />
          </Button>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 start-0 end-0 z-20 flex overflow-x-auto border-t border-border bg-card md:hidden">
          {partnerNav.slice(0, 6).map(({ to, labelKey, fallback, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex min-w-[68px] flex-1 flex-col items-center gap-1 py-2 text-[10px] font-bold ${
                  isActive ? "text-primary" : "text-foreground/60"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{t(labelKey, { defaultValue: fallback })}</span>
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-5 pb-24 md:p-8 md:pb-8">{children}</main>
      </div>
    </div>
  );
};

export const PortalHeader = ({
  title,
  subtitle,
  badge,
  action,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: ReactNode;
}) => (
  <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
    <div>
      {badge && (
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-black text-primary-deep">
          <span aria-label="partner">🤝</span>
          {badge}
        </span>
      )}
      <h1 className="text-2xl font-black text-foreground md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-foreground/65">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/**
 * Section sub-navigation. The sidebar stays at five entries, so tools that used
 * to own a sidebar row (invoices, sales, analytics, pricing, checklists, the
 * full calendar) are reached from the section they belong to.
 */
export const PortalSubnav = ({
  items,
}: {
  items: { to: string; label: string }[];
}) => (
  <div className="-mt-3 mb-6 flex flex-wrap gap-2">
    {items.map(({ to, label }) => (
      <NavLink
        key={to}
        to={to}
        end
        className={({ isActive }) =>
          `rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
            isActive
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground/70 hover:border-primary hover:text-primary"
          }`
        }
      >
        {label}
      </NavLink>
    ))}
  </div>
);

export const BOOKINGS_SUBNAV = [
  { to: "/partner/bookings", label: "الطلبات والتقويم" },
  { to: "/partner/calendar", label: "التقويم الكامل" },
  { to: "/partner/pricing", label: "التسعير والعروض" },
  { to: "/partner/checklists", label: "قوائم المهام" },
];

export const REPORTS_SUBNAV = [
  { to: "/partner/reports", label: "التقارير الشهرية" },
  { to: "/partner/invoices", label: "الفواتير الضريبية" },
  { to: "/partner/sales", label: "المبيعات" },
  { to: "/partner/analytics", label: "التحليلات" },
];
