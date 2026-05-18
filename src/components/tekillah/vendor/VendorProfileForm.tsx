import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Save, FileText, ShieldCheck, Building2,
  Landmark, MapPin, AlertTriangle, Clock, CheckCircle2, XCircle,
  CalendarDays, CalendarRange, Wallet, Users, Users2, Sparkles,
} from "lucide-react";
import { CATEGORY_LABELS, type VendorRow } from "./types";
import { ServiceTagsInput } from "./ServiceTagsInput";
import { SmartCombobox, type SmartOption } from "./SmartCombobox";
import { SmartPriceField } from "./SmartPriceField";
import {
  SAUDI_REGIONS, SAUDI_CITIES, SAUDI_DISTRICTS,
  POPULAR_SERVICES, PRICE_PRESETS, cityToRegion,
} from "./saudiPlaces";
import { TermsCheckbox } from "@/components/tekillah/TermsCheckbox";
import { recordTermsAcceptance } from "@/lib/terms";
import { useTranslation } from "react-i18next";
import { VendorPortfolioManager } from "./VendorPortfolioManager";

// IBAN: Saudi format SA + 22 digits, but accept generic 15-34 alphanumeric for flexibility
const ibanRegex = /^[A-Z]{2}[0-9A-Z]{13,32}$/;

const vendorSchema = z.object({
  business_name: z.string().trim().min(2).max(120),
  category: z.enum(["hall", "catering", "photography", "dj", "decor", "cars"]),
  bio: z.string().trim().max(800).optional(),
  city: z.string().trim().max(80).optional(),
  region: z.string().trim().min(2, "أدخل اسم المنطقة").max(80),
  district: z.string().trim().min(2, "أدخل اسم الحي").max(80),
  phone: z.string().trim().max(20).optional(),
  daily_capacity: z.number().int().min(1).max(50),
  weekday_price: z.number().min(1, "أدخل سعر أيام الأسبوع").max(10000000),
  weekend_price: z.number().min(1, "أدخل سعر عطلة نهاية الأسبوع").max(10000000),
  min_deposit: z.number().min(1, "أدخل الحد الأدنى للعربون").max(10000000),
  men_capacity: z.number().int().min(0).max(100000).optional().nullable(),
  women_capacity: z.number().int().min(0).max(100000).optional().nullable(),
  iban: z.string().trim().toUpperCase().regex(ibanRegex, "IBAN غير صحيح"),
  google_maps_url: z.string().trim().url().max(500).optional().or(z.literal("")),
});

interface Props {
  userId: string;
  vendor: VendorRow | null;
  onSaved: (v: VendorRow) => void;
}

