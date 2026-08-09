// ---------------------------------------------------------------------------
// Two beats, one light ground:
//  1. SpeedSection  — chaos (scattered hand-drawn notes + a wandering dashed
//     line) vs. order (one straight green line, three ticks, a wax seal).
//  2. BehindSection — an editorial list (01–04), each row paired with a thin
//     green line drawing that animates once on scroll.
// No dark panels, no gold, no gradients.
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import sealLogo from "@/assets/tklh-chair-mark.png.asset.json";


const EASE = [0.22, 1, 0.36, 1] as const;
const HAIR = "1px solid hsl(var(--green) / 0.18)";
const INK = "hsl(var(--green))";
const FADED = "hsl(var(--green) / 0.35)";

const once = { once: true, margin: "-70px" } as const;

// ============================================================================
// Comparison — chaos vs. order, both on paper
// ============================================================================
const SpeedSection = () => {
  const { t } = useTranslation();
  const tradPoints = t("speed.traditional.points", { returnObjects: true }) as string[];
  const tekPoints = t("speed.tekillah.points", { returnObjects: true }) as string[];

  // scattered paper scraps — deliberately unaligned
  const scraps = tradPoints.map((text, i) => ({
    text,
    rotate: [-4.5, 3.2, -2.1][i % 3],
    x: [0, 26, 10][i % 3],
    y: [0, -6, 8][i % 3],
  }));

  return (
    <section
      id="speed"
      aria-label={t("speed.ariaLabel")}
      className="bg-paper relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="relative z-10 mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display mx-auto mt-5 max-w-2xl text-balance text-2xl font-black leading-[1.45] text-green sm:text-4xl">
              {t("speed.title1")} {t("speed.title2")}
            </h2>
          </div>
        </Reveal>

        <div
          className="mt-14 grid gap-14 md:grid-cols-2 md:gap-0"
          style={{ borderTop: HAIR, paddingTop: "3rem" }}
        >
          {/* ---- Chaos side ---------------------------------------------- */}
          <Reveal>
            <div className="md:pe-12">
              <span
                className="text-[13px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: "hsl(var(--brown) / 0.75)" }}
              >
                {t("speed.traditional.chip")}
              </span>
              <div
                className="font-display mt-4 pb-1 text-4xl font-black leading-[1.45] sm:text-6xl"
                style={{ color: "hsl(var(--brown) / 0.8)" }}
              >
                {t("speed.traditional.value")}
              </div>

              <p className="mt-3 text-[15px]" style={{ color: "hsl(var(--brown) / 0.7)" }}>
                {t("speed.traditional.desc")}
              </p>

              {/* zigzag thread that climbs up and down until it reaches the goal */}
              <svg
                viewBox="0 0 320 40"
                className="mt-7 h-10 w-full"
                fill="none"
                aria-hidden
              >
                <motion.path
                  d="M4 32 L44 8 L84 32 L124 8 L164 32 L204 8 L244 32 L284 8 L312 20"
                  stroke="hsl(var(--brown) / 0.45)"
                  strokeWidth="1.5"
                  strokeDasharray="5 6"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={once}
                  transition={{ duration: 1.6, ease: "linear" }}
                />
                <motion.circle
                  cx="313"
                  cy="20"
                  r="3"
                  fill="hsl(var(--brown) / 0.5)"
                  initial={{ opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={once}
                  transition={{ duration: 0.35, ease: EASE, delay: 1.6 }}
                />
              </svg>


              {/* paper scraps, stacked untidily */}
              <div className="mt-6 space-y-3">
                {scraps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12, rotate: s.rotate * 2 }}
                    whileInView={{ opacity: 1, y: 0, rotate: s.rotate }}
                    viewport={once}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.15 * i }}
                    className="max-w-[19rem] px-4 py-3 text-[15px]"
                    style={{
                      marginInlineStart: s.x,
                      marginBlockStart: s.y,
                      color: "hsl(var(--brown) / 0.8)",
                      border: "1px solid hsl(var(--brown) / 0.3)",
                      backgroundColor: "hsl(var(--cream))",
                      borderRadius: 4,
                    }}
                  >
                    {s.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ---- Order side --------------------------------------------- */}
          <Reveal delay={0.15}>
            <div className="md:ps-12" style={{ borderInlineStart: HAIR }}>
              <span
                className="text-[13px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: INK }}
              >
                {t("speed.tekillah.chip")}
              </span>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3">
                <span
                  className="font-display text-3xl font-black leading-[1.15] sm:text-5xl"
                  style={{ color: INK }}
                >
                  {t("speed.tekillah.prefix")} 10
                </span>
                <span className="font-display text-xl font-bold sm:text-2xl" style={{ color: INK }}>
                  {t("speed.tekillah.unit")}
                </span>
              </div>
              <p className="mt-3 text-[15px] font-bold" style={{ color: INK }}>
                {t("speed.tekillah.desc")}
              </p>

              {/* one straight green line drawing itself */}
              <div className="mt-7 flex items-center gap-3">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={once}
                  transition={{ duration: 1.1, ease: EASE }}
                  className="h-px flex-1 origin-left"
                  style={{ background: "hsl(var(--green) / 0.55)" }}
                />
                {/* official Tklh chair mark, pressed once — larger and clearer */}
                <motion.span
                  initial={{ opacity: 0, scale: 1.25 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={once}
                  transition={{ duration: 0.5, ease: EASE, delay: 1.15 }}
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full shadow-sm"
                  style={{
                    backgroundColor: "hsl(var(--cream))",
                    border: "1.5px solid hsl(var(--green) / 0.45)",
                    boxShadow: "0 0 0 4px hsl(var(--green) / 0.06)",
                  }}
                  aria-hidden
                >
                  <img
                    src={sealLogo.url}
                    alt=""
                    className="h-10 w-auto select-none object-contain"
                    draggable={false}
                    style={{ filter: "drop-shadow(0 1px 0 hsl(var(--green) / 0.08))" }}
                  />
                </motion.span>

              </div>

              {/* three clean steps, ticked in sequence */}
              <ul className="mt-7 space-y-4">
                {tekPoints.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px]" style={{ color: INK }}>
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="10" stroke="hsl(var(--green) / 0.3)" strokeWidth="1.2" />
                      <motion.path
                        d="M7.5 12.4 L10.8 15.5 L16.5 9"
                        stroke={INK}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={once}
                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.35 + i * 0.28 }}
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
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
// Line drawings — one stroke weight, drawn once on scroll
// ============================================================================
const draw = (delay = 0, duration = 0.9) => ({
  initial: { pathLength: 0, opacity: 0.15 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: once,
  transition: { duration, ease: "easeInOut" as const, delay },
});

const S = { stroke: INK, strokeWidth: 1.4, fill: "none", strokeLinecap: "round" as const };

const BudgetSketch = () => (
  <svg viewBox="0 0 96 72" className="h-16 w-24" fill="none" aria-hidden>
    <motion.rect x="8" y="12" width="80" height="48" rx="5" {...S} {...draw(0, 0.8)} />
    <motion.line x1="18" y1="44" x2="78" y2="44" {...S} {...draw(0.4, 0.5)} />
    <motion.circle cx="34" cy="44" r="4.5" {...S} {...draw(0.7, 0.35)} />
    <motion.path d="M22 26 h30" {...S} {...draw(0.9, 0.4)} />
  </svg>
);

const VendorSketch = () => (
  <svg viewBox="0 0 96 72" className="h-16 w-24" fill="none" aria-hidden>
    <motion.rect x="10" y="14" width="76" height="44" rx="5" {...S} {...draw(0, 0.8)} />
    <motion.path d="M20 28 h22 M20 38 h30" {...S} {...draw(0.4, 0.5)} />
    <motion.circle
      cx="68"
      cy="40"
      r="11"
      {...S}
      initial={{ scale: 1.5, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={once}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.9 }}
      style={{ transformOrigin: "68px 40px" }}
    />
    <motion.path
      d="M63 40 l4 4 l7 -8"
      {...S}
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={once}
      transition={{ duration: 0.3, delay: 1.2 }}
    />
  </svg>
);

const BookSketch = () => (
  <svg viewBox="0 0 96 72" className="h-16 w-24" fill="none" aria-hidden>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <motion.line x1="34" y1={22 + i * 15} x2="82" y2={22 + i * 15} {...S} {...draw(i * 0.15, 0.45)} />
        <motion.path
          d={`M14 ${22 + i * 15} l4 4 l7 -8`}
          {...S}
          {...draw(0.5 + i * 0.22, 0.3)}
        />
      </g>
    ))}
  </svg>
);

