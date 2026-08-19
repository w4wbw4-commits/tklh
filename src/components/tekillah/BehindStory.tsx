// ---------------------------------------------------------------------------
// "وش وراء الـ10 دقائق؟" — scrollytelling zigzag.
// Desktop (>=1024px): a tall container with a sticky full-height stage. The
// numbered list (01–04) tracks scroll while one mockup panel swaps content.
// Mobile/small tablet: the same four beats stacked vertically, no sticky.
// Every panel carries an explicit "illustrative example" tag. No prices, no
// city names, Latin digits only.
// ---------------------------------------------------------------------------

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import sealLogo from "/tklh-chair-mark.png";
import pkgClassic from "@/assets/packages/pkg-classic-luxury.jpg";
import pkgHotel from "@/assets/packages/pkg-hotel.jpg";
import pkgModern from "@/assets/packages/pkg-modern.jpg";
import pkgFamily from "@/assets/packages/pkg-family.jpg";
import pkgHeritage from "@/assets/packages/pkg-heritage.jpg";
import pkgEconomy from "@/assets/packages/pkg-economy.jpg";

const EASE = [0.22, 1, 0.36, 1] as const;
const HAIR = "1px solid hsl(var(--green) / 0.16)";
const INK = "hsl(var(--green))";
const VENDOR_IMAGES = [pkgClassic, pkgHotel, pkgModern, pkgFamily, pkgHeritage, pkgEconomy];

type Step = { n: string; title: string; desc: string };

/* ------------------------------------------------------------------ chrome */

const PanelFrame = ({
  screen,
  tag,
  children,
}: {
  screen: string;
  tag: string;
  children: React.ReactNode;
}) => (
  <div
    className="flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-card"
    style={{ border: HAIR, boxShadow: "0 18px 44px -30px hsl(var(--green) / 0.45)" }}
  >
    <div
      className="flex items-center gap-2 px-4 py-2.5"
      style={{ borderBottom: HAIR, background: "hsl(var(--green) / 0.04)" }}
    >
      <span className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-2 w-2 rounded-full"
            style={{ background: "hsl(var(--green) / 0.28)" }}
          />
        ))}
      </span>
      <span className="truncate text-[12px] font-bold" style={{ color: "hsl(var(--green) / 0.75)" }}>
        {screen}
      </span>
    </div>

    <div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-5">{children}</div>

    <div className="px-4 pb-3">
      <span
        className="inline-block rounded-full px-2 py-0.5 text-[10.5px] font-bold"
        style={{ border: "1px dashed hsl(var(--gold) / 0.55)", color: "hsl(var(--gold))" }}
      >
        {tag}
      </span>
    </div>
  </div>
);

/* ------------------------------------------------------------------ panels */

