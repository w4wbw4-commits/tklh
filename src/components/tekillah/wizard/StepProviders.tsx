import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Check, CalendarClock, ChevronDown, Wand2, Coins, Crown, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import RiyalSymbol from "@/components/tekillah/RiyalSymbol";
import { PackageShowcase } from "./PackageShowcase";
import { resolvePreset, type PackagePreset } from "./packagePresets";
import {
  MOCK_PROVIDERS,
  PROVIDER_CATEGORIES,
  VENUE_TYPES,
  alternativeDateFor,
  demoDateKey,
  matchScore,
  priceOn,
  providerTotal,
  rankedProviders,
  venueTypeLabel,
  type Provider,
  type ProviderCategory,
  type VenueType,
  type VisionPrefs,
} from "./mockProviders";


export interface ProviderPick {
  category: ProviderCategory;
  id: string;
  name: string;
  name_en: string;
  /** Final total for this category (per-guest already multiplied). */
  total: number;
}

interface Props {
  /** Categories chosen in the services step. */
  categories: string[];
  guests: number;
  date: string;
  setDate: (d: string) => void;
  prefs: VisionPrefs;
  picks: Record<string, ProviderPick>;
  setPick: (category: ProviderCategory, pick: ProviderPick | null) => void;
}

const fmt = (n: number, isAr: boolean) => n.toLocaleString(isAr ? "ar-SA" : "en-US");

