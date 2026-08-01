// ---------------------------------------------------------------------------
// OccasionsSection — a row of sector cards (was: plain grey icon circles).
// Each card uses its OWN secondary sector colour (light background + dark
// corner seal). Sector colours never leak into the global site identity.
// Localized via i18n (AR/EN).
// ---------------------------------------------------------------------------
import { motion, useReducedMotion } from "framer-motion";
import { HeartHandshake, Crown, GraduationCap, PartyPopper } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { WaxSeal, BRAND_EASE } from "./BrandMarks";

const OCCASIONS = [
  { icon: HeartHandshake, key: "wedding",     token: "wedding" },
  { icon: Crown,          key: "engagement",  token: "engagement" },
  { icon: GraduationCap,  key: "graduation",  token: "graduation" },
  { icon: PartyPopper,    key: "events",      token: "events" },
] as const;

export const OccasionsSection = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const reduce = useReducedMotion();

  return (
    <section
      id="occasions"
      aria-label={t("occasions.aria")}
      dir={isAr ? "rtl" : "ltr"}
      className="relative overflow-hidden bg-background px-5 py-14 sm:px-8 sm:py-16"
    >
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brass/40 bg-bone px-4 py-1.5 text-xs font-bold text-green sm:text-sm">
              {t("occasions.badge")}
            </span>
            <h2 className={`mt-5 text-3xl font-black leading-[1.5] text-green md:text-4xl ${isAr ? "font-arabic" : "font-cinzel"}`}>
              {t("occasions.titlePrefix")}{" "}
              <span className="text-brass">{t("occasions.titleHighlight")}</span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {OCCASIONS.map((o, i) => {
            const Icon = o.icon;
            const dark = `hsl(var(--sector-${o.token}))`;
            const soft = `hsl(var(--sector-${o.token}-soft))`;
            return (
              <motion.article
                key={o.key}
                initial={reduce ? undefined : { opacity: 0, y: 16 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: BRAND_EASE }}
                whileHover={reduce ? undefined : { y: -3 }}
                className="group relative overflow-hidden rounded-[28px] p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
                style={{ background: soft, border: `1px solid ${dark}22` }}
              >
                <WaxSeal color={dark} size={38} className="absolute top-4 end-4 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
                <span
                  className="inline-grid h-10 w-10 place-items-center rounded-xl"
                  style={{ background: `${dark}14`, color: dark }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <h3
                  className={`mt-3 text-sm font-black sm:text-base ${isAr ? "font-arabic" : ""}`}
                  style={{ color: dark }}
                >
                  {t(`occasions.items.${o.key}`)}
                </h3>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
