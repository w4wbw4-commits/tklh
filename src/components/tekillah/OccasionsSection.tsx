// ---------------------------------------------------------------------------
// OccasionsSection — Compact "more than weddings" strip.
// Headline: "تِكله.. لكل مناسباتك السعيدة"
// Small circular icons for versatility, not a full-height card section.
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import { HeartHandshake, Crown, GraduationCap, PartyPopper } from "lucide-react";
import { Reveal } from "./Reveal";
import { SketchCornerOrnament, SketchIconSparkle } from "./SketchArt";

const OCCASIONS = [
  { icon: HeartHandshake, label: "حفلات الزواج" },
  { icon: Crown,          label: "خطوبة وملكة" },
  { icon: GraduationCap,  label: "تخرّج وأزهل" },
  { icon: PartyPopper,    label: "فعاليات كبرى" },
] as const;

export const OccasionsSection = () => (
  <section
    id="occasions"
    aria-label="مناسبات يدعمها تِكله"
    className="relative overflow-hidden bg-hero-warm px-6 py-14 sm:px-8 sm:py-16"
  >
    {/* Sketch corner ornaments — sit in the corners, never overlap content */}
    <SketchCornerOrnament className="pointer-events-none absolute top-2 left-2 hidden h-[110px] w-[110px] opacity-55 md:block" />
    <SketchCornerOrnament
      className="pointer-events-none absolute top-2 right-2 hidden h-[110px] w-[110px] opacity-55 md:block"
      style={{ transform: "scaleX(-1)" }}
    />

    <div className="relative mx-auto max-w-6xl">
      <Reveal>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/80 px-4 py-1.5 text-xs font-bold text-foreground backdrop-blur sm:text-sm">
            <SketchIconSparkle className="h-4 w-4" />
            تِكله معك في كل مناسبة
          </span>
          <h2 className="mt-5 font-arabic text-3xl font-black leading-[1.2] text-green md:text-5xl">
            تِكله.. لكل{" "}
            <span className="bg-gradient-to-l from-green to-gold bg-clip-text text-transparent">
              مناسباتك السعيدة
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-arabic text-sm leading-relaxed text-foreground/65 sm:text-base">
            من ليلة العمر، لأحلى لمّة، لأكبر فعالية — كل شي بضمان وذوق رفيع ما يخيب.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mx-auto mt-9 flex flex-wrap items-start justify-center gap-5 sm:gap-10">
          {OCCASIONS.map((o, i) => {
            const Icon = o.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
                className="group flex flex-col items-center gap-2.5"
              >
                <div className="relative grid h-16 w-16 place-items-center rounded-full border border-gold/35 bg-cream/80 text-gold shadow-soft transition-all duration-500 group-hover:border-gold/70 group-hover:bg-cream group-hover:shadow-[0_18px_40px_-15px_hsl(var(--gold)/0.55)] sm:h-20 sm:w-20">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={1.7} />
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-gold/0 opacity-0 blur-xl transition-all duration-700 group-hover:bg-gold/30 group-hover:opacity-100" />
                </div>
                <span className="font-arabic text-xs font-bold text-foreground/80 sm:text-sm">
                  {o.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </Reveal>
    </div>
  </section>
);
