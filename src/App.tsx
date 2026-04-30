import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Vendor from "./pages/Vendor.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Checkout from "./pages/Checkout.tsx";
import Success from "./pages/Success.tsx";
import Invoice from "./pages/Invoice.tsx";
import Admin from "./pages/Admin.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import TermsOfService from "./pages/TermsOfService.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import RefundPolicy from "./pages/RefundPolicy.tsx";
import NotFound from "./pages/NotFound.tsx";
import PartnerOverview from "./pages/vendor/PartnerOverview.tsx";
import PartnerBookings from "./pages/vendor/PartnerBookings.tsx";
import PartnerCalendarPage from "./pages/vendor/PartnerCalendarPage.tsx";
import PartnerInvoicesPage from "./pages/vendor/PartnerInvoicesPage.tsx";
import PartnerSalesPage from "./pages/vendor/PartnerSalesPage.tsx";
import PartnerAnalyticsPage from "./pages/vendor/PartnerAnalyticsPage.tsx";
import PartnerPricingPage from "./pages/vendor/PartnerPricingPage.tsx";
import PartnerChecklistsPage from "./pages/vendor/PartnerChecklistsPage.tsx";
import PartnerReviewsPage from "./pages/vendor/PartnerReviewsPage.tsx";
import PartnerNotificationsPage from "./pages/vendor/PartnerNotificationsPage.tsx";
import PartnerProfilePage from "./pages/vendor/PartnerProfilePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      {/* next-themes: persists user choice in localStorage and toggles `dark` class on <html>.
          `defaultTheme=light` keeps the brand cream look as the first impression. */}
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="tekillah-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
