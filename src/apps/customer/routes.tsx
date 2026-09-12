import { Route } from "react-router-dom";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
// Eagerly load Index — it's the landing route, blocking it on a chunk fetch
// would tank the initial paint. Everything else is code-split.
import Index from "@/pages/Index.tsx";

const Auth = lazyWithRetry(() => import("@/pages/Auth.tsx"));
const ForgotPassword = lazyWithRetry(() => import("@/pages/ForgotPassword.tsx"));
const ResetPassword = lazyWithRetry(() => import("@/pages/ResetPassword.tsx"));
const Vendor = lazyWithRetry(() => import("@/pages/Vendor.tsx"));
const JoinVendor = lazyWithRetry(() => import("@/pages/JoinVendor.tsx"));
const Dashboard = lazyWithRetry(() => import("@/pages/Dashboard.tsx"));
const Checkout = lazyWithRetry(() => import("@/pages/Checkout.tsx"));
const Success = lazyWithRetry(() => import("@/pages/Success.tsx"));
const Invoice = lazyWithRetry(() => import("@/pages/Invoice.tsx"));
const Terms = lazyWithRetry(() => import("@/pages/Terms.tsx"));
const Privacy = lazyWithRetry(() => import("@/pages/Privacy.tsx"));
const TermsOfService = lazyWithRetry(() => import("@/pages/TermsOfService.tsx"));
const PrivacyPolicy = lazyWithRetry(() => import("@/pages/PrivacyPolicy.tsx"));
const RefundPolicy = lazyWithRetry(() => import("@/pages/RefundPolicy.tsx"));
const WeddingsPage = lazyWithRetry(() => import("@/pages/seo/WeddingsPage.tsx"));
const EventsPage = lazyWithRetry(() => import("@/pages/seo/EventsPage.tsx"));
const ConferencesPage = lazyWithRetry(() => import("@/pages/seo/ConferencesPage.tsx"));
const Packages = lazyWithRetry(() => import("@/pages/Packages.tsx"));
const Planner = lazyWithRetry(() => import("@/pages/Planner.tsx"));
const About = lazyWithRetry(() => import("@/pages/About.tsx"));

/** Customer web app (tklh.sa) — marketing, planner, dashboard, checkout, legal. */
export const customerRoutes = [
  <Route key="/" path="/" element={<Index />} />,
  <Route key="/auth" path="/auth" element={<Auth />} />,
  <Route key="/forgot-password" path="/forgot-password" element={<ForgotPassword />} />,
  <Route key="/reset-password" path="/reset-password" element={<ResetPassword />} />,
  <Route key="/vendor" path="/vendor" element={<Vendor />} />,
  <Route key="/join-vendor" path="/join-vendor" element={<JoinVendor />} />,
  <Route key="/dashboard" path="/dashboard" element={<Dashboard />} />,
  <Route key="/checkout" path="/checkout/:bookingId" element={<Checkout />} />,
  <Route key="/invoice" path="/invoice/:bookingId" element={<Invoice />} />,
  <Route key="/success" path="/success" element={<Success />} />,
  <Route key="/terms" path="/terms" element={<Terms />} />,
  <Route key="/privacy" path="/privacy" element={<Privacy />} />,
  <Route key="/terms-of-service" path="/terms-of-service" element={<TermsOfService />} />,
  <Route key="/privacy-policy" path="/privacy-policy" element={<PrivacyPolicy />} />,
  <Route key="/refund-policy" path="/refund-policy" element={<RefundPolicy />} />,
  <Route key="/weddings" path="/weddings" element={<WeddingsPage />} />,
  <Route key="/events" path="/events" element={<EventsPage />} />,
  <Route key="/conferences" path="/conferences" element={<ConferencesPage />} />,
  <Route key="/packages" path="/packages" element={<Packages />} />,
  <Route key="/planner" path="/planner" element={<Planner />} />,
  <Route key="/about" path="/about" element={<About />} />,
];