const PanelOverview = () => {
  const { t } = useTranslation();
  const tags = t("speed.behind.p1.tags", { returnObjects: true }) as string[];
  const stages = t("speed.behind.p1.stages", { returnObjects: true }) as string[];
  const stats = t("speed.behind.p1.stats", { returnObjects: true }) as { v: string; l: string }[];

  return (
    <PanelFrame screen={t("speed.behind.p1.screen")} tag={t("speed.behind.sample")}>
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((x) => (
            <span
              key={x}
              className="rounded-full px-2.5 py-1 text-[11.5px] font-bold"
              style={{ background: "hsl(var(--green) / 0.08)", color: INK }}
            >
              {x}
            </span>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-x-3 top-[7px] h-px" style={{ background: "hsl(var(--green) / 0.2)" }} />
          <div className="relative flex justify-between gap-1">
            {stages.map((s, i) => {
              const done = i < 2;
              const current = i === 2;
              return (
                <div key={s} className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                  <span
                    className="grid h-[15px] w-[15px] place-items-center rounded-full text-[8px] font-black leading-none"
                    style={{
                      background: done || current ? INK : "hsl(var(--green) / 0.12)",
                      color: done || current ? "hsl(var(--cream))" : "transparent",
                      outline: current ? "3px solid hsl(var(--gold) / 0.45)" : "none",
                    }}
                  >
                    {done ? "✓" : "●"}
                  </span>
                  <span
                    className="text-[10.5px] font-bold leading-tight"
                    style={{ color: current ? INK : "hsl(var(--green) / 0.55)" }}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.l} className="rounded-xl px-2 py-2.5 text-center" style={{ border: HAIR }}>
              <p className="font-display text-[15px] font-black tabular-nums" style={{ color: INK }}>
                {s.v}
              </p>
              <p className="mt-0.5 text-[10.5px] font-bold" style={{ color: "hsl(var(--brown) / 0.75)" }}>
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PanelFrame>
  );
};

const PanelMarket = () => {
  const { t } = useTranslation();
  const filters = t("speed.behind.p2.filters", { returnObjects: true }) as string[];
  const vendors = t("speed.behind.p2.vendors", { returnObjects: true }) as { n: string; t: string }[];

  return (
    <PanelFrame screen={t("speed.behind.p2.screen")} tag={t("speed.behind.sampleNoPrice")}>
      <div className="flex h-full flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f, i) => (
            <span
              key={f}
              className="rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={
                i === 0
                  ? { background: INK, color: "hsl(var(--cream))" }
                  : { border: HAIR, color: "hsl(var(--green) / 0.7)" }
              }
            >
              {f}
            </span>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2">
          {vendors.map((v, i) => (
            <div key={v.n} className="relative overflow-hidden rounded-xl" style={{ border: HAIR }}>
              <img
                src={VENDOR_IMAGES[i % VENDOR_IMAGES.length]}
                alt=""
                loading="lazy"
                className="h-[46px] w-full object-cover sm:h-[58px]"
              />
              {i === 1 && (
                <span
                  className="absolute right-1 top-1 rounded-full px-1.5 py-0.5 text-[8.5px] font-black"
                  style={{ background: "hsl(var(--gold))", color: "hsl(var(--green))" }}
                >
                  {t("speed.behind.p2.best")}
                </span>
              )}
              <div className="px-2 py-1.5">
                <p className="truncate text-[11px] font-black" style={{ color: INK }}>
                  {v.n}
                </p>
                <p className="truncate text-[10px]" style={{ color: "hsl(var(--brown) / 0.7)" }}>
                  {v.t}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PanelFrame>
  );
};

const PanelBooking = () => {
  const { t } = useTranslation();
  const bands = t("speed.behind.p3.bands", { returnObjects: true }) as string[];
  const rows = t("speed.behind.p3.rows", { returnObjects: true }) as { k: string; v: string }[];

  return (
    <PanelFrame screen={t("speed.behind.p3.screen")} tag={t("speed.behind.sample")}>
      <div className="flex h-full flex-col justify-between gap-3">
        <p className="font-display text-[15px] font-black leading-snug" style={{ color: INK }}>
          {t("speed.behind.p3.title")}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {bands.map((b, i) => (
            <span
              key={b}
              className="rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={
                i === 1
                  ? { background: INK, color: "hsl(var(--cream))" }
                  : { border: HAIR, color: "hsl(var(--green) / 0.7)" }
              }
            >
              {b}
            </span>
          ))}
        </div>

        <div className="rounded-xl px-3 py-2" style={{ border: HAIR }}>
          {rows.map((r) => (
            <div key={r.k} className="flex items-center justify-between gap-3 py-1 text-[11.5px]">
              <span style={{ color: "hsl(var(--brown) / 0.75)" }}>{r.k}</span>
              <span className="font-bold" style={{ color: INK }}>
                {r.v}
              </span>
            </div>
          ))}
        </div>

        <div
          className="grid h-11 place-items-center rounded-full text-[13px] font-black"
          style={{ background: INK, color: "hsl(var(--cream))" }}
        >
          {t("speed.behind.p3.cta")}
        </div>
      </div>
    </PanelFrame>
  );
};

const PanelDone = () => {
  const { t } = useTranslation();
  return (
    <PanelFrame screen={t("speed.behind.p4.screen")} tag={t("speed.behind.sample")}>
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <img src={sealLogo} alt="" className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
        <p className="font-display text-[17px] font-black" style={{ color: INK }}>
          {t("speed.behind.p4.title")}
        </p>
        <p className="max-w-[34ch] text-[12.5px] leading-[1.9]" style={{ color: "hsl(var(--brown))" }}>
          {t("speed.behind.p4.line")}
        </p>
      </div>
    </PanelFrame>
  );
};

const PANELS = [PanelOverview, PanelMarket, PanelBooking, PanelDone];

/* -------------------------------------------------------------------- list */

const StepRow = ({
  step,
  active,
  progress,
}: {
  step: Step;
  active: boolean;
  progress: number;
}) => (
  <div className="py-5" style={{ borderTop: HAIR }}>
    <div className="flex items-start gap-4">
      <span
        className="font-display shrink-0 text-2xl font-black leading-none tabular-nums transition-colors duration-500"
        style={{ color: active ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.4)" }}
      >
        {step.n}
      </span>
      <div className="min-w-0">
        <h3
          className="font-display text-lg font-black leading-snug transition-colors duration-500 sm:text-2xl"
          style={{ color: active ? INK : "hsl(var(--green) / 0.4)" }}
        >
          {step.title}
        </h3>
        <p
          className="mt-1.5 max-w-md text-[14px] leading-[1.9] transition-opacity duration-500"
          style={{ color: "hsl(var(--brown))", opacity: active ? 1 : 0.45 }}
        >
          {step.desc}
        </p>
      </div>
    </div>
    <div className="mt-4 h-[2px] w-full overflow-hidden rounded-full" style={{ background: "hsl(var(--green) / 0.1)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.round(progress * 100)}%`,
          background: "hsl(var(--gold))",
          transition: "width 120ms linear",
        }}
      />
    </div>
  </div>
);

/* ----------------------------------------------------------------- section */

export const BehindStory = () => {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const steps = t("speed.behind.steps", { returnObjects: true }) as Step[];
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const [raw, setRaw] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setRaw(v));

  const count = steps.length || 4;
  const active = Math.min(count - 1, Math.floor(raw * count));
  const within = Math.min(1, Math.max(0, raw * count - active));
  const Panel = PANELS[active % PANELS.length];

  return (
    <section className="relative px-5 pt-16 sm:px-8 lg:pt-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display max-w-xl text-balance text-2xl font-black leading-[1.4] text-green sm:text-4xl">
            {t("speed.behind.title")}
          </h2>
        </Reveal>

        {/* ---------- mobile / small tablet: plain vertical sequence ---------- */}
        <div className="mt-8 lg:hidden">
          {steps.map((step, i) => {
            const P = PANELS[i % PANELS.length];
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: EASE }}
                className="py-7"
                style={{ borderTop: HAIR }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="font-display shrink-0 text-2xl font-black leading-none tabular-nums"
                    style={{ color: "hsl(var(--gold))" }}
                  >
                    {step.n}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-black leading-snug text-green">{step.title}</h3>
                    <p className="mt-1.5 text-[14px] leading-[1.9]" style={{ color: "hsl(var(--brown))" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-4 min-h-[300px]">
                  <P />
                </div>
              </motion.div>
            );
          })}
          <div style={{ borderTop: HAIR }} />
        </div>

        {/* ---------- desktop: sticky stage, scroll-linked ---------- */}
        <div ref={trackRef} className="relative mt-10 hidden lg:block" style={{ height: `${count * 100}vh` }}>
          <div className="sticky top-0 flex h-screen items-center">
            <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-12">
              <div>
                {steps.map((step, i) => (
                  <StepRow
                    key={step.n}
                    step={step}
                    active={i === active}
                    progress={i < active ? 1 : i === active ? within : 0}
                  />
                ))}
                <div style={{ borderTop: HAIR }} />
              </div>

              <div className="h-[440px] w-full">
                <motion.div
                  key={active}
                  initial={reduce ? { opacity: 1 } : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="h-full w-full"
                >
                  <Panel />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
