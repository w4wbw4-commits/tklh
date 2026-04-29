// ---------------------------------------------------------------------------
// Saudi places — preset regions, cities, and common districts for the
// vendor onboarding combobox. Lists are curated, not exhaustive — vendors can
// always type a custom value if their location isn't listed.
// ---------------------------------------------------------------------------

export interface PlaceOption {
  ar: string;
  en: string;
}

export const SAUDI_REGIONS: PlaceOption[] = [
  { ar: "منطقة الرياض", en: "Riyadh Region" },
  { ar: "منطقة مكة المكرمة", en: "Makkah Region" },
  { ar: "المنطقة الشرقية", en: "Eastern Region" },
  { ar: "منطقة المدينة المنورة", en: "Madinah Region" },
  { ar: "منطقة القصيم", en: "Qassim Region" },
  { ar: "منطقة عسير", en: "Asir Region" },
  { ar: "منطقة تبوك", en: "Tabuk Region" },
  { ar: "منطقة حائل", en: "Hail Region" },
  { ar: "منطقة جازان", en: "Jazan Region" },
  { ar: "منطقة نجران", en: "Najran Region" },
  { ar: "منطقة الباحة", en: "Al-Bahah Region" },
  { ar: "منطقة الجوف", en: "Al-Jouf Region" },
  { ar: "منطقة الحدود الشمالية", en: "Northern Borders Region" },
];

export const SAUDI_CITIES: PlaceOption[] = [
  { ar: "الرياض", en: "Riyadh" },
  { ar: "جدة", en: "Jeddah" },
  { ar: "مكة المكرمة", en: "Makkah" },
  { ar: "المدينة المنورة", en: "Madinah" },
  { ar: "الدمام", en: "Dammam" },
  { ar: "الخبر", en: "Khobar" },
  { ar: "الظهران", en: "Dhahran" },
  { ar: "الطائف", en: "Taif" },
  { ar: "بريدة", en: "Buraidah" },
  { ar: "تبوك", en: "Tabuk" },
  { ar: "خميس مشيط", en: "Khamis Mushait" },
  { ar: "أبها", en: "Abha" },
  { ar: "حائل", en: "Hail" },
  { ar: "نجران", en: "Najran" },
  { ar: "الجبيل", en: "Jubail" },
  { ar: "ينبع", en: "Yanbu" },
  { ar: "الأحساء", en: "Al Ahsa" },
  { ar: "القطيف", en: "Qatif" },
  { ar: "جازان", en: "Jazan" },
  { ar: "عرعر", en: "Arar" },
  { ar: "سكاكا", en: "Sakaka" },
  { ar: "الباحة", en: "Al-Bahah" },
  { ar: "عنيزة", en: "Unaizah" },
  { ar: "الخرج", en: "Al Kharj" },
];

