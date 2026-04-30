import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatedCounter } from "./AnimatedCounter";
import {
  SketchDivider,
  SketchCurtain,
  SketchEucalyptus,
  SketchLotus,
} from "./SketchArt";
import heroBanquetLeft from "@/assets/hero-banquet-left.jpeg";

// ---------------------------------------------------------------------------
// Hero — Off-white sketch experience.
// No photography. A self-drawing wedding arch sits behind the wordmark, with
// palm + floral line art floating in the corners. Olive ink + gold accents
// over a premium beige canvas. RTL-friendly.
// ---------------------------------------------------------------------------
export const Hero = () => {
  const { t } = useTranslation();
  return (
    <section
      id="home"
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "hsl(var(--cream))" }}
    >
      {/* Soft warm wash + paper grain */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, hsl(var(--surface)) 0%, hsl(var(--cream)) 55%, hsl(var(--background)) 100%)",
          }}
        />
        {/* faint paper texture */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--primary-deep)) 0.5px, transparent 0.5px)",
            backgroundSize: "3px 3px",
          }}
        />
        {/* Bottom fade into next section */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* === Reference watercolor on the LEFT — banquet table + foliage ===
          Width-capped so it never crosses into the centered text column.
          Soft cream wash + multiply blend + fade-to-cream gradient mask
          merges it with the sketch palette. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[26vw] max-w-[300px] overflow-hidden lg:block xl:w-[28vw] xl:max-w-[360px]"
      >
        <img
          src={heroBanquetLeft}
          alt=""
          className="h-full w-full object-cover object-right opacity-55 mix-blend-multiply"
          style={{
            // Tone the photo toward the brand palette (olive/gold/brown)
            filter: "sepia(0.25) saturate(0.75) hue-rotate(15deg) contrast(0.95) brightness(1.05)",
            // Fade the right edge into cream so the image dissolves before the text
            WebkitMaskImage:
              "linear-gradient(to right, hsl(0 0% 0% / 1) 0%, hsl(0 0% 0% / 0.95) 55%, hsl(0 0% 0% / 0.4) 85%, hsl(0 0% 0% / 0) 100%)",
            maskImage:
              "linear-gradient(to right, hsl(0 0% 0% / 1) 0%, hsl(0 0% 0% / 0.95) 55%, hsl(0 0% 0% / 0.4) 85%, hsl(0 0% 0% / 0) 100%)",
          }}
        />
        {/* Cream wash on top to harmonize with the hero palette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, hsl(var(--cream) / 0.35) 0%, hsl(var(--cream) / 0.55) 60%, hsl(var(--cream) / 1) 100%)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* === Side framing — slim, edge-only, never crosses content === */}
      {/* Top-right: soft eucalyptus arching down (sketch echo of the photo) */}
      <SketchEucalyptus
        className="pointer-events-none absolute top-4 right-0 hidden h-[120px] w-[230px] opacity-55 md:block lg:h-[140px] lg:w-[260px]"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Bottom-right: lotus pads (mirrors the photo's lotus on the left) */}
      <SketchLotus
        className="pointer-events-none absolute bottom-3 right-3 hidden h-[100px] w-[140px] opacity-45 md:block"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Slim drape on the right edge — balances the photo on the left */}
      <SketchCurtain
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[44px] opacity-55 md:block lg:w-[56px]"
        style={{ transform: "scaleX(-1)" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        {/* Tag chip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-deep/25 bg-cream/80 px-5 py-2 backdrop-blur-sm"
        >
          <Star className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} fill="currentColor" />
          <span className="text-xs font-bold tracking-[0.18em] text-primary-deep">
            {t("hero.tag")}
          </span>
          <Sparkles className="h-3 w-3 text-gold" strokeWidth={1.5} />
        </motion.div>

        {/* Brand wordmark — تِكله, olive on cream, no glass plate */}
        <motion.h1
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-wordmark text-balance text-center text-[80px] font-black leading-[1] sm:text-[110px] md:text-[140px] lg:text-[170px]"
          lang="ar"
          dir="rtl"
          style={{
            color: "hsl(var(--primary-deep))",
            WebkitTextFillColor: "hsl(var(--primary-deep))",
            letterSpacing: "-0.02em",
            textShadow: "0 1px 0 hsl(var(--cream)), 0 2px 18px hsl(var(--cream) / 0.9)",
          }}
        >
          {t("hero.titleA")}
        </motion.h1>

        {/* Hairline gold divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 mb-6"
        >
          <SketchDivider />
        </motion.div>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-tagline max-w-3xl text-balance text-center text-xl font-bold leading-[1.6] sm:text-2xl md:text-3xl"
          lang="ar"
          dir="rtl"
          style={{ color: "hsl(var(--primary-deep))" }}
        >
          {t("hero.titleB")}
        </motion.p>

        {/* Supporting micro description */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-xl text-balance text-sm leading-relaxed sm:text-base"
          style={{ color: "hsl(var(--primary-deep) / 0.78)" }}
        >
          {t("hero.desc")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            asChild
            className="group h-14 rounded-full bg-gold px-10 text-base font-bold text-primary-deep shadow-[0_18px_45px_-12px_hsl(var(--gold)/0.5)] transition-all hover:scale-[1.03] hover:bg-gold/90"
          >
            <a href="#wizard">
              {t("hero.cta")}
              <ArrowLeft className="ms-2 h-4 w-4 text-primary-deep transition-transform group-hover:-translate-x-1 rtl:rotate-0 ltr:rotate-180" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            asChild
            className="h-14 rounded-full border-2 border-primary-deep/30 bg-transparent px-8 text-base font-bold text-primary-deep hover:bg-primary-deep/5"
          >
            <a href="#about">{t("hero.secondary")}</a>
          </Button>
        </motion.div>

        {/* Stats — minimal floating rows */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-3 sm:gap-6"
        >
          {[
            { value: 250, suffix: t("hero.stat1Suffix", { defaultValue: "+" }), label: t("hero.stat1Label"), decimal: false },
            { value: 1200, suffix: t("hero.stat2Suffix", { defaultValue: "+" }), label: t("hero.stat2Label"), decimal: false },
            { value: 49, suffix: t("hero.stat3Suffix", { defaultValue: "★" }), label: t("hero.stat3Label"), decimal: true },
          ].map((s, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-primary-deep/15 bg-cream/70 px-3 py-4 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-gold/60 hover:bg-cream"
            >
              <div className="font-display text-2xl font-bold text-primary-deep sm:text-3xl">
                {s.decimal ? (
                  <>
                    <AnimatedCounter value={4} duration={1400} />
                    <span>.</span>
                    <AnimatedCounter value={9} duration={1700} />
                    <span className="ms-1 text-gold">{s.suffix}</span>
                  </>
                ) : (
                  <>
                    <AnimatedCounter value={s.value} />
                    <span className="text-gold">{s.suffix}</span>
                  </>
                )}
              </div>
              <div className="mt-1 text-[11px] tracking-wide text-primary-deep/60 sm:text-xs">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
