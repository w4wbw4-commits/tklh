// ---------------------------------------------------------------------------
// AdminPackageDialog — create / edit a platform package
// ---------------------------------------------------------------------------
// Handles all media uploads to the `platform-package-media` storage bucket,
// inline include-tag editor, price input (English numerals enforced via
// type="number" + tabular-nums), and publish toggle. Single dialog reused
// for both create and edit modes — distinguished by the optional `pkg` prop.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, X, Image as ImageIcon, Video, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fmtNumber } from "@/i18n/format";

const BUCKET = "platform-package-media";
const MAX_IMAGES = 12;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

export interface PlatformPackageMedia {
  url: string;
  type: "image" | "video";
}

export interface PlatformPackageRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  includes: string[];
  media: PlatformPackageMedia[];
  thumbnail_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pkg?: PlatformPackageRow | null;
  adminUserId: string;
  onSaved: () => void;
}

const sanitize = (n: string) => n.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-60);

export const AdminPackageDialog = ({ open, onOpenChange, pkg, adminUserId, onSaved }: Props) => {
  const { t } = useTranslation();
  const isEdit = !!pkg;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [includes, setIncludes] = useState<string[]>([]);
  const [includeDraft, setIncludeDraft] = useState("");
  const [media, setMedia] = useState<PlatformPackageMedia[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [published, setPublished] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Hydrate / reset whenever the dialog opens with a new package
  useEffect(() => {
    if (!open) return;
    setName(pkg?.name ?? "");
    setDescription(pkg?.description ?? "");
    setPrice(pkg?.price ? String(pkg.price) : "");
    setIncludes(pkg?.includes ?? []);
    setIncludeDraft("");
    setMedia(pkg?.media ?? []);
    setThumbnail(pkg?.thumbnail_url ?? null);
    setPublished(pkg?.published ?? true);
  }, [open, pkg]);

  const addInclude = () => {
    const v = includeDraft.trim();
    if (!v) return;
    setIncludes((arr) => [...arr, v]);
    setIncludeDraft("");
  };
  const removeInclude = (i: number) =>
    setIncludes((arr) => arr.filter((_, idx) => idx !== i));

  const uploadFile = async (file: File, kind: "image" | "video") => {
    if (file.size > MAX_FILE_BYTES) {
      toast.error(t("admin.packages.form.fileTooLarge"));
      return null;
    }
    const ext = sanitize(file.name.split(".").pop() ?? (kind === "image" ? "jpg" : "mp4"));
    const key = `${adminUserId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(key, file, {
      cacheControl: "3600", upsert: false, contentType: file.type,
    });
    if (error) { toast.error(error.message); return null; }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
    return data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const currentImages = media.filter((m) => m.type === "image").length;
    if (currentImages + files.length > MAX_IMAGES) {
      toast.error(t("admin.packages.form.tooManyImages"));
      return;
    }
    setUploading(true);
    const next: PlatformPackageMedia[] = [];
    for (const f of files) {
      const url = await uploadFile(f, "image");
      if (url) next.push({ url, type: "image" });
    }
    setMedia((m) => {
      const merged = [...m, ...next];
      // Auto-pick the first image as thumbnail if none set
      if (!thumbnail && next.length > 0) setThumbnail(next[0].url);
      return merged;
    });
    setUploading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (media.some((m) => m.type === "video")) {
      toast.error(t("admin.packages.form.videoExists"));
      return;
    }
    setUploading(true);
    const url = await uploadFile(file, "video");
    if (url) setMedia((m) => [...m, { url, type: "video" }]);
    setUploading(false);
  };

  const removeMedia = (idx: number) => {
    setMedia((m) => {
      const removed = m[idx];
      const next = m.filter((_, i) => i !== idx);
      // If we removed the thumbnail, pick another image (or null)
      if (removed.url === thumbnail) {
        const firstImage = next.find((x) => x.type === "image");
        setThumbnail(firstImage?.url ?? null);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error(t("admin.packages.form.validation.nameRequired")); return; }
    const numericPrice = Number(price);
    if (!numericPrice || numericPrice <= 0) {
      toast.error(t("admin.packages.form.validation.priceRequired")); return;
    }
    if (includes.length === 0) {
      toast.error(t("admin.packages.form.validation.includesRequired")); return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: numericPrice,
      includes,
      // JSONB column — cast our typed media array to the generated `Json` type.
      media: media as unknown as import("@/integrations/supabase/types").Json,
      thumbnail_url: thumbnail ?? media.find((m) => m.type === "image")?.url ?? null,
      published,
    };

    const { error } = isEdit
      ? await supabase.from("platform_packages").update(payload).eq("id", pkg!.id)
      : await supabase.from("platform_packages").insert([{ ...payload, created_by: adminUserId }]);

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(published
      ? t("admin.packages.form.published_toast")
      : t("admin.packages.form.saved"));
    onSaved();
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!pkg) return;
    setDeleting(true);
    const { error } = await supabase.from("platform_packages").delete().eq("id", pkg.id);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("admin.packages.form.deleted"));
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-arabic">
            {isEdit ? t("admin.packages.form.editTitle") : t("admin.packages.form.createTitle")}
          </DialogTitle>
          <DialogDescription className="font-arabic">
            {t("admin.packages.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="font-arabic">{t("admin.packages.form.name")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("admin.packages.form.namePh")}
              className="font-arabic"
              maxLength={120}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="font-arabic">{t("admin.packages.form.description")}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("admin.packages.form.descriptionPh")}
              className="min-h-[100px] font-arabic"
              maxLength={1000}
            />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label className="font-arabic">{t("admin.packages.form.price")}</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t("admin.packages.form.pricePh")}
              className="tabular-nums"
              dir="ltr"
            />
            {Number(price) > 0 && (
              <p className="font-arabic text-xs text-foreground/60 tabular-nums">
                {fmtNumber(Number(price))} ر.س
              </p>
            )}
          </div>

          {/* Includes */}
          <div className="space-y-1.5">
            <Label className="font-arabic">{t("admin.packages.form.includes")}</Label>
            <div className="flex gap-2">
              <Input
                value={includeDraft}
                onChange={(e) => setIncludeDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addInclude(); }
                }}
                placeholder={t("admin.packages.form.includesPh")}
                className="font-arabic"
              />
              <Button type="button" onClick={addInclude} variant="secondary" size="sm" className="rounded-full">
                <Plus className="h-4 w-4" />
                {t("admin.packages.form.addInclude")}
              </Button>
            </div>
            {includes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {includes.map((inc, i) => (
                  <Badge key={i} variant="secondary" className="gap-1.5 pe-1 font-arabic">
                    {inc}
                    <button
                      type="button"
                      onClick={() => removeInclude(i)}
                      className="grid h-5 w-5 place-items-center rounded-full hover:bg-destructive/20"
                      aria-label="remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Media */}
          <div className="space-y-2">
            <Label className="font-arabic">{t("admin.packages.form.media")}</Label>
            <p className="text-xs text-foreground/60 font-arabic">{t("admin.packages.form.mediaHint")}</p>

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80">
                <ImageIcon className="h-4 w-4" />
                <span className="font-arabic">{t("admin.packages.form.uploadImages")}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80">
                <Video className="h-4 w-4" />
                <span className="font-arabic">{t("admin.packages.form.uploadVideo")}</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
              </label>
              {uploading && (
                <span className="inline-flex items-center gap-2 text-xs text-foreground/65 font-arabic">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t("admin.packages.form.uploading")}
                </span>
              )}
            </div>

            {media.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {media.map((m, idx) => {
                  const isThumb = m.url === thumbnail;
                  return (
                    <div key={m.url} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
                      {m.type === "image" ? (
                        <img src={m.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <video src={m.url} muted className="h-full w-full object-cover" />
                      )}
                      {isThumb && (
                        <div className="absolute start-1 top-1 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          <Star className="h-2.5 w-2.5" />
                          {t("admin.packages.form.thumbnail")}
                        </div>
                      )}
                      {m.type === "video" && (
                        <div className="absolute end-1 top-1 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                          <Video className="h-2.5 w-2.5" /> Video
                        </div>
                      )}
                      <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 opacity-0 transition group-hover:opacity-100">
                        {m.type === "image" && !isThumb && (
                          <button
                            type="button"
                            onClick={() => setThumbnail(m.url)}
                            className="rounded-full bg-background/90 px-2 py-1 text-[10px] font-medium text-foreground hover:bg-background"
                          >
                            {t("admin.packages.form.setThumbnail")}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="ms-auto grid h-7 w-7 place-items-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          aria-label="remove media"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3">
            <div>
              <div className="font-arabic text-sm font-semibold text-foreground">
                {published ? t("admin.packages.form.published") : t("admin.packages.form.draft")}
              </div>
            </div>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          {isEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="me-1 h-4 w-4" />
                  {t("admin.packages.form.delete")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("admin.packages.form.deleteConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("admin.packages.form.deleteConfirmDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("admin.packages.form.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : null}
                    {t("admin.packages.form.deleteConfirmCta")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="flex gap-2 sm:ms-auto">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              {t("admin.packages.form.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || uploading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : null}
              {published ? t("admin.packages.form.saveAndPublish") : t("admin.packages.form.save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