// Districts per major city — covers the most popular event venues' areas.
export const SAUDI_DISTRICTS: Record<string, PlaceOption[]> = {
  "الرياض": [
    { ar: "حي العليا", en: "Al Olaya" },
    { ar: "حي السليمانية", en: "Al Sulaimaniyah" },
    { ar: "حي الملقا", en: "Al Malqa" },
    { ar: "حي النخيل", en: "Al Nakheel" },
    { ar: "حي الياسمين", en: "Al Yasmin" },
    { ar: "حي الورود", en: "Al Wurud" },
    { ar: "حي الروضة", en: "Al Rawdah" },
    { ar: "حي الربوة", en: "Al Rabwah" },
    { ar: "حي الملز", en: "Al Malaz" },
    { ar: "حي السفارات", en: "Diplomatic Quarter" },
    { ar: "حي حطين", en: "Hittin" },
    { ar: "حي العارض", en: "Al Aarid" },
    { ar: "حي الندى", en: "Al Nada" },
    { ar: "حي قرطبة", en: "Qurtubah" },
    { ar: "حي الازدهار", en: "Al Izdihar" },
    { ar: "حي الواحة", en: "Al Wahah" },
  ],
  "جدة": [
    { ar: "حي الشاطئ", en: "Al Shati" },
    { ar: "حي الروضة", en: "Al Rawdah" },
    { ar: "حي الزهراء", en: "Al Zahra" },
    { ar: "حي السلامة", en: "Al Salamah" },
    { ar: "حي الحمراء", en: "Al Hamra" },
    { ar: "حي الفيصلية", en: "Al Faisaliyah" },
    { ar: "حي البساتين", en: "Al Basateen" },
    { ar: "حي النعيم", en: "Al Naeem" },
    { ar: "حي الأندلس", en: "Al Andalus" },
    { ar: "حي المروة", en: "Al Marwah" },
    { ar: "حي النزهة", en: "Al Nuzhah" },
    { ar: "حي العزيزية", en: "Al Aziziyah" },
  ],
  "الدمام": [
    { ar: "حي الشاطئ", en: "Al Shati" },
    { ar: "حي الفيصلية", en: "Al Faisaliyah" },
    { ar: "حي النور", en: "Al Noor" },
    { ar: "حي الأمانة", en: "Al Amanah" },
    { ar: "حي الجلوية", en: "Al Jalawiyah" },
    { ar: "حي الرياض", en: "Al Riyadh" },
  ],
  "الخبر": [
    { ar: "حي الراكة", en: "Al Rakah" },
    { ar: "حي العقربية", en: "Al Aqrabiyah" },
    { ar: "حي الكورنيش", en: "Corniche" },
    { ar: "حي الحمراء", en: "Al Hamra" },
    { ar: "حي الثقبة", en: "Al Thuqbah" },
  ],
  "مكة المكرمة": [
    { ar: "حي العزيزية", en: "Al Aziziyah" },
    { ar: "حي الششة", en: "Al Shisha" },
    { ar: "حي الزاهر", en: "Al Zahir" },
    { ar: "حي النسيم", en: "Al Naseem" },
  ],
  "المدينة المنورة": [
    { ar: "حي قباء", en: "Quba" },
    { ar: "حي العنابس", en: "Al Anabis" },
    { ar: "حي العزيزية", en: "Al Aziziyah" },
    { ar: "حي الحرة الشرقية", en: "Eastern Harrah" },
  ],
  "الطائف": [
    { ar: "حي الشهداء", en: "Al Shuhada" },
    { ar: "حي الفيصلية", en: "Al Faisaliyah" },
    { ar: "حي الوشحاء", en: "Al Wishha" },
  ],
  "الأحساء": [
    { ar: "حي الهفوف", en: "Al Hofuf" },
    { ar: "حي المبرز", en: "Al Mubarraz" },
  ],
};

export const cityToRegion: Record<string, string> = {
  "الرياض": "منطقة الرياض",
  "الخرج": "منطقة الرياض",
  "جدة": "منطقة مكة المكرمة",
  "مكة المكرمة": "منطقة مكة المكرمة",
  "الطائف": "منطقة مكة المكرمة",
  "المدينة المنورة": "منطقة المدينة المنورة",
  "ينبع": "منطقة المدينة المنورة",
  "الدمام": "المنطقة الشرقية",
  "الخبر": "المنطقة الشرقية",
  "الظهران": "المنطقة الشرقية",
  "الجبيل": "المنطقة الشرقية",
  "الأحساء": "المنطقة الشرقية",
  "القطيف": "المنطقة الشرقية",
  "بريدة": "منطقة القصيم",
  "عنيزة": "منطقة القصيم",
  "تبوك": "منطقة تبوك",
  "أبها": "منطقة عسير",
  "خميس مشيط": "منطقة عسير",
  "حائل": "منطقة حائل",
  "نجران": "منطقة نجران",
  "جازان": "منطقة جازان",
  "الباحة": "منطقة الباحة",
  "سكاكا": "منطقة الجوف",
  "عرعر": "منطقة الحدود الشمالية",
};

