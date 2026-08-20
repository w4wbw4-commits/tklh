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
import { BehindStory } from "./BehindStory";
import sealLogo from "@/assets/tklh-chair.png";



const EASE = [0.22, 1, 0.36, 1] as const;
const HAIR = "1px solid hsl(var(--green) / 0.18)";
const INK = "hsl(var(--green))";


const once = { once: true, margin: "-70px" } as const;

// ============================================================================
// Direct comparison — two columns, same story, scanned in one second.
// Right (RTL first): the traditional road — a dashed wandering line with five
// tilted paper scraps that dries out. Left: the Tklh road — one straight green
// stroke, three ticks, the official chair and a pressed seal.
// ============================================================================
const S_EASE = EASE;

type Row = { trad: string; tek: string };

const SpeedSection = () => {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const rows = (t("speed.rows", { returnObjects: true }) as Row[]) || [];
  const T = (d: number) => (reduce ? 0 : d);

  return (
    <section
      id="speed"
      aria-label={t("speed.ariaLabel")}
      className="bg-paper relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="relative z-10 mx-auto max-w-4xl">
        <h2
          className="font-display font-black text-green text-[22px] sm:text-4xl"
          style={{
            lineHeight: 1.35,
            maxWidth: "24ch",
            marginInline: "auto",
            textWrap: "balance",
            textAlign: "center",
          }}
        >
          {t("speed.title1")}
          <br />
          {t("speed.title2")}
        </h2>

        {/* Column heads */}
        <div className="mt-9 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-6">
          <div className="text-center">
            <span
              className="inline-block whitespace-nowrap px-3 py-1 text-[11.5px] font-bold sm:text-[12.5px]"
              style={{
                color: "hsl(var(--brown) / 0.9)",
                border: "1px dashed hsl(var(--brown) / 0.45)",
                borderRadius: 999,
              }}
            >
              {t("speed.traditional.chip")}
            </span>
          </div>
          <div className="text-center">
            <span
              className="inline-block whitespace-nowrap px-3 py-1 text-[11.5px] font-bold sm:text-[12.5px]"
              style={{ color: "hsl(var(--cream))", backgroundColor: INK, borderRadius: 999 }}
            >
              {t("speed.tekillah.chip")}
            </span>
          </div>
        </div>

        {/* Paired rows */}
        <ul className="mt-5 space-y-2.5 sm:mt-7 sm:space-y-3">
          {rows.map((r, i) => (
            <li key={i} className="grid grid-cols-2 items-stretch gap-3 sm:gap-6">
              <motion.div
                initial={{ opacity: reduce ? 1 : 0, x: reduce ? 0 : 10, rotate: reduce ? 0 : -1.4 }}
                whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                viewport={once}
                transition={{ duration: T(0.4), ease: S_EASE, delay: T(0.06 * i) }}
                className="flex items-center px-3 py-2.5 text-[13px] font-semibold sm:text-[14.5px]"
                style={{
                  color: "hsl(var(--brown) / 0.9)",
                  border: "1px solid hsl(var(--brown) / 0.24)",
                  backgroundColor: "hsl(var(--cream))",
                  borderRadius: 4,
                  lineHeight: 1.8,
                  boxShadow: "2px 2px 0 hsl(var(--brown) / 0.1)",
                }}
              >
                {r.trad}
              </motion.div>
              <motion.div
                initial={{ opacity: reduce ? 1 : 0, x: reduce ? 0 : -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={once}
                transition={{ duration: T(0.4), ease: S_EASE, delay: T(0.1 + 0.06 * i) }}
                className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-semibold sm:text-[14.5px]"
                style={{
                  color: INK,
                  border: `1px solid hsl(var(--green) / 0.3)`,
                  backgroundColor: "hsl(var(--green) / 0.05)",
                  borderRadius: 4,
                  lineHeight: 1.8,
                }}
              >
                <motion.svg
                  viewBox="0 0 12 12"
                  className="h-3 w-3 shrink-0"
                  fill="none"
                  aria-hidden
                  initial={{ scale: reduce ? 1 : 0.4, opacity: reduce ? 1 : 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={once}
                  transition={{ duration: T(0.3), ease: S_EASE, delay: T(0.2 + 0.06 * i) }}
                >
                  <path d="M2.5 6.4 L5 8.8 L9.5 3.6" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
                <span>{r.tek}</span>
              </motion.div>
            </li>
          ))}
        </ul>

        {/* Animated rails: a drying dashed road vs. one straight green stroke */}
        <div className="mt-6 grid grid-cols-2 items-center gap-3 sm:mt-8 sm:gap-6" aria-hidden>
          <svg viewBox="0 0 200 24" preserveAspectRatio="none" className="h-6 w-full" fill="none">
            <defs>
              <linearGradient id="cmp-dry" x1="200" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="hsl(var(--brown))" stopOpacity="0.55" />
                <stop offset="0.72" stopColor="hsl(var(--brown))" stopOpacity="0.4" />
                <stop offset="1" stopColor="hsl(var(--brown))" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <motion.path
              d="M196 12 L166 4 L136 20 L106 4 L76 20 L46 4 L16 16"
              stroke="url(#cmp-dry)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="7 7"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: reduce ? 1 : 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={once}
              transition={{ duration: T(1.1), ease: "linear" }}
            />
          </svg>
          <div className="flex items-center gap-2">
            <motion.span
              initial={{ scaleX: reduce ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={once}
              transition={{ duration: T(0.6), ease: S_EASE }}
              className="h-[2.5px] flex-1 origin-right"
              style={{ backgroundColor: INK }}
            />
            <motion.span
              initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 1.2 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={once}
              transition={{ duration: T(0.35), ease: S_EASE, delay: T(0.45) }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full sm:h-14 sm:w-14"
              style={{
                backgroundColor: "hsl(var(--cream))",
                border: "1.5px solid hsl(var(--green) / 0.45)",
                boxShadow: "0 0 0 5px hsl(var(--green) / 0.06)",
              }}
            >
              <img
                src={sealLogo}
                alt=""
                draggable={false}
                className="h-[68%] w-[68%] select-none object-contain"
              />
            </motion.span>
          </div>
        </div>


        {/* The two numbers, once */}
        <div
          className="mt-7 grid grid-cols-2 gap-3 pt-6 sm:mt-9 sm:gap-6"
          style={{ borderTop: HAIR }}
        >
          <p
            className="font-display text-center text-[24px] font-black sm:text-3xl"
            style={{ color: "hsl(var(--brown) / 0.9)", lineHeight: 1.3 }}
          >
            {t("speed.traditional.value")}
          </p>
          <p
            className="font-display text-center text-[24px] font-black text-green sm:text-3xl"
            style={{ lineHeight: 1.3 }}
          >
            {t("speed.tekillah.value")}
          </p>
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

export const ProblemSolutionAbout = () => (
  <>
    <SpeedSection />
    <BehindStory />
  </>
);
