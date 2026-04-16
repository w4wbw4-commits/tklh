import type { Database } from "@/integrations/supabase/types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type GuestRow = Database["public"]["Tables"]["guests"]["Row"];
export type MilestoneRow = Database["public"]["Tables"]["timeline_milestones"]["Row"];
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];
export type PackageRow = Database["public"]["Tables"]["packages"]["Row"];

export type RsvpStatus = Database["public"]["Enums"]["rsvp_status"];
export type MilestoneStatus = Database["public"]["Enums"]["milestone_status"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];

export type BookingWithVendor = BookingRow & {
  vendor: Pick<VendorRow, "business_name" | "category" | "city"> | null;
  package: Pick<PackageRow, "name" | "tier"> | null;
};
