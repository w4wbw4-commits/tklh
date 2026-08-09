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

            <div>
              {timeline.map((row, i) => (
                <motion.div
                  key={row.key}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                  className="flex items-center justify-between gap-4 py-4"
                  style={{ borderTop: "1px solid hsl(var(--gold) / 0.32)" }}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span
                      className="font-display shrink-0 text-sm font-black tabular-nums"
                      style={{ color: "hsl(var(--gold))" }}
                    >
                      {`0${i + 1}`}
                    </span>
                    <div className="min-w-0">
                      <div
                        className="font-display truncate text-[15px] font-bold"
                        style={{
                          color:
                            row.status === "todo"
                              ? "hsl(var(--brown) / 0.65)"
                              : "hsl(var(--green))",
                        }}
                      >
                        {row.label}
                      </div>
                      {row.status === "active" && (
                        <span
                          className="mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-bold"
                          style={{
                            backgroundColor: "hsl(var(--green))",
                            color: "hsl(var(--cream))",
                          }}
                        >
                          {t("dashboardPreview.needsAction")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-[13px] text-[hsl(var(--brown))]">{row.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
