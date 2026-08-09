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
// Journey map — one start, two roads, one destination (the official chair).
// The traditional road wanders, stumbles at five stations and dries out before
// arriving. The Tklh road is one clean green stroke that reaches the chair and
// presses a seal. Timing itself tells the story: ~4s vs ~1.2s.
// ============================================================================
type Pt = [number, number];

interface Geo {
  w: number;
  h: number;
  start: Pt;
  trad: string;
  tradNodes: Pt[];
  tradCards: Pt[];
  tradTag: Pt;
  tekTag: Pt;
  tek: string;
  tekNodes: Pt[];
  tekLabels: Pt[];
  labelAlign: "center" | "start";
  chair: Pt;
  goal: Pt;
  sit: Pt;
  chairSize: number;
}

const DESKTOP: Geo = {
  w: 1000,
  h: 500,
  start: [930, 258],
  trad:
    "M930 258 C 926 190, 908 122, 858 118 C 808 114, 782 182, 732 184 C 682 186, 672 80, 622 76 C 572 72, 546 184, 491 184 C 436 184, 424 76, 374 76 C 324 76, 308 172, 258 174 C 226 175, 206 158, 190 138",
  tradNodes: [
    [858, 118],
    [732, 184],
    [622, 76],
    [491, 184],
    [374, 76],
  ],
  tradCards: [
    [846, 46],
    [688, 246],
    [622, 14],
    [455, 246],
    [374, 14],
  ],
  tradTag: [560, 300],
  tekTag: [560, 340],
  tek: "M930 258 C 926 316, 910 374, 860 376 L 152 376",
  tekNodes: [
    [730, 376],
    [520, 376],
    [320, 376],
  ],
  tekLabels: [
    [730, 428],
    [520, 428],
    [320, 428],
  ],
  labelAlign: "center",
  chair: [86, 376],
  goal: [86, 300],
  sit: [86, 452],
  chairSize: 92,
};

const MOBILE: Geo = {
  w: 360,
  h: 1100,
  start: [180, 30],
  trad:
    "M180 30 C 180 72, 252 84, 252 122 C 252 158, 96 162, 96 202 C 96 242, 252 246, 252 286 C 252 326, 96 330, 96 370 C 96 410, 212 414, 214 450 C 216 472, 202 488, 188 502",
  tradNodes: [
    [252, 122],
    [96, 202],
    [252, 286],
    [96, 370],
    [214, 450],
  ],
  tradCards: [
    [108, 122],
    [250, 202],
    [108, 286],
    [250, 370],
    [104, 450],
  ],
  tradTag: [180, 548],
  tekTag: [180, 596],
  tek: "M180 640 L 180 928",
  tekNodes: [
    [180, 700],
    [180, 780],
    [180, 860],
  ],
  tekLabels: [
    [200, 700],
    [200, 780],
    [200, 860],
  ],
  labelAlign: "start",
  chair: [180, 1010],
  goal: [180, 956],
  sit: [180, 1074],
  chairSize: 84,
};

// choreography (seconds)
const TRAD_DUR = 4;
const TEK_AT = TRAD_DUR + 0.5;
const TEK_DUR = 1.2;

const CARD_TILTS = [-3.4, 2.6, -2, 3.2, -2.8];

