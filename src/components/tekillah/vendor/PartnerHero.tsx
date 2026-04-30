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
      className="relative overflow-hidden border-b border-gold/30"
      style={{
        background:
          "radial-gradient(circle at 20% 0%, hsl(var(--gold) / 0.18), transparent 55%), radial-gradient(circle at 90% 100%, hsl(var(--primary) / 0.25), transparent 60%), linear-gradient(135deg, hsl(var(--background)), hsl(var(--secondary) / 0.4))",
      }}
    >
      {/* Decorative Najdi-gold blurs */}
      <div className="pointer-events-none absolute -top-24 end-0 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 start-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Premium Partner Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-primary-deep/90 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-gold shadow-[0_4px_20px_-4px_hsl(var(--gold)/0.4)] backdrop-blur">
            <Crown className="h-3.5 w-3.5" strokeWidth={1.8} />
            {t("vendor.partnerHero.badge", { defaultValue: isRtl ? "بوابة الشركاء الحصرية" : "Exclusive Partner Portal" })}
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
              className="group relative overflow-hidden rounded-3xl border border-gold/20 bg-card/85 p-7 text-start shadow-card backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-luxury"
            >
              <div className="pointer-events-none absolute -top-12 -end-12 h-32 w-32 rounded-full bg-gold/25 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-gradient-to-br from-primary-deep to-primary text-gold">
                  <b.icon className="h-6 w-6" strokeWidth={1.5} />
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

        {/* Dual CTA — register vs sign-in */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 flex flex-col items-center gap-4"
        >
          {isAuthenticated ? (
            <Button
              size="lg"
              onClick={onCtaClick}
              className="h-14 rounded-full bg-primary-deep px-12 text-base text-gold shadow-luxury hover:bg-primary"
            >
              <Sparkles className="me-2 h-4 w-4" />
              {t("vendor.partnerHero.ctaAuthed", { defaultValue: isRtl ? "أكمل ملف قاعتك" : "Complete your profile" })}
            </Button>
          ) : (
            <div className="flex w-full max-w-2xl flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              {/* Primary: Register as new vendor */}
              <Button
                size="lg"
                onClick={onCtaClick}
                className="h-14 flex-1 rounded-full border-2 border-gold bg-gold px-8 text-base font-bold text-primary-deep shadow-[0_8px_24px_-6px_hsl(var(--gold)/0.55)] transition-all hover:scale-[1.02] hover:bg-gold sm:flex-none sm:px-10"
              >
                <UserPlus className="me-2 h-5 w-5" />
                {isRtl ? "سجّل كمزوّد خدمة" : "Register as Vendor"}
              </Button>
              {/* Secondary: Existing partner sign-in */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 flex-1 rounded-full border-2 border-primary-deep bg-transparent px-8 text-base font-bold text-primary-deep transition-all hover:bg-primary-deep hover:text-gold sm:flex-none sm:px-10"
              >
                <Link to="/auth?redirect=/vendor&role=vendor">
                  <LogIn className="me-2 h-5 w-5" />
                  {isRtl ? "دخول شريك حالي" : "Partner Sign-in"}
                </Link>
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {t("vendor.partnerHero.footnote")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
