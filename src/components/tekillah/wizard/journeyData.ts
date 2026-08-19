// ---------------------------------------------------------------------------
// Tklh planning journey — shared data for the 4-step flow.
// Event types, per-type service categories, and budget bands.
// All numbers are written with Latin digits, phrased like the rest of the site.
// ---------------------------------------------------------------------------

export type EventTypeKey = "wedding" | "malka" | "conference" | "birthday" | "newborn";

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
    key: "wedding", ar: "الزواج", en: "Wedding", dateMode: "single",
    dateHintAr: "ليلة العمر وحدة، اختر تاريخها", dateHintEn: "One night of a lifetime — pick its date",
  },
  {
    key: "malka", ar: "الملكة", en: "Malka", wine: true, dateMode: "single",
    dateHintAr: "اختر تاريخ عقد الملكة", dateHintEn: "Pick your Malka date",
  },
  {
    key: "conference", ar: "المؤتمرات والفعاليات", en: "Conferences & events", dateMode: "range",
    dateHintAr: "اختر أيام الفعالية من - إلى", dateHintEn: "Pick your event days (from - to)",
  },
  {
    key: "birthday", ar: "أعياد الميلاد", en: "Birthdays", dateMode: "single",
    dateHintAr: "اختر تاريخ الحفلة", dateHintEn: "Pick the party date",
  },
  {
    key: "newborn", ar: "احتفال المولود", en: "Newborn celebration", dateMode: "single",
    dateHintAr: "اختر تاريخ الاحتفال", dateHintEn: "Pick the celebration date",
  },
];

export interface CategoryDef { key: string; ar: string; en: string; icon: string }

// icon = lucide-react export name, resolved in the step component.
export const CATEGORIES: Record<EventTypeKey, CategoryDef[]> = {
  wedding: [
    { key: "hall", ar: "القاعة", en: "Venue", icon: "Building2" },
    { key: "hospitality", ar: "الضيافة", en: "Hospitality", icon: "Coffee" },
    { key: "dinner", ar: "العشاء", en: "Dinner", icon: "UtensilsCrossed" },
    { key: "photography", ar: "التصوير", en: "Photography", icon: "Camera" },
    { key: "decor", ar: "التنسيق والديكور", en: "Styling & decor", icon: "Flower2" },
    { key: "band", ar: "الفرقة", en: "Band", icon: "Drum" },
    { key: "audio", ar: "الصوتيات", en: "Audio", icon: "Speaker" },
    { key: "cars", ar: "السيارات", en: "Cars", icon: "Car" },
  ],
  malka: [
    { key: "malka_venue", ar: "القاعة أو الصالة المنزلية", en: "Hall or home majlis", icon: "Home" },
    { key: "hospitality", ar: "الضيافة", en: "Hospitality", icon: "Coffee" },
    { key: "photography", ar: "التصوير", en: "Photography", icon: "Camera" },
    { key: "simple_decor", ar: "التنسيق البسيط", en: "Simple styling", icon: "Flower2" },
  ],
  conference: [
    { key: "valet", ar: "الفاليه", en: "Valet", icon: "Car" },
    { key: "booths", ar: "تصميم وتصنيع البوثات", en: "Booth design & build", icon: "LayoutGrid" },
    { key: "stage", ar: "تجهيز المسرح والإضاءة", en: "Stage & lighting", icon: "Lightbulb" },
    { key: "screens", ar: "الشاشات والصوتيات", en: "Screens & audio", icon: "MonitorPlay" },
    { key: "coffee", ar: "الضيافة وركن القهوة السعودية", en: "Hospitality & Saudi coffee corner", icon: "Coffee" },
    { key: "photography", ar: "التصوير والتوثيق", en: "Photography & coverage", icon: "Camera" },
    { key: "branding", ar: "الهوية البصرية والمطبوعات", en: "Branding & print", icon: "Palette" },
    { key: "gifts", ar: "الهدايا والتوزيعات", en: "Gifts & giveaways", icon: "Gift" },
  ],
  birthday: [
    { key: "balloons", ar: "البالونات وتنسيق الحفلة", en: "Balloons & party styling", icon: "PartyPopper" },
    { key: "cake", ar: "الكيك والحلويات", en: "Cake & sweets", icon: "Cake" },
    { key: "light_food", ar: "الضيافة الخفيفة", en: "Light catering", icon: "Coffee" },
    { key: "photography", ar: "التصوير", en: "Photography", icon: "Camera" },
    { key: "entertainment", ar: "الترفيه والفعاليات", en: "Kids entertainment", icon: "Gamepad2" },
    { key: "lighting", ar: "الديكور والإضاءة", en: "Decor & lighting", icon: "Lightbulb" },
  ],
  newborn: [
    { key: "newborn_decor", ar: "ديكور استقبال المولود", en: "Welcome decor", icon: "Baby" },
    { key: "sweets", ar: "الضيافة والحلويات", en: "Hospitality & sweets", icon: "Cake" },
    { key: "photography", ar: "التصوير", en: "Photography", icon: "Camera" },
    { key: "balloons", ar: "البالونات والتنسيق", en: "Balloons & styling", icon: "PartyPopper" },
    { key: "gifts", ar: "هدايا الضيوف والتوزيعات", en: "Guest gifts & giveaways", icon: "Gift" },
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
