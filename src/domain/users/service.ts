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

/**
 * Best-effort self-heal for allowlisted admins. RLS only lets an existing
 * admin insert into `user_roles`, so this can never escalate privileges — the
 * authoritative grant is the database trigger `auto_grant_primary_admin`.
 */
export const ensureRole = async (userId: string, role: AppRole) => {
  await db.from("user_roles").insert({ user_id: userId, role }).then(
    () => {},
    () => {},
  );
};

/**
 * Resolves admin access from the database only: `has_role` (SECURITY DEFINER,
 * reading `user_roles`) is the single source of truth. The frontend allowlist
 * is never a source of authority — it only triggers a best-effort self-heal
 * that RLS itself must approve.
 */
export const resolveAdminAccess = async (
  user: { id: string; email?: string | null; phone?: string | null } | null,
) => {
  if (!user) return false;
  const isAdmin = await hasRole(user.id, "admin");
  if (isAdmin) return true;
  if (isAllowlistedAdmin(user)) {
    // Attempt the self-heal, then re-check the database. If RLS refuses the
    // insert (the normal case for a non-admin), access stays denied.
    await ensureRole(user.id, "admin");
    return hasRole(user.id, "admin");
  }
  return false;
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

// ---- Bulk profile lookups (admin/vendor screens) --------------------------

export type ProfileLookupRow = {
  user_id: string;
  display_name: string | null;
  phone: string | null;
};

export const listProfilesByIds = async (userIds: string[], columns = "*") => {
  const { data, error } = await db.from("profiles").select(columns).in("user_id", userIds);
  return { data: (data ?? null) as unknown as ProfileLookupRow[] | null, error };
};

export const listPublicProfilesByIds = (userIds: string[]) =>
  db.from("public_profiles" as never).select("user_id, display_name").in("user_id", userIds);
