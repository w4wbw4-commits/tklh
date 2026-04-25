import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import {
  Loader2, Plus, Save, Users, Users2, CalendarDays, CalendarRange, Wallet,
  ImagePlus, X, Film, Link2, Trash2, Play, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABELS, type VendorRow } from "@/components/tekillah/vendor/types";
import { ExtraServicesPicker } from "@/components/tekillah/vendor/ExtraServicesPicker";
import { fmtNumber } from "@/i18n/format";

// Convert Arabic-Indic digits → Western digits, strip non-digits
const sanitizeDigits = (raw: string) => {
  const ar = "٠١٢٣٤٥٦٧٨٩";
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  return raw
    .split("")
    .map((c) => {
      const i = ar.indexOf(c);
      if (i >= 0) return String(i);
      const j = fa.indexOf(c);
      if (j >= 0) return String(j);
      return c;
    })
    .join("")
    .replace(/[^\d]/g, "");
};

const sanitizeName = (n: string) => n.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-60);

const MAX_IMG_BYTES = 5 * 1024 * 1024;     // 5 MB per image
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

const fmtBytes = (bytes: number) => {
  if (!bytes) return "0 KB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${fmtNumber(Math.round(mb * 10) / 10)} MB`;
  return `${fmtNumber(Math.round(bytes / 1024))} KB`;
};

