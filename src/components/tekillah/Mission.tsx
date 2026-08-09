import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import chairMark from "@/assets/tklh-chair-mark.png.asset.json";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Mission — the site's SECOND and final dark moment. One big centered
 * statement on velvet green, generous emptiness, gold closing line.
 */
export const Mission = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const ar = isAr ? "font-arabic" : "";
  const reveal = {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
  };

  return (
    <section
      id="mission"
      dir={isAr ? "rtl" : "ltr"}
      className="bg-paper relative overflow-hidden px-5 py-24 sm:px-8 sm:py-36"
    >
      <div
        className="relative z-10 mx-auto max-w-3xl px-6 py-14 text-center sm:px-12 sm:py-20"
        style={{ border: "1px solid hsl(var(--green) / 0.18)", borderRadius: 6 }}
      >
        <motion.div {...reveal} transition={{ duration: 0.75, ease: EASE }}>
          <h2
            className={`font-display mt-6 text-balance text-2xl font-black leading-[1.4] sm:text-4xl md:text-5xl ${ar}`}
            style={{ color: "hsl(var(--green))" }}
          >
            {t("mission.title")}
          </h2>
        </motion.div>

        <motion.div
          {...reveal}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="mt-12"
        >
          <p
            className={`text-lg leading-[2.1] sm:text-xl ${ar}`}
            style={{ color: "hsl(var(--brown))" }}
          >
            {t("mission.p1")}
            <br />
            {t("mission.p2Prefix")}
            <span className="font-bold" style={{ color: "hsl(var(--green))" }}>
              {t("mission.p2Highlight")}
            </span>
            {t("mission.p2Suffix")}
          </p>

          <div
            className="mx-auto my-10 h-px w-24"
            style={{ background: "hsl(var(--green) / 0.2)" }}
          />

          <p
            className={`text-lg leading-[2.1] sm:text-xl ${ar}`}
            style={{ color: "hsl(var(--brown))" }}
          >
            {t("mission.p3Prefix")}
            <span className="font-bold" style={{ color: "hsl(var(--green))" }}>
              {t("mission.p3Highlight")}
            </span>
            {t("mission.p3Suffix")}
          </p>
        </motion.div>

        <motion.p
          {...reveal}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className={`font-display mt-14 text-balance text-xl font-black leading-[1.5] sm:text-3xl md:text-4xl ${ar}`}
          style={{ color: "hsl(var(--green))" }}
        >
          {t("mission.tagline")}
        </motion.p>
      </div>
    </section>

  );
};
