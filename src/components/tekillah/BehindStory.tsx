// ---------------------------------------------------------------------------
// "وش وراء الـ10 دقائق؟" — zigzag story.
// All four panels stay open at once and alternate side to side (right/left)
// as the visitor scrolls. Each panel mirrors a real screen from the product
// with approximate numbers, and carries an explicit "illustrative example" tag.
// Provider cards are intentionally anonymous (no names, no readable images) so
// the shape reads as a real marketplace without looking AI-generated.
// ---------------------------------------------------------------------------

import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import sealLogo from "/tklh-chair-mark.png";

const EASE = [0.22, 1, 0.36, 1] as const;
const HAIR = "1px solid hsl(var(--green) / 0.16)";
const INK = "hsl(var(--green))";

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

/** Mirrors the real customer dashboard: tiles + vertical mini-timeline. */
const PanelOverview = () => {
  const { t } = useTranslation();
  const tags = t("speed.behind.p1.tags", { returnObjects: true }) as string[];
  const stages = t("speed.behind.p1.stages", { returnObjects: true }) as string[];
  const stats = t("speed.behind.p1.stats", { returnObjects: true }) as { v: string; l: string }[];

  return (
    <PanelFrame screen={t("speed.behind.p1.screen")} tag={t("speed.behind.sample")}>
      <div className="flex h-full flex-col gap-3">
        {/* greeting + planning progress, same as the real dashboard header */}
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-[14px] font-black" style={{ color: INK }}>
            {t("speed.behind.p1.greet")}
          </p>
          <span className="text-[10.5px] font-bold" style={{ color: "hsl(var(--gold))" }}>
            {t("speed.behind.p1.progressL")} · {t("speed.behind.p1.progressV")}
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: "hsl(var(--green) / 0.12)" }}
          aria-hidden
        >
          <span
            className="block h-full rounded-full"
            style={{ width: "65%", background: "hsl(var(--green))" }}
          />
        </div>

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

        {/* vertical mini-timeline, same language as the real dashboard */}
        <div className="relative min-h-0 flex-1 ps-4">
          <span
            className="absolute bottom-2 top-2 w-px"
            style={{ background: "hsl(var(--green) / 0.18)", insetInlineStart: "5px" }}
            aria-hidden
          />
          <div className="flex h-full flex-col justify-between gap-1.5">
            {stages.map((s, i) => {
              const done = i < 2;
              const current = i === 2;
              return (
                <div key={s} className="relative flex items-center gap-2.5">
                  <span
                    className="absolute grid h-[11px] w-[11px] place-items-center rounded-full text-[7px] font-black leading-none"
                    style={{
                      insetInlineStart: "-16px",
                      background: done || current ? INK : "hsl(var(--green) / 0.14)",
                      color: done || current ? "hsl(var(--cream))" : "transparent",
                      outline: current ? "3px solid hsl(var(--gold) / 0.4)" : "none",
                    }}
                  >
                    {done ? "✓" : ""}
                  </span>
                  <span
                    className="text-[11.5px] font-bold"
                    style={{ color: current ? INK : "hsl(var(--green) / 0.55)" }}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PanelFrame>
  );
};

/* simple category glyphs — flat squares, brand colours, no vendor identity */
const CAT_ICONS: Record<string, JSX.Element> = {
  venue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M3 20h18M5 20V9l7-5 7 5v11M10 20v-5h4v5" />
    </svg>
  ),
  photo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M3 8.5h3l1.5-2h9L18 8.5h3v11H3z" />
      <circle cx="12" cy="14" r="3.2" />
    </svg>
  ),
  decor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M12 21c0-5 0-7 0-9" />
      <path d="M12 12c-3 0-5-2-5-4.5S9 3 12 3s5 2 5 4.5S15 12 12 12Z" />
      <path d="M8 21h8" />
    </svg>
  ),
  coffee: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
      <path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16M4 21h13" />
    </svg>
  ),
  band: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="7" cy="17" r="2.6" />
      <circle cx="17" cy="15" r="2.6" />
      <path d="M9.6 17V7l10-2v10" />
    </svg>
  ),
  invite: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M3 6h18v12H3z" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
};

const CAT_TINT = ["--green", "--wine", "--gold", "--brown", "--green", "--wine"];

/** Marketplace: verified categories — flat coloured tiles, no vendor identity. */
const PanelMarket = () => {
  const { t } = useTranslation();
  const filters = t("speed.behind.p2.filters", { returnObjects: true }) as string[];
  const cats = t("speed.behind.p2.cats", { returnObjects: true }) as { l: string; i: string }[];

  return (
    <PanelFrame screen={t("speed.behind.p2.screen")} tag={t("speed.behind.sampleNoPrice")}>
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-[14px] font-black" style={{ color: INK }}>
            {t("speed.behind.p2.title")}
          </p>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-black"
            style={{ background: "hsl(var(--gold))", color: "hsl(var(--green))" }}
          >
            ✓ {t("speed.behind.p2.verified")}
          </span>
        </div>

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
          {cats.map((c, i) => {
            const tint = CAT_TINT[i % CAT_TINT.length];
            return (
              <div
                key={c.l}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl px-1.5 py-2 text-center"
                style={{
                  border: `1px solid hsl(var(${tint}) / 0.2)`,
                  background: `hsl(var(${tint}) / 0.06)`,
                }}
              >
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg"
                  style={{ background: `hsl(var(${tint}) / 0.12)`, color: `hsl(var(${tint}))` }}
                  aria-hidden
                >
                  <span className="block h-[18px] w-[18px] [&>svg]:h-full [&>svg]:w-full">{CAT_ICONS[c.i]}</span>
                </span>
                <span
                  className="text-[10px] font-bold leading-tight"
                  style={{ color: `hsl(var(${tint}))` }}
                >
                  {c.l}
                </span>
              </div>
            );
          })}
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

/* ----------------------------------------------------------------- section */

export const BehindStory = () => {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const steps = t("speed.behind.steps", { returnObjects: true }) as Step[];

  return (
    <section className="relative px-5 pt-16 sm:px-8 lg:pt-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display max-w-xl text-balance text-2xl font-black leading-[1.4] text-green sm:text-4xl">
            {t("speed.behind.title")}
          </h2>
        </Reveal>

        {/* zigzag: every beat is an open card, alternating side to side */}
        <div className="mt-8 flex flex-col gap-10 sm:mt-12 lg:gap-16">
          {steps.map((step, i) => {
            const P = PANELS[i % PANELS.length];
            const flip = i % 2 === 1;
            return (
              <motion.div
                key={step.n}
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: EASE }}
                className="grid items-center gap-6 lg:grid-cols-2 lg:gap-14"
              >
                <div className={flip ? "lg:order-2" : "lg:order-1"}>
                  <div className="flex items-start gap-4">
                    <span
                      className="font-display shrink-0 text-3xl font-black leading-none tabular-nums sm:text-4xl"
                      style={{ color: "hsl(var(--gold))" }}
                    >
                      {step.n}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-black leading-snug text-green sm:text-2xl">
                        {step.title}
                      </h3>
                      <p
                        className="mt-2 max-w-md text-[14px] leading-[1.9]"
                        style={{ color: "hsl(var(--brown))" }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`h-[330px] w-full sm:h-[380px] ${flip ? "lg:order-1" : "lg:order-2"}`}
                >
                  <P />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
