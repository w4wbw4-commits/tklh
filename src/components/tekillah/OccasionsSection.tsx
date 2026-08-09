// ---------------------------------------------------------------------------
// OccasionsSection — "more than weddings" strip merged with the trust bar
// (two animated counters + a symbolic customers cluster, never a count).
// Localized via i18n (AR/EN).
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import {
  HeartHandshake,
  Crown,
  GraduationCap,
  PartyPopper,
  Building2,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { AnimatedCounter } from "./AnimatedCounter";

const OCCASIONS = [
  { icon: HeartHandshake, key: "wedding" },
  { icon: Crown,          key: "engagement" },
  { icon: GraduationCap,  key: "graduation" },
  { icon: PartyPopper,    key: "events" },
] as const;


export const OccasionsSection = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const ar = isAr ? "font-arabic" : "";

  return (
    <section
      id="occasions"
      aria-label={t("occasions.aria")}
      dir={isAr ? "rtl" : "ltr"}
      className="relative overflow-hidden bg-hero-warm px-6 py-14 sm:px-8 sm:py-20"
    >
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <h2 className={`mt-5 text-balance text-2xl font-black leading-[1.5] text-green sm:text-3xl md:text-4xl ${ar}`}>
              {t("occasions.titlePrefix")}{" "}
              <span className="inline-block bg-gradient-to-l from-green to-gold bg-clip-text pb-1 leading-[1.5] text-transparent">
                {t("occasions.titleHighlight")}
              </span>
            </h2>
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
                  <span className={`text-xs font-bold text-foreground/80 sm:text-sm ${ar}`}>
                    {t(`occasions.items.${o.key}`)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </Reveal>

        {/* ── Merged trust band ─────────────────────────────────────────── */}
        <Reveal delay={0.15}>
          <div
            aria-label={t("trust.aria")}
            className="mt-12 grid gap-5 sm:mt-16 sm:gap-6 md:grid-cols-2"
          >
            {/* Halls */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-[2rem] border border-gold/30 bg-gradient-to-br from-cream via-cream to-gold/10 p-7 shadow-card backdrop-blur-sm sm:p-9"
            >
              <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
              <div className="relative flex items-start gap-5">
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green text-cream shadow-lg shadow-green/20 ring-1 ring-green/20">
                  <Building2 className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-black tabular-nums text-green sm:text-5xl">
                      <AnimatedCounter value={100} />
                    </span>
                    <span className="text-3xl font-black text-gold sm:text-4xl">+</span>
                  </div>
                  <p className={`mt-1 text-base font-bold text-green/90 ${ar}`}>
                    {t("trust.halls.label")}
                  </p>
                  <p className={`mt-2 text-sm leading-relaxed text-foreground/60 ${ar}`}>
                    {t("trust.halls.desc")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Providers */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-[2rem] border border-gold/30 bg-gradient-to-br from-cream via-cream to-gold/10 p-7 shadow-card backdrop-blur-sm sm:p-9"
            >
              <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
              <div className="relative flex items-start gap-5">
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green text-cream shadow-lg shadow-green/20 ring-1 ring-green/20">
                  <Users className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-black tabular-nums text-green sm:text-5xl">
                      <AnimatedCounter value={80} />
                    </span>
                    <span className="text-3xl font-black text-gold sm:text-4xl">+</span>
                  </div>
                  <p className={`mt-1 text-base font-bold text-green/90 ${ar}`}>
                    {t("trust.providers.label")}
                  </p>
                  <p className={`mt-2 text-sm leading-relaxed text-foreground/60 ${ar}`}>
                    {t("trust.providers.desc")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
