import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Users, Hand } from "lucide-react";

export type VisionPath = "team" | "self";
export type VisionBlockGroup = "venue" | "dinner" | "photo" | "mood";
export interface VisionBlocks { venue: string | null; dinner: string | null; photo: string | null; mood: string | null }

export const VISION_GROUPS: Array<{
  group: VisionBlockGroup; labelAr: string; labelEn: string;
  options: Array<{ value: string; ar: string; en: string }>;
}> = [
  {
    group: "venue", labelAr: "مكان", labelEn: "Venue",
    options: [
      { value: "hall", ar: "قاعة", en: "Hall" },
      { value: "resort", ar: "منتجع", en: "Resort" },
      { value: "resthouse", ar: "فنادق", en: "Rest house" },
    ],
  },
  {
    group: "dinner", labelAr: "عشاء", labelEn: "Dinner",
    options: [
      { value: "seated_buffet", ar: "قعود مع بوفيه مفتوح", en: "Seated with open buffet" },
      { value: "lamb_feast", ar: "ذبائح ", en: "Whole lamb feast" },
      { value: "buffet_only", ar: "بوفيه فقط", en: "Buffet only" },
    ],
  },
  {
    group: "photo", labelAr: "تصوير", labelEn: "Photography",
    options: [
      { value: "photo_only", ar: "صور فقط", en: "Photos only" },
      { value: "photo_video_hall", ar: "صور وفيديو للقاعة", en: "Photo & video (hall)" },
      { value: "cinematic_full", ar: "من البيت للزفة للقاعة", en: "Home → zaffa → hall" },
    ],
  },
  {
    group: "mood", labelAr: "أجواء", labelEn: "Overall mood",
    options: [
      { value: "classic", ar: "راقي ومميز", en: "Classic & grand" },
      { value: "modern", ar: "مودرن وسادة", en: "Modern & simple" },
      { value: "heritage", ar: "بسيط ويواجه", en: "Heritage" },
    ],
  },
];

const GROUPS = VISION_GROUPS;

interface Props {
  path: VisionPath;
  setPath: (p: VisionPath) => void;
  vision: string;
  setVision: (v: string) => void;
  blocks: VisionBlocks;
  setBlock: (g: VisionBlockGroup, v: string | null) => void;
}

export const StepVisionPaths = ({
  path, setPath, vision, setVision, blocks, setBlock,
}: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  const ghost = isAr
    ? "أتخيل عشى ذبايح دافئ، وصور توثق كل لحظة من البيت للقاعة، وأجواء فخمة بس مو متكلفة..."
    : "I imagine a warm lamb feast, photos of every moment from home to the hall, and a grand but effortless mood...";

  return (
    <motion.div
      key="step-vision"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="p-4 sm:p-8"
    >
      <h3 className="font-arabic text-2xl font-semibold text-foreground">
        {isAr ? "اكتب رؤيتك" : "Write your vision"}
      </h3>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setPath("team")}
          aria-pressed={path === "team"}
          className={cn(
            "rounded-2xl border p-4 text-start transition-all duration-500",
            path === "team" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
          )}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full border border-primary/30 text-primary">
            <Users className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <span className="mt-3 block font-arabic text-base font-semibold text-foreground">
            {isAr ? "فريق تكله يختار لي الأنسب" : "Let the Tklh team choose"}
          </span>
          <span className="mt-1 block font-arabic text-[13px] text-foreground/65">
            {isAr ? "اكتب لنا رؤيتك، وحنا نجهزها لك." : "Describe your vision and we'll prepare it."}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPath("self")}
          aria-pressed={path === "self"}
          className={cn(
            "rounded-2xl border p-4 text-start transition-all duration-500",
            path === "self" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
          )}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full border border-primary/30 text-primary">
            <Hand className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <span className="mt-3 flex items-center gap-2">
            <span className="font-arabic text-base font-semibold text-foreground">
              {isAr ? "أبني اختياراتي بنفسي" : "I'll build it myself"}
            </span>
            <span className="rounded-full border border-[hsl(var(--gold))]/50 px-2 py-0.5 font-arabic text-[10px] font-semibold text-[hsl(var(--gold))]">
              {isAr ? "قريبًا" : "Soon"}
            </span>
          </span>
          <span className="mt-1 block font-arabic text-[13px] text-foreground/65">
            {isAr ? "تختار مزودينك بنفسك، ونشتغل معك خطوة بخطوة." : "Pick your own providers, step by step."}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {path === "team" && (
          <motion.div
            key="team-fields"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 space-y-7"
          >
            <div className="space-y-2">
              <Label className="font-arabic text-base font-semibold text-foreground">
                {isAr ? "كيف تتخيل مناسبتك؟" : "How do you imagine your event?"}
              </Label>
              <Textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder={ghost}
                className="min-h-[150px] rounded-2xl border-border bg-card p-4 font-arabic text-base leading-relaxed text-foreground placeholder:text-foreground/40 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-5">
              <h4 className="font-arabic text-base font-semibold text-foreground">
                {isAr ? "خيارات ممكن تساعدك" : "Options that might help"}
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
                          className={cn(
                            "min-h-[44px] rounded-full border px-4 py-2 font-arabic text-[13px] transition-all duration-500",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-primary/30 text-foreground/80 hover:border-primary/60",
                          )}
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
        )}
      </AnimatePresence>
    </motion.div>
  );
};
