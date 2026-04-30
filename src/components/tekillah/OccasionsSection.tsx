// ---------------------------------------------------------------------------
// OccasionsSection — "لكل مناسباتك الفاخرة"
// 3 elegant interactive cards: weddings / private events / large events.
// Sits between Hero and About to expand the brand promise beyond weddings.
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import { HeartHandshake, Sparkles, PartyPopper, Crown } from "lucide-react";
import { Reveal } from "./Reveal";

const OCCASIONS = [
  {
    icon: HeartHandshake,
    title: "حفلات الزواج",
    desc: "ليلة العمر ما تتكرر — خلّيها على كيفك. قاعة، كوش، تصوير، ضيافة، وكل التفاصيل اللي تخلّيها ليلة ما تنتسي.",
  },
  {
    icon: Crown,
    title: "المناسبات الخاصة",
    desc: "أزهل، ملكة، خطوبة، تخرّج، عيد ميلاد، أو لمّة العيلة.. أيًا كانت لحظتك، تِكله تنسّقها لك بذوق يليق فيك.",
  },
  {
    icon: PartyPopper,
    title: "الفعاليات الكبرى",
    desc: "افتتاحات، مؤتمرات، لقاءات شركات، ومعارض — تنفيذ احترافي بلمسات سعودية فاخرة من البداية للنهاية.",
  },
] as const;

export const OccasionsSection = () => (
  <section
    id="occasions"
    aria-label="مناسبات يدعمها تِكله"
    className="relative overflow-hidden bg-background px-6 py-24 sm:px-8 sm:py-28"
  >
    <div className="relative mx-auto max-w-6xl">
      <Reveal>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/70 px-4 py-1.5 text-sm font-bold text-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
            تِكله معك في كل مناسبة
          </span>
          <h2 className="mt-6 font-arabic text-4xl font-black leading-[1.15] text-green md:text-6xl">
            تِكله لك في{" "}
            <span className="bg-gradient-to-l from-green to-gold bg-clip-text text-transparent">
              كل مناسباتك
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-arabic text-lg leading-relaxed text-foreground/65 sm:text-xl">
            لكل مناسباتك.. تحتاج دايم ناس تِكله عليهم! من ليلة العمر، لأحلى
            لمّة، لأكبر فعالية شركتك — كل شي بضمان وذوق سعودي ما يخيب.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {OCCASIONS.map((o, i) => {
          const Icon = o.icon;
          return (
            <Reveal key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="group relative h-full overflow-hidden rounded-3xl border border-gold/15 bg-cream/70 p-8 text-center shadow-card backdrop-blur-md transition-all duration-500 hover:border-gold/55 hover:shadow-[0_30px_60px_-25px_hsl(var(--gold)/0.4)]"
              >
                {/* Gold halo glow on hover */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gold/0 opacity-0 blur-3xl transition-all duration-700 group-hover:bg-gold/30 group-hover:opacity-100" />

                <div className="relative">
                  {/* Circular icon ring — luxury Najdi gold */}
                  <motion.div
                    whileHover={{ rotate: -6, scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 240, damping: 14 }}
                    className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold/40 bg-gradient-to-br from-gold/15 to-gold/5 text-gold shadow-soft"
                  >
                    <Icon className="h-9 w-9" strokeWidth={1.6} />
                  </motion.div>

                  <h3 className="mt-6 font-arabic text-2xl font-black text-green">
                    {o.title}
                  </h3>
                  <p className="mt-3 font-arabic text-sm leading-[1.95] text-foreground/70">
                    {o.desc}
                  </p>

                  <div className="mx-auto mt-6 h-0.5 w-10 rounded-full bg-gradient-to-l from-green to-gold transition-all duration-500 group-hover:w-24" />
                </div>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
