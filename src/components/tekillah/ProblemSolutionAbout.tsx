// ---------------------------------------------------------------------------
// ProblemSolutionAbout — two cohesive luxury sections on the home page:
//   1) AboutSection — "تِكله.. اسم على مسمّى" storytelling + trust factors
//   2) ValueSection — "ليلتك عرسك.. وش تبي أكثر؟" four glassy benefit cards
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

// ============================================================================
// Section A — About + Trust Factors (merges image_5 storytelling + image_6 numbers)
// ============================================================================
const TRUST_FACTORS = [
  {
    icon: Clock,
    value: 10,
    suffix: " دقائق",
    arabicDigits: true,
    label: "متوسط وقت التخطيط مع تِكله",
  },
  {
    icon: BadgePercent,
    value: 100,
    suffix: "٪",
    arabicDigits: true,
    label: "أسعار شفافة بدون مفاجآت",
  },
  {
    icon: Users,
    value: 50,
    suffix: "+",
    arabicDigits: true,
    label: "مزوّد خدمة موثّق في الرياض",
  },
] as const;

const VALUES = [
  { icon: ShieldCheck, label: "شفافية كاملة" },
  { icon: Zap, label: "سرعة وسهولة" },
  { icon: Heart, label: "تجربة سعودية أصيلة" },
] as const;

