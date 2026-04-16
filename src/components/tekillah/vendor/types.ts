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

export interface VendorRow {
  id: string;
  user_id: string;
  business_name: string;
  category: "hall" | "catering" | "photography" | "dj" | "decor" | "cars";
  bio: string | null;
  city: string | null;
  phone: string | null;
  portfolio_urls: string[];
  commercial_register_url: string | null;
  daily_capacity: number;
  starting_price: number;
  verified: boolean;
  active: boolean;
}

export interface PackageRow {
  id: string;
  vendor_id: string;
  name: string;
  tier: "basic" | "premium" | "royal";
  price: number;
  description: string | null;
  includes: string[];
  active: boolean;
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
