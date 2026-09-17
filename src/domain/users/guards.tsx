import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import * as usersService from "./service";
import type { AppRole } from "@/domain/types";

// ---------------------------------------------------------------------------
// Centralized role guards.
//
// These are UX affordances ONLY — they decide what to render and where to
// redirect. Real authorization stays in the database: RLS policies plus the
// `has_role` security-definer function remain the single source of truth, and
// they are unchanged by this module.
// ---------------------------------------------------------------------------

export interface RolesState {
  loading: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  user: ReturnType<typeof useAuth>["user"];
}

/** Resolves the signed-in user's roles using the same rules as before. */
export const useRoles = (): RolesState => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  // Which user the flags above were resolved for. Keeping this instead of a
  // plain boolean closes a race where the session arrives one render before the
  // role lookup starts: for that render the flags still belonged to "no user",
  // and a guard would wrongly deny an approved partner on a hard reload.
  const [resolvedFor, setResolvedFor] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setIsVendor(false);
          setResolvedFor(null);
        }
        return;
      }
      const [admin, vendor] = await Promise.all([
        usersService.resolveAdminAccess(user),
        usersService.hasRole(user.id, "vendor" as AppRole),
      ]);
      if (cancelled) return;
      setIsAdmin(admin);
      setIsVendor(vendor);
      setResolvedFor(user.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loading = authLoading || resolvedFor !== (user?.id ?? null);

  return { loading, isAdmin, isVendor, user };
};

const AuthGate = ({
  allow,
  children,
  loginPath = "/auth",
  deniedPath = "/",
}: {
  allow: (roles: RolesState) => boolean;
  children: React.ReactNode;
  /** Where an anonymous visitor is sent to sign in. */
  loginPath?: string;
  /** Where a signed-in user without the required role is sent. */
  deniedPath?: string;
}) => {
  const roles = useRoles();
  const location = useLocation();

  // Same soft cream wash the router uses — never a spinner flash.
  if (roles.loading) return <div className="min-h-screen bg-background" aria-hidden />;
  if (!roles.user) {
    return <Navigate to={`${loginPath}?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!allow(roles)) return <Navigate to={deniedPath} replace />;
  return <>{children}</>;
};

/** Any signed-in customer. */
export const RequireCustomer = ({ children }: { children: React.ReactNode }) => (
  <AuthGate allow={() => true}>{children}</AuthGate>
);

/**
 * Partner portal: vendor role or admin (admins can inspect partner pages).
 * The vendor role is granted only by `approve_vendor_application`, so an
 * applicant still under review lands on the status page instead of the portal.
 */
export const RequirePartner = ({ children }: { children: React.ReactNode }) => (
  <AuthGate
    allow={(r) => r.isVendor || r.isAdmin}
    loginPath="/partner/login"
    deniedPath="/partner/status"
  >
    {children}
  </AuthGate>
);

/** Admin console: allowlisted phone or `admin` role. */
export const RequireAdmin = ({ children }: { children: React.ReactNode }) => (
  <AuthGate allow={(r) => r.isAdmin}>{children}</AuthGate>
);
