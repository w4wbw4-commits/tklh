import { describe, expect, it } from "vitest";
import { isSectionAvailable, isAnySectionAvailable, vendorHasSections } from "@/domain/availability/rules";
import type { AvailabilityDay } from "@/domain/availability/rules";

const day = (p: Partial<AvailabilityDay>): AvailabilityDay => ({
  date: "2026-10-01",
  status: "booked",
  ...p,
});

describe("availability rules — single source of truth", () => {
  it("free date is available for every section", () => {
    expect(isSectionAvailable(null, "both")).toBe(true);
    expect(isSectionAvailable(undefined, "men")).toBe(true);
  });

  it("non-sectioned vendor: any hold blocks everything", () => {
    const r = day({ status: "booked" });
    expect(isSectionAvailable(r, "both")).toBe(false);
    expect(isSectionAvailable(r, "men")).toBe(false);
    expect(isAnySectionAvailable(r)).toBe(false);
    expect(vendorHasSections([r])).toBe(false);
  });

  it("men-only booked leaves women bookable", () => {
    const r = day({ men_status: "booked", women_status: null });
    expect(isSectionAvailable(r, "men")).toBe(false);
    expect(isSectionAvailable(r, "women")).toBe(true);
    expect(isSectionAvailable(r, "both")).toBe(false);
    expect(vendorHasSections([r])).toBe(true);
  });

  it("women-only booked leaves men bookable", () => {
    const r = day({ men_status: null, women_status: "booked" });
    expect(isSectionAvailable(r, "women")).toBe(false);
    expect(isSectionAvailable(r, "men")).toBe(true);
  });

  it("both sections booked blocks everything", () => {
    const r = day({ men_status: "booked", women_status: "booked" });
    expect(isAnySectionAvailable(r)).toBe(false);
  });

  it("pending request holds its section only", () => {
    const r = day({ status: "pending", men_status: "pending", women_status: null });
    expect(isSectionAvailable(r, "men")).toBe(false);
    expect(isSectionAvailable(r, "women")).toBe(true);
  });

  it("manual block on one section keeps the other open", () => {
    const r = day({ status: "blocked", men_status: "blocked", women_status: null });
    expect(isSectionAvailable(r, "men")).toBe(false);
    expect(isSectionAvailable(r, "women")).toBe(true);
  });
});
