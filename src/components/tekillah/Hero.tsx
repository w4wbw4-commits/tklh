import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  SketchCurtain,
  SketchEucalyptus,
  SketchLotus,
  SketchCandelabra,
  SketchBanquet,
  SketchTable,
} from "./SketchArt";

// ---------------------------------------------------------------------------
// Hero — Premium redesign.
// Brand wordmark at top → massive editorial headline with Kashida →
// clean subhead → 5 modern bento cards (Groom in black/gold Bisht, Bride
// in pristine white, plus Hall/Photographer/Planner) → CTAs →
// continuous two-row crossing services marquee. Background sketches stay
// as a 15% opacity watermark.
// ---------------------------------------------------------------------------

// Kashida (tatweel) helper for editorial Arabic stretching.
const T = "\u0640";
const KASHIDA_TKLH = `ت${T}${T}كلّ${T}${T}ه`; // تــكلّــه
const KASHIDA_BOOK = `احجـ${T}${T}زها`;       // احجــــزها

const ink = "hsl(var(--primary-deep))";
const gold = "hsl(var(--gold))";

// ---- Variants ---------------------------------------------------------------
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

// ---- Modern premium card icons ---------------------------------------------
type CardIconProps = { className?: string };

// Groom — minimalist Bisht silhouette, gold trim
const BishtIcon = ({ className }: CardIconProps) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
    <defs>
      <linearGradient id="bishtBlack" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a1a1a" />
        <stop offset="100%" stopColor="#000" />
      </linearGradient>
    </defs>
    {/* shoulders cloak */}
    <path d="M18 82 Q22 42 42 36 L58 36 Q78 42 82 82 Z" fill="url(#bishtBlack)" />
    {/* gold trim */}
    <path d="M22 78 Q50 68 78 78" stroke={gold} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M24 82 Q50 73 76 82" stroke={gold} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity={0.7} />
    {/* inner V neckline */}
    <path d="M42 36 L50 52 L58 36" stroke={gold} strokeWidth="1.2" strokeLinejoin="round" fill="none" />
    {/* head + ghutra */}
    <circle cx="50" cy="22" r="7" fill="#f5efe4" stroke="#1a1a1a" strokeWidth="1" />
    <path d="M40 22 Q38 12 50 11 Q62 12 60 22 Q58 28 50 28 Q42 28 40 22 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1" />
    <path d="M40 20 Q50 17 60 20" stroke="#000" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* gold pin */}
    <circle cx="50" cy="44" r="1.6" fill={gold} />
  </svg>
);

// Bride — A-line dress with veil
const DressIcon = ({ className }: CardIconProps) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
    <defs>
      <linearGradient id="dressFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f3ece0" />
      </linearGradient>
    </defs>
    {/* veil */}
    <path d="M38 24 Q24 50 22 88 L78 88 Q76 50 62 24 Z" fill="#fff" opacity={0.55} />
    {/* bodice */}
    <path d="M42 30 Q50 36 58 30 L58 50 L42 50 Z" fill="url(#dressFade)" stroke="#d8cdb6" strokeWidth="0.8" />
    {/* skirt */}
    <path d="M42 50 L24 88 Q50 84 76 88 L58 50 Z" fill="url(#dressFade)" stroke="#d8cdb6" strokeWidth="0.8" />
    {/* pleats */}
    <path d="M48 54 L40 86 M50 54 L50 86 M52 54 L60 86" stroke="#d8cdb6" strokeWidth="0.6" opacity={0.7} />
    {/* head + tiara */}
    <circle cx="50" cy="20" r="6" fill="#f5efe4" stroke="#bfae8a" strokeWidth="0.8" />
    <path d="M44 16 L46 12 L48 15 L50 11 L52 15 L54 12 L56 16" stroke={gold} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
    {/* bouquet */}
    <circle cx="50" cy="58" r="3.2" fill={gold} opacity={0.55} stroke={gold} strokeWidth="0.6" />
  </svg>
);

