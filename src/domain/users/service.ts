import { db } from "@/domain/client";
import { isAllowlistedAdmin } from "@/lib/admins";
import type { AppRole } from "@/domain/types";

// ---------------------------------------------------------------------------
// users domain — profiles, roles, admin allowlist.
// Behaviour is identical to the previous inline call sites.
// ---------------------------------------------------------------------------

export const hasRole = async (userId: string, role: AppRole) => {
  const { data } = await db.rpc("has_role", { _user_id: userId, _role: role });
  return Boolean(data);
};

/** Best-effort self-heal so RLS-protected writes work for allowlisted admins. */
export const ensureRole = async (userId: string, role: AppRole) => {
  await db.from("user_roles").insert({ user_id: userId, role }).then(
    () => {},
    () => {},
  );
};

/**
 * Resolves admin access exactly as before: hardcoded phone allowlist first
 * (with a role self-heal), otherwise the `has_role` security-definer RPC.
 */
export const resolveAdminAccess = async (
  user: { id: string; email?: string | null; phone?: string | null } | null,
) => {
  if (!user) return false;
  if (isAllowlistedAdmin(user)) {
    await ensureRole(user.id, "admin");
    return true;
  }
  return hasRole(user.id, "admin");
};

export const getProfile = async (userId: string) =>
  db.from("profiles").select("*").eq("user_id", userId).maybeSingle();

/** Fetch only the display name — used for lightweight dashboard greetings. */
export const getDisplayName = async (userId: string) =>
  db.from("profiles").select("display_name").eq("user_id", userId).maybeSingle();

export const updateProfile = async (
  userId: string,
  patch: { display_name?: string; contact_email?: string; phone?: string },
) => db.from("profiles").update(patch).eq("user_id", userId);

export const countUsersByRole = async (role: AppRole) =>
  db.from("user_roles").select("*", { count: "exact", head: true }).eq("role", role);

export const TERMS_VERSION = "1.0";

export type TermsScope = "booking" | "vendor_onboarding";

/** Non-blocking, best-effort legal acceptance record. */
export const recordTermsAcceptance = async (
  userId: string,
  scope: TermsScope,
  relatedId?: string,
) => {
  try {
    await db.from("terms_acceptances").insert({
      user_id: userId,
      scope,
      version: TERMS_VERSION,
      related_id: relatedId ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 400) : null,
    });
  } catch {
    // Non-blocking — legal record is best-effort and shouldn't break flow.
  }
};

export { isAllowlistedAdmin };
