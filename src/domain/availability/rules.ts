// ---------------------------------------------------------------------------
// availability rules — the ONLY place that decides whether a vendor/date/section
// is bookable. Both the partner calendar and the customer catalog import from
// here, so a booking accepted, rejected, cancelled or edited changes one rule
// set, never two.
//
// Source of truth for the data itself is the `vendor_availability` table, which
// the database recomputes (refresh_booking_availability) on every booking
// insert/update/delete. Nothing here re-derives state from bookings.
// ---------------------------------------------------------------------------

export type SectionKey = "men" | "women" | "both";
export type SectionStatus = "blocked" | "booked" | "pending" | null;

export interface AvailabilityDay {
  vendor_id?: string;
  date: string;
  status: "blocked" | "booked" | "pending";
  men_status?: SectionStatus;
  women_status?: SectionStatus;
}

/**
 * A row carries per-section state only for vendors that serve men and women
 * independently (the database fills men_status/women_status for those
 * categories only). Absence of both means "one indivisible venue/service".
 */
export const isSplitDay = (row: AvailabilityDay) =>
  (row.men_status ?? null) !== null || (row.women_status ?? null) !== null;

/**
 * pending and booked both hold the date: a pending row is a real request
 * awaiting the deposit, and letting a second customer book over it would
 * double-book the vendor. `blocked` is the vendor's own manual block.
 * Cancelled/rejected bookings never reach this table — the database deletes
 * the row (or recomputes it to the remaining sections) instead.
 */
const HOLDS = (s: SectionStatus) => s === "booked" || s === "pending" || s === "blocked";

/** Is `section` still bookable on this day, given the day's availability row? */
export const isSectionAvailable = (row: AvailabilityDay | null | undefined, section: SectionKey) => {
  if (!row) return true;
  if (!isSplitDay(row)) return !HOLDS(row.status);
  const men = !HOLDS(row.men_status ?? null);
  const women = !HOLDS(row.women_status ?? null);
  if (section === "men") return men;
  if (section === "women") return women;
  return men && women;
};

/** Is anything at all still bookable on this day? */
export const isAnySectionAvailable = (row: AvailabilityDay | null | undefined) =>
  isSectionAvailable(row, "men") || isSectionAvailable(row, "women");

/** Index rows by vendor for a single date — used by the customer catalog. */
export const indexByVendor = (rows: AvailabilityDay[]) => {
  const map = new Map<string, AvailabilityDay>();
  rows.forEach((r) => {
    if (r.vendor_id) map.set(r.vendor_id, r);
  });
  return map;
};

/**
 * Calendar buckets for the partner month view. Colour names stay in the UI;
 * this only says which bucket a day belongs to.
 */
export const dayBuckets = (rows: AvailabilityDay[], todayKey: string) => {
  const d = (r: AvailabilityDay) => new Date(r.date);
  const blocked: Date[] = [];
  const booked: Date[] = [];
  const pending: Date[] = [];
  const menBooked: Date[] = [];
  const womenBooked: Date[] = [];
  const menPending: Date[] = [];
  const womenPending: Date[] = [];
  const freeToday: Date[] = [];

  if (!rows.some((r) => r.date === todayKey)) {
    freeToday.push(new Date(new Date().setHours(0, 0, 0, 0)));
  }

  rows.forEach((r) => {
    if (r.status === "blocked" && !isSplitDay(r)) {
      blocked.push(d(r));
      return;
    }
    if (!isSplitDay(r)) {
      (r.status === "booked" ? booked : pending).push(d(r));
      return;
    }
    const men = r.men_status ?? null;
    const women = r.women_status ?? null;
    if (HOLDS(men) && HOLDS(women) && men !== "pending" && women !== "pending") {
      booked.push(d(r));
      return;
    }
    if (men === "booked" || men === "blocked") menBooked.push(d(r));
    else if (men === "pending") menPending.push(d(r));
    if (women === "booked" || women === "blocked") womenBooked.push(d(r));
    else if (women === "pending") womenPending.push(d(r));
  });

  return { blocked, booked, pending, menBooked, womenBooked, menPending, womenPending, freeToday };
};

/** Does this vendor expose independent men/women sections at all? */
export const vendorHasSections = (rows: AvailabilityDay[]) => rows.some(isSplitDay);
