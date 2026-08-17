// ---------------------------------------------------------------------------
// Mock provider catalog — powers the "اختر مزوديك" wizard step.
// Every record is demo data with a clear shape so it can later be swapped for
// a real backend query without touching the UI.
// ---------------------------------------------------------------------------

export type ProviderCategory =
  | "hall"
  | "catering"
  | "photography"
  | "decor"
  | "band"
  | "audio"
  | "cars";

export const PROVIDER_CATEGORIES: ProviderCategory[] = [
  "hall",
  "catering",
  "photography",
  "decor",
  "band",
  "audio",
  "cars",
];

/** Venue sub-type — only meaningful for the `hall` category. */
export type VenueType = "wedding_hall" | "hotel" | "resort" | "palace";

export const VENUE_TYPES: VenueType[] = ["wedding_hall", "hotel", "resort", "palace"];

export const venueTypeLabel = (v: VenueType, isAr: boolean) =>
  ({
    wedding_hall: isAr ? "قاعة أفراح" : "Wedding hall",
    hotel: isAr ? "فندق" : "Hotel",
    resort: isAr ? "استراحة" : "Resort",
    palace: isAr ? "قصر" : "Palace",
  }[v]);

/** Three demo dates used to exercise availability + seasonal pricing. */
export const DEMO_DATES = {
  /** Everything available. */
  a: "2026-10-15",
  /** Halls mostly booked → triggers the alternative-date banner. */
  b: "2026-11-20",
  /** Seasonal pricing (slightly higher). */
  c: "2026-12-25",
} as const;

export type DemoDateKey = keyof typeof DEMO_DATES;

/** Maps any user date onto one of the three demo scenarios (stable hash). */
export const demoDateKey = (date: string): DemoDateKey => {
  if (!date) return "a";
  if (date === DEMO_DATES.b) return "b";
  if (date === DEMO_DATES.c) return "c";
  const sum = [...date].reduce((s, c) => s + c.charCodeAt(0), 0);
  return (["a", "b", "c"] as DemoDateKey[])[sum % 3];
};

/** Seasonal multiplier per demo date. */
const SEASONAL: Record<DemoDateKey, number> = { a: 1, b: 1, c: 1.08 };

export interface Provider {
  id: string;
  category: ProviderCategory;
  name: string;
  name_en: string;
  /** Style / description line. */
  style: string;
  style_en: string;
  /** SAR. For catering this is the per-guest rate. */
  price: number;
  /** Catering only — price is per guest. */
  perGuest?: boolean;
  /** Hall only. */
  venueType?: VenueType;
  capacity?: number;
  /** Demo dates on which the provider is booked. */
  bookedOn: DemoDateKey[];
  /** Free-form tags matched against the customer's vision preferences. */
  tags: string[];
  /** Rough luxury level 1..5 — used by the "most luxurious" shortcut. */
  level: number;
}

