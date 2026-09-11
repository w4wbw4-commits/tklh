import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * UpcomingFeatures — one compact dark-velvet card that gathers all three
 * upcoming promises in a tight bento layout. Cream text, gold hairlines,
 * no heavy shadows, no scattered blocks.
 */

const PAY = ["mada", "applepay", "visa", "mastercard", "tabby", "tamara"] as const;

const GOLD = "hsl(var(--gold))";
const goldHair = "1px solid hsl(var(--gold) / 0.45)";
const creamHair = "1px solid hsl(var(--cream) / 0.14)";

export const UpcomingFeatures = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const dir: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";

  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  const Badge = () => (
    <span
      className="inline-flex shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em]"
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

  return (
    <section
      data-navbar-theme="dark"
      dir={dir}
      className="relative overflow-hidden px-4 py-10 sm:px-8 sm:py-20"
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

      <div className="relative mx-auto w-full max-w-7xl">
        <motion.div
          {...reveal(0)}
          className="rounded-3xl p-4 sm:p-10"
          style={{ border: creamHair, backgroundColor: "hsl(var(--green) / 0.55)" }}
        >
          {/* Header */}
          <div className="mb-5 flex flex-col sm:mb-8 gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display max-w-2xl text-balance text-2xl font-black leading-[1.3] sm:text-3xl">
                {t("upcoming.title")}
              </h2>
              <p className="mt-3 hidden max-w-xl text-sm leading-[1.8] text-[hsl(var(--cream)/0.75)] sm:block">
                {t("upcoming.subtitle")}
              </p>
            </div>
            <div
              className="hidden h-px w-28 sm:block"
              style={{ backgroundColor: "hsl(var(--gold) / 0.5)" }}
              aria-hidden
            />
          </div>

          {/* Bento grid */}
          <div className="grid gap-3 sm:gap-5 lg:grid-cols-3">
            {/* 01 — Installments */}
            <motion.div
              {...reveal(0.1)}
              className="relative flex flex-col rounded-2xl p-4 sm:p-6"
              style={{ border: creamHair, backgroundColor: "hsl(var(--green) / 0.35)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <Num n="01" />
                <Badge />
              </div>
              <h3 className="font-display mt-3 text-lg font-black leading-snug">
                {t("upcoming.items.installments.title")}
              </h3>
              <p className="mt-2 hidden text-[13px] leading-[1.75] text-[hsl(var(--cream)/0.72)] sm:block">
                {t("upcoming.items.installments.desc")}
              </p>

              <div className="mt-5 flex flex-1 flex-col justify-end gap-3">
                {/* Total */}
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ backgroundColor: "hsl(var(--cream))", color: "hsl(var(--green))" }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                    {t("upcoming.demo.inst.total_label")}
                  </span>
                  <span className="font-display text-base font-black tabular-nums">
                    {t("upcoming.demo.inst.total", { currency: t("common.currency") })}
                  </span>
                </div>

                {/* Schedule: first / next / rest */}
                <ul className="hidden space-y-2 sm:block">
                  {[
                    { k: "first", state: "paid" as const },
                    { k: "next", state: "next" as const },
                    { k: "rest", state: "later" as const },
                  ].map(({ k, state }) => (
                    <li
                      key={k}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{
                        border:
                          state === "next"
                            ? goldHair
                            : creamHair,
                        backgroundColor:
                          state === "next" ? "hsl(var(--gold) / 0.1)" : "transparent",
                      }}
                    >
                      <span
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-black"
                        style={{
                          border: state === "later" ? creamHair : goldHair,
                          backgroundColor:
                            state === "paid" ? "hsl(var(--gold))" : "transparent",
                          color:
                            state === "paid"
                              ? "hsl(var(--green-deep))"
                              : state === "next"
                                ? GOLD
                                : "hsl(var(--cream) / 0.6)",
                        }}
                        aria-hidden
                      >
                        {state === "paid" ? "✓" : state === "next" ? "•" : "…"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-bold leading-tight">
                          {t(`upcoming.demo.inst.${k}`)}
                        </span>
                        <span className="block text-[10px] leading-tight text-[hsl(var(--cream)/0.6)]">
                          {t(`upcoming.demo.inst.${k}Note`)}
                        </span>
                      </span>
                      <span
                        className="font-display shrink-0 text-[12px] font-black tabular-nums"
                        style={{ color: state === "later" ? "hsl(var(--cream)/0.6)" : GOLD }}
                      >
                        {t("upcoming.demo.inst.per")} {t("common.currency")}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* 12-month progress */}
                <div className="hidden items-center justify-between gap-3 sm:flex">
                  <span className="text-[10px] text-[hsl(var(--cream)/0.7)]">
                    {t("upcoming.demo.inst.paidOf")}
                  </span>
                  <div className="flex gap-1" aria-hidden>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            i < 2 ? "hsl(var(--gold))" : "hsl(var(--cream) / 0.25)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>


            {/* 02 — Invitations */}
            <motion.div
              {...reveal(0.2)}
              className="relative flex flex-col rounded-2xl p-4 sm:p-6"
              style={{ border: creamHair, backgroundColor: "hsl(var(--green) / 0.35)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <Num n="02" />
                <Badge />
              </div>
              <h3 className="font-display mt-3 text-lg font-black leading-snug">
                {t("upcoming.items.invitations.title")}
              </h3>
              <p className="mt-2 hidden text-[13px] leading-[1.75] text-[hsl(var(--cream)/0.72)] sm:block">
                {t("upcoming.items.invitations.desc")}
              </p>

              <div className="mt-5 hidden flex-1 items-end justify-center sm:flex">
                <div
                  className="w-full max-w-[230px] overflow-hidden rounded-t-[110px] px-5 pb-5 pt-8 text-center"
                  style={{ backgroundColor: "hsl(var(--cream))", color: "hsl(var(--green))" }}
                >
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.3em]"
                    style={{ color: GOLD }}
                  >
                    {t("upcoming.demo.invite.eyebrow")}
                  </span>
                  <p className="font-display mt-2 text-[17px] font-black leading-tight">
                    {t("upcoming.demo.invite.names")}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2" aria-hidden>
                    <span className="h-px w-7" style={{ backgroundColor: "hsl(var(--gold) / 0.6)" }} />
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-black"
                      style={{ border: goldHair, color: GOLD }}
                    >
                      ✦
                    </span>
                    <span className="h-px w-7" style={{ backgroundColor: "hsl(var(--gold) / 0.6)" }} />
                  </div>
                  <p className="mt-2.5 text-[10px] font-bold tracking-[0.06em] text-[hsl(var(--brown))]">
                    {t("upcoming.demo.invite.date")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 03 — Payments */}
            <motion.div
              {...reveal(0.3)}
              className="relative flex flex-col rounded-2xl p-4 sm:p-6"
              style={{ border: creamHair, backgroundColor: "hsl(var(--green) / 0.35)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <Num n="03" />
                <Badge />
              </div>
              <h3 className="font-display mt-3 text-lg font-black leading-snug">
                {t("payments.label")}
              </h3>
              <p className="mt-2 hidden text-[13px] leading-[1.75] text-[hsl(var(--cream)/0.72)] sm:block">
                {t("upcoming.demo.oneplace")}
              </p>

              <div className="mt-5 grid flex-1 grid-cols-3 content-end gap-2.5" aria-label={t("payments.aria")}>
                {PAY.map((key, j) => (
                  <motion.span
                    key={key}
                    initial={{ opacity: 0, y: 4 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.35, ease: EASE, delay: 0.35 + j * 0.04 }}
                    className={`pay-chip font-display flex items-center justify-center rounded-lg px-2 py-3 text-center text-[11px] font-black ${j > 3 ? "hidden sm:flex" : ""}`}
                    style={{ border: creamHair, color: "hsl(var(--cream))" }}
                  >
                    {t(`payments.providers.${key}`)}
                  </motion.span>
                ))}
              </div>
              <p
                className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "hsl(var(--gold) / 0.85)" }}
              >
                {t("upcoming.demo.payLabel")}
              </p>

            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
