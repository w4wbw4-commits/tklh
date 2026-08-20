import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
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
import { AppErrorBoundary } from "./components/tekillah/AppErrorBoundary";

const Auth = lazyWithRetry(() => import("./pages/Auth.tsx"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword.tsx"));
const Vendor = lazyWithRetry(() => import("./pages/Vendor.tsx"));
const JoinVendor = lazyWithRetry(() => import("./pages/JoinVendor.tsx"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard.tsx"));
const Checkout = lazyWithRetry(() => import("./pages/Checkout.tsx"));
const Success = lazyWithRetry(() => import("./pages/Success.tsx"));
const Invoice = lazyWithRetry(() => import("./pages/Invoice.tsx"));
const Admin = lazyWithRetry(() => import("./pages/Admin.tsx"));
const Terms = lazyWithRetry(() => import("./pages/Terms.tsx"));
const Privacy = lazyWithRetry(() => import("./pages/Privacy.tsx"));
const TermsOfService = lazyWithRetry(() => import("./pages/TermsOfService.tsx"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy.tsx"));
const RefundPolicy = lazyWithRetry(() => import("./pages/RefundPolicy.tsx"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound.tsx"));
const PartnerOverview = lazyWithRetry(() => import("./pages/vendor/PartnerOverview.tsx"));
const PartnerBookings = lazyWithRetry(() => import("./pages/vendor/PartnerBookings.tsx"));
const PartnerCalendarPage = lazyWithRetry(() => import("./pages/vendor/PartnerCalendarPage.tsx"));
const PartnerInvoicesPage = lazyWithRetry(() => import("./pages/vendor/PartnerInvoicesPage.tsx"));
const PartnerSalesPage = lazyWithRetry(() => import("./pages/vendor/PartnerSalesPage.tsx"));
const PartnerAnalyticsPage = lazyWithRetry(() => import("./pages/vendor/PartnerAnalyticsPage.tsx"));
const PartnerPricingPage = lazyWithRetry(() => import("./pages/vendor/PartnerPricingPage.tsx"));
const PartnerChecklistsPage = lazyWithRetry(() => import("./pages/vendor/PartnerChecklistsPage.tsx"));
const PartnerReviewsPage = lazyWithRetry(() => import("./pages/vendor/PartnerReviewsPage.tsx"));
const PartnerNotificationsPage = lazyWithRetry(() => import("./pages/vendor/PartnerNotificationsPage.tsx"));
const PartnerProfilePage = lazyWithRetry(() => import("./pages/vendor/PartnerProfilePage.tsx"));
const WeddingsPage = lazyWithRetry(() => import("./pages/seo/WeddingsPage.tsx"));
const EventsPage = lazyWithRetry(() => import("./pages/seo/EventsPage.tsx"));
const ConferencesPage = lazyWithRetry(() => import("./pages/seo/ConferencesPage.tsx"));
const Packages = lazyWithRetry(() => import("./pages/Packages.tsx"));
const Planner = lazyWithRetry(() => import("./pages/Planner.tsx"));
const About = lazyWithRetry(() => import("./pages/About.tsx"));

const queryClient = new QueryClient();

// Minimal fallback — a soft cream wash matching the brand so the chunk swap
// never flashes white. No spinner: most chunks load in <200ms on a warm cache
// and a spinner would just flicker.
const RouteFallback = () => (
  <div className="min-h-screen bg-background" aria-hidden />
);

/**
 * RouteAwareTheme — keeps the whole site in the light brand palette.
 * Admin dashboard now shares the same warm cream + velvet green identity.
 */
const RouteAwareTheme = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      storageKey="tekillah-theme"
    >
      {children}
    </ThemeProvider>
  );
};

const AppRoutes = () => {
  const isMobile = useIsMobile();
  // On mobile (or when the user prefers reduced motion), tell framer-motion to
  // skip animations and jump to final state. This kills infinite loops in our
  // illustrated sketches that otherwise burn CPU continuously on phones.
  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "user"}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter>
            <AuthProvider>
              <RouteAwareTheme>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/vendor" element={<Vendor />} />
                      <Route path="/join-vendor" element={<JoinVendor />} />
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
                      <Route path="/weddings" element={<WeddingsPage />} />
                      <Route path="/events" element={<EventsPage />} />
                      <Route path="/conferences" element={<ConferencesPage />} />
                      <Route path="/packages" element={<Packages />} />
                      <Route path="/planner" element={<Planner />} />
                      <Route path="/about" element={<About />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <RoleSwitcher />
                </TooltipProvider>
              </RouteAwareTheme>
            </AuthProvider>
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
};

const App = () => (
  <AppErrorBoundary>
    <AppRoutes />
  </AppErrorBoundary>
);

export default App;
