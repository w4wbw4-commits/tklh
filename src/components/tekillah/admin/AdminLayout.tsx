import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Hourglass,
  Briefcase,
  AlertTriangle,
  AlertOctagon,
  Receipt,
  ListChecks,
  ClipboardList,
  Star,
  PackageOpen,
  LogOut,
  Sparkles,
  Building2,
  Home,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminNotificationsBell } from "./AdminNotificationsBell";

export interface AdminNavItem {
  key: string;
  labelKey: string;
  fallback: string;
  Icon: typeof ShieldCheck;
  badge?: number;
  tone?: "default" | "warning" | "danger";
  /** Sidebar section — duplicated tabs were merged into single destinations. */
  section: "clients" | "vendors" | "ops" | "money" | "content";
}

export const adminSections: Array<{ key: AdminNavItem["section"]; ar: string }> = [
  { key: "clients", ar: "العملاء" },
  { key: "vendors", ar: "المزودون" },
  { key: "ops", ar: "التشغيل" },
  { key: "money", ar: "المالية" },
  { key: "content", ar: "المحتوى" },
];

export const adminNav: AdminNavItem[] = [
  // العملاء — كل التسجيلات في مكان واحد (تسجيلات رحلة التخطيط + العملاء المحتملون)
  { key: "interest", labelKey: "admin.tabInterest", fallback: "تسجيلات رحلة التخطيط", Icon: ClipboardList, tone: "warning", section: "clients" },
  { key: "pending", labelKey: "admin.tabPending", fallback: "الحجوزات المعلقة", Icon: Hourglass, tone: "warning", section: "clients" },
  // المزودون
  { key: "applications", labelKey: "admin.tabApplications", fallback: "طلبات الانضمام", Icon: UserPlus, tone: "warning", section: "vendors" },
  { key: "verification", labelKey: "admin.tabVerification", fallback: "التحقق", Icon: ShieldCheck, section: "vendors" },
  { key: "vendors", labelKey: "admin.tabVendors", fallback: "المزودون", Icon: Briefcase, section: "vendors" },
  // التشغيل
  { key: "late", labelKey: "admin.tabLate", fallback: "تنبيهات التأخر", Icon: AlertTriangle, tone: "danger", section: "ops" },
  { key: "incidents", labelKey: "admin.tabIncidents", fallback: "البلاغات", Icon: AlertOctagon, section: "ops" },
  // المالية
  { key: "payments", labelKey: "admin.tabPayments", fallback: "المدفوعات", Icon: Receipt, section: "money" },
  { key: "bookings", labelKey: "admin.tabBookings", fallback: "الحجوزات", Icon: ListChecks, section: "money" },
  // المحتوى — التقييمات والإشراف صارت شاشة واحدة
  { key: "reviews", labelKey: "admin.tabReviews", fallback: "التقييمات والإشراف", Icon: Star, section: "content" },
  { key: "packages", labelKey: "admin.tabPackages", fallback: "الباقات", Icon: PackageOpen, section: "content" },
];

interface AdminLayoutProps {
  active: string;
  onChange: (key: string) => void;
  badges?: Partial<Record<string, number>>;
  headerAction?: ReactNode;
  children: ReactNode;
}

