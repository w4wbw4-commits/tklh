// ---------------------------------------------------------------------------
// Pending event plan — survives the auth round-trip
// ---------------------------------------------------------------------------
// When an unauthenticated guest finishes the planning wizard, we persist the
// full snapshot to localStorage so the dashboard can finalise the booking the
// moment they sign in. Stored under a single key (`pending_event_plan`) and
// versioned so future schema changes can invalidate stale snapshots safely.
// ---------------------------------------------------------------------------

import type { ServiceKey } from "@/components/tekillah/wizard/types";
import type { VendorPick } from "@/components/tekillah/wizard/StepVendors";

export const PENDING_PLAN_KEY = "tekillah_draft_plan";
// Legacy key — migrated on first read so early testers don't lose their draft.
const LEGACY_PENDING_PLAN_KEY = "pending_event_plan";
const PENDING_PLAN_VERSION = 1;
// Snapshots older than 24h are dropped — keeps stale guest data from haunting
// future sign-ins on shared devices.
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Marker stored on a package fast-track booking. */
export interface PackageSelection {
  /** Stable key — "classic" | "premium" | "royal". */
  key: string;
  /** Localised display name at the time of selection. */
  name: string;
  /** Fixed price in SAR. */
  price: number;
  /** Translation key whose value is a string[] of inclusions. */
  includesKey: string;
}

export interface PendingPlan {
  version: number;
  savedAt: number;
  city: string;
  eventType: string;
  date: string;
  men: number;
  women: number;
  selected: string[];
  vision: string;
  selectedChips: string[];
  budgetMode: "packages" | "smart" | null;
  budget: number;
  allocations: Record<ServiceKey, number>;
  enabledServices: Record<ServiceKey, boolean>;
  picks: Record<string, VendorPick>;
  /** Set when the user picked a ready-made package (fast-track flow). */
  packageSelection?: PackageSelection | null;
}

export type PendingPlanInput = Omit<PendingPlan, "version" | "savedAt">;

export const savePendingPlan = (plan: PendingPlanInput): void => {
  try {
    const payload: PendingPlan = {
      ...plan,
      version: PENDING_PLAN_VERSION,
      savedAt: Date.now(),
    };
    localStorage.setItem(PENDING_PLAN_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota/serialisation errors — persistence is a nice-to-have.
  }
};

export const loadPendingPlan = (): PendingPlan | null => {
  try {
    let raw = localStorage.getItem(PENDING_PLAN_KEY);
    if (!raw) {
      // One-time migration from the old key name.
      const legacy = localStorage.getItem(LEGACY_PENDING_PLAN_KEY);
      if (legacy) {
        localStorage.setItem(PENDING_PLAN_KEY, legacy);
        localStorage.removeItem(LEGACY_PENDING_PLAN_KEY);
        raw = legacy;
      }
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPlan;
    if (parsed.version !== PENDING_PLAN_VERSION) {
      localStorage.removeItem(PENDING_PLAN_KEY);
      return null;
    }
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(PENDING_PLAN_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(PENDING_PLAN_KEY);
    return null;
  }
};

export const clearPendingPlan = (): void => {
  try {
    localStorage.removeItem(PENDING_PLAN_KEY);
  } catch {
    // no-op
  }
};

/** Has at least one pick OR a fast-track package selection. */
export const isPendingPlanReady = (plan: PendingPlan | null): plan is PendingPlan =>
  !!plan && !!plan.date && (
    Object.keys(plan.picks ?? {}).length > 0 || !!plan.packageSelection
  );
