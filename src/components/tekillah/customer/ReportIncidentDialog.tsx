import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Upload, X, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Kind = "quality" | "no_show" | "late" | "damage" | "safety" | "other";

interface Props {
  bookingId: string;
  vendorId: string;
}

export const ReportIncidentDialog = ({ bookingId, vendorId }: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("quality");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setKind("quality");
    setDescription("");
    setFiles([]);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []).slice(0, 5);
    setFiles(list);
  };

  const submit = async () => {
    if (!user) {
      toast.error(t("customer.report.errors.auth"));
      return;
    }
    if (description.trim().length < 10) {
      toast.error(t("customer.report.errors.descShort"));
      return;
    }
    setSubmitting(true);
    try {
      const paths: string[] = [];
      for (const f of files) {
        const ext = f.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("incident-attachments")
          .upload(path, f, { upsert: false, contentType: f.type });
        if (error) throw error;
        paths.push(path);
      }
      const { error: insErr } = await supabase.from("incident_reports" as never).insert({
        customer_id: user.id,
        vendor_id: vendorId,
        booking_id: bookingId,
        kind,
        description: description.trim(),
        attachments: paths,
      });
      if (insErr) throw insErr;
      toast.success(t("customer.report.submitted"));
      setOpen(false);
      reset();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <AlertOctagon className="me-1 h-4 w-4" /> {t("customer.report.openCta")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">{t("customer.report.title")}</DialogTitle>
          <DialogDescription>{t("customer.report.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="font-arabic text-sm">{t("customer.report.kind")}</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quality">{t("admin.incidents.kind.quality")}</SelectItem>
                <SelectItem value="no_show">{t("admin.incidents.kind.no_show")}</SelectItem>
                <SelectItem value="late">{t("admin.incidents.kind.late")}</SelectItem>
                <SelectItem value="damage">{t("admin.incidents.kind.damage")}</SelectItem>
                <SelectItem value="safety">{t("admin.incidents.kind.safety")}</SelectItem>
                <SelectItem value="other">{t("admin.incidents.kind.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="font-arabic text-sm">{t("customer.report.description")}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("customer.report.descPlaceholder")}
              className="min-h-[110px] font-arabic"
              maxLength={1000}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-arabic text-sm">{t("customer.report.images")}</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background py-4 text-sm text-foreground/65 hover:border-primary/40 hover:bg-primary/5">
              <Upload className="h-4 w-4" />
              <span>{t("customer.report.uploadHint")}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFiles}
              />
            </label>
            {files.length > 0 && (
              <ul className="space-y-1 text-xs text-foreground/65">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-secondary px-2 py-1">
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-foreground/50 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={submit}
            disabled={submitting}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
            {t("customer.report.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
