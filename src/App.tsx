import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
// Eagerly load Index — it's the landing route, blocking it on a chunk fetch
// would tank the initial paint. Everything else is code-split below so heavy
// libraries (recharts ~221KB, xlsx ~184KB, jspdf ~165KB) only download when
// the user actually navigates to a partner/admin page.
import Index from "./pages/Index.tsx";
import { RoleSwitcher } from "./components/tekillah/RoleSwitcher";
import { SaduBorders } from "./components/tekillah/SaduBorders";

const Auth = lazy(() => import("./pages/Auth.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Vendor = lazy(() => import("./pages/Vendor.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const Success = lazy(() => import("./pages/Success.tsx"));
const Invoice = lazy(() => import("./pages/Invoice.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const PartnerOverview = lazy(() => import("./pages/vendor/PartnerOverview.tsx"));
const PartnerBookings = lazy(() => import("./pages/vendor/PartnerBookings.tsx"));
const PartnerCalendarPage = lazy(() => import("./pages/vendor/PartnerCalendarPage.tsx"));
const PartnerInvoicesPage = lazy(() => import("./pages/vendor/PartnerInvoicesPage.tsx"));
const PartnerSalesPage = lazy(() => import("./pages/vendor/PartnerSalesPage.tsx"));
const PartnerAnalyticsPage = lazy(() => import("./pages/vendor/PartnerAnalyticsPage.tsx"));
const PartnerPricingPage = lazy(() => import("./pages/vendor/PartnerPricingPage.tsx"));
const PartnerChecklistsPage = lazy(() => import("./pages/vendor/PartnerChecklistsPage.tsx"));
const PartnerReviewsPage = lazy(() => import("./pages/vendor/PartnerReviewsPage.tsx"));
const PartnerNotificationsPage = lazy(() => import("./pages/vendor/PartnerNotificationsPage.tsx"));
const PartnerProfilePage = lazy(() => import("./pages/vendor/PartnerProfilePage.tsx"));

const queryClient = new QueryClient();

// Minimal fallback — a soft cream wash matching the brand so the chunk swap
// never flashes white. No spinner: most chunks load in <200ms on a warm cache
// and a spinner would just flicker.
const RouteFallback = () => (
  <div className="min-h-screen bg-background" aria-hidden />
);

const AppRoutes = () => {
  const isMobile = useIsMobile();
  // On mobile (or when the user prefers reduced motion), tell framer-motion to
  // skip animations and jump to final state. This kills infinite loops in our
  // illustrated sketches that otherwise burn CPU continuously on phones.
  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "user"}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="tekillah-theme">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AuthProvider>
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/vendor" element={<Vendor />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/checkout/:bookingId" element={<Checkout />} />
                      <Route path="/invoice/:bookingId" element={<Invoice />} />
                      <Route path="/success" element={<Success />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/refund-policy" element={<RefundPolicy />} />
                      <Route path="/partner" element={<PartnerOverview />} />
                      <Route path="/partner/bookings" element={<PartnerBookings />} />
                      <Route path="/partner/calendar" element={<PartnerCalendarPage />} />
                      <Route path="/partner/invoices" element={<PartnerInvoicesPage />} />
                      <Route path="/partner/sales" element={<PartnerSalesPage />} />
                      <Route path="/partner/analytics" element={<PartnerAnalyticsPage />} />
                      <Route path="/partner/pricing" element={<PartnerPricingPage />} />
                      <Route path="/partner/checklists" element={<PartnerChecklistsPage />} />
                      <Route path="/partner/reviews" element={<PartnerReviewsPage />} />
                      <Route path="/partner/notifications" element={<PartnerNotificationsPage />} />
                      <Route path="/partner/profile" element={<PartnerProfilePage />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <RoleSwitcher />
                  <SaduBorders />
                </AuthProvider>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
};

const App = () => <AppRoutes />;

export default App;
