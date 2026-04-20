export type BudgetMode = "packages" | "smart" | null;

export type ServiceKey = "hall" | "catering" | "photography" | "dj" | "decor" | "cars";

export interface AllocationItem {
  key: ServiceKey;
  label: string;
  pct: number;            // suggested default percentage of total
  perGuestMin: number;    // realistic minimum SAR per guest (or fixed if perGuestMin*guests < base)
  flatMin: number;        // baseline floor regardless of guests
}

export const allocationCatalog: AllocationItem[] = [
  { key: "hall",        label: "القاعة",        pct: 35, perGuestMin: 60,  flatMin: 15000 },
  { key: "catering",    label: "الضيافة",       pct: 25, perGuestMin: 90,  flatMin: 8000  },
  { key: "photography", label: "التصوير",       pct: 12, perGuestMin: 0,   flatMin: 6000  },
  { key: "decor",       label: "التنسيق",       pct: 15, perGuestMin: 25,  flatMin: 7000  },
  { key: "dj",          label: "DJ والصوت",     pct: 8,  perGuestMin: 0,   flatMin: 4000  },
  { key: "cars",        label: "السيارات",      pct: 5,  perGuestMin: 0,   flatMin: 2500  },
];

export const realisticMinimum = (item: AllocationItem, guests: number) =>
  Math.max(item.flatMin, item.perGuestMin * guests);

// ---------------------------------------------------------------------------
// Budget tiers — used by StepBudget banner and StepVendors smart matching.
// Thresholds are total event budget in SAR.
// ---------------------------------------------------------------------------
export type BudgetTier = "economy" | "standard" | "luxury";

export const BUDGET_TIER_THRESHOLDS = {
  economyMax: 60000,
  standardMax: 150000,
} as const;

export const tierForBudget = (total: number): BudgetTier => {
  if (total < BUDGET_TIER_THRESHOLDS.economyMax) return "economy";
  if (total <= BUDGET_TIER_THRESHOLDS.standardMax) return "standard";
  return "luxury";
};

export const visionChips = [
  "أجواء شتوية دافئة",
  "فخامة ملكية كلاسيكية",
  "حفل بسيط وعصري",
  "طابع تراثي سعودي",
  "إضاءة رومانسية ناعمة",
  "ألوان ذهبية وأبيض",
  "ديكور أخضر طبيعي",
  "ليلة بوهيمية أنيقة",
];
