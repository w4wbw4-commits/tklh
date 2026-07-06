import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Plus, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  vision: string;
  setVision: (v: string) => void;
  selectedChips: string[];
  toggleChip: (chip: string) => void;
}

export const StepVision = ({ vision, setVision, selectedChips, toggleChip }: Props) => {
  const { t } = useTranslation();
  const chips = t("wizard.vision.chips", { returnObjects: true }) as string[];

  const insertChip = (chip: string) => {
    toggleChip(chip);
    if (!vision.includes(chip)) {
      setVision(vision ? `${vision}\n• ${chip}` : `• ${chip}`);
    }
  };

  return (
    <motion.div
      key="step-vision"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 sm:p-10"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-arabic text-2xl font-semibold text-foreground">{t("wizard.vision.title")}</h3>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground/75">
        {t("wizard.vision.desc")}
      </p>

      <div className="mt-8 space-y-3">
        <Label className="font-arabic text-base font-semibold text-foreground">{t("wizard.vision.label")}</Label>
        <Textarea
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          placeholder={t("wizard.vision.placeholder")}
          className="min-h-[180px] rounded-2xl border-border bg-card p-5 font-arabic text-base leading-relaxed text-foreground placeholder:text-foreground/45 focus-visible:ring-primary"
        />
      </div>

    </motion.div>
  );
};
