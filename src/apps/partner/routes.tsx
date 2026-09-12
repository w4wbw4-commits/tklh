import { Route } from "react-router-dom";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

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

/**
 * Partner portal (partner.tklh.sa). Paths stay `/partner/*` so every existing
 * link, redirect (`/auth?redirect=/partner/...`) and bookmark keeps working on
 * the customer domain too.
 */
export const partnerRoutes = [
  <Route key="/partner" path="/partner" element={<PartnerOverview />} />,
  <Route key="/partner/bookings" path="/partner/bookings" element={<PartnerBookings />} />,
  <Route key="/partner/calendar" path="/partner/calendar" element={<PartnerCalendarPage />} />,
  <Route key="/partner/invoices" path="/partner/invoices" element={<PartnerInvoicesPage />} />,
  <Route key="/partner/sales" path="/partner/sales" element={<PartnerSalesPage />} />,
  <Route key="/partner/analytics" path="/partner/analytics" element={<PartnerAnalyticsPage />} />,
  <Route key="/partner/pricing" path="/partner/pricing" element={<PartnerPricingPage />} />,
  <Route key="/partner/checklists" path="/partner/checklists" element={<PartnerChecklistsPage />} />,
  <Route key="/partner/reviews" path="/partner/reviews" element={<PartnerReviewsPage />} />,
  <Route key="/partner/notifications" path="/partner/notifications" element={<PartnerNotificationsPage />} />,
  <Route key="/partner/profile" path="/partner/profile" element={<PartnerProfilePage />} />,
];
