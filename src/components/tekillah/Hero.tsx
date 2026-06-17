import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Sparkles } from "lucide-react";
import { SketchEucalyptus, SketchLotus, SketchCurtain } from "./SketchArt";

// ---------------------------------------------------------------------------
// Hero — Ultra-premium identity hero.
// Off-white canvas, Deep Forest Green + Gold accents, Thmanyah Serif Display
// headline, cinematic marquee, floating service capsules, hand-drawn bisht
// architecture, ambient gold/green mesh.
// ---------------------------------------------------------------------------

const SERVICES = [
  { emoji: "🎪", label: "قاعات", top: "8%", left: "8%", delay: "0s", size: "lg" },
  { emoji: "📸", label: "تصوير", top: "30%", left: "62%", delay: "0.8s", size: "md" },
  { emoji: "💐", label: "تنسيق", top: "58%", left: "12%", delay: "1.6s", size: "lg" },
  { emoji: "🍽️", label: "ضيافة", top: "78%", left: "58%", delay: "2.4s", size: "md" },
] as const;

const MARQUEE_ITEMS = [
  "عريس", "عروس", "صاحب قاعة", "مصورة", "منسق كوش", "مزود ضيافة", "مصمم بطاقات",
];

// Hand-drawn Bisht silhouette — minimal vector, blends with cream backdrop.
const BishtSketch = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 400 500" fill="none" className={className} aria-hidden>
    <g stroke="hsl(var(--green))" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
      {/* shoulders + collar */}
      <path d="M120 70 Q200 30 280 70" />
      <path d="M150 80 Q200 60 250 80" />
      {/* body of bisht — flowing cloak */}
      <path d="M115 75 Q70 220 90 460 Q200 480 310 460 Q330 220 285 75" />
      {/* center opening */}
      <path d="M200 70 L200 460" strokeDasharray="2 4" />
      {/* gold trim (left) */}
      <path d="M120 80 Q98 240 108 455" stroke="hsl(var(--gold))" strokeWidth="1.4" />
      <path d="M132 85 Q112 240 120 450" stroke="hsl(var(--gold))" strokeWidth="0.8" opacity="0.7" />
      {/* gold trim (right) */}
      <path d="M280 80 Q302 240 292 455" stroke="hsl(var(--gold))" strokeWidth="1.4" />
      <path d="M268 85 Q288 240 280 450" stroke="hsl(var(--gold))" strokeWidth="0.8" opacity="0.7" />
      {/* drape folds */}
      <path d="M170 200 Q180 320 175 440" opacity="0.4" />
      <path d="M230 200 Q220 320 225 440" opacity="0.4" />
      {/* arch above shoulders — wedding architecture */}
      <path d="M70 65 Q200 -20 330 65" opacity="0.35" />
      <path d="M55 75 Q200 -45 345 75" opacity="0.2" />
    </g>
  </svg>
);

