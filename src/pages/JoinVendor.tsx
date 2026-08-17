import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight, Building2, CheckCircle2, Clock, Home, Loader2, PartyPopper, ShieldCheck, User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Logo } from "@/components/tekillah/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { normalizeSaudiPhone, formatSaudiLocal } from "@/lib/phone";
import type { Database } from "@/integrations/supabase/types";

type ServiceType = Database["public"]["Enums"]["vendor_category"];
type EntityType = Database["public"]["Enums"]["applicant_entity_type"];

const SERVICES: { value: ServiceType; ar: string; en: string }[] = [
  { value: "hall", ar: "قاعات ومواقع", en: "Halls & venues" },
  { value: "catering", ar: "ضيافة وتقديم طعام", en: "Catering" },
  { value: "photography", ar: "تصوير", en: "Photography" },
  { value: "dj", ar: "الصوتيات", en: "Audio systems" },
  { value: "decor", ar: "تنسيق وديكور", en: "Decor & styling" },
  { value: "cars", ar: "سيارات وتنقل", en: "Cars & transport" },
];

const schema = z.object({
  full_name: z.string().trim().min(3, "name").max(100),
  email: z.string().trim().email("email").max(255),
  city: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(500).optional(),
});

const JoinVendor = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language !== "en";

  const [fullName, setFullName] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [email, setEmail] = useState("");
  const [entity, setEntity] = useState<EntityType | "">("");
  const [service, setService] = useState<ServiceType | "">("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const label = (ar: string, en: string) => (isAr ? ar : en);

  const submit = async () => {
    const phone = normalizeSaudiPhone(phoneLocal);
    if (!phone) {
      toast.error(label("أدخل رقم جوال سعودي صحيح (5XXXXXXXX)", "Enter a valid Saudi mobile number"));
      return;
    }
    if (!entity) {
      toast.error(label("اختر: مؤسسة أو فرد", "Choose company or individual"));
      return;
    }
    if (!service) {
      toast.error(label("اختر نوع الخدمة", "Choose your service type"));
      return;
    }
    const parsed = schema.safeParse({ full_name: fullName, email, city, notes });
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message;
      toast.error(
        first === "email"
          ? label("البريد الإلكتروني غير صحيح", "Invalid email address")
          : label("الاسم يجب أن يكون 3 أحرف على الأقل", "Name must be at least 3 characters"),
      );
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("vendor_applications").insert({
      full_name: parsed.data.full_name,
      phone,
      email: parsed.data.email,
      entity_type: entity,
      service_type: service,
      city: parsed.data.city || null,
      notes: parsed.data.notes || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(label("تعذر إرسال الطلب، حاول مرة أخرى", "Could not submit, please try again"));
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SEO
        title={label("انضم كمزود خدمة | تِكله", "Join as a service provider | TKLH")}
        description={label(
          "سجل بياناتك للانضمام إلى شبكة مزودي الخدمات في تِكله — قاعات، ضيافة، تصوير، تنسيق وأكثر.",
          "Apply to join the TKLH provider network — venues, catering, photography, decor and more.",
        )}
        canonical="/join-vendor"
      />

      <header className="sticky top-0 z-30 border-b border-gold/20 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <Button variant="ghost" size="sm" asChild className="rounded-full text-foreground/70 hover:text-primary">
            <Link to="/">
              <Home className="me-1.5 h-4 w-4" />
              <span className="hidden sm:inline">{t("common.main", { defaultValue: "الرئيسية" })}</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
        {done ? (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-gold/30 bg-card p-7 text-center shadow-card sm:p-12"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <PartyPopper className="h-8 w-8" />
            </div>
            <h1 className="mt-5 font-arabic text-2xl font-black leading-[1.45] text-primary-deep sm:text-3xl">
              {label("مبروك! تم تسجيلك في قائمة انتظار مزودي الخدمة", "Congrats! You're on the TKLH provider waitlist")}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-[1.7] text-foreground/70 sm:text-base">
              {label(
                "استلمنا بياناتك بنجاح. فريق تِكله يراجع الطلبات يدويًا، وبعد الموافقة نتواصل معك ونفتح لك حساب مزود خدمة كامل بلوحة تحكم للحجوزات والتقويم والفواتير.",
                "We received your details. Our team reviews every application manually — once approved we'll contact you and open your full provider account with bookings, calendar and invoices.",
              )}
            </p>

            <div className="mt-8 grid gap-3 text-start sm:grid-cols-3">
              {[
                { Icon: CheckCircle2, ar: "استلام الطلب", en: "Application received", done: true },
                { Icon: Clock, ar: "مراجعة الفريق", en: "Team review", done: false },
                { Icon: ShieldCheck, ar: "تفعيل حسابك", en: "Account activated", done: false },
              ].map(({ Icon, ar, en, done: isDone }) => (
                <div
                  key={ar}
                  className={`rounded-2xl border p-4 ${isDone ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}
                >
                  <Icon className={`h-5 w-5 ${isDone ? "text-primary" : "text-foreground/40"}`} />
                  <div className="mt-2 font-arabic text-sm font-semibold text-foreground">{label(ar, en)}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate("/")} className="rounded-full bg-primary-deep px-6 text-primary-foreground hover:bg-primary-deep/90">
                {label("العودة للرئيسية", "Back to home")}
              </Button>
              <Button variant="outline" asChild className="rounded-full border-gold/50 px-6">
                <Link to="/vendor">{label("تعرف على مزايا الشركاء", "Explore partner benefits")}</Link>
              </Button>
            </div>
          </motion.section>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                {label("انضم كمزود خدمة", "Join as a provider")}
              </span>
              <h1 className="mt-4 font-arabic text-2xl font-black leading-[1.45] text-primary-deep sm:text-4xl">
                {label("سجل بياناتك في دقيقة واحدة", "Apply in under a minute")}
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-[1.7] text-foreground/70">
                {label(
                  "خمس معلومات فقط تكفي لبدء طلبك. لا حاجة لإنشاء حساب الآن — بعد قبول طلبك نفتح لك حساب مزود خدمة كامل.",
                  "Five fields is all we need. No account required now — we'll create your provider account once you're approved.",
                )}
              </p>
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-5 shadow-card sm:p-8"
            >
              <div className="space-y-2">
                <Label htmlFor="jv-name">{label("الاسم", "Full name")} *</Label>
                <Input
                  id="jv-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={100}
                  placeholder={label("مثال: محمد العبدالله", "e.g. Mohammed Alabdullah")}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jv-phone">{label("رقم الجوال", "Mobile number")} *</Label>
                <div dir="ltr" className="flex items-center gap-2">
                  <span className="grid h-12 shrink-0 place-items-center rounded-xl border border-border bg-muted/40 px-3 text-sm font-semibold text-foreground/70">
                    +966
                  </span>
                  <Input
                    id="jv-phone"
                    inputMode="numeric"
                    value={formatSaudiLocal(phoneLocal)}
                    onChange={(e) => setPhoneLocal(e.target.value)}
                    placeholder="5X XXX XXXX"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jv-email">{label("البريد الإلكتروني", "Email")} *</Label>
                <Input
                  id="jv-email"
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  placeholder="name@example.com"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>{label("مؤسسة أو فرد", "Company or individual")} *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "company" as EntityType, Icon: Building2, ar: "مؤسسة / شركة", en: "Company" },
                    { value: "individual" as EntityType, Icon: User, ar: "فرد", en: "Individual" },
                  ]).map(({ value, Icon, ar, en }) => {
                    const active = entity === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setEntity(value)}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-start transition-all ${
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow-card"
                            : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="font-arabic text-sm font-semibold">{label(ar, en)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{label("نوع الخدمة", "Service type")} *</Label>
                <Select value={service} onValueChange={(v) => setService(v as ServiceType)}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder={label("اختر نوع الخدمة", "Select a service type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{label(s.ar, s.en)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jv-city">{label("المدينة (اختياري)", "City (optional)")}</Label>
                  <Input
                    id="jv-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    maxLength={80}
                    placeholder={label("الرياض", "Riyadh")}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jv-notes">{label("نبذة سريعة (اختياري)", "Short note (optional)")}</Label>
                  <Textarea
                    id="jv-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder={label("سنوات الخبرة، نطاق التغطية…", "Experience, coverage area…")}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={submit}
                disabled={submitting}
                className="h-12 w-full rounded-full bg-primary-deep text-base text-primary-foreground hover:bg-primary-deep/90"
              >
                {submitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                {label("إرسال الطلب", "Submit application")}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Button>

              <p className="text-center text-[11px] leading-relaxed text-foreground/55">
                {label(
                  "بياناتك تصل لفريق تِكله فقط لمراجعة طلب الانضمام.",
                  "Your details go only to the TKLH team to review your application.",
                )}
              </p>
            </motion.section>

            <p className="mt-6 text-center text-sm text-foreground/60">
              {label("لديك حساب شريك بالفعل؟", "Already a partner?")}{" "}
              <Link to="/auth?redirect=/partner&role=vendor" className="font-semibold text-primary underline-offset-4 hover:underline">
                {label("تسجيل الدخول", "Sign in")}
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default JoinVendor;
