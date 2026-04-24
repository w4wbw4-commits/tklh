import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";
import { LogOut, User, Calendar, Package, Bell, Loader2, ListChecks, Star, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { VendorProfileForm } from "@/components/tekillah/vendor/VendorProfileForm";
import { VendorCalendar } from "@/components/tekillah/vendor/VendorCalendar";
import { VendorPackages } from "@/components/tekillah/vendor/VendorPackages";
import { VendorBookings } from "@/components/tekillah/vendor/VendorBookings";
import { VendorNotifications } from "@/components/tekillah/vendor/VendorNotifications";
import { VendorReviews } from "@/components/tekillah/vendor/VendorReviews";
import { VendorFinancials } from "@/components/tekillah/vendor/VendorFinancials";
import { PartnerHero } from "@/components/tekillah/vendor/PartnerHero";
import type { VendorRow } from "@/components/tekillah/vendor/types";
import { useTranslation } from "react-i18next";

const VendorPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [tab, setTab] = useState("profile");
  const dashboardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) {
      setVendor(null);
      return;
    }
    (async () => {
      setVendorLoading(true);
      const { data } = await supabase.from("vendors").select("*").eq("user_id", user.id).maybeSingle();
      setVendor(data as VendorRow | null);
      setVendorLoading(false);
    })();
  }, [user]);

  const handleCtaClick = () => {
    if (!user) {
      navigate("/auth?redirect=/vendor&role=vendor");
      return;
    }
    dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isAuthed = !authLoading && !!user;

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden text-xs uppercase tracking-[0.2em] text-primary sm:inline">
              {t("vendor.kicker")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-full">
              <Link to="/">{t("common.main")}</Link>
            </Button>
            {isAuthed ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut().then(() => navigate("/"))}
                className="rounded-full text-destructive hover:bg-destructive/10"
              >
                <LogOut className="me-1 h-4 w-4" /> {t("common.logout")}
              </Button>
            ) : (
              <Button
                size="sm"
                asChild
                className="rounded-full"
              >
                <Link to="/auth?redirect=/vendor&role=vendor">{t("nav.start")}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Partner Landing Hero — visible to ALL visitors */}
      <PartnerHero onCtaClick={handleCtaClick} isAuthenticated={isAuthed} />

      {/* Authenticated dashboard */}
      {authLoading || vendorLoading ? (
        <div className="grid place-items-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : isAuthed ? (
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
                {vendor ? t("vendor.subtitleNamed") : t("vendor.subtitle")}
              </p>
            </div>

            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-card p-1 shadow-card sm:grid-cols-4 lg:grid-cols-7">
                <TabsTrigger value="profile" className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <User className="h-4 w-4" /> {t("vendor.tabs.profile")}
                </TabsTrigger>
                <TabsTrigger value="financials" disabled={!vendor} className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <TrendingUp className="h-4 w-4" /> {t("vendor.tabs.financials")}
                </TabsTrigger>
                <TabsTrigger value="bookings" disabled={!vendor} className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <ListChecks className="h-4 w-4" /> {t("vendor.tabs.bookings")}
                </TabsTrigger>
                <TabsTrigger value="calendar" disabled={!vendor} className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Calendar className="h-4 w-4" /> {t("vendor.tabs.calendar")}
                </TabsTrigger>
                <TabsTrigger value="packages" disabled={!vendor} className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Package className="h-4 w-4" /> {t("vendor.tabs.packages")}
                </TabsTrigger>
                <TabsTrigger value="reviews" disabled={!vendor} className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Star className="h-4 w-4" /> {t("vendor.tabs.reviews")}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Bell className="h-4 w-4" /> {t("vendor.tabs.notifications")}
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="profile">
                  <VendorProfileForm userId={user!.id} vendor={vendor} onSaved={setVendor} />
                </TabsContent>
                <TabsContent value="financials">
                  {vendor && <VendorFinancials vendorId={vendor.id} />}
                </TabsContent>
                <TabsContent value="bookings">
                  {vendor && <VendorBookings vendorId={vendor.id} />}
                </TabsContent>
                <TabsContent value="calendar">
                  {vendor && <VendorCalendar vendorId={vendor.id} />}
                </TabsContent>
                <TabsContent value="packages">
                  {vendor && <VendorPackages vendorId={vendor.id} />}
                </TabsContent>
                <TabsContent value="reviews">
                  {vendor && <VendorReviews vendorId={vendor.id} vendorUserId={user!.id} />}
                </TabsContent>
                <TabsContent value="notifications">
                  <VendorNotifications userId={user!.id} />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </main>
      ) : null}
    </div>
  );
};

export default VendorPage;
