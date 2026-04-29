// ---------------------------------------------------------------------------
// ProblemSolutionAbout — three storytelling sections used on the home page
// to clarify the value proposition: pain points → solution pillars → about.
// All visuals use design-system semantic tokens (no hex / hardcoded colors).
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import {
  Clock, Timer, Tag, BadgeDollarSign, Shuffle, Layers, FileText, ShieldCheck,
  Quote, ArrowLeft, Package, SlidersHorizontal, Store, Sparkles, Zap, Heart,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { Link } from "react-router-dom";

// ---------- Section 1: Problem & Solution -----------------------------------
const PROBLEM_PAIRS = [
  {
    before: { icon: Clock, title: "وقت يضيع" },
    after: { icon: Timer, title: "٥ دقائق وخلصت", desc: "اختر، احجز، وادفع من جوالك." },
  },
  {
    before: { icon: Tag, title: "أسعار ما تبين" },
    after: { icon: BadgeDollarSign, title: "أسعار شفافة", desc: "قائمة واضحة وتقدر تقارن." },
  },
  {
    before: { icon: Shuffle, title: "تنسيق متفرق" },
    after: { icon: Layers, title: "كل شي في مكان واحد", desc: "قاعة، تصوير، كوش، ضيافة." },
  },
  {
    before: { icon: FileText, title: "كل شي ورقي" },
    after: { icon: ShieldCheck, title: "عقود وضمانات رقمية", desc: "حجوزات وفواتير موثّقة." },
  },
] as const;

const ProblemSection = () => (
  <section id="problem" className="bg-background px-6 py-24 sm:px-8 sm:py-28">
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <div className="text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-bold text-foreground">
            المشكلة والحل
          </span>
          <h2 className="mt-5 font-arabic text-4xl font-black leading-tight text-foreground md:text-6xl">
            من <span className="text-problem">الحوسة</span>… إلى{" "}
            <span className="text-green">الراحة</span>
          </h2>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {PROBLEM_PAIRS.map((pair, i) => {
          const Before = pair.before.icon;
          const After = pair.after.icon;
          return (
            <Reveal key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="group relative overflow-hidden rounded-2xl border border-green/20 bg-gradient-to-br from-cream to-green-light/40 p-6 shadow-card"
              >
                <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 sm:gap-5">
                  {/* Before — pain */}
                  <div className="opacity-70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-problem/80">
                      قبل
                    </span>
                    <div className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-problem/10 text-problem">
                      <Before className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div className="mt-2 font-arabic text-sm font-semibold text-foreground/70 line-through">
                      {pair.before.title}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowLeft
                    className="h-6 w-6 shrink-0 text-green transition-transform group-hover:-translate-x-1"
                    strokeWidth={2.2}
                  />

                  {/* After — solution */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green">
                      مع تِكله
                    </span>
                    <div className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green text-cream shadow-deep">
                      <After className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div className="mt-2 font-arabic text-base font-black text-foreground">
                      {pair.after.title}
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-foreground/65">
                      {pair.after.desc}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          );
        })}
      </div>

      {/* Quote banner */}
      <Reveal delay={0.2}>
        <div className="relative mt-12 overflow-hidden rounded-3xl bg-green p-8 text-cream shadow-deep sm:p-10">
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-green-mid/40 blur-3xl" />
          <Quote className="absolute right-6 top-6 h-12 w-12 text-gold/40" strokeWidth={1.5} />
          <div className="relative">
            <p className="font-arabic text-xl font-bold leading-relaxed sm:text-2xl">
              أكثر من{" "}
              <span className="font-black text-gold-soft">90%</span> من العرسان قالوا إن{" "}
              <span className="font-black text-gold-soft">الوقت وغموض الأسعار</span> أكبر عقبة في
              تجهيز الزواج.
            </p>
            <p className="mt-4 text-sm text-cream/70">
              — من مقابلات ميدانية مع 20+ عريس وعروس في الرياض
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

// ---------- Section 2: Solution pillars -------------------------------------
const SOLUTION_FEATURES = [
  {
    icon: Package,
    title: "باقات جاهزة",
    desc: "اقتصادية، متوسطة، فاخرة — سعر شامل وثابت تعرف فيه تكلفتك من أول لحظة.",
  },
  {
    icon: SlidersHorizontal,
    title: "خيارات مرنة",
    desc: "تبي تفصّل بنفسك؟ اختر كل خدمة لحالها من قاعدة بيانات مزودين موثقة.",
  },
  {
    icon: Store,
    title: "ماركت بليس متكامل",
    desc: "قاعات، تصوير، كوش، ضيافة، منسقين، عبايات — كل شي في مكان واحد.",
  },
  {
    icon: Sparkles,
    title: "توصيات بالذكاء الاصطناعي",
    desc: "نقترح لك الباقة المناسبة حسب ميزانيتك وذوقك — قريباً.",
  },
] as const;

const SolutionSection = () => (
  <section id="solution" className="bg-surface/60 px-6 py-24 sm:px-8 sm:py-28">
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <div className="text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-bold text-foreground">
            الحل
          </span>
          <h2 className="mt-5 font-arabic text-4xl font-black leading-tight text-foreground md:text-6xl">
            تِكله — <span className="text-green">منصة ليلة عمرك</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/70 sm:text-xl">
            من اختيار القاعة إلى تفاصيل ليلة عمرك اللي تحلم فيها — بضغطة زر وأسعار واضحة.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {SOLUTION_FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-card transition-colors hover:border-green hover:shadow-card-hover"
              >
                {/* Glow blob */}
                <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-green/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                {/* Sheen */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cream/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: -6, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 14 }}
                    className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-soft to-gold/40 text-green"
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </motion.div>
                  <h3 className="mt-5 font-arabic text-2xl font-black text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-foreground/70">{f.desc}</p>
                  <div className="mt-6 h-1 w-12 rounded-full bg-gradient-to-l from-green to-gold transition-all duration-500 group-hover:w-24" />
                </div>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

// ---------- Section 3: About تِكله -------------------------------------------
const STATS = [
  { value: "10 دقائق", label: "متوسط وقت التخطيط مع تِكله" },
  { value: "100%", label: "أسعار شفافة بدون مفاجآت" },
  { value: "+50", label: "مزود خدمة موثّق في الرياض" },
] as const;

const VALUES = [
  { icon: ShieldCheck, label: "شفافية كاملة" },
  { icon: Zap, label: "سرعة وسهولة" },
  { icon: Heart, label: "تجربة سعودية أصيلة" },
] as const;

const AboutSection = () => (
  <section id="about" className="relative overflow-hidden bg-hero-warm px-6 py-24 sm:px-8 sm:py-28">
    <div className="mx-auto max-w-6xl">
      <div className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
        {/* Right column (RTL) — text */}
        <Reveal className="md:col-span-7">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-cream/70 px-4 py-1.5 text-sm font-bold text-foreground backdrop-blur">
              <Sparkles className="h-4 w-4 text-gold" strokeWidth={2} />
              تعرّف على تِكله
            </span>
            <h2 className="mt-5 font-arabic text-5xl font-black leading-[1.1] text-foreground md:text-7xl">
              زواجك كله{" "}
              <span className="bg-gradient-green bg-clip-text text-transparent">بضغطة زر</span>
            </h2>
            <p className="mt-6 text-xl font-medium leading-relaxed text-foreground/80">
              تِكله أول منصة سعودية تجمع لك كل تفاصيل ليلة عمرك في مكان واحد. من القاعة، للتصوير،
              للكوش، للضيافة — كل شي بسعر واضح وضمان أكيد. شِلنا عنك التعب وعطيناك الخيارات اللي
              تليق فيك.
            </p>
            <p className="mt-4 leading-relaxed text-foreground/65">
              نؤمن إن ليلة عمرك ما تستاهل التعب والحوسة — تستاهل تجربة سلسة، شفافة، وذكية تخليك
              تركّز على اللحظة بس.
            </p>

            {/* Values chips */}
            <div className="mt-7 flex flex-wrap gap-3">
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-full border border-green/20 bg-cream/70 px-4 py-2 text-sm font-bold text-foreground backdrop-blur"
                  >
                    <Icon className="h-4 w-4 text-green" strokeWidth={2} />
                    {v.label}
                  </span>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/#wizard"
                className="inline-flex items-center justify-center rounded-full bg-green px-8 py-4 font-arabic text-base font-bold text-cream shadow-deep transition-transform hover:-translate-y-0.5"
              >
                ابدأ التخطيط الحين
              </Link>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-full border border-border bg-cream/70 px-8 py-4 font-arabic text-base font-bold text-foreground backdrop-blur transition-colors hover:bg-cream"
              >
                حمّل التطبيق
              </a>
            </div>
          </div>
        </Reveal>

        {/* Left column — stats card */}
        <Reveal delay={0.15} className="md:col-span-5">
          <div className="rounded-3xl border border-border bg-surface/85 p-8 shadow-deep backdrop-blur">
            <div className="space-y-6">
              {STATS.map((s, i) => (
                <div key={i}>
                  <div className="bg-gradient-green bg-clip-text font-arabic text-5xl font-black text-transparent">
                    {s.value}
                  </div>
                  <div className="mt-2 text-sm text-foreground/65">{s.label}</div>
                  {i < STATS.length - 1 && <div className="mt-6 h-px bg-border" />}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

// ---------- Public composite -------------------------------------------------
export const ProblemSolutionAbout = () => (
  <>
    <ProblemSection />
    <SolutionSection />
    <AboutSection />
  </>
);
