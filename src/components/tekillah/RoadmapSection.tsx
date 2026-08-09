// ---------------------------------------------------------------------------
// RoadmapSection — replaces the old "coming soon" pile-up. Everything that
// isn't shipped yet lives here, once, as a single elegant roadmap.
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CreditCard, MailOpen, Wallet } from "lucide-react";
import { Reveal } from "./Reveal";

const ITEMS = [
  { key: "installments", icon: Wallet },
  { key: "invitations", icon: MailOpen },
  { key: "payments", icon: CreditCard },
] as const;

export const RoadmapSection = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  return (
    <section
      id="roadmap"
      aria-label={t("roadmap.aria")}
      dir={isAr ? "rtl" : "ltr"}
      className="relative overflow-hidden bg-background px-5 py-14 sm:px-8 sm:py-16"
    >
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="text-center">
            <h2 className={`text-2xl font-black leading-[1.5] text-green sm:text-3xl ${isAr ? "font-arabic" : "font-display"}`}>
              {t("roadmap.title")}
            </h2>
            <p className={`mx-auto mt-2 max-w-md text-sm text-foreground/65 ${isAr ? "font-arabic" : ""}`}>
              {t("roadmap.subtitle")}
            </p>
          </div>
        </Reveal>

        {/* Timeline rail */}
        <div className="relative mt-9">
          <span className="absolute inset-y-0 start-[26px] w-px bg-gradient-to-b from-gold/10 via-gold/45 to-gold/10 sm:start-[30px]" />

          <ul className="space-y-3.5">
            {ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <Reveal delay={0.06 * i}>
                    <motion.div
                      whileHover={{ x: isAr ? -4 : 4 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="relative flex items-start gap-4 rounded-2xl border border-gold/20 bg-cream/60 p-4 pe-5 shadow-card backdrop-blur transition-colors duration-500 hover:border-gold/50 hover:bg-cream"
                    >
                      <span className="relative z-10 grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border border-gold/40 bg-background text-gold shadow-soft sm:h-[60px] sm:w-[60px]">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.6} />
                      </span>

                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`text-sm font-black text-green sm:text-base ${isAr ? "font-arabic" : ""}`}>
                            {t(`roadmap.items.${item.key}.title`)}
                          </h3>
                          <span className={`rounded-full border border-gold/40 bg-gold/12 px-2 py-0.5 text-[10px] font-bold text-green ${isAr ? "font-arabic" : ""}`}>
                            {t("roadmap.soon")}
                          </span>
                        </div>
                        <p className={`mt-1 text-xs leading-[1.8] text-foreground/70 sm:text-[13px] ${isAr ? "font-arabic" : ""}`}>
                          {t(`roadmap.items.${item.key}.desc`)}
                        </p>
                      </div>
                    </motion.div>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};
