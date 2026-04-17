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
  Loader2, Save, ImagePlus, FileText, X, ShieldCheck, Building2,
  Landmark, MapPin, AlertTriangle, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { CATEGORY_LABELS, type VendorRow } from "./types";
import { TermsCheckbox } from "@/components/tekillah/TermsCheckbox";
import { recordTermsAcceptance } from "@/lib/terms";
import { useTranslation } from "react-i18next";

// IBAN: Saudi format SA + 22 digits, but accept generic 15-34 alphanumeric for flexibility
const ibanRegex = /^[A-Z]{2}[0-9A-Z]{13,32}$/;

const vendorSchema = z.object({
  business_name: z.string().trim().min(2).max(120),
  category: z.enum(["hall", "catering", "photography", "dj", "decor", "cars"]),
  bio: z.string().trim().max(800).optional(),
  city: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  daily_capacity: z.number().int().min(1).max(50),
  starting_price: z.number().min(0).max(10000000),
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
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [dailyCapacity, setDailyCapacity] = useState(1);
  const [startingPrice, setStartingPrice] = useState(0);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [iban, setIban] = useState("");
  const [ibanCertUrl, setIbanCertUrl] = useState<string | null>(null);
  const [mapsUrl, setMapsUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [acceptedTos, setAcceptedTos] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (vendor) {
      setBusinessName(vendor.business_name);
      setCategory(vendor.category);
      setBio(vendor.bio ?? "");
      setCity(vendor.city ?? "");
      setPhone(vendor.phone ?? "");
      setDailyCapacity(vendor.daily_capacity);
      setStartingPrice(Number(vendor.starting_price));
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
      business_name: businessName, category, bio, city, phone,
      daily_capacity: Number(dailyCapacity), starting_price: Number(startingPrice),
      iban: iban.toUpperCase(), google_maps_url: mapsUrl,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);
    const payload = {
      user_id: userId,
      business_name: businessName,
      category,
      bio: bio || null,
      city: city || null,
      phone: phone || null,
      daily_capacity: Number(dailyCapacity),
      starting_price: Number(startingPrice),
      portfolio_urls: portfolioUrls,
      commercial_register_url: docUrl,
      iban: iban.toUpperCase(),
      iban_certificate_url: ibanCertUrl,
      google_maps_url: mapsUrl || null,
    };

    let result;
    if (vendor) {
      result = await supabase.from("vendors").update(payload).eq("id", vendor.id).select().single();
    } else {
      result = await supabase.from("vendors").insert(payload).select().single();
      await supabase.from("user_roles").insert({ user_id: userId, role: "vendor" });
    }
    setSaving(false);
    if (result.error) { toast.error(result.error.message); return; }
    toast.success("تم حفظ الملف وأُرسل للمراجعة");
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
              <ShieldCheck className="h-3.5 w-3.5" /> موثّق
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
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="الرياض، جدة..." />
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
          <div className="space-y-2">
            <Label>السعر المبدئي (ر.س)</Label>
            <Input type="number" min={0} step={500} value={startingPrice}
              onChange={(e) => setStartingPrice(Number(e.target.value))} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>نبذة عن العمل</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب وصفاً يعرّف العميل بخدماتك ومميزاتك..."
              className="min-h-[120px] font-arabic" />
          </div>
        </div>
      </div>

      {/* Banking — IBAN */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Landmark className="h-4 w-4 text-primary" /> المعلومات البنكية <Badge variant="secondary" className="ms-1 text-[10px]">إلزامي</Badge>
        </div>
        <p className="mb-5 text-xs text-foreground/60">
          يُستخدم الآيبان لتحويل أرباح حجوزاتك. الشهادة سرّية ولا يراها سوى فريق التحقق.
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
          هذه الوثيقة سرّية ولا يراها سواك وفريق التحقق. تساعد في توثيق ملفك بسرعة.
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

      {/* Portfolio */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <ImagePlus className="h-4 w-4 text-primary" /> معرض الأعمال
        </div>
        <p className="mb-5 text-xs text-foreground/60">صور عالية الجودة من حفلات سابقة. حد أقصى 5MB لكل صورة.</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {portfolioUrls.map((url) => (
            <motion.div key={url} layout className="group relative aspect-square overflow-hidden rounded-2xl border border-border">
              <img src={url} alt="portfolio" className="h-full w-full object-cover" loading="lazy" />
              <button type="button" onClick={() => removePortfolio(url)}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-foreground/70 text-background opacity-0 transition-opacity group-hover:opacity-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/30 text-foreground/60 transition-colors hover:border-primary/60 hover:text-primary">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            <span className="text-xs">إضافة صورة</span>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUploadPortfolio(e.target.files[0])} />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || uploading}
          className="h-12 rounded-full bg-primary px-8 text-primary-foreground shadow-luxury hover:bg-primary/90">
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
