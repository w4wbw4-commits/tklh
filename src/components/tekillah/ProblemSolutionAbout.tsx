// ---------------------------------------------------------------------------
// Two beats, one light ground:
//  1. SpeedSection  — chaos (scattered hand-drawn notes + a wandering dashed
//     line) vs. order (one straight green line, three ticks, a wax seal).
//  2. BehindSection — an editorial list (01–04), each row paired with a thin
//     green line drawing that animates once on scroll.
// No dark panels, no gold, no gradients.
// ---------------------------------------------------------------------------

import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import sealLogo from "@/assets/tklh-chair-mark.png.asset.json";


const EASE = [0.22, 1, 0.36, 1] as const;
const HAIR = "1px solid hsl(var(--green) / 0.18)";
const INK = "hsl(var(--green))";
const FADED = "hsl(var(--green) / 0.35)";

const once = { once: true, margin: "-70px" } as const;

// ============================================================================
// Direct comparison — two columns, same story, scanned in one second.
// Right (RTL first): the traditional road — a dashed wandering line with five
// tilted paper scraps that dries out. Left: the Tklh road — one straight green
// stroke, three ticks, the official chair and a pressed seal.
// ============================================================================
const S_EASE = EASE;

const CARD_TILTS = [-2.6, 2.2, -1.8, 2.6, -2.2];

