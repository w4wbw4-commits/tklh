import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-tekillah-luxury.jpg";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t } = useTranslation();
  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background: blurred luxury still life — palette of beige, off-white, olive */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={t("hero.imgAlt")}
          width={1920}
          height={1280}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full scale-110 object-cover"
          style={{ filter: "blur(28px) saturate(1.05)" }}
        />
        {/* Warm cream wash to maintain readability without darkening */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/45 to-background" />
        {/* Subtle olive vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_hsl(var(--primary-deep)/0.18)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        {/* Tag chip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-5 py-2 shadow-soft backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
          <span className="text-xs font-medium tracking-[0.18em] text-primary-deep">
            {t("hero.tag")}
          </span>
        </motion.div>

        {/* Brand wordmark — تكلة in deep olive Kufi */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-balance text-[88px] font-semibold leading-[0.95] text-primary-deep text-shadow-hero sm:text-[120px] md:text-[150px] lg:text-[180px]"
          style={{ color: "hsl(var(--primary-deep))" }}
        >
          {t("hero.titleA")}
        </motion.h1>

        {/* Hairline divider — small olive mark */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 mb-6 flex items-center gap-3"
        >
          <span className="h-px w-10 bg-primary/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
          <span className="h-px w-10 bg-primary/40" />
        </motion.div>

        {/* Tagline — elegant Naskh-style serif */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-tagline max-w-2xl text-balance text-xl leading-[1.7] text-primary-deep/80 text-shadow-soft sm:text-2xl md:text-[28px]"
        >
          {t("hero.titleB")}
        </motion.p>

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
