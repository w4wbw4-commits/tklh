// ---------------------------------------------------------------------------
// Admin allowlist — single source of truth.
// These phones always reach the Admin Console (the DB trigger also grants the
// 'admin' role row so RLS-protected writes work).
// ---------------------------------------------------------------------------
export const PRIMARY_ADMIN_PHONES = [
  "+966530020087",
  "+966557997215",
  "+966554430196",
  "+966544057854",
];

export const PRIMARY_ADMIN_EMAILS = PRIMARY_ADMIN_PHONES.map(
  (p) => `${p.replace("+", "")}@phone.tekillah.app`,
);

/** True when the signed-in user is on the hardcoded admin allowlist. */
export const isAllowlistedAdmin = (user?: { email?: string | null; phone?: string | null } | null) =>
  !!user &&
  ((!!user.email && PRIMARY_ADMIN_EMAILS.includes(user.email)) ||
    (!!user.phone && PRIMARY_ADMIN_PHONES.includes(user.phone)));
