// ---------------------------------------------------------------------------
// PackageShowcase — six ready-made packages with representative photography.
// Purely a browsing layer: picking a card pre-fills the manual provider
// selection below it, where every provider stays visible and swappable.
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Building2, UtensilsCrossed, Camera, Check } from "lucide-react";
import RiyalSymbol from "@/components/tekillah/RiyalSymbol";
import {
  PACKAGE_PRESETS,
  presetScore,
  resolvePreset,
  type PackagePreset,
} from "./packagePresets";
import type { DemoDateKey, ProviderCategory, VisionPrefs } from "./mockProviders";

interface Props {
  activeCategories: ProviderCategory[];
  guests: number;
  dateKey: DemoDateKey;
  prefs: VisionPrefs;
  selectedKey: string | null;
  onSelect: (preset: PackagePreset) => void;
}

const fmt = (n: number, isAr: boolean) => n.toLocaleString(isAr ? "ar-SA" : "en-US");

const HEAD_ICONS: Partial<Record<ProviderCategory, typeof Building2>> = {
  hall: Building2,
  catering: UtensilsCrossed,
  photography: Camera,
};

export const PackageShowcase = ({
  activeCategories,
  guests,
  dateKey,
  prefs,
  selectedKey,
  onSelect,
}: Props) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const cards = useMemo(() => {
    const list = PACKAGE_PRESETS.map((preset) => {
      const { members, total } = resolvePreset(preset, activeCategories, guests, dateKey);
      return {
        preset,
        members,
        total,
        score: presetScore(preset, activeCategories, prefs, guests),
      };
    });
    const best = list.reduce((a, b) => (b.score > a.score ? b : a), list[0]);
    return list
      .map((c) => ({ ...c, best: c.preset.key === best?.preset.key }))
      .sort((a, b) => Number(b.best) - Number(a.best));
  }, [activeCategories, guests, dateKey, prefs]);

  if (activeCategories.length === 0) return null;

  return (
    <section className="mt-6">
      <h4 className="font-arabic text-lg font-semibold text-foreground sm:text-xl">
        {isAr ? "الباقات المقترحة لك" : "Packages suggested for you"}
      </h4>
      <p className="mt-1.5 font-arabic text-sm text-foreground/70">
        {isAr
          ? "تركيبات جاهزة محسوبة من نفس المزودين — اختر واحدة وعدّل عليها كيف ما تبي."
          : "Ready-made combinations built from the same providers — pick one and tweak it freely."}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ preset, members, total, best }, idx) => {
          const heads = members.filter((m) => HEAD_ICONS[m.category]).slice(0, 3);
          const active = selectedKey === preset.key;
          return (
            <motion.article
              key={preset.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
              className={`flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors ${
                active || best ? "border-primary" : "border-primary/20 hover:border-primary/50"
              }`}
            >
              {/* Representative image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-primary/15 bg-muted">
                <img
                  src={preset.image}
                  alt={isAr ? preset.name : preset.name_en}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 end-2 rounded-full border border-border bg-card/90 px-2 py-0.5 font-arabic text-[10px] text-foreground/70">
                  {isAr ? "صورة تمثيلية" : "Representative image"}
                </span>
                {best && (
                  <span className="absolute top-2 start-2 rounded-full border border-primary/50 bg-card/95 px-2.5 py-1 font-arabic text-[11px] font-semibold text-primary">
                    {isAr ? "الأنسب لرؤيتك" : "Best fit for your vision"}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h5 className="font-display text-lg font-semibold text-foreground">
                  {isAr ? preset.name : preset.name_en}
                </h5>
                <p className="mt-1 font-arabic text-xs text-foreground/65">
                  {isAr ? preset.tagline : preset.tagline_en}
                </p>

                <ul className="mt-3 space-y-1.5">
                  {heads.map((m) => {
                    const Icon = HEAD_ICONS[m.category]!;
                    return (
                      <li key={m.category} className="flex items-start gap-2">
                        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.6} />
                        <span className="min-w-0 font-arabic text-[12px] text-foreground/80">
                          <span className="text-foreground/55">
                            {t(`wizard.services.${m.category}`, { defaultValue: m.category })}:
                          </span>{" "}
                          {isAr ? m.provider.name : m.provider.name_en}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="my-3 h-px w-full bg-primary/15" />

                <div className="mt-auto flex items-end justify-between gap-3">
                  <div>
                    <div className="font-arabic text-[10px] text-foreground/55">
                      {isAr ? "الإجمالي التقديري" : "Estimated total"}
                    </div>
                    <div className="flex items-center gap-1.5 font-arabic text-lg font-semibold text-primary">
                      {fmt(total, isAr)}
                      <RiyalSymbol className="text-[13px]" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelect(preset)}
                    className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 font-arabic text-[13px] font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary/40 text-foreground/85 hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {active
                      ? isAr ? "مختارة" : "Selected"
                      : isAr ? "اختر هذي الباقة" : "Choose this package"}
                    {!active && <Arrow className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};
