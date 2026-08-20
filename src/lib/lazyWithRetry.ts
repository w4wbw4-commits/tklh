import { lazy, type ComponentType } from "react";

const FLAG = "tklh_chunk_reload";

/**
 * lazyWithRetry — guards lazy routes against stale chunk hashes after a deploy.
 * If the browser has an old index.html cached and requests a chunk filename that
 * no longer exists on the CDN, we hard-reload once to pick up the fresh manifest
 * instead of letting the app crash to a blank screen.
 */
export const lazyWithRetry = <T extends { default: ComponentType<any> }>(
  factory: () => Promise<T>,
) =>
  lazy(async () => {
    try {
      const mod = await factory();
      sessionStorage.removeItem(FLAG);
      return mod;
    } catch (err) {
      if (sessionStorage.getItem(FLAG) !== "1") {
        sessionStorage.setItem(FLAG, "1");
        window.location.reload();
        // Never resolve — keep the Suspense fallback until the reload happens.
        return new Promise<T>(() => {});
      }
      throw err;
    }
  });
