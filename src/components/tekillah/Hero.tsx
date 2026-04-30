import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Star } from "lucide-react";
import heroImage from "@/assets/hero-tekillah-celebration.jpg";
import floralSketch from "@/assets/floral-sketch.png";
import { useTranslation } from "react-i18next";
import { AnimatedCounter } from "./AnimatedCounter";

// ---------------------------------------------------------------------------
// Hero — Minimalist, floating text on a blurred celebration backdrop with a
// deep-green overlay. No glassmorphism container — text "floats" with subtle
// shadows so the cinematic background remains the hero's primary atmosphere.
// All colors via semantic tokens (--primary-deep / --gold).
// ---------------------------------------------------------------------------
export const Hero = () => {
  const { t } = useTranslation();
  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background: softly blurred celebration scene + lighter cream overlay for an airy feel */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={t("hero.imgAlt")}
          width={1920}
          height={1280}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full scale-[1.05] object-cover"
          style={{ filter: "blur(18px) saturate(1.05) brightness(1.05)" }}
        />
        {/* Soft cream wash so the scene reads as ambience, not subject */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--cream) / 0.55) 0%, hsl(var(--cream) / 0.35) 45%, hsl(var(--primary-deep) / 0.25) 100%)",
          }}
        />
        {/* Decorative floral sketch — corner accent, not a full background */}
        <img
          src={floralSketch}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -left-10 hidden w-[42%] max-w-[560px] opacity-[0.28] mix-blend-multiply md:block rtl:left-auto rtl:-right-10"
        />
        <img
          src={floralSketch}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-16 hidden w-[38%] max-w-[480px] -scale-x-100 rotate-180 opacity-[0.22] mix-blend-multiply md:block rtl:right-auto rtl:-left-16 rtl:scale-x-100"
        />
        {/* Subtle gold grain for warmth */}
        <div className="absolute inset-0 bg-najdi-pattern-dark opacity-[0.12] mix-blend-overlay" />
        {/* Smooth fade-out into next section */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        {/* Tag chip — gold ring on translucent dark */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-gold/60 bg-primary-deep/40 px-5 py-2 backdrop-blur-md"
        >
          <Star className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} fill="currentColor" />
          <span className="text-xs font-bold tracking-[0.18em] text-gold-soft">
            {t("hero.tag")}
          </span>
          <Sparkles className="h-3 w-3 text-gold" strokeWidth={1.5} />
        </motion.div>

        {/* Brand wordmark — تِكله in deep olive green inside a frosted glass plate */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative inline-flex items-center justify-center rounded-[2rem] border border-cream/50 px-7 py-3 sm:rounded-[2.75rem] sm:px-12 sm:py-5"
          style={{
            background:
              "linear-gradient(135deg, hsl(0 0% 100% / 0.45) 0%, hsl(0 0% 100% / 0.22) 100%)",
            backdropFilter: "blur(18px) saturate(1.1)",
            WebkitBackdropFilter: "blur(18px) saturate(1.1)",
            boxShadow:
              "0 22px 60px -25px hsl(var(--primary-deep) / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.4)",
          }}
        >
          <h1
            className="font-wordmark text-balance text-center text-[80px] font-black leading-[1] sm:text-[110px] md:text-[140px] lg:text-[170px]"
            lang="ar"
            dir="rtl"
            style={{
              color: "hsl(var(--primary-deep))",
              WebkitTextFillColor: "hsl(var(--primary-deep))",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 10px hsl(0 0% 100% / 0.4)",
            }}
          >
            {t("hero.titleA")}
          </h1>
        </motion.div>

        {/* Hairline gold divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 mb-6 flex items-center gap-3"
        >
          <span className="h-px w-20 bg-gradient-to-r from-transparent to-gold" />
          <Star className="h-3 w-3 text-gold" fill="currentColor" />
          <span className="h-px w-20 bg-gradient-to-l from-transparent to-gold" />
        </motion.div>

        {/* Sub-headline — leading tagline under the logo */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-tagline max-w-3xl text-balance text-center text-2xl font-bold leading-[1.6] text-gold-soft sm:text-3xl md:text-4xl"
          lang="ar"
          dir="rtl"
          style={{
            wordSpacing: "0.08em",
            textShadow:
              "0 2px 18px hsl(var(--primary-deep) / 0.9), 0 1px 4px hsl(var(--primary-deep) / 0.8)",
          }}
        >
          {t("hero.titleB")}
        </motion.p>

        {/* Supporting micro description */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-xl text-balance text-sm leading-relaxed text-cream/80 sm:text-base"
          style={{ textShadow: "0 1px 10px hsl(var(--primary-deep) / 0.8)" }}
        >
          {t("hero.desc")}
        </motion.p>

        {/* CTAs — Primary Gold + Secondary Outline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            asChild
            className="group h-14 rounded-full bg-gold px-10 text-base font-bold text-primary-deep shadow-[0_18px_45px_-12px_hsl(var(--gold)/0.65)] transition-all hover:scale-[1.03] hover:bg-gold/90 hover:shadow-[0_25px_70px_-15px_hsl(var(--gold)/0.8)]"
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
            className="h-14 rounded-full border-2 border-gold/70 bg-transparent px-8 text-base font-bold text-gold-soft backdrop-blur-sm hover:bg-gold/15 hover:text-gold"
          >
            <a href="#about">{t("hero.secondary")}</a>
          </Button>
        </motion.div>

        {/* Stats — minimal floating rows */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 grid w-full max-w-3xl grid-cols-3 gap-3 sm:gap-6"
        >
          {[
            { value: 250, suffix: t("hero.stat1Suffix", { defaultValue: "+" }), label: t("hero.stat1Label"), decimal: false },
            { value: 1200, suffix: t("hero.stat2Suffix", { defaultValue: "+" }), label: t("hero.stat2Label"), decimal: false },
            { value: 49, suffix: t("hero.stat3Suffix", { defaultValue: "★" }), label: t("hero.stat3Label"), decimal: true },
          ].map((s, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-gold/25 bg-primary-deep/30 px-3 py-4 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-gold/60 hover:bg-primary-deep/45"
            >
              <div className="font-display text-2xl font-bold text-cream sm:text-3xl">
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
              <div className="mt-1 text-[11px] tracking-wide text-cream/70 sm:text-xs">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
