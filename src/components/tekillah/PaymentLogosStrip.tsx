// ---------------------------------------------------------------------------
// PaymentLogosStrip — localized "coming soon" payment methods trust strip,
// rendered as one quiet editorial row divided by 1px gold rules.
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;
const PROVIDER_KEYS = ["tabby", "tamara", "mada", "applepay", "visa", "mastercard"] as const;

export const PaymentLogosStrip = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const ar = isAr ? "font-arabic" : "";

  return (
    <section
      aria-label={t("payments.aria")}
      dir={isAr ? "rtl" : "ltr"}
      className="relative px-5 py-16 sm:px-8 sm:py-20"
      style={{ borderTop: "1px solid hsl(var(--gold) / 0.45)" }}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span className="kicker">{t("payments.label")}</span>
            <span
              className="inline-flex rounded-full px-3 py-1 text-[12px] font-bold"
              style={{ backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }}
            >
              {t("payments.soon")}
            </span>
          </div>
          <p className={`mt-4 max-w-xl text-[15px] leading-[1.9] text-[hsl(var(--brown))] ${ar}`}>
            {t("payments.desc")}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 py-6 sm:gap-x-12"
            style={{
              borderTop: "1px solid hsl(var(--gold) / 0.4)",
              borderBottom: "1px solid hsl(var(--gold) / 0.4)",
            }}
          >
            {PROVIDER_KEYS.map((key, i) => (
              <motion.span
                key={key}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
                className={`text-[15px] font-bold text-green/70 sm:text-base ${ar}`}
              >
                {t(`payments.providers.${key}`)}
              </motion.span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