export const MOCK_PROVIDERS: Provider[] = [
  // ---------------------------------------------------------------- halls
  { id: "hall-yasmin", category: "hall", name: "قاعة الياسمين", name_en: "Al Yasmin Hall", style: "قاعة أفراح — تتسع حتى 300 ضيف", style_en: "Wedding hall — up to 300 guests", price: 8000, venueType: "wedding_hall", capacity: 300, bookedOn: ["b"], tags: ["modern", "simple"], level: 1 },
  { id: "hall-nakheel", category: "hall", name: "قاعة النخيل", name_en: "Al Nakheel Hall", style: "قاعة أفراح — تتسع حتى 250 ضيف", style_en: "Wedding hall — up to 250 guests", price: 12000, venueType: "wedding_hall", capacity: 250, bookedOn: ["b"], tags: ["classic", "modern"], level: 2 },
  { id: "hall-masa", category: "hall", name: "قاعة الماسة", name_en: "Al Masah Hall", style: "قاعة أفراح — تتسع حتى 400 ضيف", style_en: "Wedding hall — up to 400 guests", price: 16000, venueType: "wedding_hall", capacity: 400, bookedOn: ["b"], tags: ["classic"], level: 3 },
  { id: "hall-hotel-riyadh", category: "hall", name: "فندق الرياض الدولي", name_en: "Riyadh International Hotel", style: "فندق — يتسع حتى 500 ضيف", style_en: "Hotel — up to 500 guests", price: 22000, venueType: "hotel", capacity: 500, bookedOn: ["b"], tags: ["classic", "luxury"], level: 4 },
  { id: "hall-waha", category: "hall", name: "منتجع الواحة", name_en: "Al Waha Resort", style: "استراحة — تتسع حتى 200 ضيف", style_en: "Resort — up to 200 guests", price: 9500, venueType: "resort", capacity: 200, bookedOn: [], tags: ["heritage", "simple"], level: 2 },
  { id: "hall-naseem", category: "hall", name: "منتجع النسيم", name_en: "Al Naseem Resort", style: "استراحة — تتسع حتى 180 ضيف", style_en: "Resort — up to 180 guests", price: 11000, venueType: "resort", capacity: 180, bookedOn: ["b"], tags: ["heritage", "modern"], level: 2 },
  { id: "hall-lulua", category: "hall", name: "قصر اللؤلؤة", name_en: "Al Lulua Palace", style: "قصر — يتسع حتى 150 ضيف", style_en: "Palace — up to 150 guests", price: 28000, venueType: "palace", capacity: 150, bookedOn: ["b"], tags: ["classic", "luxury"], level: 5 },

  // ------------------------------------------------------------- catering
  { id: "cat-asala", category: "catering", name: "ضيافة الأصالة", name_en: "Al Asala Catering", style: "بوفيه مفتوح أساسي", style_en: "Basic open buffet", price: 100, perGuest: true, bookedOn: [], tags: ["buffet_only", "simple"], level: 1 },
  { id: "cat-durra", category: "catering", name: "مطبخ درة الخليج", name_en: "Durrat Al Khaleej Kitchen", style: "قعود مع بوفيه مفتوح موسّع", style_en: "Seated dinner with extended buffet", price: 180, perGuest: true, bookedOn: [], tags: ["seated_buffet", "classic"], level: 2 },
  { id: "cat-thawaqa", category: "catering", name: "بيت الذواقة", name_en: "Bayt Al Thawaqa", style: "ذبائح خرفان كاملة", style_en: "Whole lamb feast", price: 260, perGuest: true, bookedOn: [], tags: ["lamb_feast", "heritage"], level: 3 },
  { id: "cat-nokhba", category: "catering", name: "كيترينق النخبة", name_en: "Elite Catering", style: "ذبائح + محطات طعام حيّة", style_en: "Lamb feast + live food stations", price: 420, perGuest: true, bookedOn: [], tags: ["lamb_feast", "classic", "luxury"], level: 4 },
  { id: "cat-5star", category: "catering", name: "ضيافة فندقية 5 نجوم", name_en: "5-Star Hotel Catering", style: "بوفيه فندقي فاخر بخدمة كاملة", style_en: "Luxury hotel buffet, full service", price: 650, perGuest: true, bookedOn: [], tags: ["buffet_only", "luxury"], level: 5 },

  // ---------------------------------------------------------- photography
  { id: "photo-lamsa", category: "photography", name: "لمسة توثيقية", name_en: "Lamsa Documentary", style: "صور فقط — تغطية القاعة", style_en: "Photos only — hall coverage", price: 3000, bookedOn: [], tags: ["photo_only", "simple"], level: 1 },
  { id: "photo-mashhad", category: "photography", name: "استوديو المشهد", name_en: "Al Mashhad Studio", style: "صور + فيديو — تغطية القاعة", style_en: "Photo + video — hall coverage", price: 6000, bookedOn: [], tags: ["photo_video_hall", "modern"], level: 2 },
  { id: "photo-cinema", category: "photography", name: "سينما العرس", name_en: "Wedding Cinema", style: "فيديو سينمائي + صور — من البيت للزفة للقاعة", style_en: "Cinematic video + photos — home to zaffa to hall", price: 11000, bookedOn: [], tags: ["cinematic_full", "classic"], level: 4 },
  { id: "photo-platinum", category: "photography", name: "البلاتينيوم برودكشن", name_en: "Platinum Production", style: "تغطية كاملة بطاقم متعدد + درون", style_en: "Full multi-crew coverage + drone", price: 16000, bookedOn: [], tags: ["cinematic_full", "luxury"], level: 5 },

  // --------------------------------------------------------------- decor
  { id: "decor-basic", category: "decor", name: "لمسات بسيطة", name_en: "Simple Touches", style: "تنسيق أساسي", style_en: "Basic styling", price: 4000, bookedOn: [], tags: ["simple", "modern"], level: 1 },
  { id: "decor-sham", category: "decor", name: "ورد الشام", name_en: "Ward Al Sham", style: "تنسيق كامل بالورد الطبيعي", style_en: "Full styling with fresh flowers", price: 7500, bookedOn: [], tags: ["classic", "heritage"], level: 3 },
  { id: "decor-atelier", category: "decor", name: "أتيليه الفخامة", name_en: "Atelier Luxe", style: "تصميم مخصص فاخر", style_en: "Bespoke luxury design", price: 13000, bookedOn: [], tags: ["classic", "luxury"], level: 5 },

  // ---------------------------------------------------------------- band
  { id: "band-asayel", category: "band", name: "فرقة الأصايل للزفة", name_en: "Al Asayel Zaffa Band", style: "زفة تقليدية بالطبول والعزف الشعبي", style_en: "Traditional zaffa with drums and folk music", price: 3500, bookedOn: [], tags: ["heritage"], level: 2 },
  { id: "band-nojoom", category: "band", name: "فرقة نجوم الطرب", name_en: "Nojoom Al Tarab Band", style: "فرقة طرب حي بأغاني معاصرة", style_en: "Live band with contemporary songs", price: 6000, bookedOn: [], tags: ["modern"], level: 3 },
  { id: "band-lamsa", category: "band", name: "فرقة اللمسة الاستعراضية", name_en: "Al Lamsa Show Band", style: "زفة استعراضية بإضاءة وعروض حركية", style_en: "Show zaffa with lighting and choreography", price: 9000, bookedOn: [], tags: ["classic", "luxury"], level: 5 },

  // --------------------------------------------------------------- audio
  { id: "audio-ehtiraf", category: "audio", name: "صوتيات الاحتراف", name_en: "Ehtiraf Audio", style: "نظام صوت أساسي (قاعة صغيرة-متوسطة)", style_en: "Basic sound system (small-medium hall)", price: 2500, bookedOn: [], tags: ["simple"], level: 1 },
  { id: "audio-saudipro", category: "audio", name: "ساوند سعودي برو", name_en: "Saudi Sound Pro", style: "نظام متكامل + فني صوت مقيم", style_en: "Full system + on-site engineer", price: 4500, bookedOn: [], tags: ["modern"], level: 3 },
  { id: "audio-intl", category: "audio", name: "إيفنت ساوند إنترناشونال", name_en: "Event Sound International", style: "نظام ضخم لحفلات +300 ضيف", style_en: "Large-scale system for 300+ guests", price: 7000, bookedOn: [], tags: ["luxury"], level: 5 },

  // ---------------------------------------------------------------- cars
  { id: "cars-limo", category: "cars", name: "ليموزين الرياض", name_en: "Riyadh Limousine", style: "سيارة واحدة فاخرة", style_en: "Single luxury car", price: 1500, bookedOn: [], tags: ["simple", "modern"], level: 1 },
  { id: "cars-nokhba", category: "cars", name: "موكب النخبة", name_en: "Elite Motorcade", style: "موكب صغير (3 سيارات)", style_en: "Small motorcade (3 cars)", price: 3000, bookedOn: [], tags: ["classic"], level: 3 },
  { id: "cars-royal", category: "cars", name: "الموكب الملكي", name_en: "Royal Motorcade", style: "موكب فاخر (5+ سيارات)", style_en: "Luxury motorcade (5+ cars)", price: 6000, bookedOn: [], tags: ["classic", "luxury"], level: 5 },
];