export const StepProviders = ({ categories, guests, date, setDate, prefs, picks, setPick }: Props) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const dateKey = demoDateKey(date);

  const activeCategories = useMemo(
    () => PROVIDER_CATEGORIES.filter((c) => categories.includes(c)),
    [categories],
  );

  const [open, setOpen] = useState<string[]>(() => activeCategories.slice(0, 1));
  const toggleOpen = (c: string) =>
    setOpen((o) => (o.includes(c) ? o.filter((x) => x !== c) : [...o, c]));

  const [venueFilter, setVenueFilter] = useState<VenueType | "all">("all");

  const listFor = (c: ProviderCategory) => {
    const list = rankedProviders(c, dateKey, prefs, guests);
    if (c === "hall" && venueFilter !== "all") {
      return list.filter((p) => p.venueType === venueFilter);
    }
    return list;
  };

  const total = useMemo(
    () => Object.values(picks).reduce((s, p) => s + p.total, 0),
    [picks],
  );

  const applyShortcut = (mode: "best" | "cheap" | "luxe") => {
    activeCategories.forEach((c) => {
      const list = rankedProviders(c, dateKey, prefs, guests);
      if (!list.length) return;
      let chosen: Provider = list[0];
      if (mode === "cheap") {
        chosen = [...list].sort(
          (a, b) => providerTotal(a, guests, dateKey) - providerTotal(b, guests, dateKey),
        )[0];
      } else if (mode === "luxe") {
        chosen = [...list].sort((a, b) => b.level - a.level)[0];
      }
      setPick(c, {
        category: c,
        id: chosen.id,
        name: chosen.name,
        name_en: chosen.name_en,
        total: providerTotal(chosen, guests, dateKey),
      });
    });
  };

  // --- Ready-made packages layer -----------------------------------------
  const manualRef = useRef<HTMLDivElement>(null);
  const [presetKey, setPresetKey] = useState<string | null>(null);

  const applyPreset = (preset: PackagePreset) => {
    const { members } = resolvePreset(preset, activeCategories, guests, dateKey);
    activeCategories.forEach((c) => setPick(c, null));
    members
      .filter((m) => m.available)
      .forEach((m) =>
        setPick(m.category, {
          category: m.category,
          id: m.provider.id,
          name: m.provider.name,
          name_en: m.provider.name_en,
          total: m.total,
        }),
      );
    setPresetKey(preset.key);
    setOpen(activeCategories.slice(0, 1));
    requestAnimationFrame(() => {
      const el = manualRef.current;
      if (!el) return;
      const target = window.scrollY + el.getBoundingClientRect().top - 110;
      window.scrollTo({ top: target, behavior: "smooth" });
    });
  };


  return (
    <motion.div
      key="step-providers"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-4 sm:p-10"
    >
      {/* Sticky live total */}
      <div className="sticky top-16 z-20 -mx-4 mb-5 border-b border-primary/15 bg-card/95 px-4 py-3 backdrop-blur sm:-mx-10 sm:px-10">
        <div className="flex items-center justify-between gap-3">
          <span className="font-arabic text-xs font-medium text-foreground/60">
            {isAr ? "الإجمالي الحالي" : "Current total"}
          </span>
          <motion.span
            key={total}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-1.5 font-arabic text-xl font-semibold text-primary sm:text-2xl"
          >
            {fmt(total, isAr)}
            <RiyalSymbol className="text-base" />
          </motion.span>
        </div>
      </div>

      <PackageShowcase
        activeCategories={activeCategories}
        guests={guests}
        dateKey={dateKey}
        prefs={prefs}
        selectedKey={presetKey}
        onSelect={applyPreset}
      />

      <div ref={manualRef} className="mt-10 scroll-mt-28">
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <ArrowDown className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.7} />
          <span className="font-arabic text-[13px] font-medium text-foreground/85">
            {isAr ? "أو خصص باقتك يدويًا من هنا" : "Or build your package manually below"}
          </span>
        </div>
      </div>

      <h3 className="font-arabic text-2xl font-semibold text-foreground">
        {isAr ? "اختر مزوديك" : "Choose your providers"}
      </h3>
      <p className="mt-2 text-sm text-foreground/70">
        {isAr
          ? "كل مزود متاح بتاريخك يظهر لك — مرتّب بحيث الأنسب لرؤيتك أولًا."
          : "Every provider available on your date is shown — sorted so the best fit for your vision comes first."}
      </p>


      {/* Quick shortcuts */}
      <div className="mt-5 flex flex-wrap gap-2">
        {([
          { mode: "best" as const, icon: Wand2, ar: "اختر لي الأنسب تلقائيًا", en: "Auto-pick best fit" },
          { mode: "cheap" as const, icon: Coins, ar: "الأقرب للاقتصادي", en: "Most economical" },
          { mode: "luxe" as const, icon: Crown, ar: "الأفخم بالكامل", en: "Most luxurious" },
        ]).map((s) => (
          <button
            key={s.mode}
            type="button"
            onClick={() => applyShortcut(s.mode)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-primary/30 px-4 py-2 font-arabic text-[13px] text-foreground/85 transition-colors hover:border-primary hover:bg-primary/5"
          >
            <s.icon className="h-4 w-4 text-primary" strokeWidth={1.6} />
            {isAr ? s.ar : s.en}
          </button>
        ))}
      </div>

      {/* Category accordions */}
      <div className="mt-6 space-y-3">
        {activeCategories.map((c) => {
          const list = listFor(c);
          const allBooked = rankedProviders(c, dateKey, prefs, guests).length === 0;
          const isOpen = open.includes(c);
          const picked = picks[c];
          const alt = allBooked ? alternativeDateFor(c) : null;

          return (
            <div key={c} className="overflow-hidden rounded-2xl border border-primary/20 bg-card">
              <button
                type="button"
                onClick={() => toggleOpen(c)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-start"
              >
                <div className="min-w-0">
                  <div className="font-arabic text-base font-semibold text-foreground">
                    {t(`wizard.services.${c}`, { defaultValue: c })}
                  </div>
                  <div className="mt-0.5 truncate font-arabic text-xs text-foreground/60">
                    {picked
                      ? `${isAr ? picked.name : picked.name_en} — ${fmt(picked.total, isAr)}`
                      : isAr
                      ? `${list.length} مزود متاح`
                      : `${list.length} available`}
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden border-t border-primary/15"
                  >
                    <div className="space-y-3 p-4">
                      {/* Venue type filter */}
                      {c === "hall" && !allBooked && (
                        <div className="flex flex-wrap gap-2">
                          {(["all", ...VENUE_TYPES] as Array<VenueType | "all">).map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setVenueFilter(v)}
                              className={`min-h-[36px] rounded-full border px-3 py-1.5 font-arabic text-xs transition-colors ${
                                venueFilter === v
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-primary/25 text-foreground/75 hover:border-primary/60"
                              }`}
                            >
                              {v === "all" ? (isAr ? "الكل" : "All") : venueTypeLabel(v, isAr)}
                            </button>
                          ))}
                        </div>
                      )}

                      {allBooked ? (
                        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                          <p className="font-arabic text-sm text-foreground/85">
                            {isAr
                              ? `لا مزودين متاحين لـ${t(`wizard.services.${c}`)} بتاريخك`
                              : `No providers available for ${t(`wizard.services.${c}`)} on your date`}
                            {alt ? ` — ${isAr ? "جرّب" : "try"} ${alt}` : ""}
                          </p>
                          {alt && (
                            <Button
                              size="sm"
                              onClick={() => setDate(alt)}
                              className="mt-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <CalendarClock className="me-2 h-4 w-4" />
                              {isAr ? "تبديل التاريخ" : "Switch date"}
                            </Button>
                          )}
                        </div>
                      ) : list.length === 0 ? (
                        <p className="font-arabic text-sm text-foreground/70">
                          {isAr ? "لا نتائج لهذا الفلتر." : "No results for this filter."}
                        </p>
                      ) : (
                        list.map((p, i) => {
                          const active = picked?.id === p.id;
                          const unit = priceOn(p, dateKey);
                          const totalFor = providerTotal(p, guests, dateKey);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() =>
                                setPick(
                                  c,
                                  active
                                    ? null
                                    : {
                                        category: c,
                                        id: p.id,
                                        name: p.name,
                                        name_en: p.name_en,
                                        total: totalFor,
                                      },
                                )
                              }
                              className={`flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-start transition-colors ${
                                active
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="min-w-0">
                                {i === 0 && venueFilter === "all" && (
                                  <span className="mb-1.5 inline-block rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-arabic text-[10px] font-semibold text-primary">
                                    {isAr ? "الأنسب لك" : "Best fit for you"}
                                  </span>
                                )}
                                <div className="font-arabic text-[15px] font-semibold text-foreground">
                                  {isAr ? p.name : p.name_en}
                                </div>
                                <div className="mt-0.5 font-arabic text-xs text-foreground/65">
                                  {isAr ? p.style : p.style_en}
                                </div>
                                <div className="mt-2 font-arabic text-[13px] font-medium text-primary">
                                  {p.perGuest ? (
                                    <>
                                      {fmt(unit, isAr)} <RiyalSymbol className="text-[11px]" />{" "}
                                      {isAr ? "للفرد" : "per guest"} · {isAr ? "الإجمالي" : "total"}{" "}
                                      {fmt(totalFor, isAr)}
                                    </>
                                  ) : (
                                    <>
                                      {fmt(totalFor, isAr)} <RiyalSymbol className="text-[11px]" />
                                    </>
                                  )}
                                </div>
                                <div className="mt-2 inline-block rounded-full border border-border px-2 py-0.5 font-arabic text-[10px] text-foreground/50">
                                  {isAr
                                    ? "بيانات تجريبية — تُستبدل بمزودين حقيقيين"
                                    : "Demo data — to be replaced by real providers"}
                                </div>
                              </div>
                              <span
                                className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                                  active ? "border-primary bg-primary" : "border-primary/40"
                                }`}
                              >
                                {active && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {activeCategories.length === 0 && (
        <p className="mt-6 font-arabic text-sm text-foreground/70">
          {isAr ? "ارجع لخطوة الخدمات واختر ما تحتاجه." : "Go back and pick the services you need."}
        </p>
      )}
    </motion.div>
  );
};

/** Exposed for the confirm step summary. */
export const providerById = (id: string) => MOCK_PROVIDERS.find((p) => p.id === id) ?? null;
export const scoreOf = matchScore;
