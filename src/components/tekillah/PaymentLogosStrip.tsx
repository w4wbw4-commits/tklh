// ---------------------------------------------------------------------------
// PaymentLogosStrip — localized "coming soon" payment methods trust strip.
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import { CreditCard, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";

const PROVIDER_KEYS = ["tabby", "tamara", "mada", "applepay", "visa", "mastercard"] as const;

export const PaymentLogosStrip = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  return (
    <section
      aria-label={t("payments.aria")}
      dir={isAr ? "rtl" : "ltr"}
      className="relative bg-surface/60 px-6 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-3 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream px-4 py-1.5 text-xs font-bold text-foreground">
              <CreditCard className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
              {t("payments.label")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-black text-green">
              <Sparkles className="h-3 w-3 text-gold" strokeWidth={2.5} />
              {t("payments.soon")}
            </span>
          </div>
          <p className={`mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-foreground/60 sm:text-base ${isAr ? "font-arabic" : ""}`}>
            {t("payments.desc")}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
            {PROVIDER_KEYS.map((key) => (
              <motion.div
                key={key}
                whileHover={{ y: -3, filter: "grayscale(0%)", opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="group relative flex h-20 items-center justify-center rounded-2xl border border-border bg-background/70 backdrop-blur-sm"
                style={{ filter: "grayscale(100%) blur(0.4px)", opacity: 0.7 }}
              >
                <span className={`absolute -top-2 ${isAr ? "right-2" : "left-2"} rounded-full bg-gold px-2 py-0.5 text-[9px] font-black text-primary-deep shadow-soft`}>
                  {t("payments.soon")}
                </span>
                <span className={`text-sm font-black text-foreground/70 sm:text-base ${isAr ? "font-arabic" : ""}`}>
                  {t(`payments.providers.${key}`)}
                </span>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
