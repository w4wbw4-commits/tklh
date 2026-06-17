import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Gem, Bot } from "lucide-react";
import {
  SketchCurtain,
  SketchEucalyptus,
  SketchLotus,
  SketchCandelabra,
  SketchBanquet,
  SketchTable,
} from "./SketchArt";

// ---------------------------------------------------------------------------
// Hero — High-clarity message in <3s.
// Editorial Thmanyah-style typography with Kashida-stretched brand word,
// a horizontal bento row of hand-drawn service icons, and instant trust
// badges. Background keeps the architectural sketches as a low-opacity
// watermark so the message stays front and centre.
// ---------------------------------------------------------------------------

// Unicode tatweel character for Kashida (Arabic letter elongation).
const T = "\u0640";
// "تــكــلّــه" — tatweels injected between letters for editorial stretch.
const TKLH_KASHIDA = `ت${T}${T}ك${T}${T}لّ${T}${T}ه`;

// ---- Minimalist hand-drawn service icons -----------------------------------
const ink = "hsl(var(--primary-deep))";
const gold = "hsl(var(--gold))";

const drawTransition = { duration: 1.8, ease: [0.22, 1, 0.36, 1] as const };

type IconProps = { className?: string };

const IconGroom = ({ className }: IconProps) => (
  // Groom with Saudi Bisht — shoulders, bisht drape, ghutra silhouette.
  <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
    {/* Head */}
    <motion.circle cx="60" cy="34" r="11" stroke={ink} strokeWidth="1.4"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={drawTransition} />
    {/* Ghutra (headdress) */}
    <motion.path d="M48 30 Q44 18 60 16 Q76 18 72 30 Q70 38 60 38 Q50 38 48 30 Z"
      stroke={ink} strokeWidth="1.3" strokeLinejoin="round" fill={gold} fillOpacity={0.08}
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={drawTransition} />
    {/* Agal (black band) */}
    <motion.path d="M48 28 Q60 25 72 28" stroke={ink} strokeWidth="1.8" strokeLinecap="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.2 }} />
    {/* Bisht — wide shoulder cloak with gold trim */}
    <motion.path d="M22 100 Q26 60 50 52 L70 52 Q94 60 98 100 Z"
      stroke={ink} strokeWidth="1.5" strokeLinejoin="round" fill={ink} fillOpacity={0.04}
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.1 }} />
    {/* Inner thobe collar V */}
    <motion.path d="M50 52 L60 70 L70 52" stroke={ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.3 }} />
    {/* Gold bisht trim */}
    <motion.path d="M30 96 Q60 84 90 96" stroke={gold} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 3"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.5 }} />
  </svg>
);

const IconBride = ({ className }: IconProps) => (
  // Wedding dress silhouette — A-line gown with veil.
  <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
    {/* Head */}
    <motion.circle cx="60" cy="22" r="7" stroke={ink} strokeWidth="1.3"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={drawTransition} />
    {/* Veil — flowing behind */}
    <motion.path d="M44 26 Q30 50 28 96 M76 26 Q90 50 92 96"
      stroke={ink} strokeWidth="1" strokeLinecap="round" strokeDasharray="1 3"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.2 }} />
    {/* Bodice */}
    <motion.path d="M50 34 Q60 40 70 34 L70 56 L50 56 Z"
      stroke={ink} strokeWidth="1.4" strokeLinejoin="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.1 }} />
    {/* Skirt — A-line cascade */}
    <motion.path d="M50 56 L26 106 Q60 100 94 106 L70 56"
      stroke={ink} strokeWidth="1.5" strokeLinejoin="round" fill={gold} fillOpacity={0.05}
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.2 }} />
    {/* Skirt pleats */}
    <motion.path d="M56 60 L46 104 M60 60 L60 104 M64 60 L74 104"
      stroke={ink} strokeWidth="0.8" strokeLinecap="round" opacity={0.6}
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.4 }} />
    {/* Bouquet */}
    <motion.circle cx="60" cy="62" r="4" fill={gold} fillOpacity={0.5} stroke={gold} strokeWidth="0.8"
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} />
  </svg>
);

