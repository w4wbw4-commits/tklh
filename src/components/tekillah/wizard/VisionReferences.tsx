import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ImagePlus, Link2, Loader2, X, Film, Image as ImageIcon } from "lucide-react";

export interface VisionRef {
  id: string;
  kind: "file" | "link";
  url: string;
  name: string;
  tag: string;
}

export const REF_TAGS: Array<{ value: string; ar: string; en: string }> = [
  { value: "styling_decor", ar: "تنسيق وديكور", en: "Styling & decor" },
  { value: "lighting", ar: "إضاءة", en: "Lighting" },
  { value: "venue", ar: "المكان", en: "Venue" },
  { value: "cake_sweets", ar: "كيك وحلويات", en: "Cake & sweets" },
  { value: "photography", ar: "تصوير", en: "Photography" },
  { value: "outfit", ar: "الزي / الفستان", en: "Outfit" },
  { value: "other", ar: "شي ثاني", en: "Something else" },
];

const YEAR = 60 * 60 * 24 * 365;

interface Props {
  refs: VisionRef[];
  setRefs: (r: VisionRef[]) => void;
}

export const VisionReferences = ({ refs, setRefs }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [link, setLink] = useState("");

  const newId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  const MAX_FILES = 5;
  const MAX_LINKS = 2;
  const fileCount = refs.filter((r) => r.kind === "file").length;
  const linkCount = refs.filter((r) => r.kind === "link").length;

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_FILES - refs.filter((r) => r.kind === "file").length;
    if (remaining <= 0) {
      toast.error(isAr ? "تقدر تضيف ٥ صور أو فيديو كحد أقصى" : "You can add up to 5 photos or videos");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setUploading(true);
    const added: VisionRef[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error(isAr ? `${file.name} أكبر من ٢٥ ميجا` : `${file.name} is larger than 25MB`);
        continue;
      }
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${new Date().toISOString().slice(0, 10)}/${newId()}.${ext}`;
      const { error } = await supabase.storage.from("vision-refs").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });
      if (error) {
        toast.error(isAr ? "ما قدرنا نرفع الملف، جرب مرة ثانية" : "Upload failed, please try again");
        continue;
      }
      const { data } = await supabase.storage.from("vision-refs").createSignedUrl(path, YEAR);
      added.push({
        id: newId(),
        kind: "file",
        url: data?.signedUrl ?? path,
        name: file.name,
        tag: "styling_decor",
      });
    }
    setUploading(false);
    if (added.length) setRefs([...refs, ...added]);
    if (fileInput.current) fileInput.current.value = "";
  };

  const addLink = () => {
    const value = link.trim();
    if (!value) return;
    if (refs.filter((r) => r.kind === "link").length >= MAX_LINKS) {
      toast.error(isAr ? "تقدر تضيف رابطين كحد أقصى" : "You can add up to 2 links");
      return;
    }
    const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      setRefs([...refs, { id: newId(), kind: "link", url, name: host, tag: "styling_decor" }]);
      setLink("");
    } catch {
      toast.error(isAr ? "الرابط غير صحيح" : "That link doesn't look right");
    }
  };

  const setTag = (id: string, tag: string) =>
    setRefs(refs.map((r) => (r.id === id ? { ...r, tag } : r)));
  const remove = (id: string) => setRefs(refs.filter((r) => r.id !== id));

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="font-arabic text-base font-semibold text-foreground">
          {isAr ? "ورّنا الشكل الذي تبيه" : "Show us the look you want"}
        </Label>
        <p className="font-arabic text-[13px] text-foreground/65">
          {isAr
            ? "أضف صور أو فيديو، أو رابط من إنستقرام أو بنترست أو تيك توك، ووضّح وش تبي منه: تنسيق، ديكور، إضاءة، كيك، تصوير…"
            : "Add photos or videos, or a link from Instagram, Pinterest or TikTok, and tell us what you want from it: styling, decor, lighting, cake, photography…"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInput.current?.click()}
          disabled={uploading || fileCount >= MAX_FILES}
          className="min-h-[44px] rounded-full border-primary/30 font-arabic text-[13px]"
        >
          {uploading ? (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="me-2 h-4 w-4" />
          )}
          {isAr ? "أضف صورة أو فيديو" : "Add photo or video"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Link2 className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40 ltr:left-3 rtl:right-3" />
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLink();
              }
            }}
            dir="ltr"
            placeholder="https://instagram.com/p/..."
            className="min-h-[44px] rounded-full bg-card font-arabic text-[13px] ltr:pl-9 rtl:pr-9"
          />
        </div>
        <Button
          type="button"
          onClick={addLink}
          disabled={linkCount >= MAX_LINKS}
          className="min-h-[44px] rounded-full px-5 font-arabic text-[13px]"
        >
          {isAr ? "إضافة الرابط" : "Add link"}
        </Button>
      </div>

      {refs.length > 0 && (
        <ul className="space-y-3">
          {refs.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/30 text-primary">
                  {r.kind === "link" ? (
                    <Link2 className="h-4 w-4" />
                  ) : /\.(mp4|mov|webm|m4v)$/i.test(r.name) ? (
                    <Film className="h-4 w-4" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate font-arabic text-[13px] text-foreground/80">
                  {r.name}
                </span>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  aria-label={isAr ? "حذف" : "Remove"}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-foreground/50 transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REF_TAGS.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => setTag(r.id, tag.value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-arabic text-[12px] transition-all duration-300",
                      r.tag === tag.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary/25 text-foreground/70 hover:border-primary/60",
                    )}
                  >
                    {isAr ? tag.ar : tag.en}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