// ---------------------------------------------------------------------------
// Vision preferences (fed by the "لبنات رؤيتك" chips in step 3)
// ---------------------------------------------------------------------------
export interface VisionPrefs {
  dinner?: string | null;   // seated_buffet | lamb_feast | buffet_only
  photo?: string | null;    // photo_only | photo_video_hall | cinematic_full
  mood?: string | null;     // classic | modern | heritage
  text?: string;
}

/** Seasonal-adjusted price for a provider on the customer's date. */
export const priceOn = (p: Provider, dateKey: DemoDateKey) =>
  Math.round(p.price * SEASONAL[dateKey]);

export const isAvailable = (p: Provider, dateKey: DemoDateKey) =>
  !p.bookedOn.includes(dateKey);

/** Total cost of one provider given the guest count (per-guest aware). */
export const providerTotal = (p: Provider, guests: number, dateKey: DemoDateKey) =>
  p.perGuest ? priceOn(p, dateKey) * Math.max(guests, 1) : priceOn(p, dateKey);

/**
 * Relevance score — vision match first, then price sanity vs. the category's
 * median. Never hides anything: it only reorders.
 */
export const matchScore = (
  p: Provider,
  prefs: VisionPrefs,
  guests: number,
): number => {
  let score = 0;
  const text = (prefs.text ?? "").toLowerCase();

  if (prefs.dinner && p.tags.includes(prefs.dinner)) score += 40;
  if (prefs.photo && p.tags.includes(prefs.photo)) score += 40;
  if (prefs.mood && p.tags.includes(prefs.mood)) score += 30;

  // Free-text keyword hints (Arabic).
  if (text) {
    if (/ذبايح|ذبائح|خروف|خرفان/.test(text) && p.tags.includes("lamb_feast")) score += 25;
    if (/سينمائ|من البيت|زفة/.test(text) && p.tags.includes("cinematic_full")) score += 25;
    if (/فخم|فخامة|كلاسيك/.test(text) && p.tags.includes("luxury")) score += 15;
    if (/بسيط|عصري/.test(text) && p.tags.includes("simple")) score += 15;
  }

  // Capacity sanity for halls.
  if (p.capacity && guests > 0) {
    if (p.capacity >= guests) score += 12;
    else score -= 30;
  }

  // Mild preference for mid-tier pricing so extremes don't dominate.
  score += 6 - Math.abs(3 - p.level) * 2;
  return score;
};

export const rankedProviders = (
  category: ProviderCategory,
  dateKey: DemoDateKey,
  prefs: VisionPrefs,
  guests: number,
) =>
  MOCK_PROVIDERS.filter((p) => p.category === category && isAvailable(p, dateKey)).sort(
    (a, b) => matchScore(b, prefs, guests) - matchScore(a, prefs, guests),
  );

/** Nearest demo date on which the given category has availability. */
export const alternativeDateFor = (category: ProviderCategory): string | null => {
  const keys: DemoDateKey[] = ["a", "c", "b"];
  for (const k of keys) {
    if (MOCK_PROVIDERS.some((p) => p.category === category && isAvailable(p, k))) {
      return DEMO_DATES[k];
    }
  }
  return null;
};
