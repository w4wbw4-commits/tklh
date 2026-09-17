import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowRight, Loader2, MessageSquareWarning, Upload, X } from "lucide-react";
import { partnerService } from "@/domain";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PasswordInput } from "@/components/tekillah/PasswordInput";
import { PartnerAuthShell, PhoneField } from "@/components/tekillah/vendor/PartnerAuthShell";
import { formatSaudiLocal, normalizeSaudiPhone } from "@/lib/phone";
import type { Database } from "@/integrations/supabase/types";

type ServiceType = Database["public"]["Enums"]["vendor_category"];
type EntityType = Database["public"]["Enums"]["applicant_entity_type"];

const SERVICES: { value: ServiceType; label: string }[] = [
  { value: "hall", label: "قاعات ومواقع" },
  { value: "catering", label: "ضيافة وتقديم طعام" },
  { value: "photography", label: "تصوير" },
  { value: "dj", label: "الصوتيات" },
  { value: "decor", label: "تنسيق وديكور" },
  { value: "cars", label: "سيارات وتنقل" },
];

/** Only these categories can be rented per section (matches availability rules). */
const SECTION_CATEGORIES: ServiceType[] = ["hall", "photography"];

const accountSchema = z.object({
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 خانات على الأقل")
    .max(72)
    .refine((v) => /[A-Za-z\u0600-\u06FF]/.test(v) && /\d/.test(v), "أضف حرفًا ورقمًا على الأقل"),
});

const applicationSchema = z.object({
  full_name: z.string().trim().min(3, "اسم المسؤول يجب أن يكون 3 أحرف على الأقل").max(100),
  business_name: z.string().trim().min(2, "أدخل اسم المنشأة").max(120),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").max(255),
  city: z.string().trim().min(2, "أدخل المدينة").max(80),
  address: z.string().trim().max(200).optional(),
  description: z.string().trim().min(20, "أضف وصفًا لا يقل عن 20 حرفًا").max(1000),
  vat_number: z.string().trim().max(15).optional(),
});

const splitList = (value: string) =>
  value.split(/[,،\n]/).map((s) => s.trim()).filter(Boolean).slice(0, 30);

const errorText = (code: string) =>
  ({
    phone_exists: "هذا الرقم مسجّل بالفعل — سجّل الدخول أو استعد كلمة المرور",
    no_account: "لا يوجد حساب بهذا الرقم",
    rate_limited: "عدد كبير من المحاولات، حاول بعد ساعة",
    invalid_code: "رمز التحقق غير صحيح",
    code_expired: "انتهت صلاحية الرمز، اطلب رمزًا جديدًا",
    weak_password: "كلمة المرور يجب أن تكون 8 خانات على الأقل وتتضمن حرفًا ورقمًا",
    pwned_password: "كلمة المرور هذه شائعة ومكشوفة في تسريبات — اختر كلمة مرور أقوى",
  })[code] ?? "تعذر إكمال العملية، حاول مرة أخرى";

