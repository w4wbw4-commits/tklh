// ---------------------------------------------------------------------------
// OccasionsSection — cream editorial band: a quiet row of line icons, then a
// single trust row (numbers in antique gold, separated by 1px gold rules).
// No cards, no counts for customers.
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import {
  HeartHandshake,
  Crown,
  GraduationCap,
  PartyPopper,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { AnimatedCounter } from "./AnimatedCounter";

const EASE = [0.22, 1, 0.36, 1] as const;

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
      className="relative px-5 py-20 sm:px-8 sm:py-28"
      style={{ borderTop: "1px solid hsl(var(--gold) / 0.45)" }}
    >
      <div className="relative mx-auto max-w-5xl">
        <Reveal>
          <div>
            {/* asymmetry: the title runs long, the icon row sits under it */}
            <h2
              className={`font-display mt-5 max-w-2xl text-balance text-2xl font-black leading-[1.4] text-green sm:text-4xl md:text-5xl ${ar}`}
            >
              {t("occasions.titlePrefix")} {t("occasions.titleHighlight")}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-12 flex flex-wrap items-center gap-x-12 gap-y-8 sm:gap-x-20">
            {OCCASIONS.map((o, i) => {
              const Icon = o.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <Icon className="h-6 w-6 shrink-0 text-wine" strokeWidth={1.2} />
                  <span className={`text-[15px] font-bold text-green sm:text-base ${ar}`}>
                    {t(`occasions.items.${o.key}`)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </Reveal>

        {/* ── Trust row: two numerals, one gold rule between them ─────────── */}
        <Reveal delay={0.2}>
          <div
            aria-label={t("trust.aria")}
            className="mt-16 grid gap-10 py-10 sm:mt-20 sm:grid-cols-2 sm:gap-0"
            style={{
              borderTop: "1px solid hsl(var(--gold) / 0.45)",
              borderBottom: "1px solid hsl(var(--gold) / 0.45)",
            }}
          >
            {[
              { value: 100, label: t("trust.halls.label"), desc: t("trust.halls.desc") },
              { value: 80, label: t("trust.providers.label"), desc: t("trust.providers.desc") },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.75, ease: EASE, delay: i * 0.14 }}
                className={i === 1 ? "sm:ps-14" : "sm:pe-14"}
                style={
                  i === 1
                    ? { borderInlineStart: "1px solid hsl(var(--gold) / 0.45)" }
                    : undefined
                }
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-black leading-none tabular-nums text-wine sm:text-6xl">
                    <AnimatedCounter value={item.value} />
                  </span>
                  <span className="font-display text-3xl font-black leading-none text-wine sm:text-4xl">
                    +
                  </span>
                </div>
                <p className={`mt-4 text-base font-bold text-green ${ar}`}>{item.label}</p>
                <p className={`mt-2 max-w-sm text-[15px] leading-[1.9] text-[hsl(var(--brown))] ${ar}`}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
