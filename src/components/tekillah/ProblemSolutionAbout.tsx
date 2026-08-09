// ---------------------------------------------------------------------------
// ProblemSolutionAbout — SpeedSection only (About section removed).
// Fully bilingual via react-i18next (see `speed.*` keys in locales).
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Zap, Calculator, Filter, CalendarCheck, Gem, Timer,
  ListChecks, CheckCircle2, Sparkles,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { AnimatedCounter } from "./AnimatedCounter";
import { ArabicPattern } from "./ArabicPattern";
import { WaxSeal } from "./WaxSeal";
import { ImageSlot } from "./ImageSlot";

const TILE_ICONS = [Calculator, Filter, CalendarCheck, Gem] as const;

// ============================================================================
// Speed Comparison + 4 Value Tiles
// ============================================================================
const SpeedSection = () => {
  const { t } = useTranslation();
  const tradPoints = t("speed.traditional.points", { returnObjects: true }) as string[];
  const tekPoints = t("speed.tekillah.points", { returnObjects: true }) as string[];
  const tiles = t("speed.tiles", { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <section
      id="speed"
      aria-label={t("speed.ariaLabel")}
      className="relative overflow-hidden bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <ArabicPattern opacity={0.035} />

      <div className="relative mx-auto max-w-4xl">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7CAA1]/50 bg-[#163726] px-3 py-1 text-xs font-bold text-[#A7CAA1] backdrop-blur">
              <Timer className="h-3 w-3 text-[#A7CAA1]" strokeWidth={2} />
              {t("speed.badge")}
            </span>
            <h2 className="mt-3 font-arabic text-2xl font-black leading-[1.5] text-green md:text-3xl">
              {t("speed.title1")}{" "}
              <span className="inline-block bg-gradient-to-l from-green to-gold bg-clip-text pb-1 leading-[1.5] text-transparent">
                {t("speed.title2")}
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          {/* Legacy */}
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.05] p-3 shadow-card sm:p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.06] to-transparent" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background/40 px-2.5 py-0.5 text-[10px] font-bold text-foreground/60">
                  <ListChecks className="h-3 w-3" />
                  {t("speed.traditional.chip")}
                </div>
                <div className="mt-3 font-arabic text-xl font-black leading-[1.4] text-foreground/70 sm:text-3xl md:text-4xl">
                  {t("speed.traditional.value")}
                </div>
                <p className="mt-1 font-arabic text-xs text-foreground/55">
                  {t("speed.traditional.desc")}
                </p>
                {/* The legacy path crawls forward, then stalls — it never arrives. */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "38%" }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 3.4, ease: "linear" }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        "repeating-linear-gradient(90deg, hsl(var(--foreground) / 0.3) 0 8px, transparent 8px 14px)",
                    }}
                  />
                </div>
                <ul className="mt-4 space-y-1.5 font-arabic text-xs text-foreground/65">
                  {tradPoints.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* Tikkilah */}
          <Reveal delay={0.12}>
            <div className="group relative h-full overflow-hidden rounded-2xl border-2 border-gold/50 bg-cream p-3 shadow-deep sm:p-5">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-green/15 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold text-green">
                  <Zap className="h-3 w-3 text-gold" strokeWidth={2.5} />
                  {t("speed.tekillah.chip")}
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-arabic text-xl font-black leading-[1.35] text-green sm:text-3xl md:text-4xl">
                    <AnimatedCounter value={5} />
                  </span>
                  <span className="font-arabic text-lg font-bold text-gold">{t("speed.tekillah.unit")}</span>
                </div>
                <p className="mt-1 font-arabic text-xs font-bold text-green/80">
                  {t("speed.tekillah.desc")}
                </p>
                {/* Tklh's path completes fast and lands with a stamped seal. */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-green/10">
                    <motion.div
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                      className="h-full rounded-full bg-gradient-to-l from-green via-gold to-gold shadow-[0_0_14px_hsl(var(--gold)/0.6)]"
                    />
                  </div>
                  <motion.span
                    initial={{ scale: 1.9, opacity: 0, rotate: -16 }}
                    whileInView={{ scale: [1.9, 0.9, 1], opacity: [0, 1, 1], rotate: [-16, -4, -7] }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.55, delay: 1.0, times: [0, 0.6, 1], ease: [0.2, 0.9, 0.2, 1] }}
                    className="shrink-0"
                  >
                    <WaxSeal category="brand" size={26} interactive={false} title={t("seal.stamped")} />
                  </motion.span>
                </div>
                <ul className="mt-4 space-y-1.5 font-arabic text-xs text-foreground/80">
                  {tekPoints.map((item, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-gold" strokeWidth={2.5} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Reserved comparison imagery */}
        <Reveal delay={0.16}>
          <div className="mt-6">
            <ImageSlot ratio="21/9" />
          </div>
        </Reveal>

        {/* Cascade connector */}
        <Reveal delay={0.2}>
          <div className="relative mx-auto mt-8 flex flex-col items-center">
            <span className="h-8 w-px bg-gradient-to-b from-transparent via-gold/40 to-gold" />
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-cream px-3 py-1 text-[10px] font-bold text-green shadow-soft sm:text-xs">
              <Sparkles className="h-3 w-3 text-gold" strokeWidth={2} />
              {t("speed.connector")}
            </span>
          </div>
        </Reveal>

        {/* 4 creative value tiles */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
          {tiles.map((tile, i) => {
            const Icon = TILE_ICONS[i] ?? Calculator;
            const fromRight = i % 2 === 0;
            return (
              <Reveal key={i} delay={0.05 + i * 0.08}>
                <motion.div
                  initial={{ opacity: 0, x: fromRight ? 16 : -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="group relative flex flex-col items-start gap-2 overflow-hidden rounded-xl border border-gold/20 bg-cream/70 p-2.5 shadow-card backdrop-blur-md transition-all duration-500 hover:border-gold/55 hover:bg-cream hover:shadow-[0_16px_40px_-16px_hsl(var(--gold)/0.45)] sm:flex-row sm:items-start sm:gap-3 sm:p-3.5"
                >
                  <span className="absolute left-2 top-2 font-wordmark text-[9px] font-black text-gold/60 sm:left-3 sm:top-3 sm:text-[10px]">
                    ٠{i + 1}
                  </span>

                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                  <motion.span
                    whileHover={{ rotate: -6, scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 240, damping: 14 }}
                    className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gold/35 bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-soft sm:h-9 sm:w-9"
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.8} />
                  </motion.span>

                  <div className="relative min-w-0 flex-1">
                    <h3 className="font-arabic text-[11px] font-black text-green sm:text-sm md:text-base">
                      {tile.title}
                    </h3>
                    <p className="mt-0.5 font-arabic text-[10px] leading-[1.65] text-foreground/70 sm:mt-1 sm:text-xs sm:leading-[1.7]">
                      {tile.desc}
                    </p>
                    <div className="mt-1.5 h-0.5 w-6 rounded-full bg-gradient-to-l from-green to-gold transition-all duration-500 group-hover:w-10 sm:mt-2 sm:w-8 group-hover:sm:w-14" />
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const ProblemSolutionAbout = () => <SpeedSection />;
