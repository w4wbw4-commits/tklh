// ---------------------------------------------------------------------------
// AdminEditVendorDialog
// ---------------------------------------------------------------------------
// Lets the admin update core vendor fields after approval. Limited to
// presentation/pricing data (no banking or legal docs).
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Save, ImagePlus, X, Film, Link2, Trash2, Play, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTagsInput } from "@/components/tekillah/vendor/ServiceTagsInput";
import { fmtNumber } from "@/i18n/format";

interface VendorEditRow {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  bio: string | null;
  bio_en: string | null;
  city: string | null;
  region: string | null;
  region_en: string | null;
  district: string | null;
  district_en: string | null;
  phone: string | null;
  weekday_price: number;
  weekend_price: number;
  min_deposit: number;
  men_capacity: number | null;
  women_capacity: number | null;
  portfolio_urls: string[];
  extra_services: string[];
  extra_services_en: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vendorId: string | null;
  onSaved?: () => void;
}

interface VideoItem {
  id: string;
  url: string;
  duration_seconds: number | null;
  caption: string | null;
}

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

const sanitize = (n: string) => n.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-60);

const fmtBytes = (bytes: number) => {
  if (!bytes) return "0 KB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${fmtNumber(Math.round(mb * 10) / 10)} MB`;
  const kb = Math.round(bytes / 1024);
  return `${fmtNumber(kb)} KB`;
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
    } catch {
      resolve(0);
    }
  });

const isValidVideoUrl = (raw: string) => {
  try {
    const u = new URL(raw.trim());
    if (!/^https?:$/.test(u.protocol)) return false;
    const host = u.hostname.toLowerCase();
    if (host.includes("youtube.com") || host === "youtu.be" || host.includes("vimeo.com")) return true;
    if (/\.(mp4|mov|webm|m4v)(\?|$)/i.test(u.pathname)) return true;
    // Allow general cloud storage URLs (S3, Supabase, etc.)
    return host.endsWith(".amazonaws.com") || host.endsWith(".supabase.co") || host.endsWith(".cloudfront.net");
  } catch {
    return false;
  }
};

