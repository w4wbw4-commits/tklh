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
  ShieldCheck,
  Star,
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

const AVATAR_ICONS = [HeartHandshake, Crown, GraduationCap, PartyPopper, Cake] as const;

const AVATAR_STYLES = [
  "bg-green text-cream",
  "bg-cream text-green",
  "bg-green/80 text-cream",
  "bg-cream text-green",
  "bg-green text-cream",
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
            className="mt-12 overflow-hidden rounded-[2rem] border border-gold/30 bg-cream/70 shadow-card backdrop-blur-sm sm:mt-16"
          >
            <div className="grid divide-gold/20 md:grid-cols-[1fr_1fr_1.35fr] md:divide-x md:rtl:divide-x-reverse">
              {/* Halls */}
              <div className="flex items-center gap-4 px-6 py-7 sm:px-8">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15 text-gold">
                  <Building2 className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tabular-nums text-green sm:text-4xl">
                      <AnimatedCounter value={100} />
                    </span>
                    <span className="text-2xl font-black text-gold sm:text-3xl">+</span>
                  </div>
                  <p className={`mt-1 text-sm font-bold text-green/85 ${ar}`}>
                    {t("trust.halls.label")}
                  </p>
                </div>
              </div>

              {/* Providers */}
              <div className="flex items-start gap-4 border-t border-gold/20 px-6 py-7 sm:px-8 md:border-t-0">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15 text-gold">
                  <Users className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tabular-nums text-green sm:text-4xl">
                      <AnimatedCounter value={80} />
                    </span>
                    <span className="text-2xl font-black text-gold sm:text-3xl">+</span>
                  </div>
                  <p className={`mt-1 text-sm font-bold text-green/85 ${ar}`}>
                    {t("trust.providers.label")}
                  </p>
                  <p className={`mt-1 text-xs leading-relaxed text-foreground/60 ${ar}`}>
                    {t("trust.providers.desc")}
                  </p>
                </div>
              </div>

              {/* Customers — symbolic only */}
              <div className="flex flex-col justify-center gap-3.5 border-t border-gold/20 bg-green/[0.04] px-6 py-7 sm:px-8 md:border-t-0">
                <div
                  aria-hidden
                  className={`flex items-center ${isAr ? "flex-row-reverse justify-end" : ""}`}
                >
                  {AVATAR_ICONS.map((Icon, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.7, y: 8 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                      className={`-ms-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-cream shadow-soft first:ms-0 ${AVATAR_STYLES[i]}`}
                    >
                      <Icon style={{ width: 18, height: 18 }} strokeWidth={1.8} />
                    </motion.span>
                  ))}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7, y: 8 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: AVATAR_ICONS.length * 0.09, ease: [0.22, 1, 0.36, 1] }}
                    className="-ms-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-cream bg-gold/25 text-green shadow-soft"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.6} />
                  </motion.span>
                </div>
                <p className={`text-sm font-bold leading-[1.9] text-green/90 sm:text-base ${ar}`}>
                  {t("trust.customers.label")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
