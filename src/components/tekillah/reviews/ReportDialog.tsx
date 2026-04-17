import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Reason = "inappropriate" | "spam" | "harassment" | "other";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  targetType: "review" | "reply";
  targetId: string;
}

export const ReportDialog = ({ open, onOpenChange, targetType, targetId }: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reason, setReason] = useState<Reason>("inappropriate");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) { toast.error(t("report.errors.mustLogin")); return; }
    setSaving(true);
    const { error } = await supabase.from("content_reports" as never).insert({
      target_type: targetType,
      target_id: targetId,
      reporter_id: user.id,
      reason,
      details: details.trim().slice(0, 500) || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("report.success"));
    onOpenChange(false);
    setDetails("");
    setReason("inappropriate");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">{t("report.dialog.title")}</DialogTitle>
          <DialogDescription>{t("report.dialog.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="font-arabic text-sm">{t("report.reasonLabel")}</Label>
            <RadioGroup value={reason} onValueChange={(v) => setReason(v as Reason)} className="grid gap-2">
              {(["inappropriate", "spam", "harassment", "other"] as Reason[]).map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card/50 px-3 py-2 hover:bg-secondary/40">
                  <RadioGroupItem value={r} id={`reason-${r}`} />
                  <span className="text-sm text-foreground">{t(`report.reasons.${r}`)}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details">{t("report.detailsLabel")}</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("report.detailsPlaceholder")}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={submit}
            disabled={saving}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
            {t("report.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
