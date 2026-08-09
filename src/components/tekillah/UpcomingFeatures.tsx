import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * UpcomingFeatures — a compact dark velvet band (#0E2119) that breaks the
 * cream rhythm without dominating the page. Gold (#A08553) appears only as
 * 1px hairlines, numerals and the small seal; never as a fill.
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
      className="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]"
      style={{ border: goldHair, color: GOLD }}
    >
      {t("upcoming.badge")}
    </span>
  );

  const Num = ({ n }: { n: string }) => (
    <span
      className="font-display block text-[10px] font-black tracking-[0.28em] tabular-nums"
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
    className: "relative flex flex-col rounded-xl p-5 sm:p-6",
    style: {
      border: creamHair,
      backgroundColor: "hsl(var(--green) / 0.55)",
      color: "hsl(var(--cream))",
    },
  });

  return (
    <section
      dir={dir}
      className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-20"
      style={{ backgroundColor: "hsl(var(--green-deep))", color: "hsl(var(--cream))" }}
    >
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
          <h2 className="font-display max-w-xl text-balance text-2xl font-black leading-[1.35] sm:text-3xl">
            {t("upcoming.title")}
          </h2>
          <div
            className="mt-5 h-px w-20"
            style={{ backgroundColor: "hsl(var(--gold) / 0.6)" }}
            aria-hidden
          />
          <p className="mt-5 max-w-lg text-[14.5px] leading-[1.85] text-[hsl(var(--cream)/0.72)]">
            {t("upcoming.subtitle")}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {/* 01 — Installments: 12-year split, compact timeline */}
          <motion.article {...card(0)}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Num n="01" />
                <h3 className="font-display mt-2 text-base font-black leading-snug sm:text-lg">
                  {t("upcoming.items.installments.title")}
                </h3>
              </div>
              <Badge />
            </div>
            <p className="mt-2.5 text-[13.5px] leading-[1.8] text-[hsl(var(--cream)/0.72)]">
              {t("upcoming.items.installments.desc")}
            </p>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
                <span>{t("upcoming.demo.inst.label")}</span>
                <span className="tabular-nums">
                  {t("upcoming.demo.inst.total", { currency: t("common.currency") })}
                </span>
              </div>
              <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1.5 snap-x">
                {Array.from({ length: 12 }, (_, idx) => {
                  const n = idx + 1;
                  const active = n === 1;
                  return (
                    <div
                      key={n}
                      className="snap-start shrink-0 rounded-md px-2 py-2 text-center min-w-[52px]"
                      style={{
                        border: active ? goldHair : creamHair,
                        backgroundColor: active ? "hsl(var(--cream))" : "transparent",
                        color: active ? "hsl(var(--green))" : "hsl(var(--cream) / 0.78)",
                      }}
                    >
                      <span className="block text-[9px] font-bold opacity-70">
                        {t("upcoming.demo.inst.of")} {n}
                      </span>
                      <span className="font-display mt-0.5 block text-[12px] font-black tabular-nums">
                        {t("upcoming.demo.inst.per")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.article>

          {/* 02 — Invitations: smaller invitation card */}
          <motion.article {...card(1)}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Num n="02" />
                <h3 className="font-display mt-2 text-base font-black leading-snug sm:text-lg">
                  {t("upcoming.items.invitations.title")}
                </h3>
              </div>
              <Badge />
            </div>
            <p className="mt-2.5 text-[13.5px] leading-[1.8] text-[hsl(var(--cream)/0.72)]">
              {t("upcoming.items.invitations.desc")}
            </p>
            <motion.div
              whileHover={{ y: -4, rotate: isRtl ? 0.6 : -0.6 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-5 rounded-lg p-3.5 text-center"
              style={{
                backgroundColor: "hsl(var(--cream))",
                color: "hsl(var(--green))",
                border: goldHair,
              }}
            >
              <div className="rounded-md px-3 py-4" style={{ border: goldHair }}>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.3em]"
                  style={{ color: GOLD }}
                >
                  {t("upcoming.demo.invite.eyebrow")}
                </span>
                <p className="mt-2 text-[11px] text-[hsl(var(--brown))]">
                  {t("upcoming.demo.invite.line")}
                </p>
                <p className="font-display mt-1.5 text-lg font-black sm:text-xl">
                  {t("upcoming.demo.invite.names")}
                </p>
                <div
                  className="mx-auto mt-3 h-px w-14"
                  style={{ backgroundColor: "hsl(var(--gold) / 0.7)" }}
                />
                <p className="mt-3 text-[11px] text-[hsl(var(--brown))]">
                  {t("upcoming.demo.invite.date")}
                </p>
                <p className="text-[11px] text-[hsl(var(--brown-soft))]">
                  {t("upcoming.demo.invite.venue")}
                </p>
                <span
                  className="mt-4 inline-flex rounded-full px-3 py-1 text-[10px] font-bold"
                  style={{ backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }}
                >
                  {t("upcoming.demo.invite.rsvp")}
                </span>
              </div>
            </motion.div>
          </motion.article>

          {/* 03 — Payment methods */}
          <motion.article {...card(2)} className="relative flex flex-col rounded-xl p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Num n="03" />
                <h3 className="font-display mt-2 text-base font-black leading-snug sm:text-lg">
                  {t("payments.label")}
                </h3>
              </div>
              <Badge />
            </div>
            <p className="mt-2.5 max-w-2xl text-[13.5px] leading-[1.8] text-[hsl(var(--cream)/0.72)]">
              {t("upcoming.demo.oneplace")}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2" aria-label={t("payments.aria")}>
              {PAY.map((key, j) => (
                <motion.span
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, ease: EASE, delay: j * 0.06 }}
                  whileHover={{ y: -2 }}
                  className="pay-chip font-display inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-black"
                  style={{ border: creamHair, color: "hsl(var(--cream))" }}
                >
                  {t(`payments.providers.${key}`)}
                </motion.span>
              ))}
            </div>
            <p
              className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.16em]"
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
