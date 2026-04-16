import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-tekillah.jpg";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t } = useTranslation();
  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={t("hero.imgAlt")}
          width={1536}
          height={1024}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/55 via-foreground/35 to-background" />
        <div className="absolute inset-0 bg-gradient-to-l from-primary-deep/40 via-transparent to-primary/20" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium tracking-wide text-foreground/80">
            {t("hero.tag")}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-arabic text-balance text-5xl font-bold leading-[1.1] text-background text-shadow-hero sm:text-6xl md:text-7xl lg:text-[88px]"
        >
          {t("hero.titleA")}
          <br />
          <span className="text-background text-shadow-hero">
            {t("hero.titleB")}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-balance text-base font-semibold text-background/95 text-shadow-soft sm:text-lg md:text-xl"
        >
          {t("hero.desc")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            asChild
            className="group h-14 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground shadow-luxury transition-all hover:bg-primary/90 hover:shadow-[0_25px_70px_-20px_hsl(var(--primary)/0.45)]"
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
            className="h-14 rounded-full px-6 text-base text-foreground/80 hover:bg-secondary"
          >
            <a href="#features">{t("hero.secondary")}</a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-4 sm:gap-8"
        >
          {[
            { value: t("hero.stat1Value"), label: t("hero.stat1Label") },
            { value: t("hero.stat2Value"), label: t("hero.stat2Label") },
            { value: t("hero.stat3Value"), label: t("hero.stat3Label") },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl border border-border/60 px-3 py-4">
              <div className="font-arabic text-2xl font-semibold text-primary sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
