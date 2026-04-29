import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Tag,
  ListChecks,
  Building2,
  LogOut,
  Sparkles,
  Receipt,
  FileSpreadsheet,
  Bell,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sidebar layout for the partner (vendor) portal — inspired by Ahad Laila
// Uses our semantic tokens (primary = olive, secondary = warm beige).

interface NavItem {
  to: string;
  labelKey: string;
  Icon: typeof LayoutDashboard;
  fallback: string;
}

const partnerNav: NavItem[] = [
  { to: "/vendor", labelKey: "portal.nav.overview", fallback: "النظرة العامة", Icon: LayoutDashboard },
  { to: "/vendor/bookings", labelKey: "portal.nav.bookings", fallback: "الحجوزات", Icon: ListChecks },
  { to: "/vendor/calendar", labelKey: "portal.nav.calendar", fallback: "التقويم", Icon: Calendar },
  { to: "/vendor/invoices", labelKey: "portal.nav.invoices", fallback: "الفواتير", Icon: Receipt },
  { to: "/vendor/sales", labelKey: "portal.nav.sales", fallback: "المبيعات", Icon: FileSpreadsheet },
  { to: "/vendor/analytics", labelKey: "portal.nav.analytics", fallback: "التحليلات", Icon: BarChart3 },
  { to: "/vendor/pricing", labelKey: "portal.nav.pricing", fallback: "إدارة التسعير", Icon: Tag },
  { to: "/vendor/checklists", labelKey: "portal.nav.checklists", fallback: "قوائم المهام", Icon: ListChecks },
  { to: "/vendor/reviews", labelKey: "portal.nav.reviews", fallback: "التقييمات", Icon: Star },
  { to: "/vendor/notifications", labelKey: "portal.nav.notifications", fallback: "الإشعارات", Icon: Bell },
  { to: "/vendor/profile", labelKey: "portal.nav.profile", fallback: "بيانات قاعتي", Icon: Building2 },
];

export const PortalLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div dir="rtl" className="flex min-h-screen w-full bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col bg-primary p-5 text-primary-foreground md:flex">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground text-xl font-black text-primary">
            ت
          </span>
          <div>
            <div className="text-lg font-black leading-none">TKLH تِكله</div>
            <div className="mt-1 text-[10px] font-bold text-secondary">
              {t("portal.partnerPortal", { defaultValue: "بوابة الشركاء" })}
            </div>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {partnerNav.map(({ to, labelKey, fallback, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-primary-foreground text-primary"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {t(labelKey, { defaultValue: fallback })}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 space-y-3 border-t border-primary-foreground/15 pt-5">
          <div className="truncate text-xs text-primary-foreground/60" title={user?.email ?? ""}>
            {user?.email}
          </div>
          <Button
            variant="secondary"
            className="w-full border-0 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={handleLogout}
          >
            <LogOut className="ml-2 h-4 w-4" />
            {t("common.logout", { defaultValue: "تسجيل الخروج" })}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between bg-primary p-4 text-primary-foreground md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-foreground font-black text-primary">
              ت
            </span>
            <span className="font-black">TKLH</span>
            <span className="text-[10px] font-bold text-secondary">
              {t("portal.partnerShort", { defaultValue: "شريك" })}
            </span>
          </Link>
          <Button size="sm" variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="h-4 w-4" />
          </Button>
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
          <Sparkles className="h-3 w-3" />
          {badge}
        </span>
      )}
      <h1 className="text-2xl font-black text-foreground md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-foreground/65">{subtitle}</p>}
    </div>
    {action}
  </div>
);
