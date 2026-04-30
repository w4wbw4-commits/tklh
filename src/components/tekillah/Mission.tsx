import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  SketchIconCandle,
  SketchIconRings,
  SketchIconBouquet,
  SketchIconSparkle,
  SketchCornerOrnament,
} from "./SketchArt";

/**
 * Mission — "رسالتنا للمجتمع"
 * Closing emotional beat before the footer. Decorative sketch icons drift
 * in the corners while the content stays untouched in the center.
 */
export const Mission = () => {
  const { t } = useTranslation();
  const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
  };

  return (
    <section
      id="mission"
      dir="rtl"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* Layered warm gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at top right, hsl(var(--gold) / 0.18), transparent 55%), radial-gradient(ellipse at bottom left, hsl(var(--primary) / 0.12), transparent 55%), linear-gradient(180deg, hsl(var(--background)), hsl(var(--secondary) / 0.6))",
        }}
      />

      {/* === Sketch decorations — corners only, never cross the text === */}
      <SketchCornerOrnament className="pointer-events-none absolute top-6 left-2 hidden h-[120px] w-[120px] opacity-55 md:block" />
      <SketchCornerOrnament
        className="pointer-events-none absolute top-6 right-2 hidden h-[120px] w-[120px] opacity-55 md:block"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Floating sketch icons — gentle drift */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-24 left-[8%] hidden lg:block"
      >
        <SketchIconCandle className="h-14 w-10 opacity-70" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute bottom-32 right-[10%] hidden lg:block"
      >
        <SketchIconBouquet className="h-14 w-14 opacity-70" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="pointer-events-none absolute top-1/3 right-[6%] hidden lg:block"
      >
        <SketchIconSparkle className="h-9 w-9 opacity-75" />
      </motion.div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div {...reveal} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold/60 shadow-luxury">
            <SketchIconRings className="h-10 w-14" />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-primary backdrop-blur">
            {t("mission.kicker")}
          </span>
          <h2
            className="mt-5 font-wordmark text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
            style={{ color: "hsl(var(--primary-deep))" }}
          >
            {t("mission.title")}
          </h2>
        </motion.div>

        <motion.div
          {...reveal}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 rounded-3xl border border-primary/15 bg-background/70 p-8 shadow-card backdrop-blur md:p-12"
        >
          <p className="font-arabic text-xl leading-[2] text-foreground/85 sm:text-2xl">
            {t("mission.p1")}
            <br />
            {t("mission.p2Prefix")}
            <span className="font-bold text-primary-deep">{t("mission.p2Highlight")}</span>
            {t("mission.p2Suffix")}
          </p>

          <div className="mx-auto my-8 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />

          <p className="font-arabic text-xl leading-[2] text-foreground/85 sm:text-2xl">
            {t("mission.p3Prefix")}
            <span className="font-bold text-primary-deep">{t("mission.p3Highlight")}</span>
            {t("mission.p3Suffix")}
          </p>

          <p
            className="mt-8 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl"
            style={{
              backgroundImage:
                "linear-gradient(90deg, hsl(var(--primary-deep)), hsl(var(--gold)))",
            }}
          >
            {t("mission.tagline")}
          </p>
        </motion.div>

        <motion.div
          {...reveal}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href="#wizard"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-base font-bold text-primary-foreground shadow-luxury transition-all hover:-translate-y-1 hover:bg-primary-deep"
          >
            {t("mission.cta")}
            <ArrowLeft className="h-5 w-5 ltr:rotate-180" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