const ToggleSketch = () => (
  <svg viewBox="0 0 96 72" className="h-16 w-24" fill="none" aria-hidden>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <motion.rect x="20" y={14 + i * 16} width="42" height="13" rx="6.5" {...S} {...draw(i * 0.12, 0.5)} />
        <motion.circle
          cx={30}
          cy={20.5 + i * 16}
          r="4"
          {...S}
          initial={{ cx: 30, opacity: 0 }}
          whileInView={{ cx: 52, opacity: 1 }}
          viewport={once}
          transition={{ duration: 0.4, ease: "easeInOut", delay: 0.45 + i * 0.25 }}
        />
      </g>
    ))}
  </svg>
);

const SKETCHES = [BudgetSketch, VendorSketch, BookSketch, ToggleSketch];

// ============================================================================
// Editorial list — "وش وراء الـ10 دقائق؟"
// ============================================================================
const BehindSection = () => {
  const { t } = useTranslation();
  const tiles = t("speed.tiles", { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <section className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div>
            <h2 className="font-display mt-5 max-w-xl text-balance text-2xl font-black leading-[1.4] text-green sm:text-4xl">
              {t("speed.connector")}
            </h2>
          </div>
        </Reveal>

        <div className="mt-12">
          {tiles.map((tile, i) => {
            const Sketch = SKETCHES[i % SKETCHES.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={once}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
                className="flex items-start gap-5 py-7 sm:gap-10"
                style={{ borderTop: HAIR }}
              >
                <span
                  className="font-display shrink-0 text-3xl font-black leading-none tabular-nums sm:text-5xl"
                  style={{ color: INK }}
                >
                  {`0${i + 1}`}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-black leading-snug text-green sm:text-2xl">
                    {tile.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-[15px] leading-[1.9]" style={{ color: "hsl(var(--brown))" }}>
                    {tile.desc}
                  </p>
                </div>
                <div className="hidden shrink-0 sm:block" style={{ color: FADED }}>
                  <Sketch />
                </div>
              </motion.div>
            );
          })}
          <div style={{ borderTop: HAIR }} />
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