const PartnerRegister = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Step 1 = account (phone + code + password). Step 2 = full application.
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [notDelivered, setNotDelivered] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  // Application fields
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [entity, setEntity] = useState<EntityType>("company");
  const [service, setService] = useState<ServiceType | "">("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [vat, setVat] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [xAccount, setXAccount] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [website, setWebsite] = useState("");
  const [services, setServices] = useState("");
  const [areas, setAreas] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [supportsMen, setSupportsMen] = useState(false);
  const [supportsWomen, setSupportsWomen] = useState(false);
  const [independent, setIndependent] = useState(false);
  const [crFile, setCrFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);

  // A signed-in user without a partner account continues straight to the form.
  useEffect(() => {
    if (!authLoading && user) setStep(2);
  }, [authLoading, user]);

  const showSections = useMemo(
    () => (service ? SECTION_CATEGORIES.includes(service as ServiceType) : false),
    [service],
  );

  const sendCode = async () => {
    const phone = normalizeSaudiPhone(phoneLocal);
    if (!phone) {
      toast.error("أدخل رقم جوال سعودي صحيح (5XXXXXXXX)");
      return;
    }
    setBusy(true);
    try {
      const res = await partnerService.sendPartnerCode(phone, "register");
      setNotDelivered(!res.delivered);
      setDevCode(res.devCode ?? null);
      setCodeSent(true);
      if (res.delivered) toast.success("أرسلنا رمز التحقق إلى جوالك");
    } catch (e) {
      toast.error(errorText((e as Error).message));
    } finally {
      setBusy(false);
    }
  };

  const createAccount = async () => {
    const phone = normalizeSaudiPhone(phoneLocal);
    if (!phone) return;
    const parsed = accountSchema.safeParse({ password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "كلمة مرور غير صالحة");
      return;
    }
    setBusy(true);
    try {
      await partnerService.registerPartnerAccount(phone, code.trim(), password);
      const { error } = await partnerService.signInWithPhonePassword(phone, password);
      if (error) throw new Error("unexpected_error");
      toast.success("تم إنشاء الحساب — أكمل بيانات طلب الانضمام");
      setStep(2);
    } catch (e) {
      toast.error(errorText((e as Error).message));
    } finally {
      setBusy(false);
    }
  };

  const submitApplication = async () => {
    if (!user) {
      toast.error("انتهت الجلسة، سجّل الدخول ثم أكمل الطلب");
      navigate("/partner/login", { replace: true });
      return;
    }
    if (!service) {
      toast.error("اختر نوع النشاط");
      return;
    }
    const parsed = applicationSchema.safeParse({
      full_name: fullName, business_name: businessName, email, city, address, description, vat_number: vat,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "راجع الحقول المطلوبة");
      return;
    }
    if (vat && !/^\d{15}$/.test(vat)) {
      toast.error("الرقم الضريبي يجب أن يكون 15 رقمًا");
      return;
    }
    if (!crFile) {
      toast.error(entity === "company" ? "أرفق السجل التجاري" : "أرفق وثيقة العمل الحر");
      return;
    }
    if (!idFile) {
      toast.error("أرفق صورة الهوية الوطنية أو الإقامة");
      return;
    }
    if (showSections && !supportsMen && !supportsWomen) {
      toast.error("حدّد الأقسام التي تخدمها (رجال / نساء)");
      return;
    }

    const phone = normalizeSaudiPhone(phoneLocal) ??
      (user.email ? `+${user.email.split("@")[0]}` : null);
    if (!phone) {
      toast.error("تعذر تحديد رقم الجوال");
      return;
    }

    setBusy(true);
    try {
      const [crPath, idPath] = await Promise.all([
        partnerService.uploadPrivateDoc(user.id, entity === "company" ? "cr" : "freelance", crFile),
        partnerService.uploadPrivateDoc(user.id, "identity", idFile),
      ]);
      const galleryUrls = await Promise.all(
        gallery.slice(0, 10).map((f) => partnerService.uploadPortfolioMedia(user.id, f)),
      );

      const { error } = await partnerService.submitApplication({
        user_id: user.id,
        full_name: parsed.data.full_name,
        business_name: parsed.data.business_name,
        phone,
        email: parsed.data.email,
        entity_type: entity,
        service_type: service,
        city: parsed.data.city,
        region: region.trim() || null,
        address: parsed.data.address || null,
        description: parsed.data.description,
        commercial_register_url: crPath,
        identity_document_url: idPath,
        vat_number: vat.trim() || null,
        contact_whatsapp: whatsapp.trim() || null,
        social_links: {
          instagram: instagram.trim() || null,
          x: xAccount.trim() || null,
          tiktok: tiktok.trim() || null,
          website: website.trim() || null,
        },
        gallery_urls: galleryUrls,
        portfolio_urls: galleryUrls,
        services: splitList(services),
        service_areas: splitList(areas),
        starting_price: startingPrice ? Number(startingPrice) : null,
        supports_men: showSections ? supportsMen : false,
        supports_women: showSections ? supportsWomen : false,
        sections_independent: showSections ? independent : false,
        status: "new",
      });
      if (error) throw error;
      toast.success("تم إرسال طلبك للمراجعة");
      navigate("/partner/status", { replace: true });
    } catch {
      toast.error("تعذر إرسال الطلب، حاول مرة أخرى");
    } finally {
      setBusy(false);
    }
  };

  const fileRow = (
    id: string,
    labelText: string,
    file: File | null,
    onPick: (f: File | null) => void,
    accept = "image/*,application/pdf",
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{labelText}</Label>
      <label
        htmlFor={id}
        className="flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-3 text-sm text-foreground/70 hover:border-primary/40"
      >
        <Upload className="h-4 w-4 shrink-0" />
        <span className="truncate">{file ? file.name : "اختر ملفًا (صورة أو PDF)"}</span>
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </div>
  );

  return (
    <PartnerAuthShell
      wide
      title="انضم كمزود خدمة | شركاء تِكله"
      description="سجّل منشأتك في تِكله: قاعات، ضيافة، تصوير، صوتيات، تنسيق وسيارات — مع مراجعة من فريق التحقق."
      canonical="/partner/register"
      eyebrow="لوحة تحكم الشريك"
      heading={step === 1 ? "إنشاء حساب شريك" : "طلب الانضمام كمزود خدمة"}
      sub={
        step === 1
          ? "أنشئ حسابك برقم الجوال وكلمة مرور، ثم أكمل بيانات منشأتك."
          : "أكمل بيانات منشأتك ومستنداتها. يبدأ الوصول إلى لوحة التحكم بعد موافقة فريق تِكله."
      }
      footer={
        step === 1 ? (
          <>
            لديك حساب شريك؟{" "}
            <Link to="/partner/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              تسجيل الدخول
            </Link>
          </>
        ) : null
      }
    >
      {step === 1 ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="pr-phone">رقم الجوال</Label>
            <PhoneField
              id="pr-phone"
              value={formatSaudiLocal(phoneLocal)}
              onChange={setPhoneLocal}
              disabled={codeSent}
            />
          </div>

          {!codeSent ? (
            <Button
              onClick={sendCode}
              disabled={busy}
              className="h-12 w-full rounded-full bg-primary-deep text-base text-primary-foreground hover:bg-primary-deep/90"
            >
              {busy ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
              إرسال رمز التحقق
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          ) : (
            <>
              {notDelivered ? (
                <div className="flex gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm leading-relaxed text-foreground/80">
                  <MessageSquareWarning className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div>
                    خدمة الرسائل النصية غير مربوطة بعد، لذلك لم تُرسل رسالة فعلية إلى جوالك.
                    {devCode ? (
                      <>
                        {" "}الرمز للتجربة الحالية:{" "}
                        <span dir="ltr" className="font-bold tracking-[0.3em] text-primary-deep">{devCode}</span>
                      </>
                    ) : (
                      " تواصل مع فريق تِكله لإكمال التسجيل."
                    )}
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="pr-code">رمز التحقق</Label>
                <Input
                  id="pr-code"
                  dir="ltr"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D+/g, ""))}
                  placeholder="••••••"
                  className="h-12 rounded-xl text-center text-lg tracking-[0.4em]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pr-pass">كلمة المرور</Label>
                <PasswordInput
                  id="pr-pass"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  placeholder="8 خانات على الأقل، حرف ورقم"
                  show={showPass}
                  onToggle={() => setShowPass((s) => !s)}
                  t={(k) => (k === "auth.hidePassword" ? "إخفاء كلمة المرور" : "إظهار كلمة المرور")}
                />
              </div>

              <Button
                onClick={createAccount}
                disabled={busy || code.length !== 6 || password.length < 8}
                className="h-12 w-full rounded-full bg-primary-deep text-base text-primary-foreground hover:bg-primary-deep/90"
              >
                {busy ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                إنشاء الحساب ومتابعة الطلب
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ap-name">اسم المسؤول *</Label>
              <Input id="ap-name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-biz">اسم المنشأة *</Label>
              <Input id="ap-biz" value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={120} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-phone">رقم الجوال *</Label>
              <PhoneField id="ap-phone" value={formatSaudiLocal(phoneLocal)} onChange={setPhoneLocal} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-email">البريد الإلكتروني *</Label>
              <Input id="ap-email" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>نوع الكيان *</Label>
              <Select value={entity} onValueChange={(v) => setEntity(v as EntityType)}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">مؤسسة / شركة</SelectItem>
                  <SelectItem value="individual">فرد (عمل حر)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نوع النشاط *</Label>
              <Select value={service} onValueChange={(v) => setService(v as ServiceType)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="اختر نوع النشاط" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-city">المدينة *</Label>
              <Input id="ap-city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} placeholder="الرياض" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-region">المنطقة</Label>
              <Input id="ap-region" value={region} onChange={(e) => setRegion(e.target.value)} maxLength={80} placeholder="منطقة الرياض" className="h-12 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ap-address">العنوان</Label>
            <Input id="ap-address" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} placeholder="الحي، الشارع، رقم المبنى" className="h-12 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ap-desc">وصف النشاط *</Label>
            <Textarea id="ap-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={4} placeholder="عرّفنا بمنشأتك، خبرتك، وما يميزك…" className="rounded-xl" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {fileRow(
              "ap-cr",
              entity === "company" ? "السجل التجاري *" : "وثيقة العمل الحر *",
              crFile,
              setCrFile,
            )}
            {fileRow("ap-id", "الهوية الوطنية / الإقامة *", idFile, setIdFile)}
            <div className="space-y-2">
              <Label htmlFor="ap-vat">الرقم الضريبي (إن وُجد)</Label>
              <Input id="ap-vat" dir="ltr" inputMode="numeric" maxLength={15} value={vat} onChange={(e) => setVat(e.target.value.replace(/\D+/g, ""))} placeholder="15 رقمًا" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-wa">رقم واتساب للتواصل</Label>
              <Input id="ap-wa" dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} maxLength={20} placeholder="+9665XXXXXXXX" className="h-12 rounded-xl" />
            </div>
          </div>

          <p className="rounded-2xl border border-border bg-muted/20 p-3 text-[11px] leading-relaxed text-foreground/60">
            مستندات الهوية والسجل التجاري تُحفظ في مساحة خاصة لا يراها إلا فريق التحقق — لا تُنشر للعملاء.
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ap-ig">إنستقرام</Label>
              <Input id="ap-ig" dir="ltr" value={instagram} onChange={(e) => setInstagram(e.target.value)} maxLength={120} placeholder="@account" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-x">منصة X</Label>
              <Input id="ap-x" dir="ltr" value={xAccount} onChange={(e) => setXAccount(e.target.value)} maxLength={120} placeholder="@account" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-tt">تيك توك</Label>
              <Input id="ap-tt" dir="ltr" value={tiktok} onChange={(e) => setTiktok(e.target.value)} maxLength={120} placeholder="@account" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-web">الموقع الإلكتروني</Label>
              <Input id="ap-web" dir="ltr" value={website} onChange={(e) => setWebsite(e.target.value)} maxLength={200} placeholder="https://" className="h-12 rounded-xl" />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ap-services">الخدمات التي تقدمها</Label>
              <Textarea id="ap-services" value={services} onChange={(e) => setServices(e.target.value)} rows={2} placeholder="إضاءة، بوفيه، كوشة… (افصل بينها بفاصلة)" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-areas">مناطق الخدمة</Label>
              <Textarea id="ap-areas" value={areas} onChange={(e) => setAreas(e.target.value)} rows={2} placeholder="الرياض، الدرعية… (افصل بينها بفاصلة)" className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ap-price">السعر الابتدائي (ر.س)</Label>
            <Input id="ap-price" dir="ltr" inputMode="decimal" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value.replace(/[^\d.]/g, ""))} className="h-12 rounded-xl" />
          </div>

          {showSections ? (
            <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
              <div className="font-arabic text-sm font-semibold text-foreground">أقسام الرجال والنساء</div>
              {[
                { label: "أخدم قسم الرجال", value: supportsMen, set: setSupportsMen },
                { label: "أخدم قسم النساء", value: supportsWomen, set: setSupportsWomen },
                {
                  label: "القسمان مستقلان (يمكن حجز كل قسم على حدة في نفس اليوم)",
                  value: independent,
                  set: setIndependent,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-foreground/80">{row.label}</span>
                  <Switch checked={row.value} onCheckedChange={row.set} />
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="ap-gallery">صور النشاط / أعمالك السابقة</Label>
            <label
              htmlFor="ap-gallery"
              className="flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-3 text-sm text-foreground/70 hover:border-primary/40"
            >
              <Upload className="h-4 w-4 shrink-0" />
              <span>اختر حتى 10 صور</span>
            </label>
            <input
              id="ap-gallery"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setGallery(Array.from(e.target.files ?? []).slice(0, 10))}
            />
            {gallery.length ? (
              <div className="flex flex-wrap gap-2">
                {gallery.map((f, i) => (
                  <span key={`${f.name}-${i}`} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-[11px]">
                    <span className="max-w-[140px] truncate">{f.name}</span>
                    <button type="button" onClick={() => setGallery((g) => g.filter((_, idx) => idx !== i))} aria-label="إزالة">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <Button
            onClick={submitApplication}
            disabled={busy}
            className="h-12 w-full rounded-full bg-primary-deep text-base text-primary-foreground hover:bg-primary-deep/90"
          >
            {busy ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
            إرسال الطلب للمراجعة
            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
          </Button>
        </>
      )}
    </PartnerAuthShell>
  );
};

export default PartnerRegister;