// Hall — modern arch + chandelier
const HallIcon = ({ className }: CardIconProps) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
    <path d="M16 86 L16 46 Q50 14 84 46 L84 86 Z" fill={ink} fillOpacity={0.06} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M22 46 Q26 66 24 86 M78 46 Q74 66 76 86" stroke={ink} strokeWidth="1" strokeLinecap="round" />
    <line x1="50" y1="20" x2="50" y2="48" stroke={ink} strokeWidth="0.9" />
    <path d="M40 52 Q50 62 60 52 Q50 46 40 52 Z" fill={gold} fillOpacity={0.25} stroke={gold} strokeWidth="1.2" />
    <circle cx="44" cy="60" r="1.4" fill={gold} />
    <circle cx="50" cy="63" r="1.4" fill={gold} />
    <circle cx="56" cy="60" r="1.4" fill={gold} />
    <line x1="12" y1="86" x2="88" y2="86" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// Photographer — camera + ring
const CameraIcon = ({ className }: CardIconProps) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
    <rect x="14" y="32" width="72" height="48" rx="6" fill={ink} fillOpacity={0.05} stroke={ink} strokeWidth="1.5" />
    <path d="M36 32 L42 24 L62 24 L68 32" stroke={ink} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    <circle cx="42" cy="56" r="14" stroke={ink} strokeWidth="1.4" fill="#fff" />
    <circle cx="42" cy="56" r="9" stroke={ink} strokeWidth="1.1" />
    <circle cx="39" cy="53" r="2" fill={ink} fillOpacity={0.7} />
    <rect x="72" y="38" width="8" height="5" rx="1" fill={gold} fillOpacity={0.4} stroke={ink} strokeWidth="1" />
    <circle cx="72" cy="66" r="9" stroke={gold} strokeWidth="1.8" fill="none" />
    <circle cx="72" cy="57" r="1.6" fill={gold} />
  </svg>
);

// Planner — checklist clipboard
const PlannerIcon = ({ className }: CardIconProps) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
    <rect x="22" y="18" width="56" height="68" rx="6" fill="#fff" stroke={ink} strokeWidth="1.5" />
    <rect x="38" y="12" width="24" height="10" rx="3" fill={gold} fillOpacity={0.5} stroke={ink} strokeWidth="1.2" />
    <circle cx="34" cy="38" r="3" fill={gold} />
    <line x1="42" y1="38" x2="70" y2="38" stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="34" cy="52" r="3" fill={gold} />
    <line x1="42" y1="52" x2="68" y2="52" stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="34" cy="66" r="3" stroke={ink} strokeWidth="1.2" fill="none" />
    <line x1="42" y1="66" x2="64" y2="66" stroke={ink} strokeWidth="1.4" strokeLinecap="round" opacity={0.6} />
  </svg>
);

// ---- Card definitions ------------------------------------------------------
type CardDef = {
  label: string;
  caption: string;
  Icon: (p: CardIconProps) => JSX.Element;
  variant: "black" | "ivory" | "stone";
};
const cards: CardDef[] = [
  { label: "العريس", caption: "بشت وأناقة", Icon: BishtIcon, variant: "black" },
  { label: "العروس", caption: "فستان حلمها", Icon: DressIcon, variant: "ivory" },
  { label: "القاعات", caption: "فخامة المكان", Icon: HallIcon, variant: "stone" },
  { label: "المصور", caption: "لحظة لا تنسى", Icon: CameraIcon, variant: "stone" },
  { label: "المنسق", caption: "كل التفاصيل", Icon: PlannerIcon, variant: "stone" },
];

