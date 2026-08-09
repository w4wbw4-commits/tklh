// ---------------------------------------------------------------------------
// Two beats, two structures:
//  1. SpeedSection  — the site's FIRST dark moment: a full-width velvet panel
//     carrying the 6-weeks / 5-minutes contrast through light & dark, not color.
//  2. BehindSection — an editorial list (01–04) split by 1px gold hairlines.
// Content and copy are untouched; only the presentation changed.
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { AnimatedCounter } from "./AnimatedCounter";

const EASE = [0.22, 1, 0.36, 1] as const;

// ============================================================================
// Dark moment #1 — velvet comparison panel
// ============================================================================
const SpeedSection = () => {
  const { t } = useTranslation();
  const tradPoints = t("speed.traditional.points", { returnObjects: true }) as string[];
  const tekPoints = t("speed.tekillah.points", { returnObjects: true }) as string[];

  return (
    <section
      id="speed"
      aria-label={t("speed.ariaLabel")}
      className="bg-velvet relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="relative z-10 mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center">
            <span className="kicker" style={{ color: "hsl(var(--gold))" }}>
              TKLH · EVENT PLANNING
            </span>
            <h2
              className="font-display mx-auto mt-5 max-w-2xl text-balance text-2xl font-black leading-[1.45] sm:text-4xl"
              style={{ color: "hsl(var(--cream))" }}
            >
              {t("speed.title1")} {t("speed.title2")}
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-0">
          {/* Traditional way — faded cream, dashed grey thread */}
          <Reveal>
            <div className="md:pe-12">
              <span
                className="text-[13px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: "hsl(var(--cream) / 0.45)" }}
              >
                {t("speed.traditional.chip")}
              </span>
              <div
                className="font-display mt-4 text-4xl font-black leading-[1.15] sm:text-6xl"
                style={{ color: "hsl(var(--cream) / 0.42)" }}
              >
                {t("speed.traditional.value")}
              </div>
              <p className="mt-3 text-[15px]" style={{ color: "hsl(var(--cream) / 0.4)" }}>
                {t("speed.traditional.desc")}
              </p>
              <div
                className="mt-7 h-px w-full"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, hsl(var(--cream) / 0.3) 0 7px, transparent 7px 15px)",
                }}
              />
              <ul className="mt-6 space-y-2.5 text-[15px]" style={{ color: "hsl(var(--cream) / 0.42)" }}>
                {tradPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Tklh — full cream, gold thread that completes into a wax seal */}
          <Reveal delay={0.15}>
            <div
              className="md:ps-12"
              style={{ borderInlineStart: "1px solid hsl(var(--gold) / 0.45)" }}
            >
              <span className="text-[13px] font-semibold uppercase tracking-[0.24em] text-gold">
                {t("speed.tekillah.chip")}
              </span>
              <div className="mt-4 flex items-baseline gap-3">
                <span
                  className="font-display text-4xl font-black leading-[1.15] tabular-nums sm:text-6xl"
                  style={{ color: "hsl(var(--gold))" }}
                >
                  <AnimatedCounter value={5} />
                </span>
                <span
                  className="font-display text-xl font-bold sm:text-2xl"
                  style={{ color: "hsl(var(--cream))" }}
                >
                  {t("speed.tekillah.unit")}
                </span>
              </div>
              <p className="mt-3 text-[15px] font-bold" style={{ color: "hsl(var(--cream))" }}>
                {t("speed.tekillah.desc")}
              </p>

              {/* the gold thread completing, then the seal impression */}
              <div className="mt-7 flex items-center gap-3">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
                  className="h-px flex-1 origin-left"
                  style={{ background: "hsl(var(--gold))" }}
                />
                <motion.span
                  initial={{ opacity: 0, scale: 1.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease: EASE, delay: 1.2 }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                  style={{
                    backgroundColor: "hsl(var(--green-deep))",
                    border: "1px solid hsl(var(--gold) / 0.7)",
                  }}
                  aria-hidden
                >
                  <span
                    className="font-wordmark text-[11px]"
                    style={{ color: "hsl(var(--gold))" }}
                  >
                    TK
                  </span>
                </motion.span>
              </div>

              <ul className="mt-6 space-y-2.5 text-[15px]" style={{ color: "hsl(var(--cream) / 0.9)" }}>
                {tekPoints.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// Editorial list — "وش وراء الـ5 دقائق؟"  (rows + gold hairlines, no cards)
// ============================================================================
const BehindSection = () => {
  const { t } = useTranslation();
  const tiles = t("speed.tiles", { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <section className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div>
            <span className="kicker">TKLH · EVENT PLANNING</span>
            <h2 className="font-display mt-5 max-w-xl text-balance text-2xl font-black leading-[1.4] text-green sm:text-4xl">
              {t("speed.connector")}
            </h2>
          </div>
        </Reveal>

        <div className="mt-12">
          {tiles.map((tile, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
              className="flex items-start gap-6 py-7 sm:gap-10"
              style={{ borderTop: "1px solid hsl(var(--gold) / 0.4)" }}
            >
              <span
                className="font-display shrink-0 text-3xl font-black leading-none tabular-nums sm:text-5xl"
                style={{ color: "hsl(var(--gold))" }}
              >
                {`0${i + 1}`}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-black leading-snug text-green sm:text-2xl">
                  {tile.title}
                </h3>
                <p className="mt-2 max-w-xl text-[15px] leading-[1.9] text-[hsl(var(--brown))]">
                  {tile.desc}
                </p>
              </div>
            </motion.div>
          ))}
          <div style={{ borderTop: "1px solid hsl(var(--gold) / 0.4)" }} />
        </div>
      </div>
    </section>
  );
};

export const ProblemSolutionAbout = () => (
  <>
    <SpeedSection />
    <BehindSection />
  </>
);
