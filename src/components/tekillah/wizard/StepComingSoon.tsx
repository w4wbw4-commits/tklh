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
import { buildWhatsappLink } from "@/lib/whatsapp";
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

/** Minimal inline WhatsApp glyph — no extra dependency, inherits currentColor. */
const WhatsAppGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.12-.41-2.14-1.32-.79-.71-1.32-1.58-1.47-1.88-.15-.3-.02-.47.13-.62.15-.15.35-.42.5-.62.13-.18.18-.3.28-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.2-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.5.07-.77.37-.27.3-1.02 1-1.02 2.42s1.04 2.8 1.19 3c.15.2 2.05 3.28 5.06 4.47 2.5.99 2.87.85 3.39.8.52-.05 1.68-.68 1.92-1.35.24-.67.24-1.24.17-1.36-.07-.12-.27-.19-.57-.34zM12.04 21.5c-1.67 0-3.3-.44-4.73-1.28l-.34-.2-3.52.92.94-3.43-.22-.36a9.33 9.33 0 0 1-1.43-4.97c0-5.16 4.2-9.36 9.37-9.36 2.5 0 4.85.98 6.62 2.74a9.3 9.3 0 0 1 2.74 6.63c0 5.16-4.2 9.31-9.43 9.31zM12.05 1.5C5.8 1.5.72 6.58.72 12.82c0 2 .52 3.95 1.52 5.67L.5 24.5l6.16-1.61a11.25 11.25 0 0 0 5.39 1.37h.01c6.24 0 11.32-5.08 11.32-11.32 0-3.02-1.18-5.87-3.32-8.01A11.24 11.24 0 0 0 12.05 1.5z" />
  </svg>
);

