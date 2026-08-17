import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

export type VisionBlockGroup = "dinner" | "photo" | "mood";

export interface VisionBlocks {
  dinner: string | null;
  photo: string | null;
  mood: string | null;
}

const GROUPS: Array<{
  group: VisionBlockGroup;
  labelAr: string;
  labelEn: string;
  options: Array<{ value: string; ar: string; en: string }>;
}> = [
  {
    group: "dinner",
    labelAr: "العشاء",
    labelEn: "Dinner",
    options: [
      { value: "seated_buffet", ar: "قعود مع بوفيه مفتوح", en: "Seated with open buffet" },
      { value: "lamb_feast", ar: "ذبائح خرفان كاملة", en: "Whole lamb feast" },
      { value: "buffet_only", ar: "بوفيه فقط", en: "Buffet only" },
    ],
  },
  {
    group: "photo",
    labelAr: "التصوير",
    labelEn: "Photography",
    options: [
      { value: "photo_only", ar: "صور فقط", en: "Photos only" },
      { value: "photo_video_hall", ar: "صور وفيديو للقاعة", en: "Photo & video (hall)" },
      { value: "cinematic_full", ar: "من البيت للزفة للقاعة (سينمائي)", en: "Home → zaffa → hall (cinematic)" },
    ],
  },
  {
    group: "mood",
    labelAr: "الأجواء العامة",
    labelEn: "Overall mood",
    options: [
      { value: "classic", ar: "كلاسيكي فخم", en: "Classic & grand" },
      { value: "modern", ar: "عصري بسيط", en: "Modern & simple" },
      { value: "heritage", ar: "تراثي", en: "Heritage" },
    ],
  },
];

interface Props {
  vision: string;
  setVision: (v: string) => void;
  blocks: VisionBlocks;
  setBlock: (group: VisionBlockGroup, value: string | null) => void;
}

export const StepVision = ({ vision, setVision, blocks, setBlock }: Props) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const ghost = isAr
    ? "أبي عشى ذبايح، والتصوير يبدي من البيت للزفة للقاعة، وأجواء العرس كلاسيكية فخمة مو بسيطة..."
    : "I want a lamb feast dinner, filming from home to the zaffa to the hall, and a grand classic mood...";

  return (
    <motion.div
      key="step-vision"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 sm:p-10"
    >
      <h3 className="font-arabic text-2xl font-semibold text-foreground">{t("wizard.vision.title")}</h3>
      <p className="mt-2 text-sm font-medium text-foreground/75">{t("wizard.vision.desc")}</p>

      <div className="mt-8 space-y-3">
        <Label className="font-arabic text-base font-semibold text-foreground">{t("wizard.vision.label")}</Label>
        <Textarea
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          placeholder={ghost}
          className="min-h-[160px] rounded-2xl border-border bg-card p-5 font-arabic text-base leading-relaxed text-foreground placeholder:text-foreground/40 focus-visible:ring-primary"
        />
      </div>

      {/* لبنات رؤيتك — one choice per group, feeds the provider ranking engine */}
      <div className="mt-8 space-y-6">
        <h4 className="font-arabic text-base font-semibold text-foreground">
          {isAr ? "لبنات رؤيتك" : "Your vision building blocks"}
        </h4>
        {GROUPS.map((g) => (
          <div key={g.group} className="space-y-2">
            <span className="font-arabic text-xs font-medium text-foreground/60">
              {isAr ? g.labelAr : g.labelEn}
            </span>
            <div className="flex flex-wrap gap-2">
              {g.options.map((o) => {
                const active = blocks[g.group] === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setBlock(g.group, active ? null : o.value)}
                    className={`min-h-[40px] rounded-full border px-4 py-2 font-arabic text-[13px] transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary/30 bg-transparent text-foreground/80 hover:border-primary/60"
                    }`}
                  >
                    {isAr ? o.ar : o.en}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
