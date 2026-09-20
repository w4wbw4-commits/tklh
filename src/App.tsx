import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { RoleSwitcher } from "./components/tekillah/RoleSwitcher";
import { AppErrorBoundary } from "./components/tekillah/AppErrorBoundary";
import { resolveShell } from "./apps/shell";
import { customerRoutes } from "./apps/customer/routes";
import { partnerRoutes } from "./apps/partner/routes";
import { adminRoutes } from "./apps/admin/routes";

const NotFound = lazyWithRetry(() => import("./pages/NotFound.tsx"));

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

/**
 * ShellRoutes — host-aware route mounting.
 *   tklh.sa         → customer routes (+ legacy /partner and /admin aliases)
 *   partner.tklh.sa → partner routes only
 *   admin.tklh.sa   → admin routes only
 *   localhost / Lovable preview → everything, so the editor stays fully usable
 */
const ShellRoutes = () => {
  const shell = resolveShell();

  if (shell === "partner") {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/partner" replace />} />
        {partnerRoutes}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  if (shell === "admin") {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        {adminRoutes}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Customer domain keeps /partner and /admin as backward-compatible aliases.
  return (
    <Routes>
      {customerRoutes}
      {partnerRoutes}
      {adminRoutes}
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
                    <ShellRoutes />
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
