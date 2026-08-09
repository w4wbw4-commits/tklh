// ---------------------------------------------------------------------------
// DashboardPreview — one calm, static snapshot of the real customer dashboard
// (readiness ring + countdown + vendor/budget rows) with three line callouts
// pointing at it. No tabs, no autoplay — the depth lives in /dashboard.
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import chairMark from "@/assets/tklh-chair-mark.png.asset.json";

const EASE = [0.22, 1, 0.36, 1] as const;
const hairline = "1px solid hsl(var(--green) / 0.22)";
const WINE = "hsl(var(--wine))";

const READINESS = 68;

const Ring = () => {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-24 w-24 shrink-0 place-items-center">
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
      <span className="font-display absolute text-xl font-black text-primary tabular-nums">
        {READINESS}%
      </span>
    </div>
  );
};

export const DashboardPreview = () => {
  const { t } = useTranslation();
  const callouts = t("dashboardPreview.snapshot.callouts", { returnObjects: true }) as string[];

  const rows: [string, string, boolean][] = [
    [t("dashboardPreview.vendors.venue.name"), t("dashboardPreview.confirmed"), true],
    [t("dashboardPreview.vendors.catering.name"), t("dashboardPreview.needsAction"), false],
    [t("dashboardPreview.vendors.photography.name"), t("dashboardPreview.confirmed"), true],
  ];

  return (
    <section
      id="dashboard"
      className="px-5 py-20 sm:px-8 sm:py-28"
      style={{ borderTop: "1px solid hsl(var(--green) / 0.35)" }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        {/* Text + callouts */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          <span className="kicker">{t("dashboardPreview.kicker")}</span>
          <h2 className="font-display mt-5 text-balance text-2xl font-black leading-[1.4] text-green sm:text-4xl">
            {t("dashboardPreview.title")}
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-[1.95] text-[hsl(var(--brown))]">
            {t("dashboardPreview.subtitle")}
          </p>

          <ul className="mt-8 space-y-4">
            {callouts.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.15 + i * 0.18 }}
                className="flex items-center gap-3"
              >
                {/* Thin leader line pointing toward the snapshot */}
                <span
                  className="h-px w-10 shrink-0"
                  style={{ backgroundColor: i === 1 ? WINE : "hsl(var(--green) / 0.45)" }}
                  aria-hidden
                />
                <span className="text-[14.5px] font-bold text-primary">{line}</span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-9">
            <Link
              to="/planner"
              className="inline-flex items-center rounded-full px-6 py-3 text-[14px] font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }}
            >
              {t("dashboardPreview.snapshot.cta")}
            </Link>
          </div>
        </motion.div>

        {/* The snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          <div
            className="relative overflow-hidden rounded-2xl p-5 sm:p-7"
            style={{ border: hairline, backgroundColor: "hsl(var(--cream))" }}
          >
            <img
              src={chairMark.url}
              alt=""
              aria-hidden
              className="pointer-events-none absolute -top-3 end-1 h-28 w-28 object-contain opacity-[0.05]"
              draggable={false}
            />
            <div className="relative flex items-center justify-between gap-5">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/55">
                  {t("dashboardPreview.demo.eventTitle")}
                </span>
                <p className="font-display mt-2 text-lg font-black leading-snug text-primary sm:text-xl">
                  {t("customer.command.countdownLabel", { days: "94" })}
                </p>
                <p className="mt-1.5 text-[12.5px] text-[hsl(var(--brown))]">
                  {t("customer.command.readiness")}
                </p>
              </div>
              <Ring />
            </div>

            {/* Vendor rows */}
            <div className="mt-6">
              {rows.map(([name, status, ok]) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-3 py-3"
                  style={{ borderTop: hairline }}
                >
                  <span className="truncate text-[13.5px] font-bold text-primary">{name}</span>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-bold"
                    style={
                      ok
                        ? { backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }
                        : { border: `1px solid ${WINE}`, color: WINE }
                    }
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>

            {/* Budget bar */}
            <div className="mt-5 pt-4" style={{ borderTop: hairline }}>
              <div className="flex items-center justify-between text-[12.5px] font-bold text-primary">
                <span>{t("dashboardPreview.demo.budget")}</span>
                <span className="tabular-nums">65%</span>
              </div>
              <div
                className="mt-2 h-[4px] w-full overflow-hidden rounded-full"
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

          <p className="mt-3 text-center text-[12px] font-bold text-primary/55">
            {t("dashboardPreview.snapshot.badge")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
