import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PAYMENT_MARKS } from "./BrandMarks";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * UpcomingFeatures — the "what we're building next" roadmap. Editorial numbered
 * rows with a live progress bar per item, plus the payment-methods row merged in
 * (official brand marks) so everything on the way lives in one clear section.
 */

type Item = {
  key: "installments" | "invitations" | "payments";
  /** 0–1 build progress, purely indicative. */
  progress: number;
  logos?: boolean;
};

const ITEMS: Item[] = [
  { key: "installments", progress: 0.55 },
  { key: "invitations", progress: 0.35 },
  { key: "payments", progress: 0.7, logos: true },
];

export const UpcomingFeatures = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const dir: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";

  return (
    <section
      dir={dir}
      className="px-5 py-20 sm:px-8 sm:py-28"
      style={{ borderTop: "1px solid hsl(var(--gold) / 0.45)" }}
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          <span className="kicker">TKLH · ROADMAP</span>
          <h2 className="font-display mt-5 max-w-xl text-balance text-2xl font-black leading-[1.4] text-green sm:text-4xl">
            {t("upcoming.title")}
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-[1.95] text-[hsl(var(--brown))]">
            {t("upcoming.subtitle")}
          </p>
        </motion.div>

        <div className="mt-12">
          {ITEMS.map((item, i) => {
            const isPayments = item.key === "payments";
            return (
              <motion.article
                key={item.key}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
                className="py-8"
                style={{ borderTop: "1px solid hsl(var(--gold) / 0.4)" }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
                  <div className="flex min-w-0 gap-4">
                    <span
                      className="font-display shrink-0 pt-1 text-sm font-black tabular-nums"
                      style={{ color: "hsl(var(--green) / 0.45)" }}
                    >
                      {`0${i + 1}`}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-black leading-snug text-green sm:text-2xl">
                        {isPayments ? t("payments.label") : t(`upcoming.items.${item.key}.title`)}
                      </h3>
                      <p className="mt-2 max-w-xl text-[15px] leading-[1.9] text-[hsl(var(--brown))]">
                        {isPayments ? t("payments.desc") : t(`upcoming.items.${item.key}.desc`)}
                      </p>
                    </div>
                  </div>
                  <span
                    className="inline-flex shrink-0 self-start rounded-full px-4 py-1.5 text-[13px] font-bold"
                    style={{ backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }}
                  >
                    {isPayments ? t("payments.soon") : t("upcoming.badge")}
                  </span>
                </div>

                {/* Build progress — makes "we're working on it" visible */}
                <div className="mt-5 flex items-center gap-3 sm:ps-8">
                  <div
                    className="h-[3px] w-full max-w-xs overflow-hidden rounded-full"
                    style={{ backgroundColor: "hsl(var(--green) / 0.14)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "hsl(var(--green))" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.progress * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: EASE, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                  <span className="shrink-0 text-[12px] font-bold text-[hsl(var(--brown))] tabular-nums">
                    {`${Math.round(item.progress * 100)}%`}
                  </span>
                </div>

                {/* Official payment brand marks, merged into this row */}
                {item.logos && (
                  <div
                    className="mt-6 flex flex-wrap items-center gap-3 sm:ms-8"
                    aria-label={t("payments.aria")}
                  >
                    {PAYMENT_MARKS.map(({ key, Mark }, j) => (
                      <motion.span
                        key={key}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, ease: EASE, delay: j * 0.07 }}
                        className="inline-flex h-11 items-center justify-center rounded-md px-4"
                        style={{
                          border: "1px solid hsl(var(--gold) / 0.45)",
                          backgroundColor: "hsl(var(--cream))",
                        }}
                        title={t(`payments.providers.${key}`)}
                      >
                        <Mark />
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.article>
            );
          })}
          <div style={{ borderTop: "1px solid hsl(var(--gold) / 0.4)" }} />
        </div>
      </div>
    </section>
  );
};