export const VendorProfileForm = ({ userId, vendor, onSaved }: Props) => {
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<VendorRow["category"]>("hall");
  const [bio, setBio] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [regionEn, setRegionEn] = useState("");
  const [district, setDistrict] = useState("");
  const [districtEn, setDistrictEn] = useState("");
  const [phone, setPhone] = useState("");
  const [dailyCapacity, setDailyCapacity] = useState(1);
  const [weekdayPrice, setWeekdayPrice] = useState(0);
  const [weekendPrice, setWeekendPrice] = useState(0);
  const [minDeposit, setMinDeposit] = useState(0);
  const [menCapacity, setMenCapacity] = useState<number | "">("");
  const [womenCapacity, setWomenCapacity] = useState<number | "">("");
  const [extraServices, setExtraServices] = useState<string[]>([]);
  const [extraServicesEn, setExtraServicesEn] = useState<string[]>([]);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [iban, setIban] = useState("");
  const [ibanCertUrl, setIbanCertUrl] = useState<string | null>(null);
  const [mapsUrl, setMapsUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [acceptedTos, setAcceptedTos] = useState(false);
  const { t } = useTranslation();

  const isVenue = category === "hall";

  useEffect(() => {
    if (vendor) {
      setBusinessName(vendor.business_name);
      setCategory(vendor.category);
      setBio(vendor.bio ?? "");
      setBioEn(vendor.bio_en ?? "");
      setCity(vendor.city ?? "");
      setRegion(vendor.region ?? "");
      setRegionEn(vendor.region_en ?? "");
      setDistrict(vendor.district ?? "");
      setDistrictEn(vendor.district_en ?? "");
      setPhone(vendor.phone ?? "");
      setDailyCapacity(vendor.daily_capacity);
      setWeekdayPrice(Number(vendor.weekday_price ?? vendor.starting_price ?? 0));
      setWeekendPrice(Number(vendor.weekend_price ?? vendor.starting_price ?? 0));
      setMinDeposit(Number(vendor.min_deposit ?? 0));
      setMenCapacity(vendor.men_capacity ?? "");
      setWomenCapacity(vendor.women_capacity ?? "");
      setExtraServices(vendor.extra_services ?? []);
      setExtraServicesEn(vendor.extra_services_en ?? []);
      setPortfolioUrls(vendor.portfolio_urls ?? []);
      setDocUrl(vendor.commercial_register_url);
      setIban(vendor.iban ?? "");
      setIbanCertUrl(vendor.iban_certificate_url);
      setMapsUrl(vendor.google_maps_url ?? "");
    }
  }, [vendor]);

  const handleUploadPortfolio = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("الرجاء رفع صورة فقط"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("الحد الأقصى 5 ميجا"); return; }
    setUploading(true);
    const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("vendor-portfolios").upload(path, file);
    if (error) { setUploading(false); toast.error("فشل الرفع: " + error.message); return; }
    const { data } = supabase.storage.from("vendor-portfolios").getPublicUrl(path);
    setPortfolioUrls((prev) => [...prev, data.publicUrl]);
    setUploading(false);
    toast.success("تم رفع الصورة");
  };

  const handleUploadDocument = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("الحد الأقصى 10 ميجا"); return; }
    setUploading(true);
    const path = `${userId}/cr-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("vendor-documents").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) { toast.error("فشل الرفع: " + error.message); return; }
    setDocUrl(path);
    toast.success("تم رفع الوثيقة");
  };

  const handleUploadIbanCert = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("الحد الأقصى 10 ميجا"); return; }
    setUploading(true);
    const path = `${userId}/iban-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("iban-documents").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) { toast.error("فشل الرفع: " + error.message); return; }
    setIbanCertUrl(path);
    toast.success("تم رفع شهادة الآيبان");
  };

  const removePortfolio = (url: string) => {
    setPortfolioUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleSave = async () => {
    if (!docUrl) {
      toast.error("لا يمكن إكمال التسجيل بدون رفع وثيقة العمل الحر/السجل التجاري");
      return;
    }
    if (!ibanCertUrl) {
      toast.error("لا يمكن إكمال التسجيل بدون رفع شهادة الآيبان");
      return;
    }
    if (!vendor && !acceptedTos) {
      toast.error(t("terms.mustAccept"));
      return;
    }
    const parsed = vendorSchema.safeParse({
      business_name: businessName, category, bio, city,
      region: region.trim(), district: district.trim(), phone,
      daily_capacity: Number(dailyCapacity),
      weekday_price: Number(weekdayPrice),
      weekend_price: Number(weekendPrice),
      min_deposit: Number(minDeposit),
      men_capacity: category === "hall" ? (menCapacity === "" ? null : Number(menCapacity)) : null,
      women_capacity: category === "hall" ? (womenCapacity === "" ? null : Number(womenCapacity)) : null,
      iban: iban.toUpperCase(), google_maps_url: mapsUrl,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);
    const startingPrice = Math.min(Number(weekdayPrice), Number(weekendPrice));
    const payload = {
      user_id: userId,
      business_name: businessName,
      category,
      bio: bio || null,
      bio_en: bioEn.trim() || null,
      city: city || null,
      region: region.trim() || null,
      region_en: regionEn.trim() || null,
      district: district.trim() || null,
      district_en: districtEn.trim() || null,
      phone: phone || null,
      daily_capacity: Number(dailyCapacity),
      starting_price: startingPrice,
      weekday_price: Number(weekdayPrice),
      weekend_price: Number(weekendPrice),
      min_deposit: Number(minDeposit),
      men_capacity: category === "hall" && menCapacity !== "" ? Number(menCapacity) : null,
      women_capacity: category === "hall" && womenCapacity !== "" ? Number(womenCapacity) : null,
      // Manual service tags apply to ALL categories. Optional EN list shown to
      // English-locale customers; falls back to the Arabic list per item.
      extra_services: extraServices,
      extra_services_en: extraServicesEn,
      portfolio_urls: portfolioUrls,
      commercial_register_url: docUrl,
      iban: iban.toUpperCase(),
      iban_certificate_url: ibanCertUrl,
      google_maps_url: mapsUrl || null,
    };

    // Avoid `.select()` (which expands to *) because sensitive PII columns
    // are revoked from the authenticated role. Project owner-safe columns
    // explicitly; the form re-merges sensitive values via `get_vendor_private`.
    const RETURN_COLS =
      "id, user_id, business_name, category, bio, bio_en, city, region, region_en, district, district_en, portfolio_urls, google_maps_url, daily_capacity, starting_price, weekday_price, weekend_price, min_deposit, men_capacity, women_capacity, extra_services, extra_services_en, verified, active, approval_status, rejection_reason";
    let result;
    if (vendor) {
      result = await supabase.from("vendors").update(payload).eq("id", vendor.id).select(RETURN_COLS).single();
    } else {
      result = await supabase.from("vendors").insert(payload).select(RETURN_COLS).single();
      await supabase.from("user_roles").insert({ user_id: userId, role: "vendor" });
      if (!result.error) {
        await recordTermsAcceptance(userId, "vendor_onboarding", (result.data as VendorRow).id);
      }
    }
    setSaving(false);
    if (result.error) { toast.error(result.error.message); return; }
    toast.success("تم استلام معلوماتك — جاري المراجعة من قِبل الإدارة", {
      description: "سنخبرك فور صدور القرار. يمكنك متابعة الحالة من هذه الصفحة.",
      duration: 6000,
    });
    onSaved(result.data as VendorRow);
  };

  const status = vendor?.approval_status ?? "pending_approval";

  return (
    <div className="space-y-8">
      {/* Header + status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-arabic text-2xl font-semibold text-foreground">
            {vendor ? "ملف العمل" : "أنشئ ملف عملك"}
          </h2>
          <p className="mt-1 text-sm text-foreground/65">
            هذه المعلومات يراها العملاء عند البحث عن خدمتك.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {vendor?.verified && (
            <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/20">
              <ShieldCheck className="h-3.5 w-3.5" /> موثق
            </Badge>
          )}
          {vendor && <ApprovalBadge status={status} />}
        </div>
      </div>

      {/* Status banner */}
      {vendor && status === "pending_approval" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <Clock className="mt-0.5 h-4 w-4 text-amber-700 shrink-0" />
          <div>
            <div className="font-semibold text-amber-800">ملفك قيد المراجعة</div>
            <p className="text-amber-700/80">لن يظهر ملفك للعملاء حتى تتم الموافقة من فريق التحقق.</p>
          </div>
        </div>
      )}
      {vendor && status === "rejected" && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <XCircle className="mt-0.5 h-4 w-4 text-destructive shrink-0" />
          <div>
            <div className="font-semibold text-destructive">تم رفض الطلب</div>
            <p className="text-destructive/80">{vendor.rejection_reason || "يرجى مراجعة البيانات وإعادة الإرسال."}</p>
            <p className="mt-1 text-xs text-foreground/60">عند تعديل أي حقل وحفظه، سيُعاد إرسال الطلب للمراجعة تلقائياً.</p>
          </div>
        </div>
      )}

      {/* Mandatory notice */}
      {!vendor && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-primary shrink-0" />
          <div className="text-foreground/80">
            لا يمكن إكمال التسجيل أو التعاقد بدون رفع شهادة الآيبان ووثيقة العمل الحر/السجل التجاري.
          </div>
        </div>
      )}

      {/* Basic info */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Building2 className="h-4 w-4 text-primary" /> المعلومات الأساسية
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>اسم العمل</Label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)}
              placeholder="مثال: قاعة البرج الذهبي" />
          </div>
          <div className="space-y-2">
            <Label>فئة الخدمة</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as VendorRow["category"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>المدينة</Label>
            <SmartCombobox
              value={city}
              onChange={(v) => {
                setCity(v);
                // Auto-fill region from known city → region map.
                const reg = cityToRegion[v];
                if (reg && !region) {
                  setRegion(reg);
                  const regOpt = SAUDI_REGIONS.find((r) => r.ar === reg);
                  if (regOpt && !regionEn) setRegionEn(regOpt.en);
                }
              }}
              options={SAUDI_CITIES.map<SmartOption>((c) => ({
                value: c.ar, label: c.ar, secondary: c.en,
              }))}
              placeholder="اختر المدينة أو اكتبها"
              searchPlaceholder="ابحث عن مدينتك…"
            />
          </div>
          <div className="space-y-2">
            <Label>المنطقة <span className="text-destructive">*</span></Label>
            <SmartCombobox
              value={region}
              onChange={setRegion}
              secondaryValue={regionEn}
              onSecondaryChange={setRegionEn}
              options={SAUDI_REGIONS.map<SmartOption>((r) => ({
                value: r.ar, label: r.ar, secondary: r.en,
              }))}
              placeholder="اختر المنطقة"
              searchPlaceholder="ابحث عن المنطقة…"
            />
          </div>
          <div className="space-y-2">
            <Label>الحي <span className="text-destructive">*</span></Label>
            <SmartCombobox
              value={district}
              onChange={setDistrict}
              secondaryValue={districtEn}
              onSecondaryChange={setDistrictEn}
              options={(SAUDI_DISTRICTS[city] ?? []).map<SmartOption>((d) => ({
                value: d.ar, label: d.ar, secondary: d.en,
              }))}
              placeholder={city ? "اختر الحي أو اكتبه" : "اختر مدينتك أولاً أو اكتب الحي"}
              searchPlaceholder="ابحث عن الحي…"
            />
          </div>
          <div className="space-y-2">
            <Label>رقم التواصل</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>الطاقة اليومية (مناسبة/يوم)</Label>
            <Input type="number" min={1} max={50} value={dailyCapacity}
              onChange={(e) => setDailyCapacity(Number(e.target.value))} />
            <p className="text-xs text-foreground/55">عدد الحفلات التي يمكنك تغطيتها في نفس اليوم.</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>نبذة عن العمل</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب وصفاً يعرف العميل بخدماتك ومميزاتك..."
              className="min-h-[120px] font-arabic" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Bio (English) <span className="text-foreground/50 text-xs">— optional</span></Label>
            <Textarea value={bioEn} onChange={(e) => setBioEn(e.target.value)}
              placeholder="Short English description shown to non-Arabic customers."
              className="min-h-[100px]" dir="ltr" />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Wallet className="h-4 w-4 text-primary" /> {t("vendor.profile.pricingTitle")}
          <Badge variant="secondary" className="ms-1 text-[10px]">{t("vendor.profile.required") ?? "إلزامي"}</Badge>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SmartPriceField
            id="weekday-price"
            label={t("vendor.profile.weekdayPrice")}
            icon={CalendarDays}
            value={weekdayPrice}
            onChange={setWeekdayPrice}
            presets={PRICE_PRESETS[category]?.weekday}
          />
          <SmartPriceField
            id="weekend-price"
            label={t("vendor.profile.weekendPrice")}
            icon={CalendarRange}
            value={weekendPrice}
            onChange={setWeekendPrice}
            presets={PRICE_PRESETS[category]?.weekend}
          />
          <div className="sm:col-span-2">
            <SmartPriceField
              id="min-deposit"
              label={t("vendor.profile.minDeposit")}
              icon={Wallet}
              value={minDeposit}
              onChange={setMinDeposit}
              hint={t("vendor.profile.depositHint")}
              presets={PRICE_PRESETS[category]?.deposit}
            />
          </div>
        </div>
      </div>

      {/* Venue capacity — halls only */}
      {isVenue && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4 text-primary" /> {t("vendor.profile.venueCapacityTitle")}
          </div>
          <p className="mb-5 text-xs text-foreground/60">{t("vendor.profile.venueCapacityHint")}</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <CapacityField
              id="men-capacity"
              label={t("vendor.profile.menCapacity")}
              icon={Users}
              value={menCapacity}
              onChange={setMenCapacity}
            />
            <CapacityField
              id="women-capacity"
              label={t("vendor.profile.womenCapacity")}
              icon={Users2}
              value={womenCapacity}
              onChange={setWomenCapacity}
            />
          </div>
        </div>
      )}

      {/* Manual service tags — ALL categories. Each vendor types and removes
          their own offerings as olive-green chips. */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> الخدمات الإضافية
          <Badge variant="outline" className="ms-1 text-[10px]">اختياري</Badge>
        </div>
        <p className="mb-5 text-xs text-foreground/60">
          أضف الخدمات التي تقدمها لعملائك. اكتب الخدمة واضغط Enter لإضافتها كوسم. ستظهر للعميل عند تصفح ملفك.
        </p>
        <ServiceTagsInput
          value={extraServices}
          onChange={setExtraServices}
          placeholder={isVenue ? "مثال: إضاءة، بوفيه، كوشة" : "مثال: تصوير ليلي، فيديو 4K"}
          hint="اضغط Enter أو الفاصلة لإضافة الخدمة"
          suggestions={(POPULAR_SERVICES[category] ?? []).map((s) => ({
            value: s.ar,
            secondary: s.en,
          }))}
          onSuggestionSecondary={(en) =>
            setExtraServicesEn((prev) =>
              prev.some((t) => t.toLowerCase() === en.toLowerCase()) ? prev : [...prev, en],
            )
          }
        />
        <div className="mt-4">
          <div className="mb-1.5 text-xs font-medium text-foreground/70">Extra services (English) — optional</div>
          <ServiceTagsInput
            value={extraServicesEn}
            onChange={setExtraServicesEn}
            placeholder={isVenue ? "e.g. Lighting, Buffet, Stage" : "e.g. Night photography, 4K video"}
            hint="Type a service and press Enter to add it as a chip."
          />
        </div>
      </div>

      {/* Banking — IBAN */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Landmark className="h-4 w-4 text-primary" /> المعلومات البنكية <Badge variant="secondary" className="ms-1 text-[10px]">إلزامي</Badge>
        </div>
        <p className="mb-5 text-xs text-foreground/60">
          يُستخدم الآيبان لتحويل أرباح حجوزاتك. الشهادة سرية ولا يراها سوى فريق التحقق.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>رقم الآيبان (IBAN)</Label>
            <Input value={iban} onChange={(e) => setIban(e.target.value.toUpperCase().replace(/\s/g, ""))}
              placeholder="SA0000000000000000000000" dir="ltr" maxLength={34} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>شهادة الآيبان (PDF/صورة)</Label>
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                <FileText className="h-4 w-4" />
                {ibanCertUrl ? "استبدال الشهادة" : "رفع شهادة الآيبان"}
                <input type="file" accept="application/pdf,image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUploadIbanCert(e.target.files[0])} />
              </label>
              {ibanCertUrl && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> تم الرفع
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legal docs */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="h-4 w-4 text-primary" /> سجل تجاري أو وثيقة عمل حر
          <Badge variant="secondary" className="ms-1 text-[10px]">إلزامي</Badge>
        </div>
        <p className="mb-5 text-xs text-foreground/60">
          هذه الوثيقة سرية ولا يراها سواك وفريق التحقق. تساعد في توثيق ملفك بسرعة.
        </p>
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            <FileText className="h-4 w-4" />
            {docUrl ? "استبدال الوثيقة" : "رفع الوثيقة (PDF/صورة)"}
            <input type="file" accept="application/pdf,image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUploadDocument(e.target.files[0])} />
          </label>
          {docUrl && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> تم الرفع
            </Badge>
          )}
        </div>
      </div>

      {/* Optional location */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="h-4 w-4 text-primary" /> موقع العمل
          <Badge variant="outline" className="ms-1 text-[10px]">اختياري</Badge>
        </div>
        <p className="mb-5 text-xs text-foreground/60">
          ساعد العملاء في الوصول إليك بسهولة. الصق رابط موقعك من Google Maps.
        </p>
        <div className="space-y-2">
          <Label>رابط Google Maps</Label>
          <Input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/?q=..." dir="ltr" />
        </div>
      </div>

      {/* Portfolio (images + video with captions) */}
      <VendorPortfolioManager vendorId={vendor?.id ?? null} userId={userId} />

      {!vendor && (
        <TermsCheckbox checked={acceptedTos} onCheckedChange={setAcceptedTos} id="vendor-tos" />
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || uploading || (!vendor && !acceptedTos)}
          className="h-12 rounded-full bg-primary px-8 text-primary-foreground shadow-luxury hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="me-2 h-4 w-4" /> حفظ الملف وإرسال للمراجعة</>}
        </Button>
      </div>
    </div>
  );
};

const ApprovalBadge = ({ status }: { status: "pending_approval" | "approved" | "rejected" }) => {
  if (status === "approved") {
    return <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20"><CheckCircle2 className="h-3 w-3" /> موافَق عليه</Badge>;
  }
  if (status === "rejected") {
    return <Badge className="gap-1 bg-destructive/15 text-destructive hover:bg-destructive/20"><XCircle className="h-3 w-3" /> مرفوض</Badge>;
  }
  return <Badge className="gap-1 bg-amber-500/15 text-amber-700 hover:bg-amber-500/20"><Clock className="h-3 w-3" /> قيد المراجعة</Badge>;
};

// Force English numerals; arabic-indic digits are converted on input.
const sanitizeDigits = (raw: string) =>
  raw
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[^\d]/g, "");

interface PriceFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
  icon?: typeof Wallet;
}
const PriceField = ({ id, label, value, onChange, hint, icon: Icon }: PriceFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="inline-flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-primary" />} {label}
    </Label>
    <div
      dir="ltr"
      className="flex h-10 items-center overflow-hidden rounded-md border border-input bg-background transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
    >
      <input
        id={id}
        type="text"
        inputMode="decimal"
        pattern="[0-9]*"
        value={String(value)}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const cleaned = sanitizeDigits(e.target.value);
          onChange(cleaned === "" ? 0 : Math.min(10_000_000, parseInt(cleaned, 10)));
        }}
        placeholder="0"
        aria-label={label}
        className="h-full flex-1 bg-transparent px-3 text-base tabular-nums text-foreground outline-none placeholder:text-muted-foreground md:text-sm"
      />
      <span className="select-none border-s border-border bg-secondary/60 px-3 text-sm font-medium tabular-nums text-foreground/70">
        SAR
      </span>
    </div>
    {hint && <p className="text-xs text-foreground/55">{hint}</p>}
  </div>
);

interface CapacityFieldProps {
  id: string;
  label: string;
  value: number | "";
  onChange: (n: number | "") => void;
  icon?: typeof Users;
}
const CapacityField = ({ id, label, value, onChange, icon: Icon }: CapacityFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="inline-flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-primary" />} {label}
    </Label>
    <div
      dir="ltr"
      className="flex h-10 items-center overflow-hidden rounded-md border border-input bg-background transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
    >
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value === "" ? "" : String(value)}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const cleaned = sanitizeDigits(e.target.value);
          onChange(cleaned === "" ? "" : Math.min(100_000, parseInt(cleaned, 10)));
        }}
        placeholder="0"
        aria-label={label}
        className="h-full flex-1 bg-transparent px-3 text-base tabular-nums text-foreground outline-none placeholder:text-muted-foreground md:text-sm"
      />
    </div>
  </div>
);

