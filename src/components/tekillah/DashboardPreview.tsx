// ---------------------------------------------------------------------------
// DashboardPreview — an interactive, display-only mini version of the real
// customer dashboard (/dashboard). Six real tabs, clickable + hover on desktop,
// auto-rotating every 4s until the visitor interacts. No live data: sample rows
// only, clearly labelled as a preview.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Armchair,
  CalendarClock,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Receipt,
  Users,
  Sparkle,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 4000;

type TabKey = "overview" | "timeline" | "vendors" | "guests" | "invoices" | "day";

const TABS: { key: TabKey; Icon: typeof LayoutGrid }[] = [
  { key: "overview", Icon: LayoutGrid },
  { key: "timeline", Icon: CalendarClock },
  { key: "vendors", Icon: Armchair },
  { key: "guests", Icon: Users },
  { key: "invoices", Icon: Receipt },
  { key: "day", Icon: Clock },
];

const hairline = "1px solid hsl(var(--green) / 0.22)";

/** One sample row inside the mini panel. */
const Row = ({
  lead,
  trail,
  done,
  active,
}: {
  lead: string;
  trail: string;
  done?: boolean;
  active?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 py-3" style={{ borderTop: hairline }}>
    <span className="flex min-w-0 items-center gap-2.5">
      {done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.6} />
      ) : active ? (
        <Clock className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.6} />
      ) : (
        <Sparkle className="h-4 w-4 shrink-0 text-primary/40" strokeWidth={1.6} />
      )}
      <span className="truncate text-[14px] font-bold text-primary">{lead}</span>
    </span>
    <span
      className="shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-bold"
      style={
        done || active
          ? { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
          : { border: hairline, color: "hsl(var(--brown))" }
      }
    >
      {trail}
    </span>
  </div>
);

export const DashboardPreview = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>("overview");
  const [auto, setAuto] = useState(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!auto) return;
    timer.current = window.setInterval(() => {
      setTab((prev) => {
        const i = TABS.findIndex((x) => x.key === prev);
        return TABS[(i + 1) % TABS.length].key;
      });
    }, AUTOPLAY_MS);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [auto]);

  const pick = (key: TabKey) => {
    setAuto(false);
    setTab(key);
  };

  const rows = (key: Exclude<TabKey, "overview">) =>
    (t(`dashboardPreview.demo.rows.${key}`, { returnObjects: true }) as string[][]) ?? [];

  const stats = [
    { label: t("dashboardPreview.demo.stats.guests"), value: "300" },
    { label: t("dashboardPreview.demo.stats.bookings"), value: "4 / 6" },
    { label: t("dashboardPreview.demo.stats.paid"), value: "65%" },
  ];

  return (
    <section
      id="dashboard"
      className="px-5 py-20 sm:px-8 sm:py-28"
      style={{ borderTop: "1px solid hsl(var(--green) / 0.35)" }}
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
          <h2 className="font-display mt-5 text-balance text-2xl font-black leading-[1.4] text-primary sm:text-4xl">
            {t("dashboardPreview.title")}
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-[1.95] text-[hsl(var(--brown))] sm:text-base">
            {t("dashboardPreview.subtitle")}
          </p>
          <span
            className="mt-7 inline-flex items-center rounded-full px-4 py-1.5 text-[13px] font-bold"
            style={{
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            {t("dashboardPreview.demo.badge")}
          </span>
        </motion.div>

        {/* Mini dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
        >
          <div className="rounded-md" style={{ border: hairline }}>
            {/* Panel header */}
            <div
              className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-4 sm:px-7"
              style={{ borderBottom: hairline }}
            >
              <div className="font-display text-base font-black text-primary sm:text-lg">
                {t("dashboardPreview.demo.eventTitle")}
              </div>
              <div className="text-[13px] text-[hsl(var(--brown))]">
                {t("dashboardPreview.eventMeta")}
              </div>
            </div>

            {/* Tabs — horizontally scrollable on mobile */}
            <div
              className="hide-scrollbar flex gap-1 overflow-x-auto px-3 py-3 sm:px-5"
              style={{ borderBottom: hairline }}
              role="tablist"
            >
              {TABS.map(({ key, Icon }) => {
                const isActive = key === tab;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => pick(key)}
                    onMouseEnter={() => {
                      if (window.matchMedia("(hover: hover)").matches) pick(key);
                    }}
                    className="relative shrink-0 rounded-full px-3 py-1.5 text-[12.5px] font-bold transition-colors sm:text-[13px]"
                    style={
                      isActive
                        ? {
                            backgroundColor: "hsl(var(--primary))",
                            color: "hsl(var(--primary-foreground))",
                          }
                        : { border: hairline, color: "hsl(var(--primary))" }
                    }
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                      {t(`dashboardPreview.demo.tabs.${key}`)}
                    </span>
                    {isActive && auto && (
                      <motion.span
                        key={`${key}-bar`}
                        className="absolute inset-x-2 bottom-0.5 block h-[2px] origin-left rounded-full"
                        style={{ backgroundColor: "hsl(var(--primary-foreground) / 0.8)" }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Panel body */}
            <div className="px-5 py-5 sm:px-7 sm:py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {tab === "overview" ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {stats.map((s) => (
                        <div
                          key={s.label}
                          className="rounded-md px-4 py-4"
                          style={{ border: hairline, backgroundColor: "hsl(var(--primary) / 0.05)" }}
                        >
                          <div className="font-display text-2xl font-black text-primary tabular-nums">
                            {s.value}
                          </div>
                          <div className="mt-1 text-[12.5px] text-[hsl(var(--brown))]">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {rows(tab).map(([lead, trail], i) => (
                        <Row
                          key={lead}
                          lead={lead}
                          trail={trail}
                          done={i === 0}
                          active={i === 1}
                        />
                      ))}
                      {tab === "invoices" && (
                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between text-[12.5px] font-bold text-[hsl(var(--brown))]">
                            <span>{t("dashboardPreview.demo.budget")}</span>
                            <span className="tabular-nums">65%</span>
                          </div>
                          <div
                            className="h-[6px] w-full overflow-hidden rounded-full"
                            style={{ backgroundColor: "hsl(var(--primary) / 0.12)" }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: "hsl(var(--primary))" }}
                              initial={{ width: 0 }}
                              animate={{ width: "65%" }}
                              transition={{ duration: 0.7, ease: EASE }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Caption for the active tab */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`${tab}-caption`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-4 text-[14px] leading-[1.9] text-[hsl(var(--brown))]"
            >
              {t(`dashboardPreview.demo.captions.${tab}`)}
            </motion.p>
          </AnimatePresence>

          <Link
            to="/planner"
            className="mt-6 inline-flex items-center rounded-full px-6 py-3 text-[14px] font-bold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            {t("dashboardPreview.demo.cta")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
