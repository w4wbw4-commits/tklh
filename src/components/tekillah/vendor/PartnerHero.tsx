import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, LayoutDashboard, ShieldCheck, TrendingUp, Sparkles, LogIn, UserPlus, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface PartnerHeroProps {
  onCtaClick: () => void;
  isAuthenticated?: boolean;
}

export const PartnerHero = ({ onCtaClick, isAuthenticated }: PartnerHeroProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const dir: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";

  const benefits = [
    { icon: Target, key: "reach" },
    { icon: LayoutDashboard, key: "manage" },
    { icon: ShieldCheck, key: "trust" },
    { icon: TrendingUp, key: "growth" },
  ] as const;

  return (
    <section
      dir={dir}
      className="relative overflow-hidden border-b border-primary/15 bg-gradient-to-br from-secondary/40 via-background to-background"
    >
      {/* Decorative blurs — mirror anchors with logical positioning */}
      <div className="pointer-events-none absolute -top-24 end-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 start-0 h-80 w-80 rounded-full bg-secondary/50 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
            {t("vendor.partnerHero.badge")}
          </span>
          <h1
            className="mt-6 text-balance text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
            style={{ color: "hsl(var(--primary-deep))" }}
          >
            {t("vendor.partnerHero.title")}
          </h1>
          <p className="mt-5 text-base leading-[1.95] text-muted-foreground sm:text-lg">
            {t("vendor.partnerHero.subtitle")}
          </p>
        </motion.div>

        {/* Benefits grid */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl border border-primary/15 bg-card/80 p-7 text-start shadow-card backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-luxury"
            >
              <div className="pointer-events-none absolute -top-12 -end-12 h-32 w-32 rounded-full bg-secondary/40 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-background">
                  <b.icon className="h-6 w-6 text-primary" strokeWidth={1.4} />
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: "hsl(var(--primary-deep))" }}
                >
                  {t(`vendor.partnerHero.benefits.${b.key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-[1.95] text-muted-foreground">
                  {t(`vendor.partnerHero.benefits.${b.key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 flex flex-col items-center gap-3"
        >
          <Button
            size="lg"
            onClick={onCtaClick}
            className="h-14 rounded-full px-12 text-base shadow-luxury"
          >
            {isAuthenticated
              ? t("vendor.partnerHero.ctaAuthed")
              : t("vendor.partnerHero.ctaGuest")}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t("vendor.partnerHero.footnote")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