export const AdminLayout = ({ active, onChange, badges = {}, headerAction, children }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const logout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div dir="rtl" className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-s border-border bg-cream p-5 text-foreground md:flex">
        <div className="mb-6 flex items-center gap-2">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary ring-2 ring-gold/40 text-xl font-black text-primary-foreground">
              ت
            </span>
            <div className="leading-tight">
              <div className="font-arabic text-lg font-black text-foreground">تِكله</div>
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold">
                <ShieldCheck className="h-3 w-3" /> {t("admin.kicker", { defaultValue: "لوحة المسؤول" })}
              </div>
            </div>
          </Link>
          <AdminNotificationsBell onOpenSignups={() => onChange("interest")} />
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto pe-1">
          {adminSections.map((sec) => {
            const items = adminNav.filter((n) => n.section === sec.key);
            if (items.length === 0) return null;
            return (
              <div key={sec.key} className="space-y-0.5">
                <div className="px-3 pb-1 font-arabic text-[10px] font-black uppercase tracking-wider text-foreground/40">
                  {sec.ar}
                </div>
                {items.map(({ key, labelKey, fallback, Icon, tone }) => {
                  const isActive = active === key;
                  const count = badges[key] ?? 0;
                  const dotColor =
                    tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-primary" : "bg-foreground/30";
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onChange(key)}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/75 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-gold/80 group-hover:text-gold"}`} />
                      <span className="flex-1 text-start">{t(labelKey, { defaultValue: fallback })}</span>
                      {count > 0 ? (
                        <Badge
                          className={`min-w-[20px] justify-center px-1.5 py-0 text-[10px] ${
                            isActive
                              ? "bg-primary-foreground text-primary"
                              : tone === "danger"
                                ? "bg-destructive text-destructive-foreground"
                                : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {count}
                        </Badge>
                      ) : tone && !isActive ? (
                        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="mt-6 space-y-2 border-t border-border pt-5">
          <Button
            asChild
            variant="outline"
            className="w-full justify-start border-primary/20 bg-background text-foreground hover:bg-muted hover:text-foreground"
          >
            <Link to="/partner">
              <Building2 className="ms-0 me-2 h-4 w-4" />
              {t("portal.partnerPortal", { defaultValue: "بوابة الشريك" })}
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            <Link to="/">
              <Home className="me-2 h-4 w-4" />
              {t("common.home", { defaultValue: "الرئيسية" })}
            </Link>
          </Button>
          <div className="truncate text-[11px] text-foreground/55" title={user?.email ?? ""}>
            {user?.email}
          </div>
          <Button
            variant="outline"
            className="w-full border-destructive/30 text-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="me-2 h-4 w-4" />
            {t("common.logout", { defaultValue: "تسجيل الخروج" })}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-gold/40 bg-cream p-4 text-foreground md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary font-black text-primary-foreground ring-1 ring-gold/40">
              ت
            </span>
            <span className="font-arabic font-black text-foreground">تِكله</span>
            <span className="text-[10px] font-bold text-gold">{t("admin.kicker", { defaultValue: "مسؤول" })}</span>
          </Link>
          <div className="flex items-center gap-1">
            <AdminNotificationsBell onOpenSignups={() => onChange("interest")} />
            <Button asChild size="sm" variant="ghost" className="text-foreground hover:bg-muted hover:text-foreground">
              <Link to="/partner">
                <Building2 className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={logout} className="text-foreground hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Mobile horizontal nav (scrolls) */}
        <nav className="sticky top-[64px] z-10 flex gap-1 overflow-x-auto border-b border-border bg-cream px-3 py-2 md:hidden">
          {adminNav.map(({ key, labelKey, fallback, Icon }) => {
            const isActive = active === key;
            const count = badges[key] ?? 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground/70 hover:bg-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(labelKey, { defaultValue: fallback })}
                {count > 0 && (
                  <Badge
                    className={`px-1 py-0 text-[9px] ${
                      isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        <main className="flex-1 p-5 md:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-black text-foreground">
                <Sparkles className="h-3 w-3" />
                {t(`${currentLabelKey(active)}`, { defaultValue: currentFallback(active) })}
              </span>
              <h1 className="font-arabic text-2xl font-black text-foreground md:text-3xl">
                {t("admin.title", { defaultValue: "لوحة التحكم" })}
              </h1>
              <p className="mt-1 text-sm text-foreground/65">
                {t("admin.subtitle", { defaultValue: "تحكم كامل في عمليات المنصة" })}
              </p>
            </div>
            {headerAction}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

const currentLabelKey = (k: string) => adminNav.find((n) => n.key === k)?.labelKey ?? "admin.kicker";
const currentFallback = (k: string) => adminNav.find((n) => n.key === k)?.fallback ?? "لوحة المسؤول";
