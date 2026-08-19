import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { toLatinDigits } from "@/i18n/format";
import { WaxSeal } from "./WaxSeal";
import pkgClassic from "@/assets/packages/pkg-classic-luxury.jpg";
import pkgHotel from "@/assets/packages/pkg-hotel.jpg";
import pkgModern from "@/assets/packages/pkg-modern.jpg";
import pkgHeritage from "@/assets/packages/pkg-heritage.jpg";

const BACKDROP = [pkgClassic, pkgHotel, pkgModern, pkgHeritage];

interface Props {
  summary: string[];
  payload: Record<string, unknown>;
}

export const StepComingSoon = ({ summary, payload }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const cleanPhone = toLatinDigits(phone).replace(/\D/g, "");
    if (name.trim().length < 2) {
      toast.error(isAr ? "اكتب اسمك عشان نعرف نناديك" : "Please enter your name");
      return;
    }
    if (cleanPhone.length < 9) {
      toast.error(isAr ? "تأكد من رقم جوالك" : "Please check your phone number");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("planner_interest").insert({
      full_name: name.trim(),
      phone: cleanPhone,
      details: payload as never,
    });
    setSaving(false);
    if (error) {
      toast.error(isAr ? "ما وصلت بياناتك، جرب مرة ثانية" : "Something went wrong, try again");
      return;
    }
    setDone(true);
  };

  return (
    <motion.div
      key="step-soon"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-8"
    >
      {/* Blurred package layout behind the seal — real content, softly out of focus */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="grid h-full grid-cols-2 gap-3 p-4 opacity-60 blur-[14px] sm:grid-cols-4">
          {BACKDROP.map((src, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border">
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        {summary.length > 0 && (
          <p className="max-w-lg font-arabic text-[13px] leading-relaxed text-foreground/70">
            {summary.join(isAr ? " · " : " · ")}
          </p>
        )}

        <WaxSeal size={128} className="mt-5" />
        <p className="mt-3 font-arabic text-2xl font-bold text-primary">
          {isAr ? "قريبًا" : "Coming soon"}
        </p>

        <p className="mt-4 max-w-xl font-arabic text-sm leading-relaxed text-foreground/80">
          {isAr
            ? "إحنا الحين في مرحلة بناء وتجهيز شبكة مزودي الخدمة بعناية، عشان أول ما نطلق لك تكون الخيارات فعلاً تستاهل ثقتك."
            : "We're building and preparing our provider network carefully, so when we launch, the options truly deserve your trust."}
        </p>

        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-7 w-full max-w-md rounded-2xl border border-primary/25 bg-primary/5 p-5"
          >
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-5 w-5" />
            </span>
            <p className="mt-3 font-arabic text-sm font-semibold text-foreground">
              {isAr
                ? "وصلتنا بياناتك! فريق تكله بيتواصل معك ويجهّز لك كل اللي تحتاجه."
                : "We got your details! The Tklh team will reach out and prepare everything you need."}
            </p>
          </motion.div>
        ) : (
          <div className="mt-7 w-full max-w-md space-y-3 rounded-2xl border border-border bg-card/90 p-4 text-start sm:p-5">
            <div className="space-y-1.5">
              <Label className="font-arabic text-foreground">{isAr ? "الاسم" : "Name"}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAr ? "اسمك" : "Your name"}
                className="h-12 rounded-xl font-arabic"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-arabic text-foreground">{isAr ? "رقم الجوال" : "Phone number"}</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                dir="ltr"
                placeholder="05XXXXXXXX"
                className="h-12 rounded-xl tabular-nums"
              />
            </div>
            <Button
              onClick={submit}
              disabled={saving}
              className="h-12 w-full rounded-full bg-primary font-arabic text-primary-foreground hover:bg-primary/90"
            >
              {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {isAr ? "سجّل بياناتك" : "Register your details"}
            </Button>
          </div>
        )}

        <p className="mt-4 font-arabic text-[11px] text-foreground/50">
          {isAr ? "صورة تمثيلية" : "Representative image"}
        </p>
      </div>
    </motion.div>
  );
};
