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
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            {t("dashboardPreview.kicker")}
          </span>
          <h2 className="mt-4 font-arabic text-balance text-4xl font-semibold sm:text-5xl">
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
              <div className="font-arabic text-lg font-semibold">
                {t("dashboardPreview.eventTitle")}
              </div>
              <div className="mt-1 text-sm text-muted-foreground" dir="ltr">
                {t("dashboardPreview.eventMeta")}
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2">
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ scale: liveMode ? [1, 1.4, 1] : 1, opacity: liveMode ? 1 : 0.4 }}
                  transition={{ repeat: liveMode ? Infinity : 0, duration: 1.5 }}
                  className={`h-2 w-2 rounded-full ${liveMode ? "bg-destructive" : "bg-muted-foreground"}`}
                />
                <span className="font-arabic text-sm font-medium">
                  {t("dashboardPreview.liveMode")}
                </span>
              </div>
              <Switch checked={liveMode} onCheckedChange={setLiveMode} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Timeline */}
            <div className="border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-l">
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

            {/* Vendors / Live mode */}
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-arabic text-lg font-semibold">
                  {liveMode
                    ? t("dashboardPreview.vendorsLive")
                    : t("dashboardPreview.vendorsConfirmed")}
                </h3>
                {liveMode && (
                  <div className="flex items-center gap-1 text-xs font-medium text-destructive">
                    <Radio className="h-3.5 w-3.5" /> {t("dashboardPreview.liveBadge")}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {VENDORS.map((v, i) => {
                    const name = t(`dashboardPreview.vendors.${v.key}.name`);
                    const note = liveMode
                      ? t(`dashboardPreview.vendors.${v.key}.noteLive`)
                      : t("dashboardPreview.confirmed");
                    return (
                      <motion.div
                        key={v.key}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                      >
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                          <v.icon className="h-5 w-5" strokeWidth={1.6} />
                        </div>
                        <div className="flex-1">
                          <div className="font-arabic text-sm font-semibold">{name}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{note}</div>
                        </div>
                        {liveMode && (
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles[v.status]}`}
                          >
                            {t(`dashboardPreview.status.${v.status}`)}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
