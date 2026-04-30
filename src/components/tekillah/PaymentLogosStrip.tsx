// ---------------------------------------------------------------------------
// PaymentLogosStrip — "قريباً" trust strip showcasing upcoming payment methods.
// Grayscale, blurred-style word-marks (text only, no external assets) with a
// subtle gold "قريباً" badge. Builds anticipation without claiming live support.
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import { CreditCard, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";

const PROVIDERS = [
  { name: "Tabby", ar: "تابي" },
  { name: "Tamara", ar: "تمارا" },
  { name: "mada", ar: "مدى" },
  { name: "Apple Pay", ar: "آبل باي" },
  { name: "Visa", ar: "فيزا" },
  { name: "Mastercard", ar: "ماستركارد" },
] as const;

export const PaymentLogosStrip = () => (
  <section
    aria-label="طرق الدفع القادمة قريباً"
    className="relative bg-surface/60 px-6 py-16 sm:px-8 sm:py-20"
  >
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <div className="flex flex-wrap items-center justify-center gap-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream px-4 py-1.5 text-xs font-bold text-foreground">
            <CreditCard className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
            طرق الدفع
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-black text-green">
            <Sparkles className="h-3 w-3 text-gold" strokeWidth={2.5} />
            قريباً
          </span>
        </div>
        <p className="mx-auto mt-4 max-w-xl text-center font-arabic text-sm leading-relaxed text-foreground/60 sm:text-base">
          نشتغل على دمج أبرز طرق الدفع السعودية والعالمية — تجربة دفع آمنة،
          مرنة، وبدون مفاجآت.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
          {PROVIDERS.map((p, i) => (
            <motion.div
              key={p.name}
              whileHover={{ y: -3, filter: "grayscale(0%)", opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="group relative flex h-20 items-center justify-center rounded-2xl border border-border bg-background/70 backdrop-blur-sm"
              style={{
                filter: "grayscale(100%) blur(0.4px)",
                opacity: 0.7,
              }}
            >
              {/* "قريباً" corner badge */}
              <span className="absolute -top-2 right-2 rounded-full bg-gold px-2 py-0.5 text-[9px] font-black text-primary-deep shadow-soft">
                قريباً
              </span>
              <span className="font-arabic text-sm font-black text-foreground/70 sm:text-base">
                {p.ar}
              </span>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);