const IconHall = ({ className }: IconProps) => (
  // Luxury hall — chandelier, arch, drapes.
  <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
    {/* Arch */}
    <motion.path d="M20 100 L20 50 Q60 14 100 50 L100 100"
      stroke={ink} strokeWidth="1.5" strokeLinejoin="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={drawTransition} />
    {/* Curtains */}
    <motion.path d="M22 50 Q30 70 26 100 M98 50 Q90 70 94 100"
      stroke={ink} strokeWidth="1.2" strokeLinecap="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.2 }} />
    <motion.path d="M30 60 Q34 80 32 100 M90 60 Q86 80 88 100"
      stroke={ink} strokeWidth="0.9" strokeLinecap="round" opacity={0.6}
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.35 }} />
    {/* Chandelier chain */}
    <motion.line x1="60" y1="22" x2="60" y2="50" stroke={ink} strokeWidth="1"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.2 }} />
    {/* Chandelier body */}
    <motion.path d="M48 52 Q60 64 72 52 Q60 46 48 52 Z"
      stroke={ink} strokeWidth="1.3" strokeLinejoin="round" fill={gold} fillOpacity={0.12}
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.4 }} />
    {/* Drops */}
    <motion.circle cx="52" cy="62" r="1.6" fill={gold}
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 }} />
    <motion.circle cx="60" cy="66" r="1.6" fill={gold}
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} />
    <motion.circle cx="68" cy="62" r="1.6" fill={gold}
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.9 }} />
    {/* Floor */}
    <motion.line x1="14" y1="100" x2="106" y2="100" stroke={ink} strokeWidth="1.2" strokeLinecap="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.5 }} />
  </svg>
);

const IconPhotographer = ({ className }: IconProps) => (
  // Camera lens with wedding ring overlay.
  <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
    {/* Camera body */}
    <motion.path d="M18 44 L40 44 L46 34 L74 34 L80 44 L102 44 Q104 44 104 46 L104 92 Q104 94 102 94 L18 94 Q16 94 16 92 L16 46 Q16 44 18 44 Z"
      stroke={ink} strokeWidth="1.5" strokeLinejoin="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={drawTransition} />
    {/* Outer lens */}
    <motion.circle cx="50" cy="68" r="18" stroke={ink} strokeWidth="1.4"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.2 }} />
    {/* Inner lens */}
    <motion.circle cx="50" cy="68" r="11" stroke={ink} strokeWidth="1.1"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.35 }} />
    {/* Lens highlight */}
    <motion.circle cx="46" cy="64" r="2.5" fill={ink} fillOpacity={0.7}
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 }} />
    {/* Flash */}
    <motion.rect x="86" y="52" width="10" height="6" rx="1" stroke={ink} strokeWidth="1.2" fill={gold} fillOpacity={0.2}
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.3 }} />
    {/* Wedding ring overlapping lens */}
    <motion.circle cx="84" cy="78" r="12" stroke={gold} strokeWidth="1.8"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.5 }} />
    <motion.circle cx="84" cy="66" r="2" fill={gold}
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.95 }} />
  </svg>
);

