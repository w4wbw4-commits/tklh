import { motion } from "framer-motion";
import { Building2, UtensilsCrossed, Camera, Drum, Speaker, Flower2, Car, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const services = [
  { id: "hall", icon: Building2 },
  { id: "catering", icon: UtensilsCrossed },
  { id: "photography", icon: Camera },
  { id: "decor", icon: Flower2 },
  { id: "band", icon: Drum },
  { id: "audio", icon: Speaker },
  { id: "cars", icon: Car },
];

interface Props {
  selected: string[];
  toggleService: (id: string) => void;
}

export const StepServices = ({ selected, toggleService }: Props) => {
  const { t } = useTranslation();
  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 sm:p-10"
    >
      <h3 className="font-arabic text-2xl font-semibold text-foreground">{t("wizard.services.title")}</h3>
      <p className="mt-2 text-sm text-foreground/70">{t("wizard.services.desc")}</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {services.map((s) => {
          const isOn = selected.includes(s.id);
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => toggleService(s.id)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative overflow-hidden rounded-2xl border p-5 text-start transition-all ${
                isOn ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {isOn && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute end-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary"
                >
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </motion.div>
              )}
              <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                isOn ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
              }`}>
                <s.icon className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div className="font-arabic text-base font-semibold text-foreground">{t(`wizard.services.${s.id}`)}</div>
              <div className="mt-1 text-xs text-foreground/60">{t(`wizard.services.${s.id}Desc`)}</div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
