import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { CATEGORIES, type EventTypeKey } from "./journeyData";

interface Props {
  eventType: EventTypeKey;
  selected: string[];
  toggle: (key: string) => void;
}

export const StepJourneyServices = ({ eventType, selected, toggle }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const list = CATEGORIES[eventType] ?? [];

  return (
    <motion.div
      key="step-services"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="p-4 sm:p-8"
    >
      <h3 className="font-arabic text-2xl font-semibold text-foreground">
        {isAr ? "وش تحتاج لمناسبتك؟" : "What do you need for your event?"}
      </h3>
      <p className="mt-1 font-arabic text-sm text-foreground/70">
        {isAr ? "اختر الخدمات اللي تبيها، وحنا نكمل الباقي." : "Pick the services you want — we handle the rest."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {list.map((c) => {
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[c.icon] ?? Icons.Sparkle;
          const active = selected.includes(c.key);
          return (
            <motion.button
              key={c.key}
              type="button"
              onClick={() => toggle(c.key)}
              aria-pressed={active}
              whileTap={{ scale: 0.97, rotate: active ? 0 : -1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center transition-all duration-500",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-[inset_0_2px_10px_hsl(var(--primary)/0.55)]"
                  : "border-border text-foreground hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-full border transition-colors duration-500",
                  active ? "border-[hsl(var(--gold))]/60 text-[hsl(var(--gold))]" : "border-primary/30 text-primary",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <span className="font-arabic text-[13px] font-semibold leading-tight">
                {isAr ? c.ar : c.en}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-5 font-arabic text-base font-bold text-[hsl(var(--gold))]">
        {isAr
          ? `اخترت ${selected.length} من ${list.length} خدمات`
          : `You picked ${selected.length} of ${list.length} services`}
      </p>
    </motion.div>
  );
};
