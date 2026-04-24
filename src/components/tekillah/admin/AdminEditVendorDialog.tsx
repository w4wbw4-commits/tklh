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
import { Loader2, Save, ImagePlus, X, Film, Link2, Trash2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fmtNumber } from "@/i18n/format";

interface VendorEditRow {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  bio: string | null;
  city: string | null;
  phone: string | null;
  weekday_price: number;
  weekend_price: number;
  min_deposit: number;
  men_capacity: number | null;
  women_capacity: number | null;
  portfolio_urls: string[];
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
  if (mb >= 1) return `${fmtNumber(Math.round(mb * 10) / 10 as unknown as number)} MB`;
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
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
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
          .select("id, user_id, business_name, category, bio, city, phone, weekday_price, weekend_price, min_deposit, men_capacity, women_capacity, portfolio_urls")
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
        setPhone(v.phone ?? "");
        setWeekdayPrice(Number(v.weekday_price ?? 0));
        setWeekendPrice(Number(v.weekend_price ?? 0));
        setMinDeposit(Number(v.min_deposit ?? 0));
        setMenCapacity(v.men_capacity ?? "");
        setWomenCapacity(v.women_capacity ?? "");
        setPortfolioUrls(v.portfolio_urls ?? []);
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

  const handleSave = async () => {
    if (!vendor) return;
    if (!businessName.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const startingPrice = Math.min(Number(weekdayPrice), Number(weekendPrice));
    const { error } = await supabase
      .from("vendors")
      .update({
        business_name: businessName.trim(),
        bio: bio.trim() || null,
        city: city.trim() || null,
        phone: phone.trim() || null,
        weekday_price: Number(weekdayPrice) || 0,
        weekend_price: Number(weekendPrice) || 0,
        min_deposit: Number(minDeposit) || 0,
        starting_price: startingPrice || 0,
        men_capacity: isVenue && menCapacity !== "" ? Number(menCapacity) : null,
        women_capacity: isVenue && womenCapacity !== "" ? Number(womenCapacity) : null,
        portfolio_urls: portfolioUrls,
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
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {portfolioUrls.map((url) => (
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute end-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition group-hover:opacity-100"
                        aria-label="remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
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
