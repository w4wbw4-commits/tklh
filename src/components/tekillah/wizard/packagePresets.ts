// ---------------------------------------------------------------------------
// Ready-made package presets — a browsing layer on top of the same demo
// provider catalog used by the "اختر مزوديك" step. No new pricing data:
// every total is computed from MOCK_PROVIDERS so numbers always agree.
// ---------------------------------------------------------------------------

import pkgClassicImg from "@/assets/packages/pkg-classic-luxury.jpg";
import pkgHotelImg from "@/assets/packages/pkg-hotel.jpg";
import pkgModernImg from "@/assets/packages/pkg-modern.jpg";
import pkgFamilyImg from "@/assets/packages/pkg-family.jpg";
import pkgEconomyImg from "@/assets/packages/pkg-economy.jpg";
import pkgHeritageImg from "@/assets/packages/pkg-heritage.jpg";

import {
  MOCK_PROVIDERS,
  matchScore,
  providerTotal,
  isAvailable,
  type DemoDateKey,
  type Provider,
  type ProviderCategory,
  type VisionPrefs,
} from "./mockProviders";

export interface PackagePreset {
  key: string;
  name: string;
  name_en: string;
  tagline: string;
  tagline_en: string;
  image: string;
  /** One provider id per category. */
  members: Partial<Record<ProviderCategory, string>>;
}

export const PACKAGE_PRESETS: PackagePreset[] = [
  {
    key: "classic-luxury",
    name: "الكبيرة",
    name_en: "Classic Luxury",
    tagline: "لمن ما يبي يحسب حساب لشي",
    tagline_en: "For those who want luxury without limits",
    image: pkgClassicImg,
    members: {
      hall: "hall-lulua",
      catering: "cat-nokhba",
      photography: "photo-cinema",
      decor: "decor-atelier",
      band: "band-asayel",
      audio: "audio-saudipro",
      cars: "cars-royal",
    },
  },
  {
    key: "hotel-full",
    name: "الفندقية الشاملة",
    name_en: "All-Inclusive Hotel",
    tagline: "خدمة فندقية كاملة من أول ضيف لآخر لحظة",
    tagline_en: "Full hotel service from the first guest to the last moment",
    image: pkgHotelImg,
    members: {
      hall: "hall-hotel-riyadh",
      catering: "cat-5star",
      photography: "photo-platinum",
      decor: "decor-sham",
      band: "band-nojoom",
      audio: "audio-intl",
      cars: "cars-nokhba",
    },
  },
  {
    key: "modern-elegant",
    name: "الهادية",
    name_en: "Modern Elegant",
    tagline: "تنسيق بسيط ومريح",
    tagline_en: "Quiet elegance with a contemporary spirit",
    image: pkgModernImg,
    members: {
      hall: "hall-masa",
      catering: "cat-thawaqa",
      photography: "photo-mashhad",
      decor: "decor-sham",
      band: "band-lamsa",
      audio: "audio-saudipro",
      cars: "cars-limo",
    },
  },
  {
    key: "warm-family",
    name: "الدافئة العائلية",
    name_en: "Warm & Family",
    tagline: "ليلة قريبة من القلب بأجواء عائلية",
    tagline_en: "A close-to-the-heart night with a family feel",
    image: pkgFamilyImg,
    members: {
      hall: "hall-waha",
      catering: "cat-durra",
      photography: "photo-lamsa",
      decor: "decor-basic",
      band: "band-asayel",
      audio: "audio-ehtiraf",
      cars: "cars-nokhba",
    },
  },
  {
    key: "smart-economy",
    name: "الاقتصادية",
    name_en: "Smart Economy",
    tagline: "كل الأساسيات بأقل تكلفة",
    tagline_en: "All the essentials, smartly, at the lowest cost",
    image: pkgEconomyImg,
    members: {
      hall: "hall-yasmin",
      catering: "cat-asala",
      photography: "photo-lamsa",
      decor: "decor-basic",
      band: "band-asayel",
      audio: "audio-ehtiraf",
      cars: "cars-limo",
    },
  },
  {
    key: "authentic-heritage",
    name: "التراثية",
    name_en: "Authentic Heritage",
    tagline: "طابع نجدي بلمسة حديثة",
    tagline_en: "Authentic character with a modern soul",
    image: pkgHeritageImg,
    members: {
      hall: "hall-naseem",
      catering: "cat-thawaqa",
      photography: "photo-mashhad",
      decor: "decor-sham",
      band: "band-asayel",
      audio: "audio-ehtiraf",
      cars: "cars-nokhba",
    },
  },
];

const byId = (id: string): Provider | null =>
  MOCK_PROVIDERS.find((p) => p.id === id) ?? null;

export interface ResolvedMember {
  category: ProviderCategory;
  provider: Provider;
  total: number;
  available: boolean;
}

/**
 * Resolves a preset against the active categories, guest count and date.
 * Only categories the customer actually asked for are counted.
 */
export const resolvePreset = (
  preset: PackagePreset,
  activeCategories: ProviderCategory[],
  guests: number,
  dateKey: DemoDateKey,
): { members: ResolvedMember[]; total: number } => {
  const members: ResolvedMember[] = [];
  activeCategories.forEach((c) => {
    const id = preset.members[c];
    if (!id) return;
    const provider = byId(id);
    if (!provider) return;
    members.push({
      category: c,
      provider,
      total: providerTotal(provider, guests, dateKey),
      available: isAvailable(provider, dateKey),
    });
  });
  const total = members.filter((m) => m.available).reduce((s, m) => s + m.total, 0);
  return { members, total };
};

/** Average vision-match of a preset's members — drives the "best fit" badge. */
export const presetScore = (
  preset: PackagePreset,
  activeCategories: ProviderCategory[],
  prefs: VisionPrefs,
  guests: number,
): number => {
  const scores = activeCategories
    .map((c) => preset.members[c])
    .filter(Boolean)
    .map((id) => byId(id as string))
    .filter((p): p is Provider => !!p)
    .map((p) => matchScore(p, prefs, guests));
  if (!scores.length) return 0;
  return scores.reduce((s, v) => s + v, 0) / scores.length;
};
