import { motion } from "framer-motion";
import { Building2, UtensilsCrossed, Camera, Music2, Flower2, Car, Check } from "lucide-react";

const services = [
  { id: "hall", icon: Building2, name: "القاعة", desc: "اختر من أفخم القاعات" },
  { id: "catering", icon: UtensilsCrossed, name: "الضيافة", desc: "أشهى الأطباق" },
  { id: "photography", icon: Camera, name: "التصوير", desc: "لحظات لا تُنسى" },
  { id: "dj", icon: Music2, name: "DJ والصوت", desc: "أجواء مميزة" },
  { id: "decor", icon: Flower2, name: "التنسيق والديكور", desc: "لمسة فاخرة" },
  { id: "cars", icon: Car, name: "السيارات", desc: "وصول بأناقة" },
];

interface Props {
  selected: string[];
  toggleService: (id: string) => void;
}

export const StepServices = ({ selected, toggleService }: Props) => (
  <motion.div
    key="step-1"
    initial={{ opacity: 0, x: -24 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 24 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="p-6 sm:p-10"
  >
    <h3 className="font-arabic text-2xl font-semibold text-foreground">اختر خدماتك</h3>
    <p className="mt-2 text-sm text-foreground/70">اختر ما تحتاجه — يمكنك تعديل اختياراتك في أي وقت.</p>

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
            className={`group relative overflow-hidden rounded-2xl border p-5 text-right transition-all ${
              isOn ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-card hover:border-primary/40"
            }`}
          >
            {isOn && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary"
              >
                <Check className="h-3.5 w-3.5 text-primary-foreground" />
              </motion.div>
            )}
            <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
              isOn ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
            }`}>
              <s.icon className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <div className="font-arabic text-base font-semibold text-foreground">{s.name}</div>
            <div className="mt-1 text-xs text-foreground/60">{s.desc}</div>
          </motion.button>
        );
      })}
    </div>
  </motion.div>
);
