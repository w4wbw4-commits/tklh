// ---------------------------------------------------------------------------
// /about — "عن منصة تِكله"
// Premium standalone page detailing platform identity and digital facilities.
// Uses the project's semantic tokens (green / gold / cream) and the same
// motion + Arabic-pattern language as the home page so it feels native.
// ---------------------------------------------------------------------------
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  CalendarCheck,
  LayoutDashboard,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/tekillah/Navbar";
import { ScrollProgress } from "@/components/tekillah/ScrollProgress";
import { ArabicPattern } from "@/components/tekillah/ArabicPattern";
import { Reveal } from "@/components/tekillah/Reveal";
import { SketchSectionDivider } from "@/components/tekillah/SketchArt";
import { SEO } from "@/components/SEO";

const Footer = lazy(() =>
  import("@/components/tekillah/Footer").then((m) => ({ default: m.Footer })),
);

const FACILITY_ICONS = [CalendarCheck, LayoutDashboard, ShieldCheck] as const;

interface FacilityI18n { title: string; desc: string; points: string[] }

const About = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const facilities = t("aboutPage.facilities", { returnObjects: true }) as FacilityI18n[];
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title={t("aboutPage.seoTitle")}
        description={t("aboutPage.seoDesc")}
        canonical="https://tklh.sa/about"
      />
      <ScrollProgress />
      <Navbar />

      {/* ──────────────── Hero ──────────────── */}
      <section className="relative overflow-hidden bg-hero-warm px-6 pb-16 pt-36 sm:px-8 sm:pb-20 sm:pt-44">
        <ArabicPattern opacity={0.05} />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--gold)/0.35), transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/80 px-4 py-1.5 text-sm font-bold text-foreground backdrop-blur">
              <Sparkles className="h-4 w-4 text-gold" strokeWidth={2} />
              من نحن
            </span>

            <h1 className="mt-6 font-arabic text-5xl font-black leading-[1.3] text-green md:text-6xl lg:text-7xl">
              عن منصة{" "}
              <span className="inline-block bg-gradient-to-l from-green to-gold bg-clip-text leading-[1.3] text-transparent">
                تِكله
              </span>
            </h1>

            <div className="mx-auto mt-6 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-gold/60" />
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="h-px w-16 bg-gold/60" />
            </div>

            <p className="mx-auto mt-8 max-w-3xl font-arabic text-lg leading-[2] text-foreground/85 sm:text-xl md:text-2xl">
              تِكله هي منصتك الذكية الموحدة الشاملة لتنظيم وتنسيق وإدارة كافة
              الفعاليات والمناسبات، من المؤتمرات الرسمية الكبرى إلى حفلات الزفاف
              والمناسبات الشخصية{" "}
              <span className="font-black text-green">
                في مكان واحد وبأقل مجهود
              </span>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto -mt-4 mb-2 flex max-w-3xl items-center justify-center px-6">
        <SketchSectionDivider className="h-10 w-full opacity-70" />
      </div>

      {/* ──────────────── Facilities ──────────────── */}
      <section
        id="facilities"
        className="relative overflow-hidden bg-background px-6 py-20 sm:px-8 sm:py-24"
      >
        <ArabicPattern opacity={0.035} />

        <div className="relative mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/80 px-4 py-1.5 text-sm font-bold text-foreground backdrop-blur">
                <Sparkles className="h-4 w-4 text-gold" strokeWidth={2} />
                التسهيلات والمميزات
              </span>
              <h2 className="mt-5 font-arabic text-4xl font-black leading-[1.4] text-green md:text-5xl">
                كل ما تحتاجه{" "}
                <span className="inline-block bg-gradient-to-l from-green to-gold bg-clip-text leading-[1.4] text-transparent">
                  تحت سقف واحد
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl font-arabic leading-[1.95] text-foreground/65 sm:text-lg">
                تجربة رقمية متكاملة مصممة بعناية لتمنحك الراحة، الشفافية،
                والثقة في كل خطوة.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FACILITIES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={i} delay={0.08 + i * 0.1}>
                  <motion.article
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="group relative h-full overflow-hidden rounded-3xl border-2 border-gold/25 bg-cream/80 p-7 shadow-card backdrop-blur-md transition-all duration-500 hover:border-gold/70 hover:bg-cream hover:shadow-[0_25px_60px_-20px_hsl(var(--gold)/0.45)]"
                  >
                    {/* Gold sheen sweep */}
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                    {/* Corner glow */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-50 blur-3xl"
                      style={{
                        background:
                          "radial-gradient(circle, hsl(var(--gold)/0.45), transparent 70%)",
                      }}
                    />

                    <div className="relative">
                      <span className="absolute left-1 top-1 font-wordmark text-xs font-black text-gold/60">
                        ٠{i + 1}
                      </span>

                      <motion.span
                        whileHover={{ rotate: -6, scale: 1.08 }}
                        transition={{ type: "spring", stiffness: 240, damping: 14 }}
                        className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/25 to-gold/5 text-gold shadow-soft"
                      >
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                      </motion.span>

                      <h3 className="mt-5 font-arabic text-xl font-black text-green sm:text-2xl">
                        {f.title}
                      </h3>
                      <p className="mt-3 font-arabic text-[15px] leading-[1.9] text-foreground/75">
                        {f.desc}
                      </p>

                      <div className="mt-5 h-px w-full bg-gradient-to-l from-transparent via-gold/40 to-transparent" />

                      <ul className="mt-5 space-y-2.5">
                        {f.points.map((p, j) => (
                          <li
                            key={j}
                            className="flex items-center gap-2 font-arabic text-sm text-foreground/80"
                          >
                            <Check
                              className="h-4 w-4 shrink-0 text-gold"
                              strokeWidth={2.6}
                            />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 h-0.5 w-12 rounded-full bg-gradient-to-l from-green to-gold transition-all duration-500 group-hover:w-24" />
                    </div>
                  </motion.article>
                </Reveal>
              );
            })}
          </div>

          {/* CTA */}
          <Reveal delay={0.3}>
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <p className="font-arabic text-lg font-bold text-green sm:text-xl">
                جاهز تجرب الفرق بنفسك؟
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/planner"
                  className="group inline-flex items-center gap-2 rounded-full border-2 border-gold bg-green px-8 py-3.5 font-arabic text-base font-bold text-gold shadow-deep transition-all hover:-translate-y-0.5 hover:bg-green-mid hover:shadow-[0_25px_70px_-20px_hsl(var(--gold)/0.55)]"
                >
                  <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  ابدأ التخطيط الآن
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </Link>
                <Link
                  to="/packages"
                  className="inline-flex items-center justify-center rounded-full border border-green/30 bg-cream/80 px-7 py-3.5 font-arabic text-base font-bold text-green backdrop-blur transition-colors hover:bg-cream"
                >
                  استعرض الباقات
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
