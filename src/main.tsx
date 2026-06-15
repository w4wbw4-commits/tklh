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

  const isCanonicalHost = hostname === "tklh.sa";
  // Only true local development is exempt. Lovable preview/published domains
  // are redirected so all traffic consolidates on the official domain.
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local") ||
    // Lovable preview/sandbox domains — needed so the in-app preview iframe
    // and the published *.lovable.app URL keep working as dev tools.
    hostname.endsWith(".lovable.app") ||
    hostname.endsWith(".lovableproject.com") ||
    hostname.endsWith(".lovable.dev");

  if (isCanonicalHost) {
    // Force HTTPS on the canonical host.
    if (protocol !== "https:") {
      window.location.replace(`https://tklh.sa${pathname}${search}${hash}`);
    }
    return;
  }

  if (isLocal) return;

  window.location.replace(`https://tklh.sa${pathname}${search}${hash}`);
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

  const tryReload = (msg: string) => {
    if (!isChunkLoadError(msg)) return;
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