export const AdminEditVendorDialog = ({ open, onOpenChange, vendorId, onSaved }: Props) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [vendor, setVendor] = useState<VendorEditRow | null>(null);

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [regionEn, setRegionEn] = useState("");
  const [district, setDistrict] = useState("");
  const [districtEn, setDistrictEn] = useState("");
  const [phone, setPhone] = useState("");
  const [extraServices, setExtraServices] = useState<string[]>([]);
  const [extraServicesEn, setExtraServicesEn] = useState<string[]>([]);
  const [weekdayPrice, setWeekdayPrice] = useState<number>(0);
  const [weekendPrice, setWeekendPrice] = useState<number>(0);
  const [minDeposit, setMinDeposit] = useState<number>(0);
  const [menCapacity, setMenCapacity] = useState<number | "">("");
  const [womenCapacity, setWomenCapacity] = useState<number | "">("");
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);

  // Promo video state
  const [video, setVideo] = useState<VideoItem | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoSize, setVideoSize] = useState<number | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    if (!open || !vendorId) return;
    (async () => {
      setLoading(true);
      const [{ data }, { data: videoRows }] = await Promise.all([
        supabase
          .from("vendors")
          .select("id, user_id, business_name, category, bio, bio_en, city, region, region_en, district, district_en, phone, weekday_price, weekend_price, min_deposit, men_capacity, women_capacity, portfolio_urls, extra_services, extra_services_en")
          .eq("id", vendorId)
          .maybeSingle(),
        supabase
          .from("vendor_portfolio_items")
          .select("id, url, duration_seconds, caption")
          .eq("vendor_id", vendorId)
          .eq("media_type", "video")
          .order("created_at", { ascending: false })
          .limit(1),
      ]);
      if (data) {
        const v = data as VendorEditRow;
        setVendor(v);
        setBusinessName(v.business_name);
        setBio(v.bio ?? "");
        setCity(v.city ?? "");
        setRegion(v.region ?? "");
        setDistrict(v.district ?? "");
        setPhone(v.phone ?? "");
        setWeekdayPrice(Number(v.weekday_price ?? 0));
        setWeekendPrice(Number(v.weekend_price ?? 0));
        setMinDeposit(Number(v.min_deposit ?? 0));
        setMenCapacity(v.men_capacity ?? "");
        setWomenCapacity(v.women_capacity ?? "");
        setPortfolioUrls(v.portfolio_urls ?? []);
        setExtraServices(v.extra_services ?? []);
      }
      const existing = videoRows?.[0];
      setVideo(existing ? (existing as VideoItem) : null);
      setVideoUrlInput("");
      setVideoSize(null);
      setVideoProgress(0);
      setLoading(false);
    })();
  }, [open, vendorId]);

  const isVenue = vendor?.category === "hall";

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !vendor) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5 MB"); return; }
    setUploading(true);
    const path = `${vendor.user_id}/admin-${Date.now()}-${sanitize(file.name)}`;
    const { error } = await supabase.storage.from("vendor-portfolios").upload(path, file);
    if (error) { setUploading(false); toast.error(error.message); return; }
    const { data } = supabase.storage.from("vendor-portfolios").getPublicUrl(path);
    setPortfolioUrls((prev) => [...prev, data.publicUrl]);
    setUploading(false);
  };

  const removeImage = (url: string) => {
    setPortfolioUrls((prev) => prev.filter((u) => u !== url));
  };

  // Move an image one position left/right within the gallery so the admin can
  // reorder which photo appears first on the public profile.
  const moveImage = (index: number, dir: -1 | 1) => {
    setPortfolioUrls((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  // Upload promo video file via XHR so we can show real progress.
  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !vendor) return;
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error(t("admin.vendors.videoTooLarge"));
      return;
    }
    setVideoSize(file.size);
    setVideoUploading(true);
    setVideoProgress(0);

    const duration = await probeVideoDuration(file);
    const path = `${vendor.user_id}/promo-${Date.now()}-${sanitize(file.name)}`;
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
      await persistVideo(pub.publicUrl, duration > 0 ? duration : null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setVideoUploading(false);
      xhrRef.current = null;
    }
  };

  // Save a video link (YouTube/Vimeo/MP4) without uploading.
  const handleSaveVideoUrl = async () => {
    if (!vendor) return;
    const trimmed = videoUrlInput.trim();
    if (!isValidVideoUrl(trimmed)) {
      toast.error(t("admin.vendors.videoInvalidUrl"));
      return;
    }
    await persistVideo(trimmed, null);
  };

  // Replace any existing promo video for this vendor with the given URL.
  const persistVideo = async (url: string, duration: number | null) => {
    if (!vendor) return;
    // Remove old video rows first so we always keep a single promo video.
    await supabase
      .from("vendor_portfolio_items")
      .delete()
      .eq("vendor_id", vendor.id)
      .eq("media_type", "video");

    const { data, error } = await supabase
      .from("vendor_portfolio_items")
      .insert({
        vendor_id: vendor.id,
        url,
        media_type: "video",
        duration_seconds: duration,
        sort_order: 0,
      })
      .select("id, url, duration_seconds, caption")
      .maybeSingle();

    if (error) {
      toast.error(error.message);
      return;
    }
    setVideo(data as VideoItem);
    setVideoUrlInput("");
    toast.success(t("admin.vendors.videoSaved"));
  };

  const handleRemoveVideo = async () => {
    if (!vendor || !video) return;
    const { error } = await supabase
      .from("vendor_portfolio_items")
      .delete()
      .eq("id", video.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setVideo(null);
    setVideoSize(null);
    setVideoProgress(0);
    toast.success(t("admin.vendors.videoRemoved"));
  };

  const handleSave = async () => {
    if (!vendor) return;
    if (!businessName.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const startingPrice = Math.min(Number(weekdayPrice), Number(weekendPrice));
    if (!region.trim() || region.trim().length < 2) { toast.error("أدخل اسم المنطقة"); setSaving(false); return; }
    if (!district.trim() || district.trim().length < 2) { toast.error("أدخل اسم الحي"); setSaving(false); return; }
    const { error } = await supabase
      .from("vendors")
      .update({
        business_name: businessName.trim(),
        bio: bio.trim() || null,
        city: city.trim() || null,
        region: region.trim(),
        district: district.trim(),
        phone: phone.trim() || null,
        weekday_price: Number(weekdayPrice) || 0,
        weekend_price: Number(weekendPrice) || 0,
        min_deposit: Number(minDeposit) || 0,
        starting_price: startingPrice || 0,
        men_capacity: isVenue && menCapacity !== "" ? Number(menCapacity) : null,
        women_capacity: isVenue && womenCapacity !== "" ? Number(womenCapacity) : null,
        portfolio_urls: portfolioUrls,
        // Manual tags now apply to all categories.
        extra_services: extraServices,
      })
      .eq("id", vendor.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("admin.vendors.saved"));
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-arabic">{t("admin.vendors.editDialogTitle")}</DialogTitle>
          <DialogDescription className="font-arabic">{t("admin.vendors.editDialogDesc")}</DialogDescription>
        </DialogHeader>

        {loading || !vendor ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="font-arabic">{t("admin.vendors.businessName")}</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="font-arabic" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-arabic">{t("admin.vendors.city")}</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} className="font-arabic" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-arabic">المنطقة *</Label>
                <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="مثال: منطقة الرياض" className="font-arabic" required />
              </div>
              <div className="space-y-1.5">
                <Label className="font-arabic">الحي *</Label>
                <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="مثال: حي العليا" className="font-arabic" required />
              </div>
              <div className="space-y-1.5">
                <Label className="font-arabic">{t("admin.vendors.phone")}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className="tabular-nums" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="font-arabic">{t("admin.vendors.bio")}</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px] font-arabic" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="font-arabic">{t("admin.vendors.weekdayPrice")}</Label>
                <Input type="number" min={0} value={weekdayPrice}
                  onChange={(e) => setWeekdayPrice(Number(e.target.value) || 0)}
                  className="tabular-nums" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-arabic">{t("admin.vendors.weekendPrice")}</Label>
                <Input type="number" min={0} value={weekendPrice}
                  onChange={(e) => setWeekendPrice(Number(e.target.value) || 0)}
                  className="tabular-nums" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-arabic">{t("admin.vendors.minDeposit")}</Label>
                <Input type="number" min={0} value={minDeposit}
                  onChange={(e) => setMinDeposit(Number(e.target.value) || 0)}
                  className="tabular-nums" dir="ltr" />
              </div>
            </div>

            {/* Promo Video — single video per vendor, file upload OR external link */}
            <div className="space-y-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-primary" />
                  <Label className="font-arabic text-base">{t("admin.vendors.promoVideo")}</Label>
                </div>
                {video && (
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="font-arabic">{t("admin.vendors.removeVideo")}</span>
                  </button>
                )}
              </div>

              <p className="font-arabic text-xs text-foreground/65">{t("admin.vendors.promoVideoHint")}</p>

              {/* Live preview thumbnail */}
              {video && (
                <div className="relative overflow-hidden rounded-xl border border-border bg-black">
                  {/\.(mp4|mov|webm|m4v)(\?|$)/i.test(video.url) || video.url.includes(".supabase.co") ? (
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
                    {videoSize && (
                      <span className="font-arabic">
                        {t("admin.vendors.videoSize")}: <span className="tabular-nums" dir="ltr">{fmtBytes(videoSize)}</span>
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
                  onClick={handleSaveVideoUrl}
                  disabled={!videoUrlInput.trim() || videoUploading}
                  className="font-arabic"
                >
                  {t("admin.vendors.saveVideoUrl")}
                </Button>
              </div>
            </div>
            {isVenue && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="font-arabic">{t("admin.vendors.menCapacity")}</Label>
                  <Input type="number" min={0} value={menCapacity}
                    onChange={(e) => setMenCapacity(e.target.value === "" ? "" : Number(e.target.value))}
                    className="tabular-nums" dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-arabic">{t("admin.vendors.womenCapacity")}</Label>
                  <Input type="number" min={0} value={womenCapacity}
                    onChange={(e) => setWomenCapacity(e.target.value === "" ? "" : Number(e.target.value))}
                    className="tabular-nums" dir="ltr" />
                </div>
              </div>
            )}

            {/* Manual service tags — ALL vendor categories. */}
            <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
              <Label className="font-arabic text-base">الخدمات الإضافية</Label>
              <p className="font-arabic text-xs text-foreground/65">
                اكتب الخدمة واضغط Enter لإضافتها كوسم. يستطيع المشرف تعديلها في أي وقت.
              </p>
              <ServiceTagsInput
                value={extraServices}
                onChange={setExtraServices}
                placeholder={isVenue ? "مثال: إضاءة، بوفيه، كوشة" : "مثال: تصوير ليلي، فيديو 4K"}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-arabic">{t("admin.vendors.portfolioImages")}</Label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80">
                  <ImagePlus className="h-3.5 w-3.5" />
                  <span className="font-arabic">{t("admin.vendors.addImage")}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={uploading} />
                </label>
              </div>
              {uploading && (
                <span className="inline-flex items-center gap-2 text-xs text-foreground/65">
                  <Loader2 className="h-3 w-3 animate-spin" /> …
                </span>
              )}
              {portfolioUrls.length > 0 && (
                <>
                  <p className="font-arabic text-xs text-foreground/60">
                    {t("admin.vendors.reorderHint")}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {portfolioUrls.map((url, idx) => (
                      <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {/* Order badge — first image is the public cover */}
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
                        {/* Reorder arrows pinned to bottom — visible on hover/touch */}
                        <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, -1)}
                            disabled={idx === 0}
                            className="grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow-card transition hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:bg-background/90 disabled:hover:text-foreground"
                            aria-label={t("admin.vendors.moveLeft")}
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 1)}
                            disabled={idx === portfolioUrls.length - 1}
                            className="grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow-card transition hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:bg-background/90 disabled:hover:text-foreground"
                            aria-label={t("admin.vendors.moveRight")}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            {t("admin.packages.form.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving || loading || !vendor}
            className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <Save className="me-1 h-4 w-4" />}
            <span className="font-arabic">{t("admin.vendors.saveChanges")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
