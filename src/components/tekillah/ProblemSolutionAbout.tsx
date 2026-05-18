// ---------------------------------------------------------------------------
// ProblemSolutionAbout — Unified storytelling flow:
//   1) AboutValueSection — merged "تِكله.. اسم على مسمى" + 4 value tiles
//      with an inline 3-stat strip (10 دقائق / 100% / 50+) replacing the
//      bulky white card.
//   2) SpeedSection — 6 weeks vs 10 minutes comparison (kept, tighter rhythm).
// All visuals use design-system semantic tokens (no hex / hardcoded colors).
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import {
  ShieldCheck, Zap, Heart, Sparkles, Clock, BadgePercent, Users,
  Calculator, Filter, CalendarCheck, Gem, Timer, ListChecks, CheckCircle2,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { Link } from "react-router-dom";
import { AnimatedCounter } from "./AnimatedCounter";
import { ArabicPattern } from "./ArabicPattern";

// ---------- Data ------------------------------------------------------------
const TRUST_STATS = [
  { icon: Clock,       value: 10,  suffix: " دقائق", label: "وقت التخطيط" },
  { icon: BadgePercent, value: 100, suffix: "٪",     label: "شفافية كاملة" },
  { icon: Users,       value: 50,  suffix: "+",      label: "مزود موثق" },
] as const;

const VALUE_TILES = [
  { icon: Calculator,    title: "خطط بذكاء",        desc: "حاسبة ذكية تعطيك ميزانيتك بدقّة، بدون مفاجآت ولا أرقام مخفية." },
  { icon: Filter,        title: "مزودين ثقة",        desc: "اخترنا لكم أفضل المزودين في السعودية — موثقين، مجربين، وما يخيبون." },
  { icon: CalendarCheck, title: "احجز بلمح البصر",   desc: "خلص أمورك بدقائق معدودة، وودع حوسة الاتصالات والمواعيد الطويلة." },
  { icon: Gem,           title: "شبيك لبيك",          desc: "الخدمات اللي تبيها بين يديك، وبالسعر اللي يناسبك — كل شي على كيفك." },
] as const;

const VALUE_CHIPS = [
  { icon: ShieldCheck, label: "شفافية كاملة" },
  { icon: Zap,         label: "سرعة وسهولة" },
  { icon: Heart,       label: "خيارات متنوعة تليق بليلة عمرك" },
] as const;

// ============================================================================
// Section A — Unified About + Value
// ============================================================================
const AboutValueSection = () => (
  <section
    id="about"
    className="relative overflow-hidden bg-hero-warm px-6 py-20 sm:px-8 sm:py-24"
  >
    <ArabicPattern opacity={0.04} />

    <div className="relative mx-auto max-w-4xl">
      <Reveal>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/80 px-4 py-1.5 text-sm font-bold text-foreground backdrop-blur">
            <Sparkles className="h-4 w-4 text-gold" strokeWidth={2} />
            تعرف على تِكله
          </span>

          <h2 className="mt-6 font-arabic text-5xl font-black leading-[1.6] text-green md:text-6xl lg:text-7xl">
            تِكله..{" "}
            <span className="inline-block bg-gradient-to-l from-green to-gold bg-clip-text pb-2 leading-[1.6] text-transparent">
              اسم على مسمى
            </span>
          </h2>

          <div className="mx-auto mt-6 mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-gold/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="h-px w-16 bg-gold/60" />
          </div>

          <p className="mx-auto max-w-3xl font-arabic text-xl font-medium leading-[1.95] text-foreground/85 sm:text-2xl">
            شِلنا عنك هم التخطيط والبحث والحوسة. تِكله تكفل لك كل شي:
            من القاعة، للتصوير، للكوش، للضيافة — كل شي بسعر واضح وضمان أكيد.
          </p>

          <p className="mx-auto mt-4 max-w-2xl font-arabic leading-[1.95] text-foreground/65 sm:text-lg">
            اخترنا اسم «تِكله» من «الاتكال» و«الثقة» — لأن لحظة الفرح ما
            تستاهل صداع التخطيط.
          </p>
        </div>
      </Reveal>

      {/* (Trust stats strip removed — duplicated below in the Speed section) */}

      {/* Chips + CTAs */}
      <Reveal delay={0.18}>
        <div className="mt-8 flex flex-col items-center gap-5">
          <div className="flex flex-wrap justify-center gap-2.5">
            {VALUE_CHIPS.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.span
                  key={i}
                  whileHover={{ y: -2 }}
                  className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-cream/80 px-3.5 py-1.5 text-xs font-bold text-foreground backdrop-blur transition-colors hover:border-gold hover:bg-cream sm:text-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
                  {v.label}
                </motion.span>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/#wizard"
              className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-gold bg-green px-7 py-3.5 font-arabic text-sm font-bold text-gold shadow-deep transition-all hover:-translate-y-0.5 hover:bg-green-mid hover:shadow-[0_25px_70px_-20px_hsl(var(--gold)/0.55)] sm:text-base"
            >
              <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
              ابدأ التخطيط الحين
            </Link>
            <a
              href="#speed"
              className="inline-flex items-center justify-center rounded-full border border-green/30 bg-cream/70 px-7 py-3.5 font-arabic text-sm font-bold text-green backdrop-blur transition-colors hover:bg-cream sm:text-base"
            >
              ليش تِكله؟
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

// ============================================================================
// Section B — Speed Comparison + 4 Value Tiles below (creative cascade)
// ============================================================================
const SpeedSection = () => (
  <section
    id="speed"
    aria-label="مقارنة الوقت بين الطريقة التقليدية وتِكله"
    className="relative overflow-hidden bg-background px-6 py-16 sm:px-8 sm:py-20"
  >
    <ArabicPattern opacity={0.035} />

    <div className="relative mx-auto max-w-5xl">
      <Reveal>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/80 px-4 py-1.5 text-sm font-bold text-foreground backdrop-blur">
            <Timer className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
            الفرق اللي بيغير مزاجك
          </span>
          <h2 className="mt-5 font-arabic text-4xl font-black leading-[1.6] text-green md:text-5xl">
            من ٦ أسابيع حوسة..{" "}
            <span className="inline-block bg-gradient-to-l from-green to-gold bg-clip-text pb-2 leading-[1.6] text-transparent">
              لـ ١٠ دقائق وأنت مخلص
            </span>
          </h2>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {/* Legacy */}
        <Reveal>
          <div className="relative h-full overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.05] p-7 shadow-card">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.06] to-transparent" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/40 px-3 py-1 text-xs font-bold text-foreground/60">
                <ListChecks className="h-3.5 w-3.5" />
                الطريقة التقليدية
              </div>
              <div className="mt-5 font-arabic text-5xl font-black text-foreground/70 sm:text-6xl">
                ٦ أسابيع
              </div>
              <p className="mt-2 font-arabic text-sm text-foreground/55">
                من البحث، الاتصالات، والمتابعة
              </p>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, hsl(var(--foreground) / 0.25) 0 10px, transparent 10px 18px)",
                  }}
                />
              </div>
              <ul className="mt-6 space-y-2.5 font-arabic text-sm text-foreground/65">
                <li>• مكالمات وتفاوض مع كل مزود</li>
                <li>• مقارنات يدوية وأسعار متغيرة</li>
                <li>• ضياع وقت ومجهود بدون ضمان</li>
              </ul>
            </div>
          </div>
        </Reveal>

        {/* Tikkilah */}
        <Reveal delay={0.12}>
          <div className="group relative h-full overflow-hidden rounded-3xl border-2 border-gold/50 bg-cream p-7 shadow-deep">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-green/15 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs font-bold text-green">
                <Zap className="h-3.5 w-3.5 text-gold" strokeWidth={2.5} />
                مع تِكله
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-arabic text-5xl font-black leading-none text-green sm:text-6xl">
                  <AnimatedCounter value={10} arabicDigits />
                </span>
                <span className="font-arabic text-2xl font-bold text-gold">دقائق</span>
              </div>
              <p className="mt-2 font-arabic text-sm font-bold text-green/80">
                وأنت مخلص — حجز مكتمل بضمان
              </p>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-green/10">
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-l from-green via-gold to-gold shadow-[0_0_18px_hsl(var(--gold)/0.6)]"
                />
              </div>
              <ul className="mt-6 space-y-2.5 font-arabic text-sm text-foreground/80">
                {[
                  "اختر ميزانيتك وعدد ضيوفك",
                  "اقتراحات ذكية ومزودون مفلترين",
                  "احجز كل شيء بضغطة، بسعر واضح",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" strokeWidth={2.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── Cascade connector: hairline + label that ties the comparison
          to the supporting "ليش تِكله أسرع" tiles below. */}
      <Reveal delay={0.2}>
        <div className="relative mx-auto mt-14 flex flex-col items-center">
          <span className="h-12 w-px bg-gradient-to-b from-transparent via-gold/40 to-gold" />
          <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream px-4 py-1.5 text-xs font-bold text-green shadow-soft sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
            وش وراء الـ١٠ دقائق؟
          </span>
        </div>
      </Reveal>

      {/* ── 4 creative value tiles in a 2x2 grid below the comparison ── */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {VALUE_TILES.map((tile, i) => {
          const Icon = tile.icon;
          // Stagger entry from alternating sides for a "cascade" rhythm.
          const fromRight = i % 2 === 0;
          return (
            <Reveal key={i} delay={0.05 + i * 0.08}>
              <motion.div
                initial={{ opacity: 0, x: fromRight ? 24 : -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-gold/20 bg-cream/70 p-5 shadow-card backdrop-blur-md transition-all duration-500 hover:border-gold/55 hover:bg-cream hover:shadow-[0_22px_50px_-20px_hsl(var(--gold)/0.45)]"
              >
                {/* Number badge — adds creative ranking */}
                <span className="absolute left-4 top-4 font-wordmark text-xs font-black text-gold/60">
                  ٠{i + 1}
                </span>

                {/* Gold sheen sweep */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                <motion.span
                  whileHover={{ rotate: -6, scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 240, damping: 14 }}
                  className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/35 bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-soft"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </motion.span>

                <div className="relative min-w-0 flex-1">
                  <h3 className="font-arabic text-lg font-black text-green sm:text-xl">
                    {tile.title}
                  </h3>
                  <p className="mt-1.5 font-arabic text-sm leading-[1.8] text-foreground/70">
                    {tile.desc}
                  </p>
                  <div className="mt-3 h-0.5 w-10 rounded-full bg-gradient-to-l from-green to-gold transition-all duration-500 group-hover:w-20" />
                </div>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

// ---------- Public composite -------------------------------------------------
export const ProblemSolutionAbout = () => (
  <>
    <AboutValueSection />
    <SpeedSection />
  </>
);

