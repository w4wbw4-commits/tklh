import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ImagePlus, Video, X, Loader2, Save } from "lucide-react";
import { vendorsService, storageService } from "@/domain";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MAX_IMAGES = 10;
const MAX_VIDEOS = 1;
const MAX_VIDEO_SECONDS = 30;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

type MediaType = "image" | "video";

interface PortfolioItem {
  id: string;
  vendor_id: string;
  media_type: MediaType;
  url: string;
  caption: string | null;
  duration_seconds: number | null;
  sort_order: number;
}

interface Props {
  vendorId: string | null;
  userId: string;
}

const sanitizeName = (n: string) => n.replace(/[^a-zA-Z0-9.]/g, "_");

const probeVideoDuration = (file: File): Promise<number> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(v.duration);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid_video"));
    };
    v.src = url;
  });

export const VendorPortfolioManager = ({ vendorId, userId }: Props) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirtyCaptions, setDirtyCaptions] = useState<Record<string, string>>({});
  const fileImgRef = useRef<HTMLInputElement>(null);
  const fileVidRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!vendorId) return;
    setLoading(true);
    const { data, error } = await vendorsService.listPortfolioItemsOrdered(vendorId);
    setLoading(false);
    if (error) {
      toast.error("تعذر تحميل المعرض");
      return;
    }
    setItems((data ?? []) as PortfolioItem[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const images = items.filter((i) => i.media_type === "image");
  const videos = items.filter((i) => i.media_type === "video");

  const handleUploadImage = async (file: File) => {
    if (!vendorId) {
      toast.error("احفظ ملف العمل أولاً قبل إضافة الصور");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى رفع صورة فقط");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("الحد الأقصى للصورة 5 ميجابايت");
      return;
    }
    if (images.length >= MAX_IMAGES) {
      toast.error(`الحد الأقصى ${MAX_IMAGES} صور`);
      return;
    }
    setUploading(true);
    const path = `${userId}/img-${Date.now()}-${sanitizeName(file.name)}`;
    const { error: upErr } = await storageService.upload(storageService.BUCKETS.vendorPortfolios, path, file, false);
    if (upErr) {
      setUploading(false);
      toast.error("فشل الرفع: " + upErr.message);
      return;
    }
    const publicUrl = storageService.publicUrl(storageService.BUCKETS.vendorPortfolios, path);
    const { error: insErr } = await vendorsService.insertPortfolioItem({
      vendor_id: vendorId,
      media_type: "image",
      url: publicUrl,
      sort_order: images.length,
    });
    setUploading(false);
    if (insErr) {
      toast.error("فشل الحفظ: " + insErr.message);
      return;
    }
    toast.success("تم رفع الصورة");
    await load();
  };

  const handleUploadVideo = async (file: File) => {
    if (!vendorId) {
      toast.error("احفظ ملف العمل أولاً قبل إضافة الفيديو");
      return;
    }
    if (!file.type.startsWith("video/")) {
      toast.error("يرجى رفع ملف فيديو");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error("الحد الأقصى للفيديو 30 ميجابايت");
      return;
    }
    if (videos.length >= MAX_VIDEOS) {
      toast.error("يمكنك رفع فيديو واحد فقط");
      return;
    }
    let duration = 0;
    try {
      duration = await probeVideoDuration(file);
    } catch {
      toast.error("تعذر قراءة مدة الفيديو");
      return;
    }
    if (duration > MAX_VIDEO_SECONDS + 0.5) {
      toast.error(`مدة الفيديو يجب ألا تتجاوز ${MAX_VIDEO_SECONDS} ثانية`);
      return;
    }
    setUploading(true);
    const path = `${userId}/vid-${Date.now()}-${sanitizeName(file.name)}`;
    const { error: upErr } = await storageService.upload(storageService.BUCKETS.vendorPortfolios, path, file, false);
    if (upErr) {
      setUploading(false);
      toast.error("فشل الرفع: " + upErr.message);
      return;
    }
    const publicUrl = storageService.publicUrl(storageService.BUCKETS.vendorPortfolios, path);
    const { error: insErr } = await vendorsService.insertPortfolioItem({
      vendor_id: vendorId,
      media_type: "video",
      url: publicUrl,
      duration_seconds: duration,
      sort_order: videos.length,
    });
    setUploading(false);
    if (insErr) {
      toast.error("فشل الحفظ: " + insErr.message);
      return;
    }
    toast.success("تم رفع الفيديو");
    await load();
  };

  const removeItem = async (item: PortfolioItem) => {
    const { error } = await vendorsService.deletePortfolioItem(item.id);
    if (error) {
      toast.error("تعذر الحذف");
      return;
    }
    toast.success("تم الحذف");
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const saveCaption = async (item: PortfolioItem) => {
    const next = dirtyCaptions[item.id] ?? "";
    const { error } = await vendorsService.updatePortfolioItemCaption(item.id, next || null);
    if (error) {
      toast.error("تعذر حفظ الوصف");
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, caption: next || null } : i)));
    setDirtyCaptions((d) => {
      const c = { ...d };
      delete c[item.id];
      return c;
    });
    toast.success("تم حفظ الوصف");
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <ImagePlus className="h-4 w-4 text-primary" /> معرض الأعمال
      </div>
      <p className="mb-5 text-xs text-foreground/60">
        ارفع حتى {MAX_IMAGES} صور وفيديو واحد قصير (≤ {MAX_VIDEO_SECONDS} ثانية). أضف وصفاً لكل صورة ليظهر في صفحتك العامة.
      </p>

      {!vendorId && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800">
          احفظ بيانات ملف العمل أولاً ثم ارجع لإضافة الصور والفيديو.
        </div>
      )}

      {/* Upload buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4 text-primary" />}
          إضافة صورة ({images.length}/{MAX_IMAGES})
          <input
            ref={fileImgRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={!vendorId || uploading || images.length >= MAX_IMAGES}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUploadImage(f);
              if (fileImgRef.current) fileImgRef.current.value = "";
            }}
          />
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4 text-primary" />}
          إضافة فيديو (≤ {MAX_VIDEO_SECONDS} ث) ({videos.length}/{MAX_VIDEOS})
          <input
            ref={fileVidRef}
            type="file"
            accept="video/*"
            className="hidden"
            disabled={!vendorId || uploading || videos.length >= MAX_VIDEOS}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUploadVideo(f);
              if (fileVidRef.current) fileVidRef.current.value = "";
            }}
          />
        </label>
      </div>

      {/* Video preview */}
      {videos.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 text-xs font-semibold text-foreground/75">الفيديو التعريفي</div>
          {videos.map((v) => (
            <div key={v.id} className="relative overflow-hidden rounded-2xl border border-border bg-background">
              <video src={v.url} controls playsInline className="aspect-video w-full bg-foreground object-contain" />
              <button
                type="button"
                onClick={() => removeItem(v)}
                className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-foreground/70 text-background transition-opacity hover:bg-foreground"
                aria-label="حذف الفيديو"
              >
                <X className="h-4 w-4" />
              </button>
              {v.duration_seconds != null && (
                <div className="absolute start-2 top-2 rounded-full bg-foreground/70 px-2 py-0.5 text-[11px] text-background">
                  {Math.round(v.duration_seconds)} ث
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image grid */}
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-foreground/60">
          لا توجد صور بعد — ابدأ بإضافة أول صورة من أعمالك السابقة.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {images.map((item) => {
            const captionVal = dirtyCaptions[item.id] ?? item.caption ?? "";
            const isDirty = dirtyCaptions[item.id] !== undefined && (dirtyCaptions[item.id] ?? "") !== (item.caption ?? "");
            return (
              <motion.div
                key={item.id}
                layout
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img src={item.url} alt={item.caption ?? "portfolio"} loading="lazy" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="absolute end-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-foreground/70 text-background opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="حذف الصورة"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-2 p-3">
                  <label className="block text-[11px] font-semibold text-foreground/70 font-arabic">وصف الصورة</label>
                  <Input
                    dir="rtl"
                    value={captionVal}
                    maxLength={120}
                    onChange={(e) => setDirtyCaptions((d) => ({ ...d, [item.id]: e.target.value }))}
                    placeholder="مثال: ديكور قاعة ليلة العمر"
                    className="h-9 text-sm"
                  />
                  {isDirty && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => saveCaption(item)}
                      className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Save className="me-1 h-3.5 w-3.5" /> حفظ الوصف
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