export const Hero = () => {
  return (
    <section
      id="home"
      dir="rtl"
      lang="ar"
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#FDFBF7" }}
    >
      {/* ============================================================
          AMBIENT BACKGROUND — pulsating gold + forest green mesh
         ============================================================ */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full blur-[120px] animate-pulse-slow"
          style={{ background: "radial-gradient(circle, hsl(var(--gold)/0.45), transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -left-40 h-[600px] w-[600px] rounded-full blur-[140px] animate-pulse-slow"
          style={{ background: "radial-gradient(circle, hsl(var(--green)/0.35), transparent 70%)", animationDelay: "3s" }}
        />
        <div
          className="absolute bottom-0 right-1/3 h-[420px] w-[420px] rounded-full blur-[110px] animate-pulse-slow"
          style={{ background: "radial-gradient(circle, hsl(var(--gold-soft)/0.5), transparent 70%)", animationDelay: "5s" }}
        />
        {/* paper grain */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--green)) 0.5px, transparent 0.5px)",
            backgroundSize: "3px 3px",
          }}
        />
      </div>

      {/* Hand-drawn Bisht + sketch botanicals — woven into the background */}
      <BishtSketch className="pointer-events-none absolute right-[-40px] bottom-0 hidden h-[78vh] w-auto opacity-90 md:block" />
      <SketchEucalyptus className="pointer-events-none absolute top-6 left-0 h-[110px] w-[210px] opacity-50 md:h-[160px] md:w-[290px]" />
      <SketchLotus className="pointer-events-none absolute bottom-8 right-6 hidden h-[90px] w-[130px] opacity-40 md:block" />
      <SketchCurtain className="pointer-events-none absolute inset-y-0 left-0 h-full w-[34px] opacity-40 md:w-[50px]" />

      {/* ============================================================
          MAIN GRID — copy (right in RTL) / floating capsules (left)
         ============================================================ */}
      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-12 pt-28 lg:grid-cols-12 lg:gap-8 lg:pt-32">
        {/* === COPY COLUMN === */}
        <div className="lg:col-span-7 text-center lg:text-right">
          {/* Dark pill badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold tracking-wide animate-fade-in-up"
            style={{
              backgroundColor: "hsl(var(--green))",
              color: "#FDFBF7",
              boxShadow: "0 10px 30px -10px hsl(var(--green)/0.5)",
              animationDelay: "0.05s",
            }}
          >
            <Zap className="h-3.5 w-3.5 fill-current" style={{ color: "hsl(var(--gold))" }} />
            <span>اختصر الوقت.. كل تفاصيلك في مكان واحد</span>
          </div>

          {/* Massive serif headline */}
          <h1
            className="font-display mt-7 text-balance text-[42px] font-black leading-[1.05] tracking-tight animate-fade-in-up sm:text-[58px] md:text-[72px] lg:text-[82px]"
            style={{ color: "hsl(var(--green))", animationDelay: "0.2s" }}
          >
            مناسباتك الكبرى..{" "}
            <span className="relative inline-block">
              <span
                style={{
                  background: "linear-gradient(110deg, hsl(var(--gold)) 0%, hsl(var(--brown)) 50%, hsl(var(--gold)) 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundSize: "200% 100%",
                }}
                className="animate-shimmer"
              >
                تكلّه
              </span>
            </span>{" "}
            وتخلص بلمح البصر.
          </h1>

          {/* Sub-headline */}
          <p
            className="mx-auto mt-6 max-w-2xl text-balance text-base leading-[1.85] animate-fade-in-up sm:text-lg md:text-xl lg:mx-0"
            style={{ color: "hsl(var(--green)/0.78)", animationDelay: "0.4s" }}
          >
            المنصة الرقمية الذكية التي تعيد هندسة سوق المناسبات. اجمع الحجوزات، نسق مع القاعات والمزودين، وأدر كل شيء بدون حوسة الواتساب.
          </p>

          {/* CTAs */}
          <div
            className="mt-9 flex flex-col items-center justify-center gap-3 animate-fade-in-up sm:flex-row lg:justify-start"
            style={{ animationDelay: "0.6s" }}
          >
            <Button
              asChild
              size="lg"
              className="group h-14 rounded-full px-9 text-base font-bold transition-all hover:scale-[1.04]"
              style={{
                backgroundColor: "hsl(var(--green))",
                color: "#FDFBF7",
                boxShadow: "0 20px 50px -12px hsl(var(--green)/0.55)",
              }}
            >
              <a href="#wizard">
                ابدأ تخطيط مناسبتك
                <ArrowLeft className="ms-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-14 rounded-full border-2 px-8 text-base font-bold transition-all hover:scale-[1.02]"
              style={{
                borderColor: "hsl(var(--gold))",
                color: "hsl(var(--green))",
                backgroundColor: "transparent",
              }}
            >
              <a href="#about">
                <Sparkles className="ms-2 h-4 w-4" style={{ color: "hsl(var(--gold))" }} />
                شاهد كيف يعمل
              </a>
            </Button>
          </div>
        </div>

        {/* === FLOATING CAPSULES COLUMN === */}
        <div className="relative h-[420px] w-full lg:col-span-5 lg:h-[560px]">
          {/* soft glow plate behind capsules */}
          <div
            className="absolute inset-8 rounded-[40%] blur-3xl opacity-60"
            style={{ background: "radial-gradient(circle, hsl(var(--gold)/0.35), transparent 70%)" }}
          />
          {SERVICES.map((s, i) => (
            <button
              key={s.label}
              className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer animate-bubble-float rounded-full border backdrop-blur-md transition-all duration-500 hover:scale-110 hover:shadow-2xl"
              style={{
                top: s.top,
                left: s.left,
                animationDelay: s.delay,
                padding: s.size === "lg" ? "18px 26px" : "14px 20px",
                borderColor: "hsl(var(--gold)/0.45)",
                backgroundColor: "hsl(var(--cream)/0.85)",
                boxShadow: "0 12px 40px -12px hsl(var(--green)/0.35), inset 0 1px 0 hsl(0 0% 100% / 0.6)",
                animation: `bubble-float 7s ease-in-out ${s.delay} infinite, fade-in-up 0.9s var(--ease-luxury) ${0.4 + i * 0.15}s both`,
              }}
            >
              {/* hover glow */}
              <span
                className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: "radial-gradient(circle at 50% 50%, hsl(var(--gold)/0.55), transparent 70%)",
                  filter: "blur(14px)",
                }}
              />
              <span className="relative flex items-center gap-2.5">
                <span className={s.size === "lg" ? "text-3xl" : "text-2xl"}>{s.emoji}</span>
                <span
                  className={`font-display font-bold ${s.size === "lg" ? "text-xl" : "text-lg"}`}
                  style={{ color: "hsl(var(--green))" }}
                >
                  {s.label}
                </span>
              </span>
            </button>
          ))}

          {/* faint orbit ring */}
          <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full opacity-30" aria-hidden>
            <circle cx="200" cy="200" r="160" fill="none" stroke="hsl(var(--gold))" strokeWidth="1" strokeDasharray="3 6" />
            <circle cx="200" cy="200" r="110" fill="none" stroke="hsl(var(--green))" strokeWidth="0.8" strokeDasharray="2 5" />
          </svg>
        </div>
      </div>

      {/* ============================================================
          CINEMATIC INFINITE MARQUEE
         ============================================================ */}
      <div
        className="relative z-10 mt-2 w-full overflow-hidden border-y animate-fade-in-up"
        style={{
          backgroundColor: "hsl(var(--green))",
          borderColor: "hsl(var(--gold)/0.4)",
          animationDelay: "0.85s",
        }}
        dir="ltr"
      >
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[hsl(var(--green))] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[hsl(var(--green))] to-transparent" />

        <div className="flex w-max animate-marquee py-5">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-10 pe-10">
              {MARQUEE_ITEMS.map((item, i) => (
                <div key={`${dup}-${i}`} className="flex items-center gap-10">
                  <span
                    className="font-display whitespace-nowrap text-2xl font-black tracking-wide sm:text-3xl md:text-4xl"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: "1.2px #FDFBF7",
                    }}
                  >
                    {item}
                  </span>
                  <span className="text-2xl sm:text-3xl" style={{ color: "hsl(var(--gold))" }}>
                    ✦
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
