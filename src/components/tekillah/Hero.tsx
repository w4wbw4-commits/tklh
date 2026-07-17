import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  SketchCurtain,
  SketchEucalyptus,
  SketchLotus,
  SketchCandelabra,
  SketchBanquet,
  SketchTable,
} from "./SketchArt";
import wordmarkAsset from "@/assets/tklh-logo-transparent.png.asset.json";



// ---------------------------------------------------------------------------
// Hero — Premium redesign.
// Brand wordmark at top → massive editorial headline with Kashida →
// clean subhead → 5 modern bento cards (Groom in black/gold Bisht, Bride
// in pristine white, plus Hall/Photographer/Planner) → CTAs.
// Background sketches stay as a 15% opacity watermark.
// ---------------------------------------------------------------------------

// Kashida (tatweel) helper for editorial Arabic stretching.
const T = "\u0640";
// Match the header wordmark exactly: ت with kasra, no shadda.
const KASHIDA_TKLH = `تِكله`;
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

// Groom — Bisht with gold trim, ghutra + iqal
const BishtIcon = ({ className }: CardIconProps) => (
  <svg viewBox="0 0 100 120" fill="none" className={className} aria-hidden>
    <defs>
      <linearGradient id="bishtBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#23211c" />
        <stop offset="55%" stopColor="#0e0d0b" />
        <stop offset="100%" stopColor="#000" />
      </linearGradient>
      <linearGradient id="bishtGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f4d98a" />
        <stop offset="50%" stopColor={gold} />
        <stop offset="100%" stopColor="#8a6a1f" />
      </linearGradient>
      <linearGradient id="ghutra" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#ece5d4" />
      </linearGradient>
    </defs>
    {/* bisht cloak */}
    <path d="M14 112 Q14 58 38 46 L62 46 Q86 58 86 112 Z" fill="url(#bishtBody)" />
    {/* gold front trim */}
    <path d="M42 46 L46 104 M58 46 L54 104" stroke="url(#bishtGold)" strokeWidth="2.2" strokeLinecap="round" />
    {/* gold hem */}
    <path d="M16 106 Q50 98 84 106" stroke="url(#bishtGold)" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M18 110 Q50 104 82 110" stroke="url(#bishtGold)" strokeWidth="0.9" fill="none" opacity={0.7} />
    {/* inner thobe V */}
    <path d="M42 46 L50 62 L58 46 Z" fill="#fafafa" stroke="#d8cdb6" strokeWidth="0.6" />
    {/* face */}
    <ellipse cx="50" cy="28" rx="8" ry="9" fill="#f1d9b8" stroke="#9e7d52" strokeWidth="0.6" />
    {/* ghutra */}
    <path d="M36 24 Q32 10 50 8 Q68 10 64 24 Q66 36 50 36 Q34 36 36 24 Z" fill="url(#ghutra)" stroke="#bfae8a" strokeWidth="0.8" />
    {/* iqal */}
    <ellipse cx="50" cy="14" rx="14" ry="2.6" fill="#0a0a0a" />
    <ellipse cx="50" cy="14" rx="14" ry="2.6" fill="none" stroke="#3a3a3a" strokeWidth="0.5" />
    {/* brooch */}
    <circle cx="50" cy="54" r="1.8" fill="url(#bishtGold)" />
  </svg>
);

// Bride — A-line gown, long veil, tiara, bouquet
const DressIcon = ({ className }: CardIconProps) => (
  <svg viewBox="0 0 100 120" fill="none" className={className} aria-hidden>
    <defs>
      <linearGradient id="dressSilk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#fbf6ec" />
        <stop offset="100%" stopColor="#ebdfc7" />
      </linearGradient>
      <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
      </linearGradient>
      <linearGradient id="tiara" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f4d98a" />
        <stop offset="100%" stopColor={gold} />
      </linearGradient>
    </defs>
    {/* veil */}
    <path d="M34 30 Q14 72 14 114 L86 114 Q86 72 66 30 Z" fill="url(#veil)" stroke="#e6dcc8" strokeWidth="0.5" />
    {/* skirt */}
    <path d="M42 60 L22 114 Q50 108 78 114 L58 60 Z" fill="url(#dressSilk)" stroke="#d8cdb6" strokeWidth="0.8" />
    <path d="M46 66 L36 112 M50 66 L50 112 M54 66 L64 112" stroke="#d8cdb6" strokeWidth="0.5" opacity={0.7} />
    {/* bodice (sweetheart) */}
    <path d="M42 40 Q46 46 50 44 Q54 46 58 40 L58 60 L42 60 Z" fill="url(#dressSilk)" stroke="#cebf9f" strokeWidth="0.8" />
    {/* sash */}
    <rect x="42" y="57" width="16" height="2" fill={gold} opacity={0.65} />
    {/* face */}
    <ellipse cx="50" cy="28" rx="7" ry="8" fill="#f3dcbb" stroke="#b08c5a" strokeWidth="0.6" />
    {/* hair updo */}
    <path d="M43 24 Q40 14 50 13 Q60 14 57 24" fill="#3a2418" />
    {/* tiara */}
    <path d="M42 18 L45 14 L48 17 L50 12 L52 17 L55 14 L58 18" stroke="url(#tiara)" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
    <circle cx="50" cy="15" r="1" fill="url(#tiara)" />
    {/* bouquet */}
    <circle cx="50" cy="68" r="5" fill="#f9d6dc" stroke="#c97a8a" strokeWidth="0.6" />
    <circle cx="47" cy="66" r="1.4" fill="#e08a9a" />
    <circle cx="52" cy="67" r="1.4" fill="#e08a9a" />
    <circle cx="50" cy="70" r="1.4" fill="#e08a9a" />
    <path d="M48 72 L46 80 M52 72 L54 80" stroke="#7a8c5e" strokeWidth="0.8" strokeLinecap="round" />
  </svg>
);

// Hall — grand ballroom with chandelier + arch
const HallIcon = ({ className }: CardIconProps) => (
  <svg viewBox="0 0 100 120" fill="none" className={className} aria-hidden>
    <defs>
      <linearGradient id="hallWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f8f1de" />
        <stop offset="100%" stopColor="#e9dcbb" />
      </linearGradient>
      <radialGradient id="chandGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor={gold} stopOpacity="0.6" />
        <stop offset="100%" stopColor={gold} stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* arch building */}
    <path d="M12 110 L12 56 Q50 14 88 56 L88 110 Z" fill="url(#hallWall)" stroke={ink} strokeWidth="1.2" strokeLinejoin="round" />
    {/* columns */}
    <rect x="20" y="58" width="6" height="52" fill="#fff" stroke={ink} strokeWidth="0.8" />
    <rect x="74" y="58" width="6" height="52" fill="#fff" stroke={ink} strokeWidth="0.8" />
    {/* arched door */}
    <path d="M40 110 L40 80 Q50 66 60 80 L60 110 Z" fill="#1a1714" stroke={ink} strokeWidth="0.8" />
    <line x1="50" y1="68" x2="50" y2="110" stroke={gold} strokeWidth="0.5" />
    {/* chandelier glow */}
    <circle cx="50" cy="40" r="14" fill="url(#chandGlow)" />
    {/* chandelier */}
    <line x1="50" y1="22" x2="50" y2="32" stroke={ink} strokeWidth="0.7" />
    <path d="M40 36 Q50 46 60 36 Q50 32 40 36 Z" fill={gold} fillOpacity={0.35} stroke={gold} strokeWidth="1.2" />
    <circle cx="42" cy="44" r="1.3" fill={gold} />
    <circle cx="50" cy="47" r="1.3" fill={gold} />
    <circle cx="58" cy="44" r="1.3" fill={gold} />
    {/* red carpet */}
    <path d="M44 110 L36 118 L64 118 L56 110 Z" fill="#8b1e2f" />
    {/* ground */}
    <line x1="8" y1="110" x2="92" y2="110" stroke={ink} strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// Photographer — DSLR camera with sparkle flash
const CameraIcon = ({ className }: CardIconProps) => (
  <svg viewBox="0 0 100 120" fill="none" className={className} aria-hidden>
    <defs>
      <linearGradient id="camBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2a2a2e" />
        <stop offset="100%" stopColor="#0c0c0e" />
      </linearGradient>
      <radialGradient id="lensGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#5ec5ff" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#5ec5ff" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* top viewfinder hump */}
    <rect x="40" y="28" width="20" height="10" rx="2" fill="url(#camBody)" />
    {/* body */}
    <rect x="10" y="38" width="80" height="58" rx="8" fill="url(#camBody)" stroke="#000" strokeWidth="0.5" />
    {/* grip */}
    <rect x="74" y="42" width="14" height="22" rx="3" fill="#1a1a1c" />
    {/* lens mount */}
    <circle cx="42" cy="68" r="22" fill="#15151a" stroke="#3a3a40" strokeWidth="1" />
    <circle cx="42" cy="68" r="17" fill="#0a0a0d" stroke={gold} strokeWidth="0.8" />
    <circle cx="42" cy="68" r="11" fill="url(#lensGlow)" stroke="#2a2a30" strokeWidth="0.8" />
    <circle cx="42" cy="68" r="5" fill="#000" />
    <circle cx="39" cy="65" r="1.6" fill="#fff" opacity={0.7} />
    {/* shutter button */}
    <circle cx="22" cy="36" r="3" fill={gold} stroke="#000" strokeWidth="0.5" />
    {/* flash sparkle */}
    <path d="M76 24 L78 30 L84 32 L78 34 L76 40 L74 34 L68 32 L74 30 Z" fill={gold} />
    {/* brand stripe */}
    <rect x="14" y="48" width="22" height="3" rx="1" fill={gold} opacity={0.7} />
  </svg>
);

// Planner — clipboard checklist with ring/calendar accents
const PlannerIcon = ({ className }: CardIconProps) => (
  <svg viewBox="0 0 100 120" fill="none" className={className} aria-hidden>
    <defs>
      <linearGradient id="clipPaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f4eedf" />
      </linearGradient>
    </defs>
    {/* clipboard back */}
    <rect x="18" y="22" width="64" height="86" rx="6" fill="#2a1f14" />
    {/* paper */}
    <rect x="22" y="26" width="56" height="78" rx="4" fill="url(#clipPaper)" stroke="#cebf9f" strokeWidth="0.6" />
    {/* clip */}
    <rect x="38" y="16" width="24" height="12" rx="3" fill={gold} stroke="#000" strokeWidth="0.6" />
    <rect x="44" y="20" width="12" height="4" rx="1" fill="#1a1714" />
    {/* date header */}
    <rect x="28" y="32" width="44" height="10" rx="2" fill={gold} opacity={0.25} />
    <text x="50" y="40" fontSize="7" fontWeight="bold" fill={ink} textAnchor="middle" fontFamily="system-ui">EVENT</text>
    {/* checklist */}
    <rect x="30" y="50" width="6" height="6" rx="1.5" fill={gold} />
    <path d="M31.5 53 L33 54.5 L35 51.5" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <line x1="40" y1="53" x2="72" y2="53" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />

    <rect x="30" y="62" width="6" height="6" rx="1.5" fill={gold} />
    <path d="M31.5 65 L33 66.5 L35 63.5" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <line x1="40" y1="65" x2="68" y2="65" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />

    <rect x="30" y="74" width="6" height="6" rx="1.5" stroke={ink} strokeWidth="1" fill="#fff" />
    <line x1="40" y1="77" x2="70" y2="77" stroke={ink} strokeWidth="1.2" strokeLinecap="round" opacity={0.7} />

    <rect x="30" y="86" width="6" height="6" rx="1.5" stroke={ink} strokeWidth="1" fill="#fff" />
    <line x1="40" y1="89" x2="64" y2="89" stroke={ink} strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />

    {/* gold ring accent */}
    <circle cx="72" cy="98" r="5" stroke={gold} strokeWidth="1.6" fill="none" />
    <circle cx="72" cy="93" r="1.2" fill={gold} />
  </svg>
);

// ---- Card definitions ------------------------------------------------------
type CardDef = {
  labelKey: string;
  captionKey: string;
  Icon: (p: CardIconProps) => JSX.Element;
  variant: "black" | "ivory" | "stone";
};
const cards: CardDef[] = [
  { labelKey: "hero.cards.groom.label",        captionKey: "hero.cards.groom.caption",        Icon: BishtIcon,   variant: "black" },
  { labelKey: "hero.cards.bride.label",        captionKey: "hero.cards.bride.caption",        Icon: DressIcon,   variant: "ivory" },
  { labelKey: "hero.cards.hall.label",         captionKey: "hero.cards.hall.caption",         Icon: HallIcon,    variant: "stone" },
  { labelKey: "hero.cards.photographer.label", captionKey: "hero.cards.photographer.caption", Icon: CameraIcon,  variant: "stone" },
  { labelKey: "hero.cards.planner.label",      captionKey: "hero.cards.planner.caption",      Icon: PlannerIcon, variant: "stone" },
];

const variantClass: Record<CardDef["variant"], string> = {
  black:
    "bg-gradient-to-br from-[#0e0e10] via-[#15151a] to-[#1f1d18] text-white border-white/10 hover:shadow-[0_28px_60px_-22px_rgba(0,0,0,0.7)]",
  ivory:
    "bg-gradient-to-br from-white via-[#fafaf6] to-[#f1ead9] text-primary-deep border-[hsl(var(--primary-deep)/0.08)] hover:shadow-[0_28px_60px_-22px_hsl(var(--primary-deep)/0.35)]",
  stone:
    "bg-gradient-to-br from-cream via-cream to-[hsl(var(--surface))] text-primary-deep border-[hsl(var(--primary-deep)/0.08)] hover:shadow-[0_28px_60px_-22px_hsl(var(--primary-deep)/0.3)]",
};


export const Hero = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  return (
    <section
      id="home"
      dir={isAr ? "rtl" : "ltr"}
      lang={i18n.language}
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

      {/* === Sketch watermark (15%) — visible on all screens, narrower on mobile === */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.15]">
        <SketchCurtain className="absolute inset-y-0 left-0 h-full w-[44px] sm:w-[60px] md:w-[90px]" />
        <SketchCurtain className="absolute inset-y-0 right-0 h-full w-[44px] sm:w-[60px] md:w-[90px]" style={{ transform: "scaleX(-1)" }} />
        <SketchEucalyptus className="absolute top-6 left-[6%] h-[80px] w-[140px] sm:h-[110px] sm:w-[200px] md:h-[140px] md:w-[260px]" />
        <SketchLotus className="absolute top-10 right-[8%] h-[70px] w-[100px] sm:h-[100px] sm:w-[140px] md:h-[120px] md:w-[170px]" />
        <SketchCandelabra className="absolute bottom-10 left-[3%] h-[160px] w-[110px] hidden lg:block" />
        <SketchCandelabra className="absolute bottom-10 right-[3%] h-[160px] w-[110px] hidden lg:block" style={{ transform: "scaleX(-1)" }} />
        <SketchTable className="absolute bottom-16 left-1/2 h-[100px] w-[180px] -translate-x-1/2 sm:h-[140px] sm:w-[240px] md:h-[180px] md:w-[320px]" />
        <SketchBanquet className="absolute -bottom-4 left-1/2 h-[120px] w-[300px] -translate-x-1/2 hidden xl:block sm:h-[160px] sm:w-[400px] md:h-[200px] md:w-[520px]" />
      </div>


      {/* === Foreground === */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center px-5 pt-20 pb-10 sm:px-8"
      >
        {/* Two-column hero: text (right in RTL) + mockup (left in RTL) */}
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Right column (text) — appears first in RTL DOM order so it's on the right */}
          <div className="flex flex-col items-center text-center lg:items-end lg:text-right">
            {/* Massive headline */}
            <motion.h1
              variants={rise}
              className="font-display text-balance font-black tracking-[-0.005em] text-primary-deep w-full max-w-4xl mx-auto px-4 sm:px-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight md:leading-snug"
              style={{
                fontFeatureSettings: '"kern","liga","calt","dlig"',
                wordSpacing: "0.05em",
                textShadow: "0 1px 0 hsl(var(--cream)), 0 2px 18px hsl(var(--cream)/0.9)",
              }}
            >
              <span className="relative inline-block">
                <img
                  src={wordmarkAsset.url}
                  alt={isAr ? "TKLH تِكله" : "TKLH Tklh"}
                  className="inline-block h-28 sm:h-36 md:h-44 lg:h-52 xl:h-60 w-auto select-none align-middle"
                  draggable={false}
                />
              </span>
              <br />
              <br />
              <span style={{ color: "#163726" }}>{t("hero.slogan")}</span>
            </motion.h1>


            {/* Sub-headline */}
            <motion.p
              variants={rise}
              className="font-tagline mt-6 max-w-2xl mx-auto px-4 text-balance text-sm leading-relaxed text-primary-deep/75 sm:text-base md:text-lg"
            >
              {t("hero.subheadPrefix")}{" "}
              <span className="font-bold" style={{ color: "hsl(var(--green))" }}>{t("hero.brand")}</span>&nbsp;
              {t("hero.subheadSuffix")}
            </motion.p>


          </div>

          {/* Left column (mockup) — intentionally empty */}
          <motion.div
            variants={rise}
            className="relative flex items-center justify-center lg:order-first"
          />
        </div>




        {/* === CTA === */}
        <motion.div variants={rise} className="mt-10 w-full max-w-xl">
          <a
            href="/planner"
            className={`group relative flex scale-[0.7] items-center gap-3 overflow-hidden rounded-2xl border-2 border-[rgba(22,55,38,0.4)] bg-gradient-to-br from-[#163726] to-[#163726] p-5 ${isAr ? "text-right" : "text-left"} text-[#A7CAA1] shadow-[0_25px_60px_-20px_rgba(22,55,38,0.45)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-[rgba(22,55,38,0.7)]`}
          >
            <span aria-hidden className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
              style={{ background: "radial-gradient(circle, #A7CAA1, transparent 70%)" }} />
            <span className="grid h-12 w-12 flex-none place-items-center rounded-xl border border-[rgba(167,202,161,0.5)] bg-[rgba(22,55,38,0.4)] transition-transform duration-500 group-hover:rotate-6" />
            <div className="flex-1">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[rgba(167,202,161,0.8)]"><br /></div>
              <div className="font-display text-lg font-black text-[#A7CAA1] sm:text-xl">{t("hero.ctaTitle")}&nbsp;</div>
              <div className="mt-0.5 text-[12.5px] text-[rgba(250,250,245,0.9)]">{t("hero.ctaDesc")}</div>
            </div>
            {isAr ? (
              <ArrowLeft className="h-5 w-5 text-[#A7CAA1] transition-transform duration-500 ease-out group-hover:-translate-x-1" />
            ) : (
              <ArrowRight className="h-5 w-5 text-[#A7CAA1] transition-transform duration-500 ease-out group-hover:translate-x-1" />
            )}
          </a>
        </motion.div>



      </motion.div>
    </section>
  );
};