const fmtDuration = (sec: number | null) => {
  if (!sec || !isFinite(sec)) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${fmtNumber(m)}:${String(s).padStart(2, "0")}`;
};

const probeVideoDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    try {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => resolve(v.duration || 0);
      v.onerror = () => resolve(0);
      v.src = URL.createObjectURL(file);
    } catch { resolve(0); }
  });

const isValidVideoUrl = (raw: string) => {
  try {
    const u = new URL(raw.trim());
    if (!/^https?:$/.test(u.protocol)) return false;
    const host = u.hostname.toLowerCase();
    if (host.includes("youtube.com") || host === "youtu.be" || host.includes("vimeo.com")) return true;
    if (/\.(mp4|mov|webm|m4v)(\?|$)/i.test(u.pathname)) return true;
    return host.endsWith(".amazonaws.com") || host.endsWith(".supabase.co") || host.endsWith(".cloudfront.net");
  } catch { return false; }
};

const schema = z.object({
  business_name: z.string().trim().min(2).max(120),
  category: z.enum(["hall", "catering", "photography", "dj", "decor", "cars"]),
  city: z.string().trim().max(80).optional(),
  region: z.string().trim().min(2, "أدخل اسم المنطقة").max(80),
  district: z.string().trim().min(2, "أدخل اسم الحي").max(80),
  phone: z.string().trim().max(20).optional(),
  bio: z.string().trim().max(800).optional(),
  weekday_price: z.number().min(1),
  weekend_price: z.number().min(1),
  min_deposit: z.number().min(1),
  men_capacity: z.number().int().min(0).optional().nullable(),
  women_capacity: z.number().int().min(0).optional().nullable(),
});

interface Props {
  adminUserId: string;
  /** Called after successful insert so the parent can refresh stats. */
  onCreated?: () => void;
}

interface PendingVideo {
  url: string;
  duration_seconds: number | null;
  size_bytes: number | null;
  /** True for direct file uploads (so we render a <video> preview). */
  isFile: boolean;
}

export const AdminAddVendorDialog = ({ adminUserId, onCreated }: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<VendorRow["category"]>("hall");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [weekdayPrice, setWeekdayPrice] = useState<number | "">("");
  const [weekendPrice, setWeekendPrice] = useState<number | "">("");
  const [minDeposit, setMinDeposit] = useState<number | "">("");
  const [menCapacity, setMenCapacity] = useState<number | "">("");
  const [womenCapacity, setWomenCapacity] = useState<number | "">("");
  const [extraServices, setExtraServices] = useState<string[]>([]);

  // Media state — staged before vendor insert, persisted on save.
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [imgUploading, setImgUploading] = useState(false);
  const [video, setVideo] = useState<PendingVideo | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const isVenue = category === "hall";

  const reset = () => {
    setBusinessName(""); setCategory("hall");
    setCity(""); setRegion(""); setDistrict(""); setPhone(""); setBio("");
    setWeekdayPrice(""); setWeekendPrice(""); setMinDeposit("");
    setMenCapacity(""); setWomenCapacity(""); setExtraServices([]);
    setPortfolioUrls([]); setVideo(null); setVideoUrlInput("");
    setVideoProgress(0); setVideoUploading(false); setImgUploading(false);
  };

  // -------------------------------------------------------------------------
  // IMAGE UPLOAD — store under admin's user folder so RLS allows the admin to
  // upload before any vendor row exists. The public bucket means files are
  // already viewable; we just save the URLs into vendors.portfolio_urls on save.
  // -------------------------------------------------------------------------
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMG_BYTES) {
      toast.error(t("admin.addVendor.imageTooLarge"));
      return;
    }
    setImgUploading(true);
    const path = `${adminUserId}/new-vendor/${Date.now()}-${sanitizeName(file.name)}`;
    const { error } = await supabase.storage.from("vendor-portfolios").upload(path, file);
    if (error) {
      setImgUploading(false);
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from("vendor-portfolios").getPublicUrl(path);
    setPortfolioUrls((prev) => [...prev, data.publicUrl]);
    setImgUploading(false);
  };

  const removeImage = (url: string) => {
    setPortfolioUrls((prev) => prev.filter((u) => u !== url));
  };

  // -------------------------------------------------------------------------
  // VIDEO — XHR upload with real progress, OR external URL (YouTube/Vimeo/MP4)
  // -------------------------------------------------------------------------
  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error(t("admin.addVendor.videoTooLarge"));
      return;
    }
    setVideoUploading(true);
    setVideoProgress(0);

    const duration = await probeVideoDuration(file);
    const path = `${adminUserId}/new-vendor/promo-${Date.now()}-${sanitizeName(file.name)}`;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
    const baseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const uploadUrl = `${baseUrl}/storage/v1/object/vendor-portfolios/${path}`;

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Authorization", `Bearer ${token ?? apikey}`);
        xhr.setRequestHeader("apikey", apikey);
        xhr.setRequestHeader("x-upsert", "true");
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setVideoProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(xhr.responseText)));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      const { data: pub } = supabase.storage.from("vendor-portfolios").getPublicUrl(path);
      setVideo({
        url: pub.publicUrl,
        duration_seconds: duration > 0 ? duration : null,
        size_bytes: file.size,
        isFile: true,
      });
      toast.success(t("admin.addVendor.videoStaged"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setVideoUploading(false);
      xhrRef.current = null;
    }
  };

  const handleStageVideoUrl = () => {
    const trimmed = videoUrlInput.trim();
    if (!isValidVideoUrl(trimmed)) {
      toast.error(t("admin.addVendor.videoInvalidUrl"));
      return;
    }
    setVideo({ url: trimmed, duration_seconds: null, size_bytes: null, isFile: false });
    setVideoUrlInput("");
    toast.success(t("admin.addVendor.videoStaged"));
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoProgress(0);
  };

  // -------------------------------------------------------------------------
  // SAVE — insert vendor row, then attach the promo video as a portfolio item
  // so it shows up in the public VendorMediaCarousel and the Edit dialog.
  // -------------------------------------------------------------------------
  const handleSave = async () => {
    const parsed = schema.safeParse({
      business_name: businessName,
      category,
      city,
      region: region.trim(),
      district: district.trim(),
      phone,
      bio,
      weekday_price: Number(weekdayPrice),
      weekend_price: Number(weekendPrice),
      min_deposit: Number(minDeposit),
      men_capacity: isVenue && menCapacity !== "" ? Number(menCapacity) : null,
      women_capacity: isVenue && womenCapacity !== "" ? Number(womenCapacity) : null,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSaving(true);
    const startingPrice = Math.min(Number(weekdayPrice), Number(weekendPrice));
    const payload = {
      user_id: adminUserId,
      business_name: businessName,
      category,
      bio: bio || null,
      city: city || null,
      region: region.trim() || null,
      district: district.trim() || null,
      phone: phone || null,
      daily_capacity: 1,
      starting_price: startingPrice,
      weekday_price: Number(weekdayPrice),
      weekend_price: Number(weekendPrice),
      min_deposit: Number(minDeposit),
      men_capacity: isVenue && menCapacity !== "" ? Number(menCapacity) : null,
      women_capacity: isVenue && womenCapacity !== "" ? Number(womenCapacity) : null,
      extra_services: isVenue ? extraServices : [],
      portfolio_urls: portfolioUrls,
      // Admin bypass: instantly approved, active and visible publicly
      approval_status: "approved" as const,
      active: true,
      verified: true,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminUserId,
    };

    const { data: inserted, error } = await supabase
      .from("vendors")
      .insert(payload)
      .select("id")
      .maybeSingle();

    if (error || !inserted) {
      setSaving(false);
      toast.error(error?.message ?? "Insert failed");
      return;
    }

    // Attach promo video (if any) to the new vendor.
    if (video) {
      const { error: videoErr } = await supabase.from("vendor_portfolio_items").insert({
        vendor_id: inserted.id,
        url: video.url,
        media_type: "video",
        duration_seconds: video.duration_seconds,
        sort_order: 0,
      });
      if (videoErr) toast.error(videoErr.message);
    }

    setSaving(false);
    toast.success(t("admin.addVendor.successToast"));
    reset();
    setOpen(false);
    onCreated?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> {t("admin.addVendor.cta")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-arabic text-xl">{t("admin.addVendor.title")}</DialogTitle>
          <DialogDescription className="font-arabic">{t("admin.addVendor.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Basic */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="font-arabic">{t("admin.addVendor.businessName")}</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                placeholder={t("admin.addVendor.businessNamePh") ?? ""} />
            </div>
            <div className="space-y-2">
              <Label className="font-arabic">{t("admin.addVendor.category")}</Label>
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
              <Label className="font-arabic">{t("admin.addVendor.city")}</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("admin.addVendor.cityPh") ?? ""} />
            </div>
            <div className="space-y-2">
              <Label className="font-arabic">المنطقة <span className="text-destructive">*</span></Label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="مثال: منطقة الرياض" required />
            </div>
            <div className="space-y-2">
              <Label className="font-arabic">الحي <span className="text-destructive">*</span></Label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="مثال: حي العليا" required />
            </div>
            <div className="space-y-2">
              <Label className="font-arabic">{t("admin.addVendor.phone")}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" placeholder="05xxxxxxxx" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="font-arabic">{t("admin.addVendor.bio")}</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
                className="min-h-[80px] font-arabic"
                placeholder={t("admin.addVendor.bioPh") ?? ""} />
            </div>
          </div>

          {/* Pricing — two-column grid */}
          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet className="h-4 w-4 text-primary" /> {t("admin.addVendor.pricingTitle")}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NumField label={t("vendor.profile.weekdayPrice")} icon={CalendarDays} value={weekdayPrice} onChange={setWeekdayPrice} unit={t("common.currency")} />
              <NumField label={t("vendor.profile.weekendPrice")} icon={CalendarRange} value={weekendPrice} onChange={setWeekendPrice} unit={t("common.currency")} />
              <div className="sm:col-span-2">
                <NumField label={t("vendor.profile.minDeposit")} icon={Wallet} value={minDeposit} onChange={setMinDeposit}
                  unit={t("common.currency")} hint={t("vendor.profile.depositHint")} />
              </div>
            </div>
          </div>

          {/* Capacity — halls only */}
          {isVenue && (
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" /> {t("vendor.profile.venueCapacityTitle")}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NumField label={t("vendor.profile.menCapacity")} icon={Users} value={menCapacity} onChange={setMenCapacity} />
                <NumField label={t("vendor.profile.womenCapacity")} icon={Users2} value={womenCapacity} onChange={setWomenCapacity} />
              </div>
            </div>
          )}

          {/* Extra services — venues only */}
          {isVenue && (
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" /> خدمات إضافية
              </div>
              <ExtraServicesPicker value={extraServices} onChange={setExtraServices} />
            </div>
          )}

          {/* Promo Video — luxury black/gold card */}
          <div className="space-y-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" />
                <Label className="font-arabic text-base">{t("admin.vendors.promoVideo")}</Label>
              </div>
              {video && (
                <button
                  type="button"
                  onClick={removeVideo}
                  className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="font-arabic">{t("admin.vendors.removeVideo")}</span>
                </button>
              )}
            </div>

            <p className="font-arabic text-xs text-foreground/65">{t("admin.vendors.promoVideoHint")}</p>

            {/* Live preview */}
            {video && (
              <div className="relative overflow-hidden rounded-xl border border-border bg-black">
                {video.isFile || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(video.url) ? (
                  <video
                    key={video.url}
                    src={video.url}
                    controls
                    preload="metadata"
                    playsInline
                    className="aspect-video w-full bg-black object-contain"
                  />
                ) : (
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative grid aspect-video w-full place-items-center bg-gradient-to-br from-primary/10 to-black text-primary"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-luxury transition group-hover:scale-105">
                      <Play className="h-5 w-5" />
                    </span>
                    <span className="absolute bottom-2 start-2 max-w-[80%] truncate rounded-md bg-background/85 px-2 py-1 text-[10px] text-foreground" dir="ltr">
                      {video.url}
                    </span>
                  </a>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-card px-3 py-2 text-xs text-foreground/70">
                  <span className="font-arabic">
                    {t("admin.vendors.videoDuration")}: <span className="tabular-nums" dir="ltr">{fmtDuration(video.duration_seconds)}</span>
                  </span>
                  {video.size_bytes != null && (
                    <span className="font-arabic">
                      {t("admin.vendors.videoSize")}: <span className="tabular-nums" dir="ltr">{fmtBytes(video.size_bytes)}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Upload progress */}
            {videoUploading && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-foreground/70">
                  <span className="inline-flex items-center gap-1.5 font-arabic">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    {t("admin.vendors.uploadingVideo")}
                  </span>
                  <span className="tabular-nums" dir="ltr">{fmtNumber(videoProgress)}%</span>
                </div>
                <Progress value={videoProgress} className="h-2" />
              </div>
            )}

            {/* Upload + URL controls */}
            <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20">
                <Film className="h-3.5 w-3.5" />
                <span className="font-arabic">{t("admin.vendors.uploadVideo")}</span>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  className="hidden"
                  onChange={handleUploadVideo}
                  disabled={videoUploading}
                />
              </label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40" />
                <Input
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder={t("admin.vendors.videoUrlPlaceholder")}
                  dir="ltr"
                  className="ps-8 text-xs"
                  disabled={videoUploading}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStageVideoUrl}
                disabled={!videoUrlInput.trim() || videoUploading}
                className="font-arabic"
              >
                {t("admin.vendors.saveVideoUrl")}
              </Button>
            </div>
          </div>

          {/* Portfolio Images — multi upload, ordered */}
          <div className="space-y-2 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-primary" />
                <Label className="font-arabic text-base">{t("admin.vendors.portfolioImages")}</Label>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                <ImagePlus className="h-3.5 w-3.5" />
                <span className="font-arabic">{t("admin.vendors.addImage")}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={imgUploading} />
              </label>
            </div>
            {imgUploading && (
              <span className="inline-flex items-center gap-2 text-xs text-foreground/65">
                <Loader2 className="h-3 w-3 animate-spin" /> {t("admin.addVendor.uploadingImage")}
              </span>
            )}
            {portfolioUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {portfolioUrls.map((url, idx) => (
                  <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <span
                      className="absolute start-1 top-1 grid h-6 min-w-[1.5rem] place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground tabular-nums shadow-card"
                      dir="ltr"
                    >
                      {fmtNumber(idx + 1)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute end-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition group-hover:opacity-100"
                      aria-label={t("admin.vendors.removeImage")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-arabic text-xs text-foreground/55">{t("admin.addVendor.imagesEmpty")}</p>
            )}
          </div>

          {weekdayPrice && weekendPrice ? (
            <div className="rounded-xl bg-primary/10 p-3 text-center text-xs font-medium text-primary">
              {t("admin.addVendor.previewStart")}{" "}
              <span className="font-arabic text-sm font-semibold" dir="ltr">
                {fmtNumber(Math.min(Number(weekdayPrice), Number(weekendPrice)))}
              </span>{" "}
              {t("common.currency")}
            </div>
          ) : null}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={() => { setOpen(false); reset(); }} className="rounded-full">
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving || imgUploading || videoUploading}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <Save className="me-1 h-4 w-4" />}
            {t("admin.addVendor.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NumField = ({
  label, value, onChange, icon: Icon, unit, hint,
}: {
  label: string;
  value: number | "";
  onChange: (n: number | "") => void;
  icon: typeof Users;
  unit?: string;
  hint?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 font-arabic text-xs">
      <Icon className="h-3.5 w-3.5 text-primary" /> {label}
    </Label>
    <div className="relative">
      <Input
        inputMode="numeric"
        dir="ltr"
        value={value === "" ? "" : String(value)}
        onChange={(e) => {
          const cleaned = sanitizeDigits(e.target.value);
          onChange(cleaned === "" ? "" : Number(cleaned));
        }}
        className="font-arabic text-end"
        placeholder="0"
      />
      {unit && <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-foreground/50">{unit}</span>}
    </div>
    {hint && <p className="text-[10px] text-foreground/55">{hint}</p>}
  </div>
);
