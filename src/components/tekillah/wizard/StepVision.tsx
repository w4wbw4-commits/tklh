import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Plus, Check } from "lucide-react";
import { visionChips } from "./types";

interface Props {
  vision: string;
  setVision: (v: string) => void;
  selectedChips: string[];
  toggleChip: (chip: string) => void;
}

export const StepVision = ({ vision, setVision, selectedChips, toggleChip }: Props) => {
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
        <h3 className="font-arabic text-2xl font-semibold text-foreground">ارسم رؤيتك لليلتك</h3>
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        اكتب تفاصيل ليلتك المثالية بكلماتك — كل تفصيلة تساعدنا نحقّقها لك.
      </p>

      <div className="mt-8 space-y-3">
        <Label className="font-arabic text-foreground">وصف ليلتك</Label>
        <Textarea
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          placeholder="مثال: أتخيّل قاعة بإضاءة دافئة، طاولات طويلة بزهور بيضاء وأخضر زيتوني، وفقرة DJ هادئة في البداية..."
          className="min-h-[180px] rounded-2xl border-border bg-card p-5 font-arabic text-base leading-relaxed text-foreground placeholder:text-foreground/40 focus-visible:ring-primary"
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          اقتراحات سريعة — اضغط لإضافتها
        </div>
        <div className="flex flex-wrap gap-2">
          {visionChips.map((chip) => {
            const isOn = selectedChips.includes(chip);
            return (
              <motion.button
                key={chip}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => insertChip(chip)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-arabic text-sm transition-all ${
                  isOn
                    ? "border-primary bg-primary text-primary-foreground shadow-soft"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                {isOn ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {chip}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