const variantClass: Record<CardDef["variant"], string> = {
  black:
    "bg-gradient-to-br from-[#0e0e10] via-[#15151a] to-[#1f1d18] text-white border-white/10 hover:shadow-[0_28px_60px_-22px_rgba(0,0,0,0.7)]",
  ivory:
    "bg-gradient-to-br from-white via-[#fafaf6] to-[#f1ead9] text-primary-deep border-[hsl(var(--primary-deep)/0.08)] hover:shadow-[0_28px_60px_-22px_hsl(var(--primary-deep)/0.35)]",
  stone:
    "bg-gradient-to-br from-cream via-cream to-[hsl(var(--surface))] text-primary-deep border-[hsl(var(--primary-deep)/0.08)] hover:shadow-[0_28px_60px_-22px_hsl(var(--primary-deep)/0.3)]",
};

// ---- Services marquee data --------------------------------------------------
const marqueeRow1 = [
  "🎪 قاعات فخمة",
  "📸 مصورين محترفين",
  "💐 كوشات مصممة",
  "🍽️ بوفيه وكيترنق",
  "🎵 فرق استعراضية",
  "🚗 سيارات زفة",
];
const marqueeRow2 = [
  "✨ تنسيق إضاءة",
  "🎂 كيك مناسبات",
  "💌 دعوات إلكترونية",
  "🎁 توزيعات راقية",
  "🌹 منسقي ورد",
  "🎤 حفلات DJ",
];

