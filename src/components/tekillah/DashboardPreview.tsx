import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

type StepKey = "venue" | "catering" | "photography" | "florals" | "night";

const EASE = [0.22, 1, 0.36, 1] as const;

const TIMELINE: { key: StepKey; status: "done" | "active" | "todo" }[] = [
  { key: "venue", status: "done" },
  { key: "catering", status: "active" },
  { key: "photography", status: "todo" },
  { key: "florals", status: "todo" },
  { key: "night", status: "todo" },
];

/**
 * DashboardPreview — split screen: editorial text on one side, the panel
 * inside a 1px gold frame on the other. No browser mock-up, no soft shadows.
 */
export const DashboardPreview = () => {
  const { t } = useTranslation();
  // Interactive: which step the visitor is inspecting. Defaults to the active one.
  const [openIndex, setOpenIndex] = useState(
    Math.max(0, TIMELINE.findIndex((r) => r.status === "active")),
  );


  const timeline = useMemo(
    () =>
      TIMELINE.map((row) => ({
        ...row,
        label: t(`dashboardPreview.timeline.${row.key}.label`),
        time: t(`dashboardPreview.timeline.${row.key}.time`),
      })),
    [t],
  );

  return (
    <section
      id="dashboard"
      className="px-5 py-20 sm:px-8 sm:py-28"
      style={{ borderTop: "1px solid hsl(var(--gold) / 0.45)" }}
    >
      <div className="mx-auto grid max-w-6xl items-start gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASE }}
          className="md:sticky md:top-28"
        >
          <span className="kicker">TKLH · EVENT PLANNING</span>
          <h2 className="font-display mt-5 text-balance text-2xl font-black leading-[1.4] text-green sm:text-4xl">
            {t("dashboardPreview.title")}
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-[1.95] text-[hsl(var(--brown))] sm:text-base">
            {t("dashboardPreview.subtitle")}
          </p>
          <span
            className="mt-7 inline-flex items-center rounded-full px-4 py-1.5 text-[13px] font-bold"
            style={{
              border: "1px solid hsl(var(--gold) / 0.55)",
              color: "hsl(var(--gold))",
            }}
          >
            {t("dashboardPreview.kicker")}
          </span>
        </motion.div>

        {/* Panel side — gold hairline frame */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="rounded-md"
          style={{ border: "1px solid hsl(var(--gold) / 0.5)" }}
        >
          <div
            className="flex flex-wrap items-baseline justify-between gap-3 px-6 py-5 sm:px-8"
            style={{ borderBottom: "1px solid hsl(var(--gold) / 0.4)" }}
          >
            <div className="font-display text-lg font-black text-green">
              {t("dashboardPreview.eventTitle")}
            </div>
            <div className="text-[13px] text-[hsl(var(--brown))]" dir="ltr">
              {t("dashboardPreview.eventMeta")}
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="mb-6 flex items-baseline justify-between">
              <h3 className="font-display text-base font-black text-green">
                {t("dashboardPreview.timelineTitle")}
              </h3>
              <span className="text-[13px] text-[hsl(var(--brown))]">
                {t("dashboardPreview.timeRemaining")}
              </span>
            </div>

            {/* Real vertical timeline: continuous rail + animated progress fill */}
            <div className="relative ps-9">
              <div
                className="absolute top-3 bottom-3 w-px"
                style={{
                  insetInlineStart: "13px",
                  backgroundColor: "hsl(var(--green) / 0.18)",
                }}
              />
              <motion.div
                className="absolute top-3 w-px origin-top"
                style={{ insetInlineStart: "13px", backgroundColor: "hsl(var(--green))" }}
                initial={{ height: 0 }}
                whileInView={{ height: `${(activeIndex / (timeline.length - 1)) * 100 * 0.86}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
              />

              {timeline.map((row, i) => {
                const isOpen = i === openIndex;
                const reached = i <= activeIndex;
                return (
                  <motion.button
                    key={row.key}
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    aria-expanded={isOpen}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                    className="group relative block w-full py-4 text-start"
                  >
                    {/* Node on the rail */}
                    <span
                      className="absolute grid h-[15px] w-[15px] place-items-center rounded-full transition-all duration-300"
                      style={{
                        insetInlineStart: "-29px",
                        top: "22px",
                        backgroundColor: reached ? "hsl(var(--green))" : "hsl(var(--cream))",
                        border: `1px solid hsl(var(--green) / ${reached ? 1 : 0.35})`,
                        boxShadow: isOpen ? "0 0 0 4px hsl(var(--green) / 0.14)" : "none",
                      }}
                    >
                      {row.status === "done" && (
                        <svg viewBox="0 0 10 10" className="h-[7px] w-[7px]" aria-hidden>
                          <path
                            d="M1 5.2 3.6 8 9 2"
                            fill="none"
                            stroke="hsl(var(--cream))"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </span>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="font-display shrink-0 text-sm font-black tabular-nums"
                          style={{ color: reached ? "hsl(var(--green))" : "hsl(var(--green) / 0.4)" }}
                        >
                          {`0${i + 1}`}
                        </span>
                        <span
                          className="font-display truncate text-[15px] font-bold transition-colors"
                          style={{
                            color:
                              row.status === "todo"
                                ? "hsl(var(--brown) / 0.7)"
                                : "hsl(var(--green))",
                          }}
                        >
                          {row.label}
                        </span>
                        {row.status === "active" && (
                          <span
                            className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                            style={{
                              backgroundColor: "hsl(var(--green))",
                              color: "hsl(var(--cream))",
                            }}
                          >
                            {t("dashboardPreview.needsAction")}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-[13px] text-[hsl(var(--brown))]">
                        {row.time}
                      </span>
                    </div>

                    {/* Interactive detail: a thin underline that grows on the open step */}
                    <motion.span
                      className="mt-3 block h-px origin-left"
                      style={{ backgroundColor: "hsl(var(--green) / 0.35)" }}
                      animate={{ scaleX: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                    />
                  </motion.button>
                );
              })}
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
};
