import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-tekillah-celebration.jpg";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t } = useTranslation();
  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background: celebration scene at 80% clarity (only ~20% blur) */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={t("hero.imgAlt")}
          width={1920}
          height={1280}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full scale-[1.02] object-cover"
          style={{ filter: "blur(1.5px) saturate(1.08)" }}
        />
        {/* Lighter cream wash — lets the celebration details show through */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/10 to-background/95" />
        {/* Centre olive vignette for depth + edge focus */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_55%,_hsl(var(--primary-deep)/0.22)_100%)]" />
        {/* Smooth fade-out into next section */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        {/* Tag chip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/80 px-5 py-2 shadow-soft backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
          <span className="text-xs font-medium tracking-[0.18em] text-primary-deep">
            {t("hero.tag")}
          </span>
        </motion.div>

        {/* Glass scrim — soft off-white blur, low opacity, feathered edges */}
        <div className="relative mx-auto inline-flex flex-col items-center px-10 py-8 sm:px-16 sm:py-10 text-center">
          {/* Frosted off-white card with feathered radial mask — slightly stronger to keep wordmark crisp on clearer bg */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-[3rem] border border-primary/15"
            style={{
              background:
                "radial-gradient(ellipse at center, hsl(60 14% 98% / 0.72) 0%, hsl(60 14% 98% / 0.45) 60%, hsl(60 14% 98% / 0) 100%)",
              backdropFilter: "blur(18px) saturate(1.08)",
              WebkitBackdropFilter: "blur(18px) saturate(1.08)",
              boxShadow: "0 30px 80px -40px hsl(82 45% 18% / 0.22)",
            }}
          />

          {/* Brand wordmark — تِكِلّه in bold geometric Kufic, blocky and impactful */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-wordmark text-balance text-center text-[88px] font-bold leading-[1.3] text-primary-deep sm:text-[124px] md:text-[156px] lg:text-[188px]"
            lang="ar"
            dir="rtl"
            style={{
              color: "hsl(var(--primary-deep))",
              WebkitTextFillColor: "hsl(var(--primary-deep))",
              fontWeight: 700,
              letterSpacing: "0",
              // Stronger single-tone halo for legibility on the clearer background
              textShadow:
                "0 2px 30px hsl(60 14% 98% / 0.95), 0 1px 4px hsl(60 14% 98% / 0.8), 0 0 14px hsl(60 14% 98% / 0.6)",
            }}
          >
            {t("hero.titleA")}
          </motion.h1>

          {/* Hairline divider — olive accent */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 mb-7 flex items-center gap-3"
          >
            <span className="h-px w-12 bg-primary/50" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
            <span className="h-px w-12 bg-primary/50" />
          </motion.div>

          {/* Tagline — Amiri serif, balanced spacing under the wordmark */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-tagline max-w-2xl text-balance text-center text-xl leading-[1.8] text-primary-deep sm:text-2xl md:text-[28px]"
            style={{
              textShadow:
                "0 1px 14px hsl(60 14% 98% / 0.95), 0 1px 3px hsl(60 14% 98% / 0.8)",
            }}
          >
            {t("hero.titleB")}
          </motion.p>
        </div>

        {/* Supporting description */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 max-w-xl text-balance text-sm font-normal leading-relaxed text-foreground/70 sm:text-base"
        >
          {t("hero.desc")}
        </motion.p>

        {/* CTAs — olive primary, ghost secondary */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            asChild
            className="group h-14 rounded-full bg-primary px-10 text-base font-medium text-primary-foreground shadow-luxury transition-all hover:bg-primary-deep hover:shadow-[0_25px_70px_-20px_hsl(var(--primary)/0.45)]"
          >
            <a href="#wizard">
              {t("hero.cta")}
              <ArrowLeft className="ms-2 h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:rotate-0 ltr:rotate-180" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            asChild
            className="h-14 rounded-full border border-primary/25 bg-background/40 px-8 text-base text-primary-deep backdrop-blur-md hover:bg-secondary/60"
          >
            <a href="#features">{t("hero.secondary")}</a>
          </Button>
        </motion.div>

        {/* Stats — minimal, beige cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 grid w-full max-w-3xl grid-cols-3 gap-3 sm:gap-6"
        >
          {[
            { value: t("hero.stat1Value"), label: t("hero.stat1Label") },
            { value: t("hero.stat2Value"), label: t("hero.stat2Label") },
            { value: t("hero.stat3Value"), label: t("hero.stat3Label") },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-primary/15 bg-background/65 px-3 py-4 backdrop-blur-md shadow-card"
            >
              <div className="font-display text-2xl font-semibold text-primary-deep sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-[11px] tracking-wide text-foreground/60 sm:text-xs">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
