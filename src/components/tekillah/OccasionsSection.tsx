// ---------------------------------------------------------------------------
// OccasionsSection — Compact "more than weddings" strip.
// Localized via i18n (AR/EN).
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import { HeartHandshake, Crown, GraduationCap, PartyPopper } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";

const OCCASIONS = [
  { icon: HeartHandshake, key: "wedding" },
  { icon: Crown,          key: "engagement" },
  { icon: GraduationCap,  key: "graduation" },
  { icon: PartyPopper,    key: "events" },
] as const;

export const OccasionsSection = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  return (
    <section
      id="occasions"
      aria-label={t("occasions.aria")}
      dir={isAr ? "rtl" : "ltr"}
      className="relative overflow-hidden bg-hero-warm px-6 py-14 sm:px-8 sm:py-16"
    >

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/80 px-4 py-1.5 text-xs font-bold text-foreground backdrop-blur sm:text-sm">
              {t("occasions.badge")}
            </span>
            <h2 className={`mt-5 text-balance text-2xl font-black leading-[1.5] text-green sm:text-3xl md:text-4xl ${isAr ? "font-arabic" : ""}`}>
              {t("occasions.titlePrefix")}{" "}
              <span className={`inline-block bg-gradient-to-l from-green to-gold bg-clip-text pb-1 leading-[1.5] text-transparent`}>
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
                  <span className={`text-xs font-bold text-foreground/80 sm:text-sm ${isAr ? "font-arabic" : ""}`}>
                    {t(`occasions.items.${o.key}`)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
