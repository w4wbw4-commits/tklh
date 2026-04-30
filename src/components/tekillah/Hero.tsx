import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatedCounter } from "./AnimatedCounter";
import {
  SketchDivider,
  SketchGinkgo,
  SketchCandelabra,
  SketchBranch,
  SketchBanquet,
} from "./SketchArt";

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

      {/* Decorative line-art — corners */}
      <SketchPalm
        className="pointer-events-none absolute -bottom-6 left-2 hidden h-[280px] w-auto opacity-70 md:block rtl:left-auto rtl:right-2"
      />
      <SketchFloral
        className="pointer-events-none absolute top-24 right-4 hidden h-[180px] w-auto opacity-60 md:block rtl:right-auto rtl:left-4"
      />
      <SketchFloral
        className="pointer-events-none absolute bottom-24 right-1/3 hidden h-[140px] w-auto -scale-x-100 opacity-50 lg:block"
      />

      {/* Center-stage arch sketch — sits behind the wordmark */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto flex justify-center">
        <SketchArch className="h-[520px] w-auto max-w-[90vw] opacity-90" />
      </div>

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