// ---------------------------------------------------------------------------
// Popular services per vendor category — surfaced as clickable suggestion
// chips so partners can fill their service tags in seconds.
// ---------------------------------------------------------------------------
export const POPULAR_SERVICES: Record<string, PlaceOption[]> = {
  hall: [
    { ar: "إضاءة احترافية", en: "Professional lighting" },
    { ar: "بوفيه مفتوح", en: "Open buffet" },
    { ar: "نظام صوتي", en: "Sound system" },
    { ar: "كوشة عرايس", en: "Bridal stage" },
    { ar: "ذبائح", en: "Live cooking / lamb" },
    { ar: "منسق حفلات", en: "Event coordinator" },
    { ar: "واي فاي مجاني", en: "Free Wi-Fi" },
    { ar: "مواقف خاصة", en: "Private parking" },
    { ar: "خدمة ركن السيارات", en: "Valet parking" },
    { ar: "تكييف مركزي", en: "Central A/C" },
    { ar: "غرفة عروس", en: "Bridal suite" },
    { ar: "ديكور أزهار", en: "Floral decor" },
  ],
  catering: [
    { ar: "بوفيه مفتوح", en: "Open buffet" },
    { ar: "ضيافة قهوة عربية", en: "Arabic coffee service" },
    { ar: "ذبائح طازجة", en: "Fresh lamb" },
    { ar: "حلويات شرقية", en: "Oriental sweets" },
    { ar: "حلويات غربية", en: "Western desserts" },
    { ar: "محطة معجنات", en: "Pastry station" },
    { ar: "مشروبات ساخنة", en: "Hot drinks station" },
    { ar: "كيك مناسبات", en: "Custom event cake" },
    { ar: "خدمة جرسونات", en: "Waitstaff service" },
    { ar: "تنسيق طاولات", en: "Table setup" },
  ],
  photography: [
    { ar: "تصوير فوتوغرافي", en: "Photography" },
    { ar: "تصوير فيديو 4K", en: "4K video" },
    { ar: "تصوير سينمائي", en: "Cinematic film" },
    { ar: "تصوير درون", en: "Drone shots" },
    { ar: "ألبوم مطبوع", en: "Printed album" },
    { ar: "مونتاج لايف", en: "Same-day edit" },
    { ar: "فوتوبوث", en: "Photo booth" },
    { ar: "تصوير ٣٦٠", en: "360° video" },
    { ar: "بث مباشر", en: "Live streaming" },
  ],
  dj: [
    { ar: "DJ احترافي", en: "Professional DJ" },
    { ar: "نظام صوت كبير", en: "Large sound system" },
    { ar: "إضاءة متحركة", en: "Moving lights" },
    { ar: "ليزر شو", en: "Laser show" },
    { ar: "ساكس لايف", en: "Live saxophone" },
    { ar: "إنترو دخول", en: "Custom entrance intro" },
    { ar: "MC تقديم", en: "MC / host" },
    { ar: "مايك لاسلكي", en: "Wireless mic" },
  ],
  decor: [
    { ar: "تنسيق كوشة", en: "Stage styling" },
    { ar: "تنسيق مداخل", en: "Entrance styling" },
    { ar: "أزهار طبيعية", en: "Fresh flowers" },
    { ar: "أزهار صناعية فاخرة", en: "Premium silk flowers" },
    { ar: "إضاءة مزاجية", en: "Mood lighting" },
    { ar: "خلفية باسم العروسين", en: "Custom name backdrop" },
    { ar: "ممرات وسجاد", en: "Aisle runners" },
    { ar: "تنسيق طاولات", en: "Table centerpieces" },
    { ar: "أعمدة رومانية", en: "Roman columns" },
    { ar: "كراسي شيافاري", en: "Chiavari chairs" },
  ],
  cars: [
    { ar: "سيارة عروسين فارهة", en: "Luxury bridal car" },
    { ar: "ليموزين", en: "Limousine" },
    { ar: "رولزرويس", en: "Rolls-Royce" },
    { ar: "مرسيدس S-Class", en: "Mercedes S-Class" },
    { ar: "سائق خاص", en: "Private chauffeur" },
    { ar: "تنسيق زهور للسيارة", en: "Car floral decor" },
    { ar: "موكب مرافق", en: "Escort convoy" },
  ],
};

// Smart price presets by category and field — gives vendors realistic
// starting points instead of staring at an empty 0.
export const PRICE_PRESETS: Record<string, { weekday: number[]; weekend: number[]; deposit: number[] }> = {
  hall: {
    weekday: [8000, 15000, 25000, 40000, 60000],
    weekend: [12000, 20000, 35000, 55000, 80000],
    deposit: [2000, 5000, 10000, 15000],
  },
  catering: {
    weekday: [3000, 8000, 15000, 25000, 40000],
    weekend: [5000, 12000, 20000, 35000, 50000],
    deposit: [1000, 2500, 5000, 10000],
  },
  photography: {
    weekday: [2000, 4000, 7000, 12000, 20000],
    weekend: [3000, 6000, 10000, 15000, 25000],
    deposit: [500, 1500, 3000, 5000],
  },
  dj: {
    weekday: [1500, 3000, 5000, 8000, 12000],
    weekend: [2500, 5000, 8000, 12000, 18000],
    deposit: [500, 1500, 3000],
  },
  decor: {
    weekday: [3000, 7000, 15000, 25000, 40000],
    weekend: [5000, 10000, 20000, 35000, 55000],
    deposit: [1000, 3000, 5000, 10000],
  },
  cars: {
    weekday: [1500, 3000, 5000, 8000, 12000],
    weekend: [2000, 4000, 7000, 12000, 18000],
    deposit: [500, 1500, 3000],
  },
};
