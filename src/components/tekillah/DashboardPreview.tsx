// ---------------------------------------------------------------------------
// DashboardPreview — a compact, floating snapshot of the real customer
// dashboard. It keeps the idea (readiness ring + vendor rows + budget) but
// stays small so it does not dominate the page.
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
  const r = 32;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--green) / 0.14)" strokeWidth="7" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--green))" strokeWidth="7"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (c * READINESS) / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE }}
        />
      </svg>
      <span className="font-display absolute text-base font-black text-primary tabular-nums">
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
      className="px-5 py-10 sm:px-8 sm:py-14"
      style={{ borderTop: "1px solid hsl(var(--green) / 0.35)" }}
    >
      <div className="mx-auto grid max-w-6xl items-start gap-8 md:grid-cols-[0.95fr_1.05fr] md:gap-12">
        {/* Text + callouts */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          <span className="kicker">{t("dashboardPreview.kicker")}</span>
          <h2 className="font-display mt-4 text-balance text-2xl font-black leading-[1.35] text-green sm:text-3xl">
            {t("dashboardPreview.title")}
          </h2>
          <p className="mt-3 max-w-md text-[14px] leading-[1.85] text-[hsl(var(--brown))]">
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
                <span
                  className="h-px w-8 shrink-0"
                  style={{ backgroundColor: i === 1 ? WINE : "hsl(var(--green) / 0.45)" }}
                  aria-hidden
                />
                <span className="text-[13.5px] font-bold text-primary">{line}</span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-7">
            <Link
              to="/planner"
              className="inline-flex items-center rounded-full px-5 py-2.5 text-[13px] font-bold transition-opacity hover:opacity-90"
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
            className="relative overflow-hidden rounded-xl p-4 sm:p-5"
            style={{ border: hairline, backgroundColor: "hsl(var(--cream))" }}
          >
            <img
              src={chairMark.url}
              alt=""
              aria-hidden
              className="pointer-events-none absolute -top-2 end-0 h-20 w-20 object-contain opacity-[0.05]"
              draggable={false}
            />
            <div className="relative flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-primary/55">
                  {t("dashboardPreview.demo.eventTitle")}
                </span>
                <p className="font-display mt-1.5 text-base font-black leading-snug text-primary sm:text-lg">
                  {t("customer.command.countdownLabel", { days: "94" })}
                </p>
                <p className="mt-1 text-[11.5px] text-[hsl(var(--brown))]">
                  {t("customer.command.readiness")}
                </p>
              </div>
              <Ring />
            </div>

            {/* Vendor rows */}
            <div className="mt-4">
              {rows.map(([name, status, ok]) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-3 py-2"
                  style={{ borderTop: hairline }}
                >
                  <span className="truncate text-[12.5px] font-bold text-primary">{name}</span>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold"
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
