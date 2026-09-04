import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import wordmarkAsset from "/tklh-logo.png";





// ---------------------------------------------------------------------------
// Hero — Premium redesign.
// Brand wordmark at top → massive editorial headline with Kashida →
// clean subhead → 5 modern bento cards (Groom in black/gold Bisht, Bride
// in pristine white, plus Hall/Photographer/Planner) → CTAs.
// Background sketches stay as a 15% opacity watermark.
// ---------------------------------------------------------------------------



// ---- Variants ---------------------------------------------------------------
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

export const Hero = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const words = t("hero.rotating", { returnObjects: true }) as string[];
  const [wordIndex, setWordIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setWordIndex((n) => (n + 1) % words.length), isMobile ? 1800 : 2400);
    return () => clearInterval(id);
  }, [words.length, isMobile]);
  const word = words[wordIndex % words.length];

  return (
    <section
      id="home"
      dir={isAr ? "rtl" : "ltr"}
      lang={i18n.language}
      className="relative w-full overflow-hidden scroll-smooth"
      style={{ backgroundColor: "hsl(var(--cream))" }}
    >
      {/* === Foreground — one calm, centered editorial column === */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex min-h-[78svh] max-w-4xl flex-col items-center justify-center px-5 pb-14 pt-24 text-center sm:min-h-[80vh] sm:px-8 sm:pb-16 sm:pt-20"
      >
        {/* Wordmark */}
        <motion.img
          variants={rise}
          src={wordmarkAsset}
          alt={isAr ? "TKLH تِكله" : "TKLH Tklh"}
          className="mt-6 h-20 w-auto select-none sm:h-24 md:h-24 lg:h-28"
          draggable={false}
        />




        {/* Rotating line — "تِكله لـ …" */}
        <motion.div
          variants={rise}
          className="mt-5 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 sm:gap-x-3"
        >
          <span
            className="font-display shrink-0 text-lg font-black tracking-tight sm:text-xl md:text-2xl"
            style={{ color: "#163726" }}
          >
            {t("hero.forPrefix")}
          </span>

          <span className="relative inline-flex flex-col items-center pb-1">
            <span className="relative flex h-[2.35rem] items-center overflow-hidden sm:h-[2.9rem] md:h-[3.4rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={word}
                  initial={{ y: "45%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-45%", opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display block whitespace-nowrap text-2xl font-black leading-none tracking-tight sm:text-3xl md:text-4xl"
                  style={{ color: "#163726" }}
                >
                  {word}
                </motion.span>
              </AnimatePresence>
            </span>

            {/* hairline underline */}
            <span
              className="mt-1 block h-px w-full"
              style={{ background: "hsl(var(--green) / 0.35)" }}
              aria-hidden
            />
          </span>

        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={rise}
          className="font-display mt-7 font-black tracking-[-0.005em]"
          style={{
            color: "#163726",
            fontFeatureSettings: '"kern","liga","calt","dlig"',
            fontSize: "clamp(1rem, 2.75vw, 2.125rem)",
            lineHeight: 1.3,
            maxWidth: "20ch",
            marginInline: "auto",
            textWrap: "balance",
            paddingBlock: "0.08em",
          }}
        >
          {t("hero.slogan")}
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={rise}
          className="font-tagline mt-5 text-[15px] sm:text-base"
          style={{
            color: "hsl(var(--brown))",
            lineHeight: 1.8,
            maxWidth: "44ch",
            marginInline: "auto",
            textWrap: "pretty",
          }}
        >
          {t("hero.subheadPrefix")}{" "}
          <span className="font-bold" style={{ color: "hsl(var(--green))" }}>{t("hero.brand")}</span>{" "}
          {t("hero.subheadSuffix")}
        </motion.p>


        {/* === CTA === */}
        <motion.div variants={rise} className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/planner"
            className="group inline-flex w-1/2 items-center justify-center gap-2.5 rounded-full px-8 py-4 text-sm font-black transition-colors duration-500 sm:w-auto sm:text-base"
            style={{
              backgroundColor: "hsl(var(--green))",
              color: "hsl(var(--cream))",
              boxShadow: "0 2px 0 0 hsl(var(--gold) / 0.55)",
            }}
          >
            <span>{t("hero.ctaTitle")}</span>
            <Arrow className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
          </a>
        </motion.div>

      </motion.div>
    </section>
  );
};

