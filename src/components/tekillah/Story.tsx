import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import storyImage from "@/assets/story-fabric.jpg";

export const Story = () => {
  const { t } = useTranslation();

  return (
    <section
      id="story"
      className="relative w-full overflow-hidden bg-background py-28 sm:py-36"
    >
      {/* Soft-focus luxury background */}
      <div className="absolute inset-0">
        <img
          src={storyImage}
          alt={t("story.imgAlt")}
          width={1920}
          height={1080}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ filter: "blur(2px) saturate(1.05)" }}
        />
        {/* Cream wash for legibility while preserving fabric warmth */}
        <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/85 to-background/55" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Decorative side — empty column lets background breathe on desktop */}
          <div className="hidden lg:col-span-5 lg:block" aria-hidden>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="aspect-[4/5] w-full rounded-[2.5rem] border border-primary/15 shadow-luxury"
              style={{
                backgroundImage: `url(${storyImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>

          {/* Text column — RTL aligned */}
          <div className="lg:col-span-7" dir="rtl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 inline-flex items-center gap-3"
            >
              <span className="h-px w-10 bg-primary/50" />
              <span className="text-xs font-medium tracking-[0.22em] text-primary-deep">
                {t("story.kicker")}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-wordmark text-balance text-right text-5xl font-bold leading-[1.25] text-primary-deep sm:text-6xl md:text-7xl"
              lang="ar"
              dir="rtl"
              style={{ color: "hsl(var(--primary-deep))" }}
            >
              {t("story.title")}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 mb-8 flex items-center gap-3"
              style={{ transformOrigin: "right" }}
            >
              <span className="h-px w-16 bg-primary/40" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="font-arabic text-balance text-right text-lg leading-[2] text-foreground/85 sm:text-xl"
            >
              {t("story.body")}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="font-arabic mt-6 text-balance text-right text-base leading-[2] text-foreground/70 sm:text-lg"
            >
              {t("story.secondary")}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};
