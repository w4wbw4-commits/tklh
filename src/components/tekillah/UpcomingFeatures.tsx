import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * UpcomingFeatures — the single dark velvet band of the page (#0E2119) that
 * breaks the cream rhythm. Gold (#A08553) appears only as 1px hairlines,
 * numerals and the small seal; never as a fill. Wine (#46232A) shows up once,
 * on the payments card hover accent.
 */

const PAY = ["mada", "applepay", "visa", "mastercard", "tabby", "tamara"] as const;

const GOLD = "hsl(var(--gold))";
const goldHair = "1px solid hsl(var(--gold) / 0.42)";
const creamHair = "1px solid hsl(var(--cream) / 0.14)";

export const UpcomingFeatures = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const dir: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";

  const Badge = () => (
    <span
      className="inline-flex shrink-0 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em]"
      style={{ border: goldHair, color: GOLD }}
    >
      {t("upcoming.badge")}
    </span>
  );

  /** Small gold ordinal — numerals are one of the few sanctioned gold uses. */
  const Num = ({ n }: { n: string }) => (
    <span
      className="font-display block text-[11px] font-black tracking-[0.28em] tabular-nums"
      style={{ color: GOLD }}
    >
      {n}
    </span>
  );

  const card = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.7, ease: EASE, delay: i * 0.1 },
    className: "relative flex flex-col rounded-xl p-6 sm:p-7",
    style: {
      border: creamHair,
      backgroundColor: "hsl(var(--green) / 0.55)",
      color: "hsl(var(--cream))",
    },
  });

  return (
    <section
      dir={dir}
      className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28"
      style={{ backgroundColor: "hsl(var(--green-deep))", color: "hsl(var(--cream))" }}
    >
      {/* top + bottom gold hairlines frame the dark band */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: "hsl(var(--gold) / 0.55)" }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ backgroundColor: "hsl(var(--gold) / 0.35)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          <h2 className="font-display max-w-xl text-balance text-2xl font-black leading-[1.4] sm:text-4xl">
            {t("upcoming.title")}
          </h2>
          <div
            className="mt-6 h-px w-24"
            style={{ backgroundColor: "hsl(var(--gold) / 0.6)" }}
            aria-hidden
          />
          <p className="mt-6 max-w-lg text-[15px] leading-[1.95] text-[hsl(var(--cream)/0.72)]">
            {t("upcoming.subtitle")}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* 01 — Installments: show the split, not a progress bar */}
          <motion.article {...card(0)}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Num n="01" />
                <h3 className="font-display mt-2 text-lg font-black leading-snug sm:text-xl">
                  {t("upcoming.items.installments.title")}
                </h3>
              </div>
              <Badge />
            </div>
            <p className="mt-3 text-[14.5px] leading-[1.9] text-[hsl(var(--cream)/0.72)]">
              {t("upcoming.items.installments.desc")}
            </p>
            <p
              className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "hsl(var(--gold) / 0.9)" }}
            >
              {t("upcoming.demo.inst.label")}
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-lg px-2 py-3 text-center"
                  style={{
                    border: n === 1 ? goldHair : creamHair,
                    backgroundColor: n === 1 ? "hsl(var(--cream))" : "transparent",
                    color: n === 1 ? "hsl(var(--green))" : "hsl(var(--cream) / 0.8)",
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

          {/* 02 — Invitations: an actual invitation card, cream on velvet */}
          <motion.article {...card(1)}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Num n="02" />
                <h3 className="font-display mt-2 text-lg font-black leading-snug sm:text-xl">
                  {t("upcoming.items.invitations.title")}
                </h3>
              </div>
              <Badge />
            </div>
            <p className="mt-3 text-[14.5px] leading-[1.9] text-[hsl(var(--cream)/0.72)]">
              {t("upcoming.items.invitations.desc")}
            </p>
            <motion.div
              whileHover={{ y: -5, rotate: isRtl ? 0.7 : -0.7 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-6 rounded-lg p-5 text-center"
              style={{
                backgroundColor: "hsl(var(--cream))",
                color: "hsl(var(--green))",
                border: goldHair,
              }}
            >
              <div className="rounded-md px-4 py-6" style={{ border: goldHair }}>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.3em]"
                  style={{ color: GOLD }}
                >
                  {t("upcoming.demo.invite.eyebrow")}
                </span>
                <p className="mt-3 text-[12px] text-[hsl(var(--brown))]">
                  {t("upcoming.demo.invite.line")}
                </p>
                <p className="font-display mt-2 text-xl font-black sm:text-2xl">
                  {t("upcoming.demo.invite.names")}
                </p>
                <div
                  className="mx-auto mt-4 h-px w-16"
                  style={{ backgroundColor: "hsl(var(--gold) / 0.7)" }}
                />
                <p className="mt-4 text-[12.5px] text-[hsl(var(--brown))]">
                  {t("upcoming.demo.invite.date")}
                </p>
                <p className="text-[12.5px] text-[hsl(var(--brown-soft))]">
                  {t("upcoming.demo.invite.venue")}
                </p>
                <span
                  className="mt-5 inline-flex rounded-full px-4 py-1.5 text-[11px] font-bold"
                  style={{ backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }}
                >
                  {t("upcoming.demo.invite.rsvp")}
                </span>
              </div>
            </motion.div>
          </motion.article>

          {/* 03 — Payment methods: names, all in one place */}
          <motion.article {...card(2)} className="relative flex flex-col rounded-xl p-6 sm:p-7 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Num n="03" />
                <h3 className="font-display mt-2 text-lg font-black leading-snug sm:text-xl">
                  {t("payments.label")}
                </h3>
              </div>
              <Badge />
            </div>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-[1.9] text-[hsl(var(--cream)/0.72)]">
              {t("upcoming.demo.oneplace")}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5" aria-label={t("payments.aria")}>
              {PAY.map((key, j) => (
                <motion.span
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, ease: EASE, delay: j * 0.06 }}
                  whileHover={{ y: -2 }}
                  className="pay-chip font-display inline-flex items-center rounded-full px-4 py-2 text-[13.5px] font-black"
                  style={{ border: creamHair, color: "hsl(var(--cream))" }}
                >
                  {t(`payments.providers.${key}`)}
                </motion.span>
              ))}
            </div>
            <p
              className="mt-5 text-[11.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: "hsl(var(--gold) / 0.85)" }}
            >
              {t("upcoming.demo.payLabel")}
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
};
