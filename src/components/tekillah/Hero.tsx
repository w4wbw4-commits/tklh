import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { WaxSeal, ZariRule, BRAND_EASE } from "./BrandMarks";
import wordmarkAsset from "@/assets/tklh-logo-transparent.png.asset.json";

// ---------------------------------------------------------------------------
// Hero — Design v1 (identity file, p.29).
// Forest-green stage → wordmark → sage headline → one row of six sector
// cards, each in its own sector colour with a small wax seal → one pill CTA.
// No sketches, no scattered pattern, no signature squiggle.
// ---------------------------------------------------------------------------

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: BRAND_EASE } },
};

// The six official sectors. Colours come from CSS tokens only.
const SECTORS = [
  { key: "graduation", token: "graduation" },
  { key: "engagement", token: "engagement" },
  { key: "wedding", token: "wedding" },
  { key: "hospitality", token: "hospitality" },
  { key: "kids", token: "kids" },
  { key: "events", token: "events" },
] as const;

// Large single chair watermark — one mark, not a pattern.
const ChairWatermark = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden
    viewBox="0 0 100 100"
    className={`pointer-events-none absolute ${className}`}
    fill="none"
    stroke="hsl(var(--green-light))"
    strokeWidth={1.1}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M32 22 Q50 10 68 22 L68 46 Q50 52 32 46 Z" />
    <path d="M28 52 H72 L70 61 H30 Z" />
    <path d="M34 61 V84 M66 61 V84" />
    <path d="M28 46 V55 M72 46 V55" />
  </svg>
);

export const Hero = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const reduce = useReducedMotion();

  return (
    <section
      id="home"
      dir={isAr ? "rtl" : "ltr"}
      lang={i18n.language}
      className="relative w-full overflow-hidden bg-green"
    >
      {/* soft warm depth, kept extremely quiet */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(var(--green-light) / 0.16), transparent 62%)",
        }}
      />
      <ChairWatermark className="left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 opacity-[0.06]" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 pt-32 pb-14 text-center sm:px-8 sm:pt-36"
      >
        {/* Wordmark */}
        <motion.img
          variants={rise}
          src={wordmarkAsset.url}
          alt={isAr ? "تِكله TKLH" : "TKLH"}
          draggable={false}
          className="h-24 w-auto select-none sm:h-32 md:h-36"
        />

        {/* Headline — sage, two lines, no rule underneath */}
        <motion.h1
          variants={rise}
          className={`mt-7 max-w-3xl text-balance text-2xl font-bold leading-[1.5] text-green-light sm:text-3xl md:text-4xl ${isAr ? "font-arabic" : "font-cinzel"}`}
        >
          {t("hero.slogan")}
        </motion.h1>

        <motion.p
          variants={rise}
          className={`mt-4 max-w-xl text-balance text-sm font-light leading-[1.9] text-bone/70 sm:text-base ${isAr ? "font-arabic" : ""}`}
        >
          {t("hero.subheadSuffix")}
        </motion.p>

        {/* Sector cards */}
        <div className="mt-10 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {SECTORS.map((s, i) => {
            const dark = `hsl(var(--sector-${s.token}))`;
            const soft = `hsl(var(--sector-${s.token}-soft))`;
            return (
              <motion.div key={s.key} variants={rise} className="h-full">
                <Link
                  to={`/planner?sector=${s.key}`}
                  className="group relative flex h-full flex-col items-center justify-between gap-3 overflow-hidden rounded-[28px] p-4 text-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-green hover:-translate-y-1"
                  style={{
                    background: soft,
                    border: `1px solid ${dark}22`,
                    boxShadow: "var(--shadow-card)",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <span className="transition-opacity duration-300 opacity-60 group-hover:opacity-100">
                    <WaxSeal color={dark} size={38} />
                  </span>
                  <span
                    className={`text-[13px] font-semibold leading-snug sm:text-sm ${isAr ? "font-arabic" : ""}`}
                    style={{ color: dark }}
                  >
                    {t(`hero.sectors.${s.key}`)}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-4 bottom-0 h-[2px] origin-center scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                    style={{ background: dark, opacity: 0.5, transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Single pill CTA */}
        <motion.div variants={rise} className="mt-10">
          <Link
            to="/planner"
            className={`group inline-flex items-center gap-2 rounded-full bg-green-light px-7 py-3.5 text-sm font-semibold text-green transition-all duration-300 hover:brightness-105 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-green sm:text-base ${isAr ? "font-arabic" : ""}`}
            style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "var(--shadow-soft)" }}
          >
            {t("hero.cta")}
            {isAr ? (
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            ) : (
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </Link>
        </motion.div>
      </motion.div>

      {/* Ivory footnote strip closes the hero — the one zari boundary line */}
      <div className="relative z-10">
        <ZariRule color="hsl(var(--brass))" />
        <motion.div
          initial={reduce ? undefined : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ duration: 0.5, ease: BRAND_EASE, delay: 0.35 }}
          className="bg-bone px-5 py-4"
        >
          <p className={`text-center text-[13px] font-light tracking-wide text-green/80 sm:text-sm ${isAr ? "font-arabic" : ""}`}>
            {t("hero.footnote")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
