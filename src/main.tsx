import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@emran-alhaddad/saudi-riyal-font/index.css";
import "./i18n";

// Canonical domain enforcement.
// Any host other than tklh.sa (or local dev / lovable preview) is redirected
// to https://tklh.sa preserving the path, query, and hash. Browsers cannot
// emit a real 301, so we use location.replace() — it skips the bad host in
// history and search engines pick up the canonical via the <link rel="canonical">
// tags on every page (see SEO.tsx + index.html).
(() => {
  if (typeof window === "undefined") return;
  const { hostname, pathname, search, hash, protocol } = window.location;

  // Production hosts, one per audience. Each one serves its own shell (see
  // src/apps/shell.ts) and must NOT be folded into the customer domain,
  // otherwise the partner and admin subdomains would bounce to the storefront.
  const PRODUCTION_HOSTS = ["tklh.sa", "partner.tklh.sa", "admin.tklh.sa"];
  const isProductionHost = PRODUCTION_HOSTS.includes(hostname);

  // Only true local development is exempt. Lovable preview/published domains
  // are redirected so all traffic consolidates on the official domains.
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local") ||
    // Lovable preview/sandbox domains — needed so the in-app preview iframe
    // and the published *.lovable.app URL keep working as dev tools.
    hostname.endsWith(".lovable.app") ||
    hostname.endsWith(".lovableproject.com") ||
    hostname.endsWith(".lovable.dev");

  if (isProductionHost) {
    // Force HTTPS, staying on the same audience host.
    if (protocol !== "https:") {
      window.location.replace(`https://${hostname}${pathname}${search}${hash}`);
    }
    return;
  }

  if (isLocal) return;

  // www.tklh.sa and any other host consolidate on the canonical customer domain.
  window.location.replace(`https://tklh.sa${pathname}${search}${hash}`);
})();

// The partner and admin hosts are private back-office surfaces: keep them out
// of search results. index.html ships the public storefront's robots tag, so on
// those hosts we replace it at runtime before the first paint.
(() => {
  if (typeof window === "undefined") return;
  const host = window.location.hostname.toLowerCase();
  if (!host.startsWith("partner.") && !host.startsWith("admin.")) return;
  document.querySelectorAll('meta[name="robots"], meta[name="googlebot"]').forEach((el) => el.remove());
  const meta = document.createElement("meta");
  meta.setAttribute("name", "robots");
  meta.setAttribute("content", "noindex, nofollow");
  document.head.appendChild(meta);
})();


// Auto-recover from stale dynamic-import chunks after a redeploy.
// When Vite rebuilds, old chunk filenames (hashed) disappear from the CDN.
// A user with the previous index.js still cached will throw
// "Failed to fetch dynamically imported module" on the next lazy route.
// We detect that specific error and force a one-shot reload to pick up the
// fresh manifest. The sessionStorage guard prevents a reload loop if the
// error is actually a network/offline issue.
if (typeof window !== "undefined") {
  const RELOAD_FLAG = "tklh_chunk_reload";
  const isChunkLoadError = (msg: string) =>
    /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(msg);

  // React reconciliation crash — usually caused by third-party DOM mutators
  // (translation extensions, ad blockers) or framer-motion exit-animation
  // races. The fiber tree is corrupted at this point so a one-shot reload
  // is the only safe recovery; the sessionStorage guard prevents loops.
  const isReactDomCrash = (msg: string) =>
    /removeChild.*not a child|insertBefore.*not a child|NotFoundError.*Node/i.test(msg);

  const tryReload = (msg: string) => {
    if (!isChunkLoadError(msg) && !isReactDomCrash(msg)) return;
    if (sessionStorage.getItem(RELOAD_FLAG)) return;
    sessionStorage.setItem(RELOAD_FLAG, "1");
    window.location.reload();
  };

  window.addEventListener("error", (e) => tryReload(e.message ?? ""));
  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    const msg = typeof reason === "string" ? reason : reason?.message ?? "";
    tryReload(msg);
  });

  // Clear the guard once the app has loaded successfully.
  window.addEventListener("load", () => {
    setTimeout(() => sessionStorage.removeItem(RELOAD_FLAG), 2000);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