const TradColumn = () => {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const stations = t("speed.journey.stations", { returnObjects: true }) as string[];
  const T = (d: number) => (reduce ? 0 : d);

  return (
    <div className="relative">
      <div className="flex items-baseline gap-2.5">
        <span
          className="whitespace-nowrap px-2.5 py-1 text-[11px] font-bold sm:text-[12px]"
          style={{
            color: "hsl(var(--brown) / 0.9)",
            border: "1px dashed hsl(var(--brown) / 0.4)",
            borderRadius: 999,
          }}
        >
          {t("speed.traditional.chip")}
        </span>
      </div>
      <p
        className="font-display mt-3 text-2xl font-black leading-none sm:text-3xl"
        style={{ color: "hsl(var(--brown) / 0.85)" }}
      >
        {t("speed.traditional.value")}
      </p>
      <p className="mt-1.5 text-[12.5px] font-semibold sm:text-[13px]" style={{ color: "hsl(var(--brown) / 0.7)" }}>
        {t("speed.journey.tradTag")}
      </p>

      {/* dashed wandering rail + tilted scraps */}
      <div className="relative mt-6 ps-7 sm:ps-9">
        <svg
          viewBox="0 0 40 320"
          preserveAspectRatio="none"
          className="absolute inset-y-0 start-0 h-full w-8 sm:w-10"
          fill="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="cmp-dry" x1="0" y1="0" x2="0" y2="320" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="hsl(var(--brown))" stopOpacity="0.5" />
              <stop offset="0.78" stopColor="hsl(var(--brown))" stopOpacity="0.4" />
              <stop offset="1" stopColor="hsl(var(--brown))" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <motion.path
            d="M20 4 C 34 40, 6 62, 20 98 C 34 134, 6 156, 20 192 C 34 228, 6 250, 20 286 C 26 300, 24 310, 21 318"
            stroke="url(#cmp-dry)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 6"
            initial={{ pathLength: reduce ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={once}
            transition={{ duration: T(1.5), ease: "linear" }}
          />
        </svg>

        <ul className="relative space-y-2.5">
          {stations.map((s, i) => (
            <li key={i} className="flex">
              <motion.span
                initial={{ opacity: reduce ? 1 : 0, x: reduce ? 0 : 10, rotate: CARD_TILTS[i] }}
                whileInView={{ opacity: 1, x: 0, rotate: CARD_TILTS[i] }}
                viewport={once}
                transition={{ duration: T(0.4), ease: S_EASE, delay: T(0.15 + i * 0.12) }}
                className="inline-block px-3 py-2 text-[12.5px] leading-snug sm:text-[13.5px]"
                style={{
                  color: "hsl(var(--brown) / 0.85)",
                  border: "1px solid hsl(var(--brown) / 0.26)",
                  backgroundColor: "hsl(var(--cream))",
                  borderRadius: 3,
                  boxShadow: "2px 2px 0 hsl(var(--brown) / 0.1)",
                }}
              >
                {s}
              </motion.span>
            </li>
          ))}
        </ul>

        {/* the road dries out — never arrives */}
        <motion.p
          initial={{ opacity: reduce ? 1 : 0 }}
          whileInView={{ opacity: 1 }}
          viewport={once}
          transition={{ duration: T(0.5), delay: T(0.9) }}
          className="mt-5 text-[12px] font-semibold sm:text-[12.5px]"
          style={{ color: "hsl(var(--brown) / 0.5)" }}
        >
          {t("speed.traditional.desc")}
        </motion.p>
      </div>
    </div>
  );
};

const TekColumn = () => {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const steps = t("speed.tekillah.points", { returnObjects: true }) as string[];
  const T = (d: number) => (reduce ? 0 : d);

  return (
    <div className="relative">
      <span
        className="inline-block whitespace-nowrap px-2.5 py-1 text-[11px] font-bold sm:text-[12px]"
        style={{
          color: "hsl(var(--cream))",
          backgroundColor: INK,
          borderRadius: 999,
        }}
      >
        {t("speed.tekillah.chip")}
      </span>
      <p className="font-display mt-3 text-2xl font-black leading-none text-green sm:text-3xl">
        {t("speed.tekillah.prefix")} 10 {t("speed.tekillah.unit")}
      </p>
      <p className="mt-1.5 text-[12.5px] font-black sm:text-[13px]" style={{ color: INK }}>
        {t("speed.journey.tekTag")}
      </p>

      {/* one straight green rail + three ticks */}
      <div className="relative mt-6 ps-7 sm:ps-9">
        <motion.span
          initial={{ scaleY: reduce ? 1 : 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={once}
          transition={{ duration: T(0.6), ease: S_EASE, delay: T(0.1) }}
          className="absolute inset-y-1 start-[13px] w-[2px] origin-top sm:start-[17px]"
          style={{ backgroundColor: INK }}
          aria-hidden
        />
        <ul className="relative space-y-4">
          {steps.map((s, i) => (
            <li key={i} className="relative">
              <motion.span
                initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={once}
                transition={{ duration: T(0.3), ease: S_EASE, delay: T(0.45 + i * 0.14) }}
                className="absolute top-[2px] grid h-[18px] w-[18px] place-items-center rounded-full sm:h-5 sm:w-5"
                style={{
                  insetInlineStart: "-1.75rem",
                  backgroundColor: "hsl(var(--cream))",
                  border: `1.6px solid ${INK}`,
                  marginInlineStart: "0.28rem",
                }}
                aria-hidden
              >
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                  <path d="M2.5 6.4 L5 8.8 L9.5 3.6" stroke={INK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.span>
              <motion.p
                initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={once}
                transition={{ duration: T(0.35), ease: S_EASE, delay: T(0.5 + i * 0.14) }}
                className="text-[13px] font-semibold leading-snug sm:text-[14.5px]"
                style={{ color: INK }}
              >
                {s}
              </motion.p>
            </li>
          ))}
        </ul>

        {/* destination: official chair + pressed seal */}
        <div className="mt-6 flex items-center gap-3.5">
          <div className="relative shrink-0">
            <motion.span
              initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 1.15 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={once}
              transition={{ duration: T(0.45), ease: S_EASE, delay: T(0.95) }}
              className="grid h-[74px] w-[74px] place-items-center rounded-full sm:h-[86px] sm:w-[86px]"
              style={{
                backgroundColor: "hsl(var(--cream))",
                border: "1.5px solid hsl(var(--green) / 0.45)",
                boxShadow: "0 0 0 5px hsl(var(--green) / 0.06)",
              }}
            >
              <img
                src={sealLogo.url}
                alt=""
                aria-hidden
                draggable={false}
                className="h-[68%] w-[68%] select-none object-contain"
              />
            </motion.span>
            <motion.span
              initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 1.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={once}
              transition={{ duration: T(0.3), ease: S_EASE, delay: T(1.15) }}
              className="absolute -bottom-1 start-full ms-[-16px] whitespace-nowrap px-2 py-1 text-[10.5px] font-black"
              style={{ color: "hsl(var(--cream))", backgroundColor: INK, borderRadius: 999 }}
            >
              {t("speed.journey.seal")}
            </motion.span>
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-black leading-tight text-green sm:text-xl">
              {t("speed.journey.goal")}
            </p>
            <p className="mt-1 text-[12.5px] font-semibold leading-snug sm:text-[13px]" style={{ color: "hsl(var(--brown) / 0.8)" }}>
              {t("speed.journey.sit")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpeedSection = () => {
  const { t } = useTranslation();

  return (
    <section
      id="speed"
      aria-label={t("speed.ariaLabel")}
      className="bg-paper relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="relative z-10 mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display mx-auto max-w-2xl text-balance text-2xl font-black leading-[1.45] text-green sm:text-4xl">
              {t("speed.title1")} {t("speed.title2")}
            </h2>
          </div>
        </Reveal>

        <div className="mt-9 sm:mt-12" style={{ borderTop: HAIR, paddingTop: "2rem" }}>
          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            <TradColumn />
            <div
              className="border-t pt-8 md:border-t-0 md:border-s md:pt-0 md:ps-12"
              style={{ borderColor: "hsl(var(--green) / 0.18)" }}
            >
              <TekColumn />
            </div>

          </div>
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
                className="py-7"
                style={{ borderTop: HAIR }}
              >
                {/* Mobile: number + title on top, drawing beneath.
                    Desktop: single row with the drawing on the far side. */}
                <div className="flex items-start gap-4 sm:gap-10">
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
                </div>
                <div
                  className="mt-5 flex max-h-[34vh] justify-center sm:hidden"
                  style={{ color: FADED }}
                  aria-hidden
                >
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