const IconPlanner = ({ className }: IconProps) => (
  // Table setup with chair + candle (planning/styling).
  <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
    {/* Chair back (left) */}
    <motion.path d="M22 96 L22 56 Q22 50 28 50 L36 50 Q42 50 42 56 L42 96"
      stroke={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={drawTransition} />
    <motion.path d="M22 72 L42 72" stroke={ink} strokeWidth="1" strokeLinecap="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.3 }} />
    {/* Round table */}
    <motion.ellipse cx="70" cy="76" rx="34" ry="6" stroke={ink} strokeWidth="1.5" fill={gold} fillOpacity={0.08}
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.15 }} />
    {/* Drape */}
    <motion.path d="M36 78 Q40 96 50 100 M104 78 Q100 96 90 100 M70 82 L70 102"
      stroke={ink} strokeWidth="1.1" strokeLinecap="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.4 }} />
    {/* Candle */}
    <motion.path d="M68 70 L68 50 L72 50 L72 70 Z" stroke={ink} strokeWidth="1.3" strokeLinejoin="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.5 }} />
    {/* Wick */}
    <motion.line x1="70" y1="50" x2="70" y2="44" stroke={ink} strokeWidth="1"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.6 }} />
    {/* Flame */}
    <motion.path d="M70 44 Q66 38 70 32 Q74 38 70 44 Z" fill={gold} stroke={gold} strokeWidth="0.8"
      initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: [0, 1, 0.85, 1], scale: [0.7, 1.05, 0.95, 1] }} viewport={{ once: true }} transition={{ delay: 0.9, duration: 1.4, repeat: Infinity, repeatType: "reverse" }}
      style={{ transformOrigin: "70px 40px" }} />
    {/* Petals scatter */}
    <motion.circle cx="50" cy="78" r="1.6" fill={gold} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.95 }} />
    <motion.circle cx="92" cy="78" r="1.6" fill={gold} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.05 }} />
  </svg>
);

// ---- Stagger container variants --------------------------------------------
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

// ---- Service grid data ------------------------------------------------------
const services: { label: string; Icon: (p: IconProps) => JSX.Element }[] = [
  { label: "العريس", Icon: IconGroom },
  { label: "العروس", Icon: IconBride },
  { label: "القاعات", Icon: IconHall },
  { label: "المصور", Icon: IconPhotographer },
  { label: "المنسق", Icon: IconPlanner },
];

const badges: { label: string; Icon: typeof Clock }[] = [
  { label: "حجز فوري في أقل من دقيقة", Icon: Clock },
  { label: "أسعار مباشرة بشفافية كاملة", Icon: Gem },
  { label: "أتمتة ذكية تلغي الواتساب", Icon: Bot },
];