export const StepComingSoon = ({ summary, payload }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [waLink, setWaLink] = useState("");

  /**
   * Builds the concierge WhatsApp message: who registered, how to reach them,
   * and every detail they picked in the wizard — so the Tklh team can start
   * working before the first call. Free-text vision is included when written.
   */
  const buildMessage = (fullName: string, cleanPhone: string, ref: string) => {
    const lines: string[] = [];
    const vision = typeof payload.vision === "string" ? payload.vision.trim() : "";
    const services = Array.isArray(payload.services) ? payload.services.length : 0;

    if (isAr) {
      lines.push("السلام عليكم تِكله 👋");
      lines.push("سجّلت بياناتي عبر رحلة التخطيط وأبغى أسرّع التواصل:");
      lines.push("");
      lines.push(`• الاسم: ${fullName}`);
      lines.push(`• الجوال: ${cleanPhone}`);
      if (summary.length) {
        lines.push("");
        lines.push("تفاصيل المناسبة:");
        summary.forEach((s) => lines.push(`• ${s}`));
      }
      if (services) lines.push(`• عدد الخدمات المختارة: ${services}`);
      if (vision) {
        lines.push("");
        lines.push(`رؤيتي للمناسبة: ${vision}`);
      }
      if (ref) {
        lines.push("");
        lines.push(`رقم الطلب: ${ref}`);
      }
    } else {
      lines.push("Hello Tklh 👋");
      lines.push("I just registered through the planning journey and would like a faster follow-up:");
      lines.push("");
      lines.push(`• Name: ${fullName}`);
      lines.push(`• Phone: ${cleanPhone}`);
      if (summary.length) {
        lines.push("");
        lines.push("Event details:");
        summary.forEach((s) => lines.push(`• ${s}`));
      }
      if (services) lines.push(`• Selected services: ${services}`);
      if (vision) {
        lines.push("");
        lines.push(`My vision: ${vision}`);
      }
      if (ref) {
        lines.push("");
        lines.push(`Request ref: ${ref}`);
      }
    }
    return lines.join("\n");
  };

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
    // No `.select()` here on purpose: the public insert policy grants INSERT only,
    // so asking PostgREST to return the row would fail the RLS read check.
    const { error } = await supabase.from("planner_interest").insert({
      full_name: name.trim(),
      phone: cleanPhone,
      details: payload as never,
    });
    setSaving(false);
    if (error) {
      const rate = /rate_limited/i.test(error.message);
      toast.error(
        rate
          ? isAr
            ? "سجّلنا طلبك مسبقاً — تواصل معنا مباشرة على الواتس"
            : "You already submitted recently — reach us on WhatsApp"
          : isAr
            ? "ما وصلت بياناتك، جرب مرة ثانية"
            : "Something went wrong, try again",
      );
      if (!rate) return;
    }

    // Data is saved first — WhatsApp is only an accelerator, never the record.
    const ref = cleanPhone.slice(-4);
    const link = buildWhatsappLink({ message: buildMessage(name.trim(), cleanPhone, ref) });
    setWaLink(link);
    setDone(true);

    // Smart hand-off: try to open WhatsApp right away; if the browser blocks the
    // programmatic window, the visible button below still does the job.
    const win = window.open(link, "_blank", "noopener,noreferrer");
    if (!win) {
      toast.success(
        isAr ? "تم التسجيل — اضغط زر الواتس لإكمال التواصل" : "Registered — tap the WhatsApp button to continue",
      );
    }
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
        {/* Real package-card shapes — image, title bar, choose button — then blurred. */}
        <div className="grid h-full grid-cols-2 gap-3 p-4 opacity-70 blur-[14px] sm:grid-cols-4">
          {BACKDROP.map((src, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="h-1/2 min-h-[86px] w-full overflow-hidden">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-2 p-3">
                <span className="block h-2.5 w-4/5 rounded-full bg-primary/25" />
                <span className="block h-2 w-3/5 rounded-full bg-primary/15" />
                <span className="mt-1 block h-6 w-20 rounded-full border border-primary/40 bg-primary/20" />
              </div>
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
          {"\n"}
        </p>

        <p className="mt-4 max-w-xl font-arabic text-sm leading-relaxed text-foreground/80">
          {"\n"}
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
                ? "وصلتنا بياناتك! فريق تكله بيتواصل معك خلال أقل من 24 ساعة، ويجهّز لك كل اللي تحتاجه."
                : "We got your details! The Tklh team will reach out within less than 24 hours and prepare everything you need."}
            </p>

            {waLink && (
              <>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 font-arabic text-sm font-bold text-[#0b2d1b] transition hover:brightness-105"
                >
                  <WhatsAppGlyph className="h-4 w-4" />
                  {isAr ? "سرّع التواصل عبر الواتس" : "Speed things up on WhatsApp"}
                </a>
                <p className="mt-2 font-arabic text-[11.5px] leading-relaxed text-foreground/60">
                  {isAr
                    ? "الرسالة جاهزة بكل تفاصيلك — بس اضغط إرسال."
                    : "Your message is ready with all your details — just hit send."}
                </p>
              </>
            )}
          </motion.div>

        ) : (
          <div className="mt-7 w-full max-w-md space-y-3 rounded-2xl border border-border bg-card/90 p-4 text-start sm:p-5">
            {/* Prominent pledge — sits above the fields so it reads as the CTA itself */}
            <div className="rounded-xl border border-primary/30 bg-primary/[0.07] p-3.5 text-center sm:p-4">
              <p className="font-arabic text-[15px] font-bold leading-relaxed text-primary sm:text-base">
                {isAr
                  ? "سجّل بياناتك، وحنا لك تكله"
                  : "Register your details — Tklh takes it from here"}
              </p>
              <p className="mt-1.5 font-arabic text-[12.5px] leading-relaxed text-foreground/75">
                {isAr
                  ? "نجهّز لك كل شي، وبنتواصل معك خلال أقل من 24 ساعة."
                  : "We prepare everything and reach out within less than 24 hours."}
              </p>
            </div>

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

        <p className="mt-4 max-w-md font-arabic text-[12px] leading-relaxed text-foreground/60">
          {isAr
            ? "تِكله — منصة سعودية تشيل عنك هم التخطيط، وتخليك ترتاح من أي هم. ثقة ووضوح وضمان من أول خطوة ليوم مناسبتك."
            : "Tklh — a Saudi platform that takes the planning burden off your shoulders so you can relax. Trust, clarity, and guarantee from the first step to your event day."}
        </p>
      </div>
    </motion.div>
  );
};
