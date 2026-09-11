// ---------------------------------------------------------------------------
// Tklh planning journey — shared data for the 4-step flow.
// Event types, per-type service categories, and budget bands.
// All numbers are written with Latin digits, phrased like the rest of the site.
// ---------------------------------------------------------------------------

export type EventTypeKey = "wedding" | "engagement" | "malka" | "conference" | "birthday" | "newborn" | "graduation" | "other";

export interface EventTypeDef {
  key: EventTypeKey;
  ar: string;
  en: string;
  /** Wine seal (#46232A) is reserved for the Malka stamp only. */
  wine?: boolean;
  dateMode: "single" | "range";
  dateHintAr: string;
  dateHintEn: string;
}

export const EVENT_TYPES: EventTypeDef[] = [
  {
    key: "wedding", ar: "زواج", en: "Wedding", dateMode: "single",
    dateHintAr: "ليلة العمر وحدة، اختر تاريخها", dateHintEn: "One night of a lifetime — pick its date",
  },
  {
    key: "engagement", ar: "خطوبة", en: "Engagement", dateMode: "single",
    dateHintAr: "اختر تاريخ خطوبتك", dateHintEn: "Pick your engagement date",
  },
  {
    key: "malka", ar: "ملكة", en: "Malka", wine: true, dateMode: "single",
    dateHintAr: "اختر تاريخ عقد الملكة", dateHintEn: "Pick your Malka date",
  },
  {
    key: "conference", ar: "مؤتمرات وفعاليات", en: "Conferences & events", dateMode: "range",
    dateHintAr: "اختر أيام الفعالية من - إلى", dateHintEn: "Pick your event days (from - to)",
  },
  {
    key: "birthday", ar: "يوم ميلاد", en: "Birthdays", dateMode: "single",
    dateHintAr: "اختر تاريخ الحفلة", dateHintEn: "Pick the party date",
  },
  {
    key: "newborn", ar: "استقبال مولود", en: "Newborn celebration", dateMode: "single",
    dateHintAr: "اختر تاريخ الاحتفال", dateHintEn: "Pick the celebration date",
  },
  {
    key: "graduation", ar: "حفلات تخرج", en: "Graduation party", dateMode: "single",
    dateHintAr: "اختر تاريخ حفل التخرج", dateHintEn: "Pick the graduation party date",
  },
  {
    key: "other", ar: "أخرى", en: "Other", dateMode: "single",
    dateHintAr: "اكتب نوع مناسبتك واختر تاريخها", dateHintEn: "Type your event and pick its date",
  },
];

export interface CategoryDef { key: string; ar: string; en: string; icon: string }

