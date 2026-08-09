// ---------------------------------------------------------------------------
// OccasionsSection — "Tklh for all your happy occasions".
// The generic circular icons are gone: each category is now a wax seal, the
// symbol of an invitation, on a card tinted to that seal's wax colour.
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { WaxSeal, SEAL_PALETTES, type SealCategory } from "./WaxSeal";

const OCCASIONS: { key: string; seal: SealCategory }[] = [
  { key: "wedding", seal: "wedding" },
  { key: "engagement", seal: "engagement" },
  { key: "graduation", seal: "graduation" },
  { key: "kids", seal: "kids" },
  { key: "hospitality", seal: "hospitality" },
  { key: "events", seal: "events" },
];

export const OccasionsSection = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  return (
    <section
      id="occasions"
      aria-label={t("occasions.aria")}
      dir={isAr ? "rtl" : "ltr"}
      className="relative overflow-hidden bg-hero-warm px-5 py-14 sm:px-8 sm:py-16"
    >
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <span className={`inline-flex items-center rounded-full border border-gold/40 bg-cream/80 px-4 py-1.5 text-xs font-bold text-foreground backdrop-blur sm:text-sm ${isAr ? "font-arabic" : ""}`}>
              {t("occasions.badge")}
            </span>
            <h2 className={`mt-5 text-balance text-2xl font-black leading-[1.5] text-green sm:text-3xl md:text-4xl ${isAr ? "font-arabic" : ""}`}>
              {t("occasions.titlePrefix")}{" "}
              <span className="inline-block bg-gradient-to-l from-green to-gold bg-clip-text pb-1 leading-[1.5] text-transparent">
                {t("occasions.titleHighlight")}
              </span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {OCCASIONS.map((o, i) => {
              const p = SEAL_PALETTES[o.seal];
              return (
                <motion.article
                  key={o.key}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -3 }}
                  className="group flex flex-col items-center gap-3 rounded-[26px] border p-4 shadow-card backdrop-blur transition-shadow duration-500 hover:shadow-card-hover"
                  style={{ background: p.card, borderColor: p.border }}
                >
                  <WaxSeal category={o.seal} size={72} title={t(`occasions.items.${o.key}`)} />
                  <span
                    className={`text-center text-xs font-black leading-[1.6] sm:text-sm ${isAr ? "font-arabic" : ""}`}
                    style={{ color: p.waxDark }}
                  >
                    {t(`occasions.items.${o.key}`)}
                  </span>
                </motion.article>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
