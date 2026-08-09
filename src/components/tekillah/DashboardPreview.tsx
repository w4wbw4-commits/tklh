// ---------------------------------------------------------------------------
// DashboardPreview — a compact snapshot of the real customer dashboard.
// The card is now built around a vertical timeline so the section reads as
// "your event journey" at a glance. Readiness ring + budget bar stay as quiet
// summary hints so the card still feels like a dashboard, not a static list.
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import chairMark from "/tklh-chair-mark.png";

const EASE = [0.22, 1, 0.36, 1] as const;
const hairline = "1px solid hsl(var(--green) / 0.22)";
const WINE = "hsl(var(--wine))";
const GOLD = "hsl(var(--gold))";
const GREEN = "hsl(var(--green))";
const CREAM = "hsl(var(--cream))";

const READINESS = 68;

const Ring = () => {
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-14 w-14 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--green) / 0.14)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--green))" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (c * READINESS) / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE }}
        />
      </svg>
      <span className="font-display absolute text-sm font-black text-primary tabular-nums">
        {READINESS}%
      </span>
    </div>
  );
};

export const DashboardPreview = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const callouts = t("dashboardPreview.snapshot.callouts", { returnObjects: true }) as string[];

  const timeline = [
    { key: "venue", state: "done" as const },
    { key: "catering", state: "active" as const },
    { key: "photography", state: "wait" as const },
    { key: "florals", state: "later" as const },
    { key: "night", state: "future" as const },
  ];

  const stateDot = (state: string) => {
    if (state === "done") return { bg: GREEN, border: GREEN, icon: "✓", color: CREAM };
    if (state === "active") return { bg: "transparent", border: GOLD, icon: "•", color: GOLD };
    if (state === "wait") return { bg: "transparent", border: WINE, icon: "!", color: WINE };
    return { bg: "transparent", border: "hsl(var(--green) / 0.25)", icon: "", color: "hsl(var(--green) / 0.35)" };
  };

  return (
    <section
      id="dashboard"
      className="px-5 py-10 sm:px-8 sm:py-14"
      style={{ borderTop: "1px solid hsl(var(--green) / 0.35)" }}
    >
      <div className="mx-auto grid max-w-6xl items-start gap-8 md:grid-cols-[0.95fr_1.05fr] md:gap-12">
        {/* Text + callouts — on mobile the live snapshot leads, so this drops below */}
        <motion.div
          className="order-2 md:order-1"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          <span className="kicker">{t("dashboardPreview.kicker")}</span>
          <h2 className="font-display mt-4 text-balance text-2xl font-black leading-[1.35] text-green sm:text-3xl">
            {t("dashboardPreview.title")}
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-[1.85] text-[hsl(var(--brown))]">
            {t("dashboardPreview.subtitle")}
          </p>

          <ul className="mt-6 space-y-3">
            {callouts.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.15 + i * 0.18 }}
                className="flex items-center gap-3"
              >
                {/* numbered on mobile, hairline pointer on larger screens */}
                <span
                  className="shrink-0 text-[12px] font-black tabular-nums sm:hidden"
                  style={{ color: i === 1 ? WINE : "hsl(var(--green) / 0.6)" }}
                  aria-hidden
                >
                  {`0${i + 1}`}
                </span>
                <span
                  className="hidden h-px w-8 shrink-0 sm:block"
                  style={{ backgroundColor: i === 1 ? WINE : "hsl(var(--green) / 0.45)" }}
                  aria-hidden
                />
                <span className="text-[15px] font-bold text-primary sm:text-[13.5px]">{line}</span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-7">
            <Link
              to="/planner"
              className="inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-[15px] font-bold transition-opacity hover:opacity-90 sm:w-auto sm:py-2.5 sm:text-[13px]"
              style={{ backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }}
            >
              {t("dashboardPreview.snapshot.cta")}
            </Link>
          </div>
        </motion.div>

        {/* The snapshot — timeline-first, and first in the mobile reading order */}
        <motion.div
          className="order-1 md:order-2"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          <div
            className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
            style={{ border: hairline, backgroundColor: "hsl(var(--cream))" }}
          >
            <img
              src={chairMark}
              alt=""
              aria-hidden
              className="pointer-events-none absolute -top-2 end-0 h-24 w-24 object-contain opacity-[0.04]"
              draggable={false}
            />

            {/* Card header */}
            <div className="relative flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-primary/55">
                  {t("dashboardPreview.demo.eventTitle")}
                </span>
                <p className="font-display mt-1 text-lg font-black leading-snug text-primary sm:text-xl">
                  {t("customer.command.countdownLabel", { days: "94" })}
                </p>
                <p className="mt-0.5 text-[11px] text-[hsl(var(--brown))]">
                  {t("customer.command.readiness")}
                </p>
              </div>
              <Ring />
            </div>

            {/* Timeline */}
            <div className="relative mt-5">
              <div
                className="absolute top-2 bottom-2 w-px"
                style={{ backgroundColor: "hsl(var(--green) / 0.18)", [isRtl ? "right" : "left"]: "11px" }}
                aria-hidden
              />
              <ul className="space-y-0">
                {timeline.map(({ key, state }, i) => {
                  const label = t(`dashboardPreview.timeline.${key}.label`);
                  const time = t(`dashboardPreview.timeline.${key}.time`);
                  const dot = stateDot(state);
                  return (
                    <motion.li
                      key={key}
                      initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.1 }}
                      className="relative flex items-start gap-3 py-2.5"
                    >
                      <span
                        className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-black"
                        style={{
                          border: `1.5px solid ${dot.border}`,
                          backgroundColor: dot.bg,
                          color: dot.color,
                        }}
                        aria-hidden
                      >
                        {dot.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="text-[12.5px] font-bold text-primary">{label}</span>
                          <span
                            className="text-[10px] font-bold tabular-nums"
                            style={{ color: state === "active" ? WINE : "hsl(var(--brown))" }}
                          >
                            {time}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            {/* Budget hint */}
            <div className="mt-4 pt-3" style={{ borderTop: hairline }}>
              <div className="flex items-center justify-between text-[11.5px] font-bold text-primary">
                <span>{t("dashboardPreview.demo.budget")}</span>
                <span className="tabular-nums">65%</span>
              </div>
              <div
                className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full"
                style={{ backgroundColor: "hsl(var(--green) / 0.12)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: "hsl(var(--green))" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: "65%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: EASE, delay: 0.3 }}
                />
              </div>
            </div>
          </div>

          <p className="mt-2.5 text-center text-[11px] font-bold text-primary/55">
            {t("dashboardPreview.snapshot.badge")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