export const Hero = () => {
  return (
    <section
      id="home"
      dir="rtl"
      lang="ar"
      className="relative min-h-screen w-full overflow-hidden scroll-smooth"
      style={{ backgroundColor: "hsl(var(--cream))" }}
    >
      {/* === Background wash === */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 25%, hsl(var(--surface)) 0%, hsl(var(--cream)) 55%, hsl(var(--background)) 100%)",
          }}
        />
        {/* Paper grain */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--primary-deep)) 0.5px, transparent 0.5px)",
            backgroundSize: "3px 3px",
          }}
        />
        {/* Fade into next section */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* === Watermark sketch layer — opacity-20, scattered, non-intrusive === */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        <SketchCurtain className="absolute inset-y-0 left-0 h-full w-[60px] sm:w-[90px]" />
        <SketchCurtain className="absolute inset-y-0 right-0 h-full w-[60px] sm:w-[90px]" style={{ transform: "scaleX(-1)" }} />
        <SketchEucalyptus className="absolute top-6 left-[6%] h-[140px] w-[260px] hidden md:block" />
        <SketchLotus className="absolute top-10 right-[8%] h-[120px] w-[170px] hidden md:block" />
        <SketchCandelabra className="absolute bottom-0 left-[4%] h-[260px] w-[180px] hidden lg:block" />
        <SketchCandelabra className="absolute bottom-0 right-[4%] h-[260px] w-[180px] hidden lg:block" style={{ transform: "scaleX(-1)" }} />
        <SketchTable className="absolute bottom-6 left-1/2 h-[180px] w-[320px] -translate-x-1/2 hidden sm:block" />
        <SketchBanquet className="absolute -bottom-4 left-1/2 h-[200px] w-[520px] -translate-x-1/2 hidden xl:block" />
      </div>

      {/* === Foreground content === */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 pt-28 pb-16 text-center sm:px-8"
      >
        {/* Eyebrow */}
        <motion.div
          variants={rise}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-deep/20 bg-cream/70 px-5 py-2 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="text-[11px] font-bold tracking-[0.22em] text-primary-deep">
            tklh.sa — منصة المناسبات الذكية
          </span>
        </motion.div>

        {/* Main headline — editorial, Thmanyah Serif Display */}
        <motion.h1
          variants={rise}
          className="font-display text-balance text-[40px] font-black leading-[1.12] tracking-[-0.01em] text-primary-deep sm:text-[56px] md:text-[72px] lg:text-[88px]"
          style={{
            textShadow: "0 1px 0 hsl(var(--cream)), 0 2px 18px hsl(var(--cream) / 0.9)",
          }}
        >
          زواجك ومناسباتك..{" "}
          <span
            className="relative inline-block text-primary-deep"
            style={{
              fontFeatureSettings: '"kern","liga","calt","dlig"',
              letterSpacing: "0.01em",
            }}
          >
            {/* Kashida-stretched brand word */}
            <span className="bg-gradient-to-b from-primary-deep to-primary-deep/85 bg-clip-text">
              {TKLH_KASHIDA}
            </span>
            {/* Gold underline flourish */}
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-1 left-0 right-0 h-[3px] origin-right rounded-full bg-gradient-to-l from-gold via-gold to-transparent"
            />
          </span>{" "}
          وتخلص بلمح البصر.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={rise}
          className="font-tagline mt-6 max-w-3xl text-balance text-base leading-[1.85] text-primary-deep/80 sm:text-lg md:text-xl"
        >
          المنصة الذكية الأولى لحجز القاعات وكافة خدمات الزواج بلمح البصر وبدون
          حوسة التنسيق اليدوي.
        </motion.p>

        {/* === Services bento row — hand-drawn sketches === */}
        <motion.ul
          variants={rise}
          className="mt-10 grid w-full max-w-4xl grid-cols-5 gap-2 sm:gap-4"
        >
          {services.map(({ label, Icon }, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.55 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative flex flex-col items-center justify-end rounded-2xl border border-primary-deep/12 bg-cream/70 px-2 py-4 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-gold/60 hover:bg-cream hover:shadow-[0_18px_40px_-18px_hsl(var(--primary-deep)/0.35)] sm:px-3 sm:py-5"
            >
              <Icon className="h-12 w-12 transition-transform duration-500 ease-out group-hover:scale-110 sm:h-16 sm:w-16" />
              <span className="mt-2 text-[11px] font-bold tracking-wide text-primary-deep sm:mt-3 sm:text-sm">
                {label}
              </span>
              <span className="pointer-events-none absolute inset-x-3 -bottom-px h-px bg-gradient-to-l from-transparent via-gold/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </motion.li>
          ))}
        </motion.ul>

        {/* === CTAs === */}
        <motion.div
          variants={rise}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            asChild
            className="group h-14 rounded-full bg-gold px-10 text-base font-bold text-primary-deep shadow-[0_18px_45px_-12px_hsl(var(--gold)/0.5)] transition-all duration-300 hover:scale-[1.03] hover:bg-gold/90"
          >
            <a href="#wizard">
              ابدأ التنسيق الآن
              <ArrowLeft className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            asChild
            className="h-14 rounded-full border-2 border-primary-deep/25 bg-transparent px-8 text-base font-bold text-primary-deep transition-all duration-300 hover:bg-primary-deep/5"
          >
            <a href="#about">شاهد كيف تعمل</a>
          </Button>
        </motion.div>

        {/* === Trust badges — instant "aha" === */}
        <motion.ul
          variants={rise}
          className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          {badges.map(({ label, Icon }, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 1.1 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group inline-flex items-center gap-2 rounded-full border border-primary-deep/15 bg-cream/80 px-4 py-2 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-cream"
            >
              <Icon className="h-4 w-4 text-gold transition-transform duration-300 group-hover:scale-110" strokeWidth={1.8} />
              <span className="text-xs font-bold text-primary-deep sm:text-sm">{label}</span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
};