const AboutSection = () => (
  <section
    id="about"
    className="relative overflow-hidden bg-hero-warm px-6 py-24 sm:px-8 sm:py-28"
  >
    {/* Subtle Najdi pattern overlay */}
    <ArabicPattern opacity={0.04} />

    <div className="relative mx-auto max-w-6xl">
      <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
        {/* Right column (RTL) — text */}
        <Reveal className="md:col-span-7">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/80 px-4 py-1.5 text-sm font-bold text-foreground backdrop-blur">
              <Sparkles className="h-4 w-4 text-gold" strokeWidth={2} />
              تعرّف على تِكله
            </span>

            <h2 className="mt-6 font-arabic text-5xl font-black leading-[1.1] text-green md:text-7xl">
              تِكله..{" "}
              <span className="bg-gradient-to-l from-green to-green-mid bg-clip-text text-transparent">
                اسم على مسمّى
              </span>
            </h2>

            {/* Hairline divider */}
            <div className="mt-7 mb-7 flex items-center gap-3">
              <span className="h-px w-16 bg-gold/60" />
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            </div>

            <p className="mt-2 font-arabic text-xl font-medium leading-[2] text-foreground/85 sm:text-2xl">
              شِلنا عنك همّ التخطيط والبحث والحوسة. تِكله تكفل لك كل شي:
              من القاعة، للتصوير، للكوش، للضيافة — كل شي بسعر واضح وضمان أكيد.
              أنت بس عِش اللحظة.. و«تِكله» تكفل لك الباقي.
            </p>

            <p className="mt-5 font-arabic leading-[2] text-foreground/65 sm:text-lg">
              اخترنا اسم «تِكله» من «الاتكال» و«الثقة»؛ لأنّنا نؤمن إن لحظة الفرح
              ما تستاهل صداع التخطيط. منصّة سعودية تجمع بين ذكاء التخطيط وفنّ
              التنفيذ — تختار ميزانيتك، نقترح لك الأنسب، وتلقى أفضل المزوّدين.
            </p>

            {/* Values chips */}
            <div className="mt-8 flex flex-wrap gap-3">
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.span
                    key={i}
                    whileHover={{ y: -2 }}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-cream/80 px-4 py-2 text-sm font-bold text-foreground backdrop-blur transition-colors hover:border-gold hover:bg-cream"
                  >
                    <Icon className="h-4 w-4 text-gold" strokeWidth={2} />
                    {v.label}
                  </motion.span>
                );
              })}
            </div>

            {/* CTAs — Deep Green / Gold scheme */}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/#wizard"
                className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-gold bg-green px-8 py-4 font-arabic text-base font-bold text-gold shadow-deep transition-all hover:-translate-y-0.5 hover:bg-green-mid hover:shadow-[0_25px_70px_-20px_hsl(var(--gold)/0.55)]"
              >
                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                ابدأ التخطيط الحين
              </Link>
              <a
                href="#value"
                className="inline-flex items-center justify-center rounded-full border border-green/30 bg-cream/70 px-8 py-4 font-arabic text-base font-bold text-green backdrop-blur transition-colors hover:bg-cream"
              >
                ليش تِكله؟
              </a>
            </div>
          </div>
        </Reveal>

        {/* Left column — Trust Factors stack (image_6 redesigned) */}
        <Reveal delay={0.15} className="md:col-span-5">
          <div className="relative rounded-[2rem] border border-gold/25 bg-cream/85 p-8 shadow-deep backdrop-blur-md">
            {/* Soft gold corner glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />

            <div className="relative space-y-7">
              {TRUST_FACTORS.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="font-arabic text-5xl font-black leading-none text-green">
                        <AnimatedCounter
                          value={f.value}
                          suffix={f.suffix}
                          arabicDigits={f.arabicDigits}
                        />
                      </div>
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                    </div>
                    <div className="mt-2 font-arabic text-sm leading-relaxed text-foreground/65">
                      {f.label}
                    </div>
                    {i < TRUST_FACTORS.length - 1 && (
                      <div className="mt-6 h-px bg-gradient-to-l from-transparent via-gold/30 to-transparent" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

// ============================================================================
// Section B — Value Proposition (image_7 reimagined)
//   Title: "ليلتك عرسك.. وش تبي أكثر؟"
//   4 glassy cards with Najdi-gold hover glow
// ============================================================================
const VALUE_CARDS = [
  {
    icon: Calculator,
    title: "خطّط بذكاء",
    desc: "خطّط بمزاج رايق. حاسبة ذكية تعطيك ميزانيتك بالريال، بدون مفاجآت ولا أرقام مخفية.",
  },
  {
    icon: Filter,
    title: "مزوّدون نخبة",
    desc: "مزوّدون.. كلهم «نخبة». ما نتعامل إلا مع الأفضل، ونضمن لك جودة تليق بك.",
  },
  {
    icon: CalendarCheck,
    title: "احجز زواجك بلمح البصر",
    desc: "خلّص كل أمورك في دقائق معدودة، وودّع حوسة الاتصالات والمواعيد الطويلة.",
  },
  {
    icon: Gem,
    title: "خدماتك على كيفك",
    desc: "اختر خدماتك على كيفك، بأسعار واضحة وضمان يخليك تعيش ليلة عمرك وأنت مرتاح.",
  },
] as const;

const ValueSection = () => (
  <section
    id="value"
    className="relative overflow-hidden bg-background px-6 py-24 sm:px-8 sm:py-28"
  >
    {/* Pattern divider above */}
    <ArabicPattern opacity={0.035} />

    <div className="relative mx-auto max-w-6xl">
      <Reveal>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/70 px-4 py-1.5 text-sm font-bold text-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
            ليش تِكله؟
          </span>
          <h2 className="mt-6 font-arabic text-4xl font-black leading-[1.15] text-green md:text-6xl">
            ليلتك عرسك..{" "}
            <span className="bg-gradient-to-l from-green to-gold bg-clip-text text-transparent">
              وش تبي أكثر؟
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-arabic text-lg leading-relaxed text-foreground/65 sm:text-xl">
            أربع أسباب تخلّيك تختار تِكله بدون تردد — سهولة، شفافية، ضمان،
            وذوق سعودي أصيل.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VALUE_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <Reveal key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="group relative h-full overflow-hidden rounded-3xl border border-gold/15 bg-cream/60 p-7 shadow-card backdrop-blur-md transition-all duration-500 hover:border-gold/50 hover:bg-cream/80 hover:shadow-[0_30px_60px_-25px_hsl(var(--gold)/0.4)]"
                style={{
                  WebkitBackdropFilter: "blur(12px) saturate(1.1)",
                  backdropFilter: "blur(12px) saturate(1.1)",
                }}
              >
                {/* Najdi gold glow on hover */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gold/0 opacity-0 blur-3xl transition-all duration-700 group-hover:bg-gold/30 group-hover:opacity-100" />

                {/* Gold sheen sweep */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: -6, scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 240, damping: 14 }}
                    className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 to-gold/5 text-gold shadow-soft"
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </motion.div>

                  <h3 className="mt-5 font-arabic text-2xl font-black text-green">
                    {card.title}
                  </h3>
                  <p className="mt-3 font-arabic text-sm leading-[1.95] text-foreground/70">
                    {card.desc}
                  </p>

                  {/* Animated underline */}
                  <div className="mt-6 h-0.5 w-10 rounded-full bg-gradient-to-l from-green to-gold transition-all duration-500 group-hover:w-20" />
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
    <AboutSection />
    <ValueSection />
  </>
);
