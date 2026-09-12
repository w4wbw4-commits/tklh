// ---------------------------------------------------------------------------
// Domain layer — shared contract types.
//
// These are the types a future iOS/Android client mirrors. They are re-exported
// from their current homes so no existing import path breaks.
// ---------------------------------------------------------------------------
import type { Database } from "@/integrations/supabase/types";

export type Tables = Database["public"]["Tables"];
export type Enums = Database["public"]["Enums"];

export type Row<T extends keyof Tables> = Tables[T]["Row"];
export type Insert<T extends keyof Tables> = Tables[T]["Insert"];
export type Update<T extends keyof Tables> = Tables[T]["Update"];

export type AppRole = Enums["app_role"];
export type BookingStatus = Enums["booking_status"];
export type ApprovalStatus = Enums["approval_status"];
export type PaymentStatus = Enums["payment_status"];
export type LeadStatus = Enums["lead_status"];
export type NotificationType = Enums["notification_type"];
export type VendorCategory = Enums["vendor_category"];

// Existing hand-written view models keep their current definitions.
export type {
  VendorRow,
  PackageRow,
  AvailabilityRow,
  NotificationRow,
} from "@/components/tekillah/vendor/types";
