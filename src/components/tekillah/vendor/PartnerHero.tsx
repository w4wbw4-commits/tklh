import { motion } from "framer-motion";
import { Target, LayoutDashboard, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PartnerHeroProps {
  onCtaClick: () => void;
  isAuthenticated?: boolean;
}

const benefits = [
  {
    icon: Target,
    title: "وصول مستهدف",
    desc: "نصل بخدماتك إلى العملاء الأكثر جدية في البحث عن التميز لمناسباتهم.",
  },
  {
    icon: LayoutDashboard,
    title: "إدارة ذكية",
    desc: "لوحة تحكم احترافية تتيح لك إدارة حجوزاتك، معرض أعمالك، وتقييماتك في مكان واحد.",
  },
  {
    icon: ShieldCheck,
    title: "ثقة وموثوقية",
    desc: "نحن حلقة الوصل التي تضمن حقك وحق العميل، مما يبني علاقة عمل مستدامة.",
  },
  {
    icon: TrendingUp,
    title: "نمو مستمر",
    desc: "انضم لشبكة من نخبة الموردين في السوق السعودي وارفع من حصتك السوقية.",
  },
];

export const PartnerHero = ({ onCtaClick, isAuthenticated }: PartnerHeroProps) => {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden border-b border-primary/15 bg-gradient-to-br from-secondary/40 via-background to-background"
    >
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-secondary/50 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
            بوابة الشركاء
          </span>
          <h1
            className="font-wordmark mt-6 text-balance text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
            style={{ color: "hsl(var(--primary-deep))" }}
          >
            لماذا تختار الشراكة مع تِكله؟
          </h1>
          <p className="font-tagline mt-5 text-base leading-[1.95] text-muted-foreground sm:text-lg">
            انضم إلى منصة سعودية فاخرة تربطك بأرقى العملاء وتمنحك الأدوات لإدارة عملك باحترافية،
            في بيئة تحفظ حقك وترفع من قيمة خدماتك.
          </p>
        </motion.div>

        {/* Benefits grid */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl border border-primary/15 bg-card/80 p-7 text-right shadow-card backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-luxury"
            >
              <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-secondary/40 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-background">
                  <b.icon className="h-6 w-6 text-primary" strokeWidth={1.4} />
                </div>
                <h3
                  className="font-wordmark text-xl font-bold"
                  style={{ color: "hsl(var(--primary-deep))" }}
                >
                  {b.title}
                </h3>
                <p className="font-tagline mt-3 text-sm leading-[1.95] text-muted-foreground">
                  {b.desc}
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
            className="font-tagline h-14 rounded-full px-12 text-base shadow-luxury"
          >
            {isAuthenticated ? "ابدأ إعداد ملفك الآن" : "انضم لنخبة المزودين الآن"}
          </Button>
          <p className="font-tagline text-xs text-muted-foreground">
            تسجيل سريع · مراجعة خلال 24 ساعة · بدون رسوم اشتراك
          </p>
        </motion.div>
      </div>
    </section>
  );
};
