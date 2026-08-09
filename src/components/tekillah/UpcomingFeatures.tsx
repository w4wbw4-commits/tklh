import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * UpcomingFeatures — small editorial list rows with one capsule "soon" tag
 * per row. No cards, no glass, no blurs.
 */
export const UpcomingFeatures = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const dir: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";

  const items = ["installments", "invitations"] as const;

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
          <span className="kicker">TKLH · EVENT PLANNING</span>
          <h2 className="font-display mt-5 max-w-xl text-balance text-2xl font-black leading-[1.4] text-green sm:text-4xl">
            {t("upcoming.title")}
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-[1.95] text-[hsl(var(--brown))]">
            {t("upcoming.subtitle")}
          </p>
        </motion.div>

        <div className="mt-12">
          {items.map((key, i) => (
            <motion.article
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
              className="flex flex-col gap-3 py-7 sm:flex-row sm:items-start sm:justify-between sm:gap-10"
              style={{ borderTop: "1px solid hsl(var(--gold) / 0.4)" }}
            >
              <div className="min-w-0">
                <h3 className="font-display text-lg font-black leading-snug text-green sm:text-2xl">
                  {t(`upcoming.items.${key}.title`)}
                </h3>
                <p className="mt-2 max-w-xl text-[15px] leading-[1.9] text-[hsl(var(--brown))]">
                  {t(`upcoming.items.${key}.desc`)}
                </p>
              </div>
              <span
                className="inline-flex shrink-0 self-start rounded-full px-4 py-1.5 text-[13px] font-bold"
                style={{ backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }}
              >
                {t("upcoming.badge")}
              </span>
            </motion.article>
          ))}
          <div style={{ borderTop: "1px solid hsl(var(--gold) / 0.4)" }} />
        </div>
      </div>
    </section>
  );
};
