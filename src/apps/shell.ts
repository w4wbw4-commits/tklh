// ---------------------------------------------------------------------------
// App shell resolution.
//
// One build serves three domains:
//   tklh.sa          → customer
//   partner.tklh.sa  → partner portal
//   admin.tklh.sa    → admin console
//
// Anywhere else (localhost, Lovable preview, the editor) mounts ALL routes so
// nothing is lost while developing. Legacy paths (`tklh.sa/partner`,
// `tklh.sa/admin`) also keep working — the customer shell mounts them as
// aliases, so existing links and bookmarks never break.
// ---------------------------------------------------------------------------
export type ShellKind = "customer" | "partner" | "admin" | "all";

export const resolveShell = (hostname?: string): ShellKind => {
  const host = (hostname ?? (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();
  if (host.startsWith("admin.")) return "admin";
  if (host.startsWith("partner.")) return "partner";
  if (host === "tklh.sa" || host === "www.tklh.sa" || host.endsWith(".tklh.sa")) return "customer";
  // Preview / local / published Lovable host: everything mounted.
  return "all";
};