const JourneyMap = ({ geo, id }: { geo: Geo; id: string }) => {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const stations = t("speed.journey.stations", { returnObjects: true }) as string[];
  const steps = t("speed.tekillah.points", { returnObjects: true }) as string[];
  const pos = (p: Pt) => ({ left: `${(p[0] / geo.w) * 100}%`, top: `${(p[1] / geo.h) * 100}%` });
  const T = (d: number) => (reduce ? 0 : d);

  return (
    <div className="relative w-full" style={{ aspectRatio: `${geo.w} / ${geo.h}` }}>
      <svg
        viewBox={`0 0 ${geo.w} ${geo.h}`}
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient
            id={`${id}-dry`}
            gradientUnits="userSpaceOnUse"
            x1={geo.start[0]}
            y1={geo.start[1]}
            x2={geo.tradNodes[geo.tradNodes.length - 1][0]}
            y2={geo.tradNodes[geo.tradNodes.length - 1][1]}
          >
            <stop offset="0" stopColor="hsl(var(--brown))" stopOpacity="0.5" />
            <stop offset="0.72" stopColor="hsl(var(--brown))" stopOpacity="0.42" />
            <stop offset="1" stopColor="hsl(var(--brown))" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* --- traditional road: one continuous dashed meander that dries out */}
        <motion.path
          d={geo.trad}
          stroke={`url(#${id}-dry)`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="7 7"
          initial={{ pathLength: reduce ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={once}
          transition={{ duration: T(TRAD_DUR), ease: "linear" }}
        />
        {geo.tradNodes.map((n, i) => (
          <motion.circle
            key={i}
            cx={n[0]}
            cy={n[1]}
            r="5"
            fill="hsl(var(--cream))"
            stroke="hsl(var(--brown) / 0.5)"
            strokeWidth="1.6"
            initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={once}
            transition={{ duration: T(0.3), ease: EASE, delay: T(0.5 + i * 0.68) }}
          />
        ))}

        {/* --- Tklh road: one clean stroke straight to the chair */}
        <motion.path
          d={geo.tek}
          stroke={INK}
          strokeWidth="2.4"
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={once}
          transition={{ duration: T(TEK_DUR), ease: EASE, delay: T(TEK_AT) }}
        />
        {geo.tekNodes.map((n, i) => (
          <motion.g
            key={i}
            initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={once}
            transition={{ duration: T(0.3), ease: EASE, delay: T(TEK_AT + 0.35 + i * 0.3) }}
            style={{ transformOrigin: `${n[0]}px ${n[1]}px` }}
          >
            <circle cx={n[0]} cy={n[1]} r="9" fill="hsl(var(--cream))" stroke={INK} strokeWidth="1.6" />
            <path
              d={`M${n[0] - 4.2} ${n[1] + 0.4} L${n[0] - 1.2} ${n[1] + 3.4} L${n[0] + 4.4} ${n[1] - 3.2}`}
              stroke={INK}
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        ))}
      </svg>

      {/* ---- start capsule -------------------------------------------------- */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pos(geo.start)}>
        <motion.span
          initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={once}
          transition={{ duration: T(0.5), ease: EASE }}
          className="block whitespace-nowrap px-3.5 py-2 text-[12px] font-bold sm:text-[13px]"
          style={{
            color: INK,
            border: "1.5px solid hsl(var(--green) / 0.5)",
            backgroundColor: "hsl(var(--cream))",
            borderRadius: 999,
          }}
        >
          {t("speed.journey.start")}
        </motion.span>
      </div>

      {/* ---- five pain stations, as tilted paper scraps ---------------------- */}
      {stations.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 10, rotate: CARD_TILTS[i] }}
          whileInView={
            reduce
              ? { opacity: 1, y: 0, rotate: CARD_TILTS[i] }
              : { opacity: 1, y: 0, rotate: [CARD_TILTS[i] * 2, CARD_TILTS[i] - 1.5, CARD_TILTS[i]] }
          }
          viewport={once}
          transition={{ duration: T(0.5), ease: EASE, delay: T(0.55 + i * 0.68) }}
          className="absolute w-[8.5rem] -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 text-center text-[11.5px] leading-snug sm:w-[9.5rem] sm:px-3 sm:py-2 sm:text-[13px]"
          style={{
            ...pos(geo.tradCards[i]),
            color: "hsl(var(--brown) / 0.85)",
            border: "1px solid hsl(var(--brown) / 0.28)",
            backgroundColor: "hsl(var(--cream))",
            borderRadius: 3,
            boxShadow: "2px 2px 0 hsl(var(--brown) / 0.12)",
          }}
        >
          {s}
        </motion.div>
      ))}

      {/* ---- floating tags --------------------------------------------------- */}
      <motion.span
        initial={{ opacity: reduce ? 1 : 0 }}
        whileInView={{ opacity: 1 }}
        viewport={once}
        transition={{ duration: T(0.5), delay: T(TRAD_DUR - 0.4) }}
        className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[11.5px] font-semibold sm:text-[13px]"
        style={{ ...pos(geo.tradTag), color: "hsl(var(--brown) / 0.75)" }}
      >
        {t("speed.journey.tradTag")}
      </motion.span>
      <motion.span
        initial={{ opacity: reduce ? 1 : 0 }}
        whileInView={{ opacity: 1 }}
        viewport={once}
        transition={{ duration: T(0.5), delay: T(TEK_AT) }}
        className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[12px] font-black sm:text-[14px]"
        style={{ ...pos(geo.tekTag), color: INK }}
      >
        {t("speed.journey.tekTag")}
      </motion.span>

      {/* ---- three clean steps ---------------------------------------------- */}
      {steps.map((s, i) => (
        <motion.span
          key={i}
          initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={once}
          transition={{ duration: T(0.4), ease: EASE, delay: T(TEK_AT + 0.4 + i * 0.3) }}
          className={`absolute block w-[9rem] text-[11.5px] font-semibold leading-snug sm:w-[10.5rem] sm:text-[13px] ${
            geo.labelAlign === "center" ? "-translate-x-1/2 text-center" : "text-start"
          } -translate-y-1/2`}
          style={{ ...pos(geo.tekLabels[i]), color: INK }}
        >
          {s}
        </motion.span>
      ))}

      {/* ---- destination: goal word + official chair + seal + closing line -- */}
      <motion.span
        initial={{ opacity: reduce ? 1 : 0 }}
        whileInView={{ opacity: 1 }}
        viewport={once}
        transition={{ duration: T(0.5), delay: T(TEK_AT + TEK_DUR - 0.2) }}
        className="font-display absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-base font-black sm:text-xl"
        style={{ ...pos(geo.goal), color: INK }}
      >
        {t("speed.journey.goal")}
      </motion.span>

      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pos(geo.chair)}>
        <div className="relative">
          <motion.span
            initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 1.2 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={once}
            transition={{ duration: T(0.5), ease: EASE, delay: T(TEK_AT + TEK_DUR - 0.1) }}
            className="grid place-items-center rounded-full"
            style={{
              height: geo.chairSize,
              width: geo.chairSize,
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
              className="h-[70%] w-[70%] select-none object-contain"
            />
          </motion.span>

          {/* pressed wax seal */}
          <motion.span
            initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 1.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={once}
            transition={{ duration: T(0.35), ease: EASE, delay: T(TEK_AT + TEK_DUR + 0.15) }}
            className="absolute -bottom-2 start-full ms-[-14px] whitespace-nowrap px-2 py-1 text-[10.5px] font-black sm:text-[11.5px]"
            style={{
              color: "hsl(var(--cream))",
              backgroundColor: INK,
              borderRadius: 999,
            }}
          >
            {t("speed.journey.seal")}
          </motion.span>
        </div>
      </div>

      <motion.span
        initial={{ opacity: reduce ? 1 : 0 }}
        whileInView={{ opacity: 1 }}
        viewport={once}
        transition={{ duration: T(0.5), delay: T(TEK_AT + TEK_DUR + 0.3) }}
        className="absolute w-[11rem] -translate-x-1/2 -translate-y-1/2 text-center text-[11.5px] font-semibold leading-snug sm:w-[13rem] sm:text-[13px]"
        style={{ ...pos(geo.sit), color: "hsl(var(--brown) / 0.8)" }}
      >
        {t("speed.journey.sit")}
      </motion.span>
    </div>
  );
};

const SpeedSection = () => {
  const { t } = useTranslation();

  return (
    <section
      id="speed"
      aria-label={t("speed.ariaLabel")}
      className="bg-paper relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="relative z-10 mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display mx-auto max-w-2xl text-balance text-2xl font-black leading-[1.45] text-green sm:text-4xl">
              {t("speed.title1")} {t("speed.title2")}
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 sm:mt-14" style={{ borderTop: HAIR, paddingTop: "2.5rem" }}>
          <div className="hidden md:block">
            <JourneyMap geo={DESKTOP} id="journey-d" />
          </div>
          <div className="md:hidden">
            <JourneyMap geo={MOBILE} id="journey-m" />
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
