import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
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
    hostname.endsWith(".local");

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

createRoot(document.getElementById("root")!).render(<App />);
