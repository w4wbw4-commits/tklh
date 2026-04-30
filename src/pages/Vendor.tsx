import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";
import { LogOut, User, Calendar, Bell, Loader2, ListChecks, Star, TrendingUp, Clock, XCircle, ShieldCheck, LayoutDashboard, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { VendorProfileForm } from "@/components/tekillah/vendor/VendorProfileForm";
import { VendorCalendar } from "@/components/tekillah/vendor/VendorCalendar";
import { VendorBookings } from "@/components/tekillah/vendor/VendorBookings";
import { VendorNotifications } from "@/components/tekillah/vendor/VendorNotifications";
import { VendorReviews } from "@/components/tekillah/vendor/VendorReviews";
import { VendorFinancials } from "@/components/tekillah/vendor/VendorFinancials";
import { PartnerHero } from "@/components/tekillah/vendor/PartnerHero";
import { PartnerDashboardPreview } from "@/components/tekillah/vendor/PartnerDashboardPreview";
import { WelcomeDialog } from "@/components/tekillah/vendor/WelcomeDialog";
import type { VendorRow } from "@/components/tekillah/vendor/types";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";

const VendorPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [tab, setTab] = useState("profile");
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [welcomeVendor, setWelcomeVendor] = useState<VendorRow | null>(null);
  const dashboardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) {
      setVendor(null);
      return;
    }
    (async () => {
      setVendorLoading(true);
      const { data } = await supabase.from("vendors").select("*").eq("user_id", user.id).maybeSingle();
      const v = data as VendorRow | null;
      setVendor(v);
      setVendorLoading(false);
      // If the vendor already has a profile (any status), send them straight
      // to the partner dashboard. /vendor is a marketing/onboarding page —
      // existing partners belong in /partner.
      if (v) {
        navigate("/partner", { replace: true });
        return;
      }
      // No profile yet → default landing tab is the profile form.
      setTab("profile");
    })();
  }, [user, navigate]);

  const handleVendorSaved = (v: VendorRow) => {
    const isFirstSave = !vendor;
    setVendor(v);
    if (v.approval_status === "approved") setTab("bookings");
    if (isFirstSave) {
      setWelcomeVendor(v);
      setWelcomeOpen(true);
    } else {
      // Subsequent edits → go straight back to the partner dashboard.
      navigate("/partner");
    }
  };

  const handleCtaClick = () => {
    if (!user) {
      navigate("/auth?redirect=/vendor&role=vendor");
      return;
    }
    dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isAuthed = !authLoading && !!user;
  const isApproved = vendor?.approval_status === "approved";
  const isPending = vendor && vendor.approval_status === "pending_approval";
  const isRejected = vendor && vendor.approval_status === "rejected";

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SEO
        title="بوابة الشركاء | TKLH Partner Portal"
        description="انضم إلى شبكة شركاء تِكله TKLH وقدّم خدماتك في تخطيط وحجز المناسبات لعملاء في كافة المملكة العربية السعودية."
        canonical="/vendor"
      />
      <header
        className="sticky top-0 z-30 border-b border-gold/20"
        style={{
          background: "hsl(var(--background) / 0.78)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          boxShadow: "0 8px 30px -12px hsl(var(--green) / 0.15)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden text-xs uppercase tracking-[0.2em] text-gold sm:inline">
              {t("vendor.kicker")}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Always-visible: back to public site */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-full text-foreground/75 hover:text-gold"
            >
              <Link to="/" aria-label={t("common.main")}>
                <Home className="me-1.5 h-4 w-4" />
                <span className="hidden sm:inline">{t("common.main")}</span>
              </Link>
            </Button>

            {/* Partner Dashboard entry — context-aware:
                - signed-in vendor → straight to /partner
                - signed-in but no profile yet → scroll to profile form below
                - guest → auth flow then back to /vendor to complete profile */}
            <Button
              size="sm"
              onClick={() => {
                if (!isAuthed) {
                  navigate("/auth?redirect=/vendor&role=vendor");
                  return;
                }
                if (vendor) {
                  navigate("/partner");
                  return;
                }
                setTab("profile");
                dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="rounded-full border border-gold/50 bg-primary-deep text-gold shadow-[0_4px_14px_-4px_hsl(var(--green)/0.45)] transition-all hover:scale-[1.03] hover:bg-primary-deep"
            >
              <LayoutDashboard className="me-1.5 h-4 w-4" />
              {isAuthed && vendor
                ? t("vendor.partnerDashboard", { defaultValue: "واجهة الشريك" })
                : isAuthed
                  ? t("vendor.completeProfile", { defaultValue: "أكمل بياناتك" })
                  : t("vendor.partnerDashboard", { defaultValue: "واجهة الشريك" })}
            </Button>

            {isAuthed ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    navigate("/auth?redirect=/vendor&role=vendor");
                  }}
                  className="hidden rounded-full border-gold/50 text-primary-deep hover:bg-gold/10 hover:text-primary-deep md:inline-flex"
                >
                  {t("vendor.switchAccount", { defaultValue: "دخول بحساب آخر" })}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut().then(() => navigate("/"))}
                  className="rounded-full text-destructive hover:bg-destructive/10"
                  aria-label={t("common.logout")}
                >
                  <LogOut className="h-4 w-4 sm:me-1" />
                  <span className="hidden sm:inline">{t("common.logout")}</span>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                asChild
                variant="outline"
                className="rounded-full border-gold/60 text-primary-deep hover:bg-gold/10"
              >
                <Link to="/auth?redirect=/partner&role=vendor">
                  {t("vendor.signIn", { defaultValue: "دخول الشركاء" })}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Partner Landing Hero — only for visitors who haven't started a profile yet */}
      {!vendor && (
        <>
          <PartnerHero onCtaClick={handleCtaClick} isAuthenticated={isAuthed} />
          <PartnerDashboardPreview />
        </>
      )}

      {/* Authenticated dashboard */}
      {authLoading || vendorLoading ? (
        <div className="grid place-items-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : isAuthed ? (
        <>
        <WelcomeDialog
          open={welcomeOpen}
          onOpenChange={setWelcomeOpen}
          vendor={welcomeVendor}
          onEnter={() => {
            setWelcomeOpen(false);
            navigate("/partner");
          }}
        />
        <main ref={dashboardRef} className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h2 className="font-arabic text-3xl font-semibold text-foreground sm:text-4xl">
                {vendor ? t("vendor.welcomeNamed", { name: vendor.business_name }) : t("vendor.welcome")}
              </h2>
              <p className="mt-2 text-foreground/65">
                {isApproved
                  ? t("vendor.subtitleApproved", { defaultValue: "حسابك مفعّل — تابع حجوزاتك القادمة وأدر تقويمك من هنا." })
                  : isPending
                    ? t("vendor.subtitlePending", { defaultValue: "ملفك قيد المراجعة. سنخبرك فور صدور القرار." })
                    : isRejected
                      ? t("vendor.subtitleRejected", { defaultValue: "تم رفض الطلب — عدّل البيانات وأعد الإرسال." })
                      : t("vendor.subtitle")}
              </p>
            </div>

            {/* Pending state: prominent "Under Review" view, but keep profile editable */}
            {isPending && (
              <div className="mb-6 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 shadow-card">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-700">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-arabic text-lg font-semibold text-amber-800">
                      {t("vendor.underReview.title", { defaultValue: "ملفك قيد المراجعة من قِبل الإدارة" })}
                    </h3>
                    <p className="mt-1 text-sm text-amber-700/85">
                      {t("vendor.underReview.body", { defaultValue: "نراجع معلومات قاعتك الآن. ستتمكّن من استقبال الحجوزات فور الموافقة. يمكنك تعديل بياناتك في أي وقت." })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="mb-6 rounded-3xl border border-destructive/30 bg-destructive/10 p-6 shadow-card">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-destructive/20 text-destructive">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-arabic text-lg font-semibold text-destructive">
                      {t("vendor.rejected.title", { defaultValue: "تم رفض الطلب" })}
                    </h3>
                    <p className="mt-1 text-sm text-destructive/85">
                      {vendor?.rejection_reason || t("vendor.rejected.body", { defaultValue: "يرجى مراجعة بياناتك وإعادة الإرسال." })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isApproved && (
              <div className="mb-6 rounded-3xl border border-primary/30 bg-primary/5 p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="text-sm text-foreground/80">
                    {t("vendor.approved.banner", { defaultValue: "حسابك مفعّل ويظهر للعملاء — راجع طلبات الحجز الجديدة في تبويب الحجوزات." })}
                  </p>
                </div>
              </div>
            )}

            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-card p-1 shadow-card sm:grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="bookings" disabled={!isApproved} className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <ListChecks className="h-4 w-4" /> {t("vendor.tabs.bookings")}
                </TabsTrigger>
                <TabsTrigger value="calendar" disabled={!isApproved} className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Calendar className="h-4 w-4" /> {t("vendor.tabs.calendar")}
                </TabsTrigger>
                <TabsTrigger value="financials" disabled={!isApproved} className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <TrendingUp className="h-4 w-4" /> {t("vendor.tabs.financials")}
                </TabsTrigger>
                <TabsTrigger value="reviews" disabled={!isApproved} className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Star className="h-4 w-4" /> {t("vendor.tabs.reviews")}
                </TabsTrigger>
                <TabsTrigger value="profile" className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <User className="h-4 w-4" /> {t("vendor.tabs.profile")}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Bell className="h-4 w-4" /> {t("vendor.tabs.notifications")}
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="bookings">
                  {vendor && isApproved && <VendorBookings vendorId={vendor.id} />}
                </TabsContent>
                <TabsContent value="calendar">
                  {vendor && isApproved && <VendorCalendar vendorId={vendor.id} />}
                </TabsContent>
                <TabsContent value="financials">
                  {vendor && isApproved && <VendorFinancials vendorId={vendor.id} />}
                </TabsContent>
                <TabsContent value="reviews">
                  {vendor && isApproved && <VendorReviews vendorId={vendor.id} vendorUserId={user!.id} />}
                </TabsContent>
                <TabsContent value="profile">
                  <VendorProfileForm userId={user!.id} vendor={vendor} onSaved={handleVendorSaved} />
                </TabsContent>
                <TabsContent value="notifications">
                  <VendorNotifications userId={user!.id} />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </main>
        </>
      ) : null}
    </div>
  );
};

export default VendorPage;
