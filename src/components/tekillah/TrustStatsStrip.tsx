// ---------------------------------------------------------------------------
// TrustStatsStrip — real numbers only. Two counters + one narrative card.
// No invented metrics (no client counts, no ratings, no city counts).
// ---------------------------------------------------------------------------
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { AnimatedCounter } from "./AnimatedCounter";

const numberClass =
  "font-display bg-gradient-to-l from-green to-gold bg-clip-text pb-1 text-4xl font-black leading-[1.25] text-transparent sm:text-5xl md:text-6xl";

export const TrustStatsStrip = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const chips = t("trust.vendors.chips", { returnObjects: true }) as string[];

  return (
    <section
      aria-label={t("trust.aria")}
      dir={isAr ? "rtl" : "ltr"}
      className="relative bg-background px-5 py-12 sm:px-8 sm:py-16"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center rounded-full border border-gold/40 bg-cream/80 px-4 py-1.5 text-xs font-bold text-primary-deep backdrop-blur">
              {t("trust.badge")}
            </span>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Registered venues */}
          <Reveal>
            <article className="flex h-full flex-col items-center justify-center rounded-3xl border border-gold/25 bg-cream/70 p-6 text-center shadow-card backdrop-blur">
              <div className={numberClass}>
                <AnimatedCounter value={100} prefix="+" />
              </div>
              <p className={`mt-1 text-sm font-bold text-primary-deep/80 ${isAr ? "font-arabic" : ""}`}>
                {t("trust.halls.label")}
              </p>
            </article>
          </Reveal>

          {/* Service providers + category chips */}
          <Reveal delay={0.1}>
            <article className="flex h-full flex-col items-center justify-center rounded-3xl border border-gold/25 bg-cream/70 p-6 text-center shadow-card backdrop-blur">
              <div className={numberClass}>
                <AnimatedCounter value={80} prefix="+" />
              </div>
              <p className={`mt-1 text-sm font-bold text-primary-deep/80 ${isAr ? "font-arabic" : ""}`}>
                {t("trust.vendors.label")}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {chips.map((c) => (
                  <span
                    key={c}
                    className={`rounded-full border border-primary-deep/15 bg-background/70 px-2.5 py-0.5 text-[11px] font-semibold text-primary-deep/75 ${isAr ? "font-arabic" : ""}`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>

          {/* Narrative card — deliberately number-free */}
          <Reveal delay={0.2}>
            <article className="flex h-full flex-col items-center justify-center rounded-3xl border border-primary-deep/15 bg-primary-deep p-6 text-center shadow-card">
              <p
                className={`text-balance text-lg font-black leading-[1.75] sm:text-xl ${isAr ? "font-arabic" : ""}`}
                style={{ color: "#A7CAA1" }}
              >
                {t("trust.note")}
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
