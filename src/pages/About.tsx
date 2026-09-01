// ---------------------------------------------------------------------------
// /about — "عن منصة تِكله"
// Rebuilt in the "luxury invitation" language: paper cream, velvet green,
// antique-gold hairlines, official chair mark (never drawn in code), no
// sparkle icons, mobile-first spacing and type.
// ---------------------------------------------------------------------------
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarCheck, LayoutDashboard, ShieldCheck, Check } from "lucide-react";
import { Navbar } from "@/components/tekillah/Navbar";
import { ScrollProgress } from "@/components/tekillah/ScrollProgress";
import { Reveal } from "@/components/tekillah/Reveal";
import { ProblemSolutionAbout } from "@/components/tekillah/ProblemSolutionAbout";
import { OccasionsSection } from "@/components/tekillah/OccasionsSection";
import { SEO } from "@/components/SEO";
import chairMark from "/tklh-chair-mark.png";

const Footer = lazy(() =>
  import("@/components/tekillah/Footer").then((m) => ({ default: m.Footer })),
);

const FACILITY_ICONS = [CalendarCheck, LayoutDashboard, ShieldCheck] as const;
const EASE = [0.22, 1, 0.36, 1] as const;

interface FacilityI18n { title: string; desc: string; points: string[] }

const About = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const ar = isAr ? "font-arabic" : "";
  const facilities = t("aboutPage.facilities", { returnObjects: true }) as FacilityI18n[];

  return (
    <main className="min-h-screen bg-paper" dir={isAr ? "rtl" : "ltr"}>
      <SEO
        title={t("aboutPage.seoTitle")}
        description={t("aboutPage.seoDesc")}
        canonical="https://tklh.sa/about"
      />
      <ScrollProgress />
      <Navbar />

      {/* ──────────────── Hero — invitation card ──────────────── */}
      <section className="bg-paper px-5 pb-14 pt-28 sm:px-8 sm:pb-20 sm:pt-40">
        <div
          className="mx-auto max-w-3xl px-5 py-12 text-center sm:px-12 sm:py-16"
          style={{ border: "1px solid hsl(var(--gold) / 0.45)", borderRadius: 6 }}
        >
          <Reveal>
            <img
              src={chairMark}
              alt=""
              aria-hidden
              className="mx-auto mb-6 h-14 w-14 object-contain opacity-85 sm:h-20 sm:w-20"
              draggable={false}
            />

            <p
              className={`text-[11px] font-bold uppercase tracking-[0.28em] sm:text-xs ${ar}`}
              style={{ color: "hsl(var(--gold))" }}
            >
              {t("aboutPage.heroBadge")}
            </p>

            <h1
              className={`mt-4 text-balance font-display text-3xl font-black leading-[1.35] sm:text-5xl md:text-6xl ${ar}`}
              style={{ color: "hsl(var(--green))" }}
            >
              {t("aboutPage.heroTitlePart1")}{" "}
              <span style={{ color: "hsl(var(--green))" }}>{t("aboutPage.heroTitlePart2")}</span>
            </h1>

            <div className="mx-auto mt-7 flex items-center justify-center gap-3" aria-hidden>
              <span className="h-px w-12 sm:w-20" style={{ background: "hsl(var(--gold) / 0.5)" }} />
              <span className="h-1 w-1 rounded-full" style={{ background: "hsl(var(--gold))" }} />
              <span className="h-px w-12 sm:w-20" style={{ background: "hsl(var(--gold) / 0.5)" }} />
            </div>

            <p
              className={`mx-auto mt-7 max-w-2xl text-[15px] leading-[2.05] sm:text-lg md:text-xl ${ar}`}
              style={{ color: "hsl(var(--brown))" }}
            >
              {t("aboutPage.heroIntro")}{" "}
              <span className="font-bold" style={{ color: "hsl(var(--green))" }}>
                {t("aboutPage.heroIntroHighlight")}
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── Speed / Behind story / Occasions (from home) ──────────────── */}
      <ProblemSolutionAbout />
      <OccasionsSection />

      {/* ──────────────── Facilities ──────────────── */}
      <section id="facilities" className="bg-paper px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center">
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.28em] sm:text-xs ${ar}`}
                style={{ color: "hsl(var(--gold))" }}
              >
                {t("aboutPage.facilitiesBadge")}
              </p>
              <h2
                className={`mt-3 text-balance font-display text-2xl font-black leading-[1.4] sm:text-4xl ${ar}`}
                style={{ color: "hsl(var(--green))" }}
              >
                {t("aboutPage.facilitiesTitlePart1")}{" "}
                <span style={{ color: "hsl(var(--gold))" }}>
                  {t("aboutPage.facilitiesTitlePart2")}
                </span>
              </h2>
              <p
                className={`mx-auto mt-4 max-w-2xl text-[15px] leading-[1.95] sm:text-base ${ar}`}
                style={{ color: "hsl(var(--brown-soft))" }}
              >
                {t("aboutPage.facilitiesSubtitle")}
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 md:grid-cols-3">
            {facilities.map((f, i) => {
              const Icon = FACILITY_ICONS[i] ?? CalendarCheck;
              return (
                <Reveal key={i} delay={0.06 + i * 0.08}>
                  <motion.article
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="group h-full px-5 py-6 sm:px-6 sm:py-7"
                    style={{
                      border: "1px solid hsl(var(--gold) / 0.4)",
                      borderRadius: 6,
                      background: "hsl(var(--cream))",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="inline-flex h-11 w-11 items-center justify-center"
                        style={{
                          border: "1px solid hsl(var(--gold) / 0.45)",
                          borderRadius: 4,
                          color: "hsl(var(--gold))",
                        }}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <span
                        className="font-display text-sm font-black tabular-nums"
                        style={{ color: "hsl(var(--gold) / 0.7)" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3
                      className={`mt-5 font-display text-lg font-black leading-snug sm:text-xl ${ar}`}
                      style={{ color: "hsl(var(--green))" }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className={`mt-2.5 text-[14px] leading-[1.9] ${ar}`}
                      style={{ color: "hsl(var(--brown-soft))" }}
                    >
                      {f.desc}
                    </p>

                    <div
                      className="mt-5 h-px w-full"
                      style={{ background: "hsl(var(--gold) / 0.35)" }}
                      aria-hidden
                    />

                    <ul className="mt-4 space-y-2.5">
                      {f.points.map((p, j) => (
                        <li
                          key={j}
                          className={`flex items-center gap-2 text-[13.5px] ${ar}`}
                          style={{ color: "hsl(var(--brown))" }}
                        >
                          <Check
                            className="h-3.5 w-3.5 shrink-0"
                            strokeWidth={2.6}
                            style={{ color: "hsl(var(--gold))" }}
                          />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.article>
                </Reveal>
              );
            })}
          </div>

          {/* CTA */}
          <Reveal delay={0.2}>
            <div className="mt-14 text-center sm:mt-20">
              <p
                className={`font-display text-lg font-black sm:text-2xl ${ar}`}
                style={{ color: "hsl(var(--green))" }}
              >
                {t("aboutPage.ctaTitle")}
              </p>
              <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/planner"
                  className={`inline-flex min-h-[48px] items-center justify-center px-8 text-[15px] font-bold transition-colors ${ar}`}
                  style={{
                    background: "hsl(var(--green))",
                    color: "hsl(var(--cream))",
                    borderRadius: 4,
                  }}
                >
                  {t("aboutPage.ctaPlan")}
                </Link>
                <Link
                  to="/packages"
                  className={`inline-flex min-h-[48px] items-center justify-center px-8 text-[15px] font-bold transition-colors ${ar}`}
                  style={{
                    border: "1px solid hsl(var(--green) / 0.35)",
                    color: "hsl(var(--green))",
                    borderRadius: 4,
                  }}
                >
                  {t("aboutPage.ctaPackages")}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[30vh]" aria-hidden />}>
        <Footer />
      </Suspense>
    </main>
  );
};

export default About;
