import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import chairMark from "@/assets/tklh-chair-mark.png.asset.json";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Mission — one framed statement on paper cream, with a live chair medallion
 * (drawn ring + gentle float + hover press) echoing the dashboard snapshot.
 */
const ChairMedallion = () => {
  const reduce = useReducedMotion();
  const R = 46;
  const C = 2 * Math.PI * R;

  return (
    <motion.div
      className="relative mx-auto mb-8 h-28 w-28 sm:h-32 sm:w-32"
      initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE }}
      whileHover={reduce ? undefined : { scale: 1.04 }}
    >
      {/* soft halo */}
      <span
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: "0 0 0 8px hsl(var(--green) / 0.05)" }}
        aria-hidden
      />

      {/* gold ring that draws itself in */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={R} fill="none" stroke="hsl(var(--green) / 0.12)" strokeWidth="1.6" />
        <motion.circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="hsl(var(--gold))"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: reduce ? 0 : C }}
          whileInView={{ strokeDashoffset: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: reduce ? 0 : 1.5, ease: EASE, delay: 0.15 }}
        />
      </svg>

      {/* the official chair — never drawn in code */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src={chairMark.url}
          alt=""
          aria-hidden
          draggable={false}
          className="h-[52%] w-[52%] select-none object-contain"
        />
      </motion.div>
    </motion.div>
  );
};

export const Mission = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const ar = isAr ? "font-arabic" : "";
  const reveal = {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
  };

  const corner = (pos: string) => (
    <span
      className={`pointer-events-none absolute h-5 w-5 ${pos}`}
      style={{ borderColor: "hsl(var(--gold) / 0.55)" }}
      aria-hidden
    />
  );

  return (
    <section
      id="mission"
      dir={isAr ? "rtl" : "ltr"}
      className="bg-paper relative overflow-hidden px-5 py-24 sm:px-8 sm:py-36"
    >
      <img
        src={chairMark.url}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute -end-10 top-8 h-64 w-64 select-none object-contain opacity-[0.035] sm:h-80 sm:w-80"
      />

      <div
        className="relative z-10 mx-auto max-w-3xl px-6 py-14 text-center sm:px-12 sm:py-20"
        style={{ border: "1px solid hsl(var(--green) / 0.18)", borderRadius: 6 }}
      >
        {/* gold corner ornaments */}
        {corner("left-2 top-2 border-l border-t")}
        {corner("right-2 top-2 border-r border-t")}
        {corner("left-2 bottom-2 border-b border-l")}
        {corner("right-2 bottom-2 border-b border-r")}

        <ChairMedallion />

        <motion.div {...reveal} transition={{ duration: 0.75, ease: EASE, delay: 0.05 }}>
          <h2
            className={`font-display text-balance text-2xl font-black leading-[1.4] sm:text-4xl md:text-5xl ${ar}`}
            style={{ color: "hsl(var(--green))" }}
          >
            {t("mission.title")}
          </h2>
          <div className="mx-auto mt-6 flex items-center justify-center gap-3" aria-hidden>
            <motion.span
              className="h-px w-10 origin-right sm:w-16"
              style={{ background: "hsl(var(--gold) / 0.55)" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            />
            <span className="h-1 w-1 rounded-full" style={{ background: "hsl(var(--gold))" }} />
            <motion.span
              className="h-px w-10 origin-left sm:w-16"
              style={{ background: "hsl(var(--gold) / 0.55)" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            />
          </div>
        </motion.div>

        <motion.div
          {...reveal}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="mt-10 sm:mt-12"
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
