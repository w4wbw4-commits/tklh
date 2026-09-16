import { describe, expect, it } from "vitest";
import {
  getAvailabilityVisualState,
  isDualSectionCategory,
} from "@/components/tekillah/availability/AvailabilityCalendar";

describe("availability calendar states", () => {
  it("classifies only halls and photographers as dual-section vendors", () => {
    expect(isDualSectionCategory("hall")).toBe(true);
    expect(isDualSectionCategory("photography")).toBe(true);
    expect(isDualSectionCategory("catering")).toBe(false);
    expect(isDualSectionCategory("cars")).toBe(false);
  });

  it("renders all dual-section booking combinations", () => {
    expect(getAvailabilityVisualState(undefined, true)).toBe("available");
    expect(getAvailabilityVisualState({ date: "2026-09-16", status: "pending" }, true)).toBe("pending");
    expect(getAvailabilityVisualState({ date: "2026-09-16", status: "booked", men_status: "booked" }, true)).toBe("men");
    expect(getAvailabilityVisualState({ date: "2026-09-16", status: "booked", women_status: "booked" }, true)).toBe("women");
    expect(getAvailabilityVisualState({ date: "2026-09-16", status: "booked", men_status: "booked", women_status: "booked" }, true)).toBe("both");
  });

  it("uses a full-cell state for simple bookings", () => {
    expect(getAvailabilityVisualState({ date: "2026-09-16", status: "pending" }, false)).toBe("pending");
    expect(getAvailabilityVisualState({ date: "2026-09-16", status: "booked" }, false)).toBe("booked");
  });
});