// icon = lucide-react export name, resolved in the step component.
export const CATEGORIES: Record<EventTypeKey, CategoryDef[]> = {
  wedding: [
    { key: "hall", ar: "قاعة", en: "Venue", icon: "Building2" },
    { key: "hospitality", ar: "ضيافة", en: "Hospitality", icon: "Coffee" },
    { key: "dinner", ar: "عشاء", en: "Dinner", icon: "UtensilsCrossed" },
    { key: "photography", ar: "تصوير", en: "Photography", icon: "Camera" },
    { key: "decor", ar: "تنسيق وديكور", en: "Styling & decor", icon: "Flower2" },
    { key: "band", ar: "فرقة", en: "Band", icon: "Drum" },
    { key: "audio", ar: "صوتيات", en: "Audio", icon: "Speaker" },
    { key: "cars", ar: "سيارات", en: "Cars", icon: "Car" },
  ],
  engagement: [
    { key: "hall", ar: "قاعة أو صالة", en: "Hall or lounge", icon: "Building2" },
    { key: "hospitality", ar: "ضيافة", en: "Hospitality", icon: "Coffee" },
    { key: "photography", ar: "تصوير", en: "Photography", icon: "Camera" },
    { key: "decor", ar: "تنسيق وديكور", en: "Styling & decor", icon: "Flower2" },
    { key: "audio", ar: "صوتيات", en: "Audio", icon: "Speaker" },
    { key: "cars", ar: "سيارات", en: "Cars", icon: "Car" },
  ],
  malka: [
    { key: "malka_venue", ar: "قاعة أو صالة منزلية", en: "Hall or home majlis", icon: "Home" },
    { key: "hospitality", ar: "ضيافة", en: "Hospitality", icon: "Coffee" },
    { key: "photography", ar: "تصوير", en: "Photography", icon: "Camera" },
    { key: "simple_decor", ar: "تنسيق بسيط", en: "Simple styling", icon: "Flower2" },
  ],
  conference: [
    { key: "valet", ar: "فاليه", en: "Valet", icon: "Car" },
    { key: "booths", ar: "تصميم وتصنيع بوثات", en: "Booth design & build", icon: "LayoutGrid" },
    { key: "stage", ar: "تجهيز مسرح وإضاءة", en: "Stage & lighting", icon: "Lightbulb" },
    { key: "screens", ar: "شاشات وصوتيات", en: "Screens & audio", icon: "MonitorPlay" },
    { key: "coffee", ar: "ضيافة وركن قهوة سعودية", en: "Hospitality & Saudi coffee corner", icon: "Coffee" },
    { key: "photography", ar: "تصوير وتوثيق", en: "Photography & coverage", icon: "Camera" },
    { key: "branding", ar: "هوية بصرية ومطبوعات", en: "Branding & print", icon: "Palette" },
    { key: "gifts", ar: "هدايا وتوزيعات", en: "Gifts & giveaways", icon: "Gift" },
  ],
  birthday: [
    { key: "balloons", ar: "بالونات وتنسيق حفلة", en: "Balloons & party styling", icon: "PartyPopper" },
    { key: "cake", ar: "كيك وحلويات", en: "Cake & sweets", icon: "Cake" },
    { key: "light_food", ar: "ضيافة خفيفة", en: "Light catering", icon: "Coffee" },
    { key: "photography", ar: "تصوير", en: "Photography", icon: "Camera" },
    { key: "entertainment", ar: "ترفيه وفعاليات", en: "Kids entertainment", icon: "Gamepad2" },
    { key: "lighting", ar: "ديكور وإضاءة", en: "Decor & lighting", icon: "Lightbulb" },
  ],
  newborn: [
    { key: "newborn_decor", ar: "ديكور استقبال مولود", en: "Welcome decor", icon: "Baby" },
    { key: "sweets", ar: "ضيافة وحلويات", en: "Hospitality & sweets", icon: "Cake" },
    { key: "photography", ar: "تصوير", en: "Photography", icon: "Camera" },
    { key: "balloons", ar: "بالونات وتنسيق", en: "Balloons & styling", icon: "PartyPopper" },
    { key: "gifts", ar: "هدايا ضيوف وتوزيعات", en: "Guest gifts & giveaways", icon: "Gift" },
  ],
  graduation: [
    { key: "grad_decor", ar: "تنسيق وديكور التخرج", en: "Graduation styling & decor", icon: "GraduationCap" },
    { key: "hospitality", ar: "ضيافة وحلويات", en: "Hospitality & sweets", icon: "Cake" },
    { key: "photography", ar: "تصوير", en: "Photography", icon: "Camera" },
    { key: "balloons", ar: "بالونات وتنسيق", en: "Balloons & styling", icon: "PartyPopper" },
    { key: "gifts", ar: "هدايا وتوزيعات", en: "Gifts & giveaways", icon: "Gift" },
  ],
  other: [
    { key: "hospitality", ar: "ضيافة", en: "Hospitality", icon: "Coffee" },
    { key: "photography", ar: "تصوير", en: "Photography", icon: "Camera" },
    { key: "decor", ar: "تنسيق وديكور", en: "Styling & decor", icon: "Flower2" },
    { key: "audio", ar: "صوتيات", en: "Audio", icon: "Speaker" },
    { key: "gifts", ar: "هدايا وتوزيعات", en: "Gifts & giveaways", icon: "Gift" },
  ],
};

export interface BudgetBand { key: string; ar: string; en: string }

export const BUDGET_BANDS: BudgetBand[] = [
  { key: "under_50", ar: "أقل من 50 ألف", en: "Under 50k" },
  { key: "50_75", ar: "من 50 إلى 75 ألف", en: "50k - 75k" },
  { key: "75_100", ar: "من 75 إلى 100 ألف", en: "75k - 100k" },
  { key: "100_150", ar: "من 100 إلى 150 ألف", en: "100k - 150k" },
  { key: "over_150", ar: "أكثر من 150 ألف", en: "More than 150k" },
  { key: "undecided", ar: "لسا ما حددت رقم", en: "Haven't decided yet" },
];

export const labelOf = (
  list: Array<{ key: string; ar: string; en: string }>,
  key: string,
  isAr: boolean,
) => {
  const found = list.find((x) => x.key === key);
  return found ? (isAr ? found.ar : found.en) : "";
};
