import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * UpcomingFeatures — "on the way" roadmap as three editorial cards.
 * Each card shows the feature itself instead of an abstract progress bar:
 * an installment split, a real invitation card mock, and the named payment
 * methods (text wordmarks — no logo images) that live in one place.
 */

const PAY = ["mada", "applepay", "visa", "mastercard", "tabby", "tamara"] as const;

const hairline = "1px solid hsl(var(--green) / 0.18)";

export const UpcomingFeatures = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const dir: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";

  const Badge = () => (
    <span
      className="inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide"
      style={{ backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }}
    >
      {t("upcoming.badge")}
    </span>
  );

  const card = (i: number) => ({
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.7, ease: EASE, delay: i * 0.1 },
    className: "flex flex-col rounded-xl p-6 sm:p-7",
    style: { border: hairline, backgroundColor: "hsl(var(--cream))" },
  });

  return (
    <section dir={dir} className="px-5 py-20 sm:px-8 sm:py-28" style={{ borderTop: hairline }}>
      <div className="mx-auto max-w-5xl">
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

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* 01 — Installments: show the split, not a progress bar */}
          <motion.article {...card(0)}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-lg font-black leading-snug text-green sm:text-xl">
                {t("upcoming.items.installments.title")}
              </h3>
              <Badge />
            </div>
            <p className="mt-3 text-[14.5px] leading-[1.9] text-[hsl(var(--brown))]">
              {t("upcoming.items.installments.desc")}
            </p>
            <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--green)/0.6)]">
              {t("upcoming.demo.inst.label")}
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-lg px-2 py-3 text-center"
                  style={{
                    border: hairline,
                    backgroundColor: n === 1 ? "hsl(var(--green))" : "transparent",
                    color: n === 1 ? "hsl(var(--cream))" : "hsl(var(--green))",
                  }}
                >
                  <span className="block text-[10px] font-bold opacity-70">
                    {`${t("upcoming.demo.inst.of")} ${n}`}
                  </span>
                  <span className="font-display mt-1 block text-[15px] font-black tabular-nums">
                    1,250
                  </span>
                </div>
              ))}
            </div>
          </motion.article>

          {/* 02 — Invitations: an actual invitation card */}
          <motion.article {...card(1)}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-lg font-black leading-snug text-green sm:text-xl">
                {t("upcoming.items.invitations.title")}
              </h3>
              <Badge />
            </div>
            <p className="mt-3 text-[14.5px] leading-[1.9] text-[hsl(var(--brown))]">
              {t("upcoming.items.invitations.desc")}
            </p>
            <motion.div
              whileHover={{ y: -4, rotate: isRtl ? 0.6 : -0.6 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-6 rounded-lg p-6 text-center"
              style={{ backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }}
            >
              <div
                className="rounded-md px-4 py-6"
                style={{ border: "1px solid hsl(var(--cream) / 0.35)" }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">
                  {t("upcoming.demo.invite.eyebrow")}
                </span>
                <p className="mt-3 text-[12px] opacity-80">{t("upcoming.demo.invite.line")}</p>
                <p className="font-display mt-2 text-xl font-black sm:text-2xl">
                  {t("upcoming.demo.invite.names")}
                </p>
                <div
                  className="mx-auto mt-4 h-px w-16"
                  style={{ backgroundColor: "hsl(var(--cream) / 0.4)" }}
                />
                <p className="mt-4 text-[12.5px] opacity-90">{t("upcoming.demo.invite.date")}</p>
                <p className="text-[12.5px] opacity-75">{t("upcoming.demo.invite.venue")}</p>
                <span
                  className="mt-5 inline-flex rounded-full px-4 py-1.5 text-[11px] font-bold"
                  style={{ backgroundColor: "hsl(var(--cream))", color: "hsl(var(--green))" }}
                >
                  {t("upcoming.demo.invite.rsvp")}
                </span>
              </div>
            </motion.div>
          </motion.article>

          {/* 03 — Payment methods: names, all in one place */}
          <motion.article {...card(2)} className="flex flex-col rounded-xl p-6 sm:p-7 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-lg font-black leading-snug text-green sm:text-xl">
                {t("payments.label")}
              </h3>
              <Badge />
            </div>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-[1.9] text-[hsl(var(--brown))]">
              {t("upcoming.demo.oneplace")}
            </p>
            <div
              className="mt-6 flex flex-wrap items-center gap-2.5"
              aria-label={t("payments.aria")}
            >
              {PAY.map((key, j) => (
                <motion.span
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, ease: EASE, delay: j * 0.06 }}
                  className="font-display inline-flex items-center rounded-full px-4 py-2 text-[13.5px] font-black text-green"
                  style={{ border: hairline, backgroundColor: "hsl(var(--green) / 0.05)" }}
                >
                  {t(`payments.providers.${key}`)}
                </motion.span>
              ))}
            </div>
            <p className="mt-4 text-[12px] font-bold text-[hsl(var(--green)/0.55)]">
              {t("upcoming.demo.payLabel")}
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
};
