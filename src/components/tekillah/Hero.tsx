import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarCheck, CheckCircle2, Sparkles, Zap } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { SketchCurtain, SketchLongBanquet, SketchLotus } from "./SketchArt";

// ---------------------------------------------------------------------------
// Hero — Premium off-white canvas with slow gradient mesh, bento-style
// floating glassmorphism UI cards over a faint sketch of a wedding setup.
// Arabic-first, RTL. Headings in Thmanyah Serif Display.
// ---------------------------------------------------------------------------

const OFFWHITE = "#FDFBF7";

export const Hero = () => {
  return (
    <section
      id="home"
      dir="rtl"
      lang="ar"
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: OFFWHITE }}
    >
      {/* === Living gradient mesh — slow, blurred, corner-anchored === */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-32 h-[55vw] max-h-[680px] w-[55vw] max-w-[680px] rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(circle, hsl(38 65% 72% / 0.55) 0%, hsl(38 65% 72% / 0.18) 45%, transparent 70%)",
            filter: "blur(70px)",
          }}
          animate={{ x: [0, 40, -10, 0], y: [0, 25, -15, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-44 -left-40 h-[60vw] max-h-[720px] w-[60vw] max-w-[720px] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, hsl(100 38% 38% / 0.45) 0%, hsl(100 38% 38% / 0.14) 50%, transparent 72%)",
            filter: "blur(80px)",
          }}
          animate={{ x: [0, -30, 20, 0], y: [0, -20, 18, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 h-[40vw] max-h-[480px] w-[40vw] max-w-[480px] -translate-x-1/2 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, hsl(40 50% 88% / 0.7) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
          animate={{ scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* paper grain */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--primary-deep)) 0.5px, transparent 0.5px)",
            backgroundSize: "3px 3px",
          }}
        />
        {/* fade to next section */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* === Sketch wedding setup (faint) — sits behind glass cards === */}
      <SketchCurtain className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[36px] opacity-35 md:block md:w-[52px]" />
      <SketchCurtain className="pointer-events-none absolute inset-y-0 left-0 h-full w-[28px] opacity-35 sm:w-[40px] md:w-[52px]" />
      <SketchLotus className="pointer-events-none absolute bottom-6 right-6 hidden h-[110px] w-[150px] opacity-40 md:block" />

      {/* === Layout grid === */}
      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-24 pt-28 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:pt-32">
        {/* ---------- LEFT (text column, RTL = visually right) ---------- */}
        <div className="lg:col-span-7 lg:order-1 flex flex-col items-start text-right">
          {/* Top pulsing badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-primary-deep/15 bg-white/70 px-5 py-2 shadow-[0_8px_30px_-12px_hsl(100_45%_14%/0.18)] backdrop-blur-md"
          >
            <span className="absolute -inset-px rounded-full">
              <span className="absolute inset-0 animate-ping rounded-full bg-gold/30 opacity-60" />
            </span>
            <Zap className="relative h-4 w-4 text-gold" fill="currentColor" strokeWidth={1.5} />
            <span className="relative text-xs font-bold tracking-[0.14em] text-primary-deep">
              خلّها علينا.. وارتاح
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-balance text-[40px] font-black leading-[1.12] tracking-tight sm:text-[56px] md:text-[68px] lg:text-[76px]"
            style={{ color: "hsl(var(--primary-deep))" }}
          >
            زواجك ومناسباتك..{" "}
            <span className="relative inline-block whitespace-nowrap" style={{ color: "hsl(var(--green))" }}>
              تكلّه
              {/* Sketch underline */}
              <svg
                aria-hidden
                viewBox="0 0 220 18"
                className="absolute -bottom-2 left-0 h-3 w-full"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M4 11 C 50 3, 110 17, 165 8 S 215 6, 218 10"
                  fill="none"
                  stroke="hsl(var(--gold))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.3, delay: 1.1, ease: "easeInOut" }}
                />
              </svg>
            </span>{" "}
            علينا وتخلص بلمح البصر.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-base leading-[1.85] sm:text-lg md:text-xl"
            style={{ color: "hsl(var(--primary-deep) / 0.78)" }}
          >
            المنظومة الرقمية الأولى التي تجمعك بأفضل القاعات ومزودي الخدمات.
            تخطيط ذكي، حجوزات فورية، وبدون حوسة التنسيق اليدوي.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <Button
              size="lg"
              asChild
              className="group h-14 rounded-full px-8 text-base font-bold text-white shadow-[0_18px_45px_-14px_hsl(100_45%_14%/0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_-14px_hsl(100_45%_14%/0.6)]"
              style={{ backgroundColor: "hsl(var(--green))" }}
            >
              <a href="#wizard">
                <span>ابدأ التخطيط بلمح البصر</span>
                <span className="ms-2 transition-transform group-hover:-translate-x-1">🚀</span>
              </a>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="h-14 rounded-full border-2 border-primary-deep/25 bg-white/40 px-7 text-base font-bold text-primary-deep backdrop-blur-sm transition-all duration-300 hover:border-primary-deep/60 hover:bg-white/80"
            >
              <a href="#partner">أنا صاحب قاعة / مزود خدمة</a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 grid w-full max-w-2xl grid-cols-3 gap-3 sm:gap-5"
          >
            {[
              { value: 49, suffix: "★", label: "تقييم العملاء", decimal: true },
              { value: 1200, suffix: "+", label: "مناسبة منظمة" },
              { value: 250, suffix: "+", label: "مزود خدمة موثق" },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-primary-deep/12 bg-white/70 px-3 py-4 text-center backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-gold/60"
              >
                <div className="font-display text-2xl font-black sm:text-3xl" style={{ color: "hsl(var(--primary-deep))" }}>
                  {s.decimal ? (
                    <>
                      <AnimatedCounter value={4} duration={1400} />
                      <span>.</span>
                      <AnimatedCounter value={9} duration={1700} />
                      <span className="ms-1 text-gold">{s.suffix}</span>
                    </>
                  ) : (
                    <>
                      <AnimatedCounter value={s.value} />
                      <span className="text-gold">{s.suffix}</span>
                    </>
                  )}
                </div>
                <div className="mt-1 text-[11px] tracking-wide text-primary-deep/65 sm:text-xs">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ---------- RIGHT (visual hook — bento with sketch + glass cards) ---------- */}
        <div className="lg:col-span-5 lg:order-2 relative h-[460px] sm:h-[520px] lg:h-[600px]">
          {/* Faint sketch base */}
          <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
            <SketchLongBanquet
              className="h-[88%] w-[115%] opacity-60"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, hsl(0 0% 0% / 1) 50%, hsl(0 0% 0% / 0) 85%)",
                maskImage:
                  "radial-gradient(ellipse at center, hsl(0 0% 0% / 1) 50%, hsl(0 0% 0% / 0) 85%)",
              }}
            />
          </div>

          {/* Soft halo behind cards */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at 50% 45%, hsl(40 60% 85% / 0.55) 0%, transparent 60%)",
            }}
          />

          {/* === Floating glass card 1 — booking confirmed === */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-6 right-2 z-20 sm:top-10 sm:right-6"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/55 px-4 py-3 shadow-[0_20px_50px_-20px_hsl(100_45%_14%/0.35)] backdrop-blur-xl"
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{ backgroundColor: "hsl(var(--green) / 0.15)" }}
              >
                <CheckCircle2 className="h-5 w-5" style={{ color: "hsl(var(--green))" }} strokeWidth={2.2} />
              </span>
              <div className="text-right">
                <div className="text-[11px] font-medium text-primary-deep/60">قاعة الياسمين</div>
                <div className="text-sm font-extrabold text-primary-deep">تم تأكيد حجز القاعة ✅</div>
              </div>
            </motion.div>
          </motion.div>

          {/* === Floating glass card 2 — schedule ready === */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-20 left-0 z-20 sm:bottom-24 sm:left-4"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/55 px-4 py-3 shadow-[0_20px_50px_-20px_hsl(100_45%_14%/0.35)] backdrop-blur-xl"
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{ backgroundColor: "hsl(var(--gold) / 0.22)" }}
              >
                <CalendarCheck className="h-5 w-5 text-gold" strokeWidth={2.2} />
              </span>
              <div className="text-right">
                <div className="text-[11px] font-medium text-primary-deep/60">٧ يونيو · ٨:٠٠ م</div>
                <div className="text-sm font-extrabold text-primary-deep">جدولك جاهز 📅</div>
              </div>
            </motion.div>
          </motion.div>

          {/* === Floating glass card 3 — premium pill === */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-4 right-6 z-20 sm:bottom-6 sm:right-12"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-4 py-2 shadow-[0_14px_40px_-16px_hsl(100_45%_14%/0.3)] backdrop-blur-xl"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" fill="currentColor" />
              <span className="text-xs font-bold text-primary-deep">٣ مزودين متاحين الآن</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
