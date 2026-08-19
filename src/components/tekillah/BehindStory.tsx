// ---------------------------------------------------------------------------
// "وش وراء الـ10 دقائق؟" — quiet vertical list with hairline dividers.
// Each step is a single open row: a line-art icon, title + description, and
// a large step number. Clean, invitation-like, easy to scan.
// ---------------------------------------------------------------------------

import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";

const INK = "#163726";
const HAIR = "1px solid hsl(var(--green) / 0.16)";

type Step = { n: string; title: string; desc: string };

const StepIcon = ({ index }: { index: number }) => {
  const stroke = { stroke: INK, strokeWidth: 1.5, fill: "none", strokeLinecap: "round" as const };

  switch (index) {
    case 0:
      // slider / smart control
      return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden>
          <rect x="6" y="10" width="36" height="28" rx="6" {...stroke} />
          <line x1="10" y1="20" x2="38" y2="20" {...stroke} />
          <line x1="10" y1="28" x2="38" y2="28" {...stroke} />
          <circle cx="22" cy="28" r="3" {...stroke} />
        </svg>
      );
    case 1:
      // list with checkmark
      return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden>
          <rect x="6" y="8" width="36" height="32" rx="6" {...stroke} />
          <line x1="14" y1="18" x2="30" y2="18" {...stroke} />
          <line x1="14" y1="26" x2="26" y2="26" {...stroke} />
          <path d="M28 30 l4 4 l8 -9" {...stroke} />
        </svg>
      );
    case 2:
      // checklist
      return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden>
          <line x1="16" y1="12" x2="40" y2="12" {...stroke} />
          <line x1="16" y1="22" x2="40" y2="22" {...stroke} />
          <line x1="16" y1="32" x2="40" y2="32" {...stroke} />
          <path d="M8 13 l3 3 l5 -6" {...stroke} />
          <path d="M8 23 l3 3 l5 -6" {...stroke} />
          <path d="M8 33 l3 3 l5 -6" {...stroke} />
        </svg>
      );
    case 3:
      // stacked toggles
      return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden>
          <rect x="8" y="10" width="32" height="10" rx="5" {...stroke} />
          <circle cx="16" cy="15" r="3" {...stroke} />
          <rect x="8" y="24" width="32" height="10" rx="5" {...stroke} />
          <circle cx="16" cy="29" r="3" {...stroke} />
        </svg>
      );
    default:
      return null;
  }
};

export const BehindStory = () => {
  const { t } = useTranslation();
  const steps = t("speed.behind.steps", { returnObjects: true }) as Step[];

  return (
    <section className="relative bg-cream px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="font-display mb-10 text-right text-2xl font-black leading-[1.3] text-green sm:mb-14 sm:text-4xl">
            {t("speed.behind.title")}
          </h2>
        </Reveal>

        <div className="flex flex-col">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className="group"
              style={{ borderTop: i === 0 ? HAIR : undefined, borderBottom: HAIR }}
            >
              <div className="flex items-center gap-4 py-7 sm:gap-6 sm:py-9">
                <div className="shrink-0 text-green/80 transition-colors group-hover:text-green">
                  <StepIcon index={i} />
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <h3 className="font-display text-lg font-black leading-snug text-green sm:text-xl">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-[1.8] text-brown sm:text-[15px]">
                    {step.desc}
                  </p>
                </div>

                <span className="font-display shrink-0 text-3xl font-black leading-none tabular-nums text-green sm:text-5xl">
                  {step.n}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
