import { motion } from "framer-motion";
import { Calculator, ShieldCheck, Zap, Gem } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export const Features = () => {
  const { t } = useTranslation();
  const features = [
    { icon: Calculator, key: "smart" },
    { icon: ShieldCheck, key: "booking" },
    { icon: Zap, key: "budget" },
    { icon: Gem, key: "live" },
  ] as const;

  const handleStartPlanning = () => {
    const el = document.getElementById("wizard");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="features" className="relative py-24 sm:py-32" dir="rtl">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            {t("features.kicker")}
          </span>
          <h2
            className="mt-4 font-wordmark text-balance text-4xl font-bold sm:text-5xl"
            style={{ color: "hsl(var(--primary-deep))" }}
          >
            {t("features.title")}
          </h2>
          <p className="font-arabic mt-4 text-muted-foreground sm:text-lg">
            {t("features.subtitle")}
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl border border-primary/15 bg-secondary/30 p-7 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-luxury"
            >
              <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-secondary/40 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative text-right">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-background">
                  <f.icon className="h-6 w-6 text-primary" strokeWidth={1.4} />
                </div>
                <h3
                  className="font-wordmark text-xl font-bold"
                  style={{ color: "hsl(var(--primary-deep))" }}
                >
                  {t(`features.${f.key}.title`)}
                </h3>
                <p className="font-arabic mt-2 text-sm leading-[1.9] text-muted-foreground">
                  {t(`features.${f.key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
