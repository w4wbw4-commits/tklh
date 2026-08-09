import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

type StepKey = "venue" | "catering" | "photography" | "florals" | "night";

const TIMELINE: { key: StepKey; status: "done" | "active" | "todo" }[] = [
  { key: "venue", status: "done" },
  { key: "catering", status: "active" },
  { key: "photography", status: "todo" },
  { key: "florals", status: "todo" },
  { key: "night", status: "todo" },
];

export const DashboardPreview = () => {
  const { t } = useTranslation();

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
    <section id="dashboard" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary sm:text-xs sm:tracking-[0.24em]">
            {t("dashboardPreview.kicker")}
          </span>
          <h2 className="mt-4 font-arabic text-balance text-2xl font-semibold leading-[1.45] sm:text-4xl md:text-5xl">
            {t("dashboardPreview.title")}
          </h2>
          <p className="mt-4 text-muted-foreground sm:text-lg">
            {t("dashboardPreview.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 overflow-hidden rounded-3xl border border-border bg-card shadow-luxury"
        >
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-gradient-beige px-6 py-5 sm:px-8">
            <div>
              <span className="mb-2 inline-flex items-center rounded-full border border-gold/40 bg-cream/80 px-2.5 py-0.5 font-arabic text-[10px] font-bold text-primary-deep sm:text-[11px]">
                {t("dashboardPreview.previewChip")}
              </span>
              <div className="font-arabic text-lg font-semibold">
                {t("dashboardPreview.eventTitle")}
              </div>
              <div className="mt-1 text-sm text-muted-foreground" dir="ltr">
                {t("dashboardPreview.eventMeta")}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-arabic text-lg font-semibold">
                {t("dashboardPreview.timelineTitle")}
              </h3>
              <span className="text-xs text-muted-foreground">
                {t("dashboardPreview.timeRemaining")}
              </span>
            </div>

            <div className="relative space-y-5 ps-6">
              <div className="absolute end-auto start-[10px] top-2 bottom-2 w-px bg-border" />
              {timeline.map((row, i) => {
                const Icon =
                  row.status === "done"
                    ? CheckCircle2
                    : row.status === "active"
                    ? Clock
                    : AlertCircle;
                const color =
                  row.status === "done"
                    ? "text-primary bg-primary/10"
                    : row.status === "active"
                    ? "text-primary-deep bg-secondary"
                    : "text-muted-foreground bg-muted";

                return (
                  <motion.div
                    key={row.key}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="relative flex items-start gap-4"
                  >
                    <div
                      className={`absolute -start-6 grid h-5 w-5 place-items-center rounded-full ring-4 ring-card ${color}`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-arabic text-sm font-semibold">{row.label}</div>
                        <span className="text-xs text-muted-foreground">{row.time}</span>
                      </div>
                      {row.status === "active" && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-primary-deep">
                          {t("dashboardPreview.needsAction")}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
