export const CATEGORY_LABELS: Record<string, string> = {
  hall: "قاعة",
  catering: "ضيافة",
  photography: "تصوير",
  dj: "DJ وصوت",
  decor: "تنسيق وديكور",
  cars: "سيارات",
};

export const TIER_LABELS: Record<string, string> = {
  basic: "كلاسيك",
  premium: "بريميوم",
  royal: "رويال",
};

export type ApprovalStatus = "pending_approval" | "approved" | "rejected";

export interface VendorRow {
  id: string;
  user_id: string;
  business_name: string;
  category: "hall" | "catering" | "photography" | "dj" | "decor" | "cars";
  bio: string | null;
  city: string | null;
  region: string | null;
  district: string | null;
  phone: string | null;
  portfolio_urls: string[];
  commercial_register_url: string | null;
  iban: string | null;
  iban_certificate_url: string | null;
  google_maps_url: string | null;
  daily_capacity: number;
  starting_price: number;
  weekday_price: number;
  weekend_price: number;
  min_deposit: number;
  men_capacity: number | null;
  women_capacity: number | null;
  extra_services: string[];
  verified: boolean;
  active: boolean;
  approval_status: ApprovalStatus;
  rejection_reason: string | null;
}

/**
 * Optional add-ons offered by venues ("قاعة" only). Stored as text[] in
 * `vendors.extra_services` so admins and vendors can edit the same list.
 * NOTE: per product spec, AC ("تكييف") is intentionally excluded.
 */
export const VENUE_EXTRA_SERVICES = [
  { key: "lighting", label: "إضاءة" },
  { key: "buffet", label: "بوفيه" },
  { key: "sound", label: "صوتيات" },
  { key: "catering_meat", label: "ذبائح" },
  { key: "kosha", label: "كوشة" },
  { key: "coordinator", label: "منسق" },
  { key: "wifi", label: "واي فاي" },
  { key: "parking", label: "مواقف" },
] as const;

export type VenueExtraServiceKey = (typeof VENUE_EXTRA_SERVICES)[number]["key"];

export const EXTRA_SERVICE_LABELS: Record<string, string> = Object.fromEntries(
  VENUE_EXTRA_SERVICES.map((s) => [s.key, s.label]),
);

export interface PackageRow {
  id: string;
  vendor_id: string;
  name: string;
  tier: "basic" | "premium" | "royal";
  price: number;
  description: string | null;
  includes: string[];
  active: boolean;
  approval_status: ApprovalStatus;
  rejection_reason: string | null;
}

export interface AvailabilityRow {
  id: string;
  vendor_id: string;
  date: string;
  status: "blocked" | "booked" | "pending";
  note: string | null;
  booking_id: string | null;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: "booking_request" | "booking_confirmed" | "payment_confirmed" | "event_reminder" | "general";
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}
