import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  SketchIconCandle,
  SketchIconBouquet,
  SketchIconSparkle,
  SketchCornerOrnament,
} from "./SketchArt";

export const UpcomingFeatures = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const dir: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";

  const items = [
    { icon: SketchIconCandle, key: "installments" },
    { icon: SketchIconBouquet, key: "invitations" },
  ] as const;

  return (
    <section
      dir={dir}
      className="relative overflow-hidden py-20 sm:py-28"
    >
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -top-20 start-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 end-0 h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-primary backdrop-blur">
            <SketchIconSparkle className="h-4 w-4" />
            {t("upcoming.kicker")}
          </span>
          <h2
            className="mt-5 text-balance text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
            style={{ color: "hsl(var(--primary-deep))" }}
          >
            {t("upcoming.title")}
          </h2>
          <p className="mt-4 text-base leading-[1.9] text-muted-foreground">
            {t("upcoming.subtitle")}
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((it, i) => (
            <motion.article
              key={it.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl border border-primary/15 glass p-8 text-start shadow-card backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-luxury"
            >
              {/* Coming soon badge */}
              <span className="absolute top-4 end-4 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                {t("upcoming.badge")}
              </span>

              <div className="pointer-events-none absolute -bottom-16 -start-16 h-40 w-40 rounded-full bg-secondary/40 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-background/70">
                  <it.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <h3
                  className="text-xl font-bold sm:text-2xl"
                  style={{ color: "hsl(var(--primary-deep))" }}
                >
                  {t(`upcoming.items.${it.key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-[1.95] text-muted-foreground sm:text-base">
                  {t(`upcoming.items.${it.key}.desc`)}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
