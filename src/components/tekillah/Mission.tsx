import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  SketchIconCandle,
  SketchIconRings,
  SketchIconBouquet,
  SketchIconSparkle,
  SketchCornerOrnament,
} from "./SketchArt";
import { WaxSeal } from "./BrandMarks";


/**
 * Mission — "رسالتنا للمجتمع"
 * Closing emotional beat before the footer. Decorative sketch icons drift
 * in the corners while the content stays untouched in the center.
 */
export const Mission = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
  };

  return (
    <section
      id="mission"
      dir={isAr ? "rtl" : "ltr"}
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

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div {...reveal} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-primary backdrop-blur">
            {t("mission.kicker")}
          </span>

          {/* One-sentence mission, then the leaning signature line + CTA to
              the full About page (the long copy lives there now). */}
          <p
            className={`mt-6 text-2xl font-bold leading-[1.7] sm:text-3xl ${isAr ? "font-arabic" : "font-cinzel"}`}
            style={{ color: "hsl(var(--primary-deep))" }}
          >
            {t("mission.oneLine", { defaultValue: t("mission.tagline") })}
          </p>

          <div className="mt-5 flex justify-center">
            <WaxSeal size={44} />
          </div>

          <Link
            to="/about"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-bold text-bone transition-transform duration-300 hover:-translate-y-0.5"
            style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            {t("mission.cta")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