const MarqueeRow = ({ items, direction }: { items: string[]; direction: "rtl" | "ltr" }) => {
  const doubled = [...items, ...items];
  return (
    <div className="relative w-full overflow-hidden py-2">
      <div
        className={`flex w-max items-center gap-10 whitespace-nowrap ${
          direction === "rtl" ? "animate-marquee-rtl" : "animate-marquee-ltr"
        }`}
      >
        {doubled.map((item, i) => (
          <div key={`${item}-${i}`} className="flex items-center gap-10">
            <span className="text-sm font-bold tracking-wide text-primary-deep/85 sm:text-base">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-gold/70" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
};

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
              "radial-gradient(ellipse at 50% 20%, hsl(var(--surface)) 0%, hsl(var(--cream)) 55%, hsl(var(--background)) 100%)",
          }}
        />
        {/* warm glow */}
        <div
          className="absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.18), transparent 70%)" }}
        />
        {/* paper grain */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--primary-deep)) 0.5px, transparent 0.5px)",
            backgroundSize: "3px 3px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* === Sketch watermark (15%) === */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.15]">
        <SketchCurtain className="absolute inset-y-0 left-0 h-full w-[60px] sm:w-[90px]" />
        <SketchCurtain className="absolute inset-y-0 right-0 h-full w-[60px] sm:w-[90px]" style={{ transform: "scaleX(-1)" }} />
        <SketchEucalyptus className="absolute top-6 left-[6%] h-[140px] w-[260px] hidden md:block" />
        <SketchLotus className="absolute top-10 right-[8%] h-[120px] w-[170px] hidden md:block" />
        <SketchCandelabra className="absolute bottom-10 left-[3%] h-[240px] w-[170px] hidden lg:block" />
        <SketchCandelabra className="absolute bottom-10 right-[3%] h-[240px] w-[170px] hidden lg:block" style={{ transform: "scaleX(-1)" }} />
        <SketchTable className="absolute bottom-16 left-1/2 h-[180px] w-[320px] -translate-x-1/2 hidden sm:block" />
        <SketchBanquet className="absolute -bottom-4 left-1/2 h-[200px] w-[520px] -translate-x-1/2 hidden xl:block" />
      </div>

      {/* === Foreground === */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center px-5 pt-20 pb-10 text-center sm:px-8"
      >
        {/* Brand wordmark */}
        <motion.div variants={rise} className="mb-6 flex flex-col items-center">
          <span
            className="font-display text-5xl font-black tracking-tight text-[#0b0b0d] sm:text-6xl"
            style={{ fontFeatureSettings: '"kern","liga","calt","dlig"', letterSpacing: "0.005em" }}
          >
            تكلّه
          </span>
          <span className="mt-2 h-[2px] w-14 rounded-full bg-gradient-to-l from-transparent via-gold to-transparent" />
        </motion.div>

        {/* Massive headline */}
        <motion.h1
          variants={rise}
          className="font-display text-balance text-[34px] font-black leading-[1.14] tracking-[-0.01em] text-[#0b0b0d] sm:text-[52px] md:text-[68px] lg:text-[82px]"
          style={{
            fontFeatureSettings: '"kern","liga","calt","dlig"',
            textShadow: "0 1px 0 hsl(var(--cream)), 0 2px 18px hsl(var(--cream)/0.9)",
          }}
        >
          حنا لك{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-b from-[#0b0b0d] to-[#1f1d18] bg-clip-text text-transparent">
              {KASHIDA_TKLH}!
            </span>
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-1 left-0 right-0 h-[3px] origin-right rounded-full bg-gradient-to-l from-gold via-gold to-transparent"
            />
          </span>{" "}
          <br className="hidden sm:block" />
          زواجك ومناسباتك {KASHIDA_BOOK} بلمح البصر.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={rise}
          className="font-tagline mt-6 max-w-3xl text-balance text-base leading-[1.85] text-primary-deep/75 sm:text-lg md:text-xl"
        >
          المنظومة الرقمية الذكية لحجز القاعات وكافة تفاصيل ليلة العمر بدون تعقيد
          وبدون حوسة الواتساب.
        </motion.p>

        {/* === Premium bento cards === */}
        <motion.ul
          variants={rise}
          className="mt-10 grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4"
        >
          {cards.map(({ label, caption, Icon, variant }, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative flex flex-col items-center justify-end overflow-hidden rounded-3xl border px-3 py-5 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-2 ${variantClass[variant]}`}
            >
              {/* gold corner accent */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-90"
                style={{ background: "radial-gradient(circle, hsl(var(--gold)/0.55), transparent 70%)" }}
              />
              <div className="relative grid h-20 w-20 place-items-center rounded-2xl transition-transform duration-500 ease-out group-hover:scale-110 sm:h-24 sm:w-24">
                <Icon className="h-full w-full" />
              </div>
              <span className={`mt-3 text-sm font-black tracking-wide sm:text-base ${variant === "black" ? "text-white" : "text-primary-deep"}`}>
                {label}
              </span>
              <span className={`mt-0.5 text-[11px] font-medium ${variant === "black" ? "text-white/60" : "text-primary-deep/55"}`}>
                {caption}
              </span>
              <span className="pointer-events-none absolute inset-x-4 -bottom-px h-px bg-gradient-to-l from-transparent via-gold/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
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
            className="group h-14 rounded-full bg-gold px-10 text-base font-bold text-primary-deep shadow-[0_18px_45px_-12px_hsl(var(--gold)/0.55)] transition-all duration-500 ease-out hover:scale-[1.04] hover:bg-gold/90"
          >
            <a href="#wizard">
              ابدأ التنسيق الآن
              <ArrowLeft className="ms-2 h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-x-1" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            asChild
            className="h-14 rounded-full border-2 border-primary-deep/25 bg-transparent px-8 text-base font-bold text-primary-deep transition-all duration-500 ease-out hover:bg-primary-deep/5"
          >
            <a href="#about">شاهد كيف تعمل</a>
          </Button>
        </motion.div>

        {/* === Crossing services marquee === */}
        <motion.div
          variants={rise}
          className="relative mt-14 w-screen max-w-none -mx-5 sm:-mx-8"
          style={{ marginInline: "calc(50% - 50vw)" }}
        >
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-cream to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-cream to-transparent" />
          <div className="flex flex-col gap-1 border-y border-primary-deep/10 py-3">
            <MarqueeRow items={marqueeRow1} direction="rtl" />
            <MarqueeRow items={marqueeRow2} direction="ltr" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
