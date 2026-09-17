import { Route } from "react-router-dom";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { RequirePartner } from "@/domain/users/guards";

const PartnerOverview = lazyWithRetry(() => import("@/pages/vendor/PartnerOverview.tsx"));
const PartnerBookings = lazyWithRetry(() => import("@/pages/vendor/PartnerBookings.tsx"));
const PartnerCalendarPage = lazyWithRetry(() => import("@/pages/vendor/PartnerCalendarPage.tsx"));
const PartnerInvoicesPage = lazyWithRetry(() => import("@/pages/vendor/PartnerInvoicesPage.tsx"));
const PartnerSalesPage = lazyWithRetry(() => import("@/pages/vendor/PartnerSalesPage.tsx"));
const PartnerAnalyticsPage = lazyWithRetry(() => import("@/pages/vendor/PartnerAnalyticsPage.tsx"));
const PartnerPricingPage = lazyWithRetry(() => import("@/pages/vendor/PartnerPricingPage.tsx"));
const PartnerChecklistsPage = lazyWithRetry(() => import("@/pages/vendor/PartnerChecklistsPage.tsx"));
const PartnerReviewsPage = lazyWithRetry(() => import("@/pages/vendor/PartnerReviewsPage.tsx"));
const PartnerNotificationsPage = lazyWithRetry(() => import("@/pages/vendor/PartnerNotificationsPage.tsx"));
const PartnerProfilePage = lazyWithRetry(() => import("@/pages/vendor/PartnerProfilePage.tsx"));
const PartnerReportsPage = lazyWithRetry(() => import("@/pages/vendor/PartnerReportsPage.tsx"));

const PartnerLogin = lazyWithRetry(() => import("@/pages/partner/PartnerLogin.tsx"));
const PartnerRegister = lazyWithRetry(() => import("@/pages/partner/PartnerRegister.tsx"));
const PartnerForgotPassword = lazyWithRetry(() => import("@/pages/partner/PartnerForgotPassword.tsx"));
const PartnerApplicationStatus = lazyWithRetry(() => import("@/pages/partner/PartnerApplicationStatus.tsx"));

/** Every portal page passes through the same gate: auth → role → RLS. */
const gated = (element: React.ReactNode) => <RequirePartner>{element}</RequirePartner>;

/**
 * Partner portal (partner.tklh.sa). Paths stay `/partner/*` so every existing
 * link, redirect (`/auth?redirect=/partner/...`) and bookmark keeps working on
 * the customer domain too.
 */
export const partnerRoutes = [
  // Public: sign-in, registration, password reset, application status.
  <Route key="/partner/login" path="/partner/login" element={<PartnerLogin />} />,
  <Route key="/partner/register" path="/partner/register" element={<PartnerRegister />} />,
  <Route key="/partner/forgot-password" path="/partner/forgot-password" element={<PartnerForgotPassword />} />,
  <Route key="/partner/status" path="/partner/status" element={<PartnerApplicationStatus />} />,

  // Portal: vendor role (granted on approval) or admin.
  <Route key="/partner" path="/partner" element={gated(<PartnerOverview />)} />,
  <Route key="/partner/bookings" path="/partner/bookings" element={gated(<PartnerBookings />)} />,
  <Route key="/partner/calendar" path="/partner/calendar" element={gated(<PartnerCalendarPage />)} />,
  <Route key="/partner/invoices" path="/partner/invoices" element={gated(<PartnerInvoicesPage />)} />,
  <Route key="/partner/sales" path="/partner/sales" element={gated(<PartnerSalesPage />)} />,
  <Route key="/partner/analytics" path="/partner/analytics" element={gated(<PartnerAnalyticsPage />)} />,
  <Route key="/partner/pricing" path="/partner/pricing" element={gated(<PartnerPricingPage />)} />,
  <Route key="/partner/checklists" path="/partner/checklists" element={gated(<PartnerChecklistsPage />)} />,
  <Route key="/partner/reviews" path="/partner/reviews" element={gated(<PartnerReviewsPage />)} />,
  <Route key="/partner/notifications" path="/partner/notifications" element={gated(<PartnerNotificationsPage />)} />,
  <Route key="/partner/profile" path="/partner/profile" element={gated(<PartnerProfilePage />)} />,
  <Route key="/partner/reports" path="/partner/reports" element={gated(<PartnerReportsPage />)} />,
];
