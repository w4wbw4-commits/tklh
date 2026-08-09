// ---------------------------------------------------------------------------
// TrustStrip — three-card trust bar: two animated counters + a symbolic
// customers card (never shows a customer count, by product rule).
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Users,
  HeartHandshake,
  Crown,
  GraduationCap,
  PartyPopper,
  Cake,
  Plus,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { AnimatedCounter } from "./AnimatedCounter";

const AVATAR_ICONS = [HeartHandshake, Crown, GraduationCap, PartyPopper, Cake] as const;

// Alternating brand tints — green / cream only, no photos, no initials.
const AVATAR_STYLES = [
  "bg-green text-cream",
  "bg-cream text-green",
  "bg-green-mid text-cream",
  "bg-cream text-green",
  "bg-green text-cream",
] as const;

export const TrustStrip = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const ar = isAr ? "font-arabic" : "";

  return (
    <section
      aria-label={t("trust.aria")}
      dir={isAr ? "rtl" : "ltr"}
      className="relative overflow-hidden bg-background px-6 py-14 sm:px-8 sm:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {/* ── Card 1: halls ── */}
          <Reveal>
            <article className="h-full rounded-3xl border-2 border-gold/25 bg-cream/70 p-6 shadow-card backdrop-blur-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15 text-gold">
                <Building2 className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-green sm:text-4xl">
                  <AnimatedCounter value={100} />
                </span>
                <span className="text-2xl font-black text-gold sm:text-3xl">+</span>
              </div>
              <p className={`mt-2 text-sm font-bold text-green/85 sm:text-base ${ar}`}>
                {t("trust.halls.label")}
              </p>
            </article>
          </Reveal>

          {/* ── Card 2: service providers ── */}
          <Reveal delay={0.1}>
            <article className="h-full rounded-3xl border-2 border-gold/25 bg-cream/70 p-6 shadow-card backdrop-blur-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15 text-gold">
                <Users className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-green sm:text-4xl">
                  <AnimatedCounter value={80} />
                </span>
                <span className="text-2xl font-black text-gold sm:text-3xl">+</span>
              </div>
              <p className={`mt-2 text-sm font-bold text-green/85 sm:text-base ${ar}`}>
                {t("trust.providers.label")}
              </p>
              <p className={`mt-1 text-xs leading-relaxed text-foreground/60 sm:text-sm ${ar}`}>
                {t("trust.providers.desc")}
              </p>
            </article>
          </Reveal>

          {/* ── Card 3: customers — symbolic only, never a number ── */}
          <Reveal delay={0.2}>
            <article className="h-full rounded-3xl border-2 border-gold/25 bg-cream/70 p-6 shadow-card backdrop-blur-sm">
              <div
                aria-hidden
                className={`flex items-center ${isAr ? "flex-row-reverse justify-end" : ""}`}
              >
                {AVATAR_ICONS.map((Icon, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                    className={`-ms-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-cream shadow-soft first:ms-0 ${AVATAR_STYLES[i]}`}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} strokeWidth={1.8} />
                  </motion.span>
                ))}
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: AVATAR_ICONS.length * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  className="-ms-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-cream bg-gold/25 text-green shadow-soft"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.6} />
                </motion.span>
              </div>
              <p className={`mt-5 text-sm font-bold leading-[1.9] text-green/85 sm:text-base ${ar}`}>
                {t("trust.customers.label")}
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
