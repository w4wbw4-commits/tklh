// ---------------------------------------------------------------------------
// HowItWorks — three short horizontal cards replacing the long
// "6 weeks vs 5 minutes" comparison. Each card carries a corner seal and a
// single-side zari edge. Fully bilingual (see `how.*` keys in locales).
// ---------------------------------------------------------------------------

import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CornerSeal, ZariEdge, SignatureLine, BRAND_EASE } from "./BrandMarks";

const STEPS = ["choose", "compare", "book"] as const;

export const HowItWorks = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const reduce = useReducedMotion();

  return (
    <section
      id="how"
      dir={isAr ? "rtl" : "ltr"}
      aria-label={t("how.aria", { defaultValue: isAr ? "كيف تعمل تِكله" : "How TKLH works" })}
      className="relative bg-background px-5 py-14 sm:px-8 sm:py-16"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <h2 className={`text-2xl font-black text-green sm:text-3xl ${isAr ? "font-arabic" : "font-cinzel"}`}>
            {t("how.title", { defaultValue: isAr ? "ثلاث خطوات فقط" : "Just three steps" })}
          </h2>
          <SignatureLine className="mt-3" width={150} />
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {STEPS.map((key, i) => (
            <motion.article
              key={key}
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: BRAND_EASE }}
              className="relative overflow-hidden rounded-2xl border border-[hsl(var(--green)/0.12)] bg-bone p-5 shadow-card"
            >
              <ZariEdge side={isAr ? "end" : "start"} />
              <CornerSeal corner="end-top" color="hsl(var(--brass))" />
              <span className="text-[11px] font-black tracking-[0.2em] text-brass">
                {isAr ? `٠${i + 1}` : `0${i + 1}`}
              </span>
              <h3 className={`mt-2 text-base font-black text-green ${isAr ? "font-arabic" : ""}`}>
                {t(`how.steps.${key}.title`)}
              </h3>
              <p className={`mt-1.5 text-[13px] leading-[1.8] text-foreground/70 ${isAr ? "font-arabic" : ""}`}>
                {t(`how.steps.${key}.desc`)}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
