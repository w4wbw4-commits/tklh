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
      className="inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]"
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
    className: "relative flex flex-col rounded-xl p-4 sm:p-5",
    style: {
      border: creamHair,
      backgroundColor: "hsl(var(--green) / 0.55)",
      color: "hsl(var(--cream))",
    },
  });

  return (
    <section
      dir={dir}
      className="relative overflow-hidden px-5 py-12 sm:px-8 sm:py-16"
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
          <h2 className="font-display max-w-xl text-balance text-xl font-black leading-[1.4] sm:text-2xl">
            {t("upcoming.title")}
          </h2>
          <div
            className="mt-4 h-px w-16"
            style={{ backgroundColor: "hsl(var(--gold) / 0.6)" }}
            aria-hidden
          />
          <p className="mt-4 max-w-lg text-[13px] leading-[1.75] text-[hsl(var(--cream)/0.72)]">
            {t("upcoming.subtitle")}
          </p>
        </motion.div>

        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-2">
          {/* Left column — Invitations (tall portrait card, matches right stack height) */}
          <motion.article {...card(0)} className={`${card(0).className} h-full`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Num n="02" />
                <h3 className="font-display mt-1.5 text-[15px] font-black leading-snug sm:text-base">
                  {t("upcoming.items.invitations.title")}
                </h3>
              </div>
              <Badge />
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.7] text-[hsl(var(--cream)/0.72)]">
              {t("upcoming.items.invitations.desc")}
            </p>

            {/* modern e-invite: portrait, arched frame, hairline rule, wax-free monogram seal */}
            <div className="mt-4 flex flex-1 items-stretch justify-center">
              <motion.div
                whileHover={{ y: -4, rotate: isRtl ? 0.4 : -0.4 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="relative flex w-full max-w-[280px] flex-col overflow-hidden p-2.5"
                style={{
                  backgroundColor: "hsl(var(--cream))",
                  color: "hsl(var(--green))",
                  border: goldHair,
                  borderRadius: "160px 160px 14px 14px",
                }}
              >
                <div
                  className="flex flex-1 flex-col items-center justify-between px-4 pb-5 pt-8 text-center"
                  style={{ border: goldHair, borderRadius: "150px 150px 10px 10px" }}
                >
                  <div>
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.34em]"
                      style={{ color: GOLD }}
                    >
                      {t("upcoming.demo.invite.eyebrow")}
                    </span>
                    <p className="mt-3 text-[10px] tracking-[0.12em] text-[hsl(var(--brown))]">
                      {t("upcoming.demo.invite.line")}
                    </p>
                  </div>

                  <div className="my-4">
                    <p className="font-display text-lg font-black leading-tight sm:text-xl">
                      {t("upcoming.demo.invite.names")}
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2" aria-hidden>
                      <span
                        className="h-px w-10"
                        style={{ backgroundColor: "hsl(var(--gold) / 0.7)" }}
                      />
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-black"
                        style={{ border: goldHair, color: GOLD }}
                      >
                        ✦
                      </span>
                      <span
                        className="h-px w-10"
                        style={{ backgroundColor: "hsl(var(--gold) / 0.7)" }}
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <p className="text-[10px] font-bold tracking-[0.08em] text-[hsl(var(--brown))]">
                      {t("upcoming.demo.invite.date")}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[hsl(var(--brown-soft))]">
                      {t("upcoming.demo.invite.venue")}
                    </p>
                    <span
                      className="mt-4 inline-flex rounded-full px-3.5 py-1 text-[10px] font-bold"
                      style={{ backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }}
                    >
                      {t("upcoming.demo.invite.rsvp")}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.article>


          {/* Right column — Installments stacked + Payments square below */}
          <div className="flex flex-col gap-4">
            {/* 01 — Installments: single vertical stack */}
            <motion.article {...card(1)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Num n="01" />
                  <h3 className="font-display mt-1.5 text-[15px] font-black leading-snug sm:text-base">
                    {t("upcoming.items.installments.title")}
                  </h3>
                </div>
                <Badge />
              </div>
              <p className="mt-2 text-[12.5px] leading-[1.7] text-[hsl(var(--cream)/0.72)]">
                {t("upcoming.items.installments.desc")}
              </p>

              <div className="mt-4">
                <div
                  className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: GOLD }}
                >
                  <span>{t("upcoming.demo.inst.label")}</span>
                  <span className="tabular-nums">
                    {t("upcoming.demo.inst.total", { currency: t("common.currency") })}
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-1">
                  {Array.from({ length: 12 }, (_, idx) => {
                    const n = idx + 1;
                    const active = n === 1;
                    return (
                      <div
                        key={n}
                        className="flex items-center justify-between rounded-md px-2 py-1"
                        style={{
                          border: active ? goldHair : creamHair,
                          backgroundColor: active ? "hsl(var(--cream))" : "transparent",
                          color: active ? "hsl(var(--green))" : "hsl(var(--cream) / 0.78)",
                        }}
                      >
                        <span className="text-[10px] font-bold opacity-80">
                          {n} {t("upcoming.demo.inst.of")}
                        </span>
                        <span className="font-display text-[11px] font-black tabular-nums">
                          {t("upcoming.demo.inst.per")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.article>

            {/* 03 — Payment methods: compact square below installments */}
            <motion.article {...card(2)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Num n="03" />
                  <h3 className="font-display mt-1.5 text-[15px] font-black leading-snug sm:text-base">
                    {t("payments.label")}
                  </h3>
                </div>
                <Badge />
              </div>
              <p className="mt-2 max-w-2xl text-[12.5px] leading-[1.7] text-[hsl(var(--cream)/0.72)]">
                {t("upcoming.demo.oneplace")}
              </p>
              <div
                className="mt-3 grid grid-cols-3 gap-2"
                aria-label={t("payments.aria")}
              >
                {PAY.map((key, j) => (
                  <motion.span
                    key={key}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, ease: EASE, delay: j * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="pay-chip font-display flex items-center justify-center rounded-lg px-2 py-2 text-center text-[11px] font-black"
                    style={{ border: creamHair, color: "hsl(var(--cream))" }}
                  >
                    {t(`payments.providers.${key}`)}
                  </motion.span>
                ))}
              </div>
              <p
                className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ color: "hsl(var(--gold) / 0.85)" }}
              >
                {t("upcoming.demo.payLabel")}
              </p>
            </motion.article>
          </div>
        </div>
      </div>
    </section>
  );
};
