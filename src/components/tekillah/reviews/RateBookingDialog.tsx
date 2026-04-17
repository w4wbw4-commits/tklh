import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { containsProfanity } from "@/lib/profanity";
import { StarRating } from "./StarRating";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bookingId: string;
  vendorId: string;
  customerId: string;
  vendorName: string;
  onSubmitted?: () => void;
}

export const RateBookingDialog = ({ open, onOpenChange, bookingId, vendorId, customerId, vendorName, onSubmitted }: Props) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [quality, setQuality] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (rating < 1) { toast.error(t("reviews.errors.pickRating")); return; }
    if (comment.trim() && containsProfanity(comment)) {
      toast.error(t("moderation.profanityBlocked"));
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      vendor_id: vendorId,
      customer_id: customerId,
      rating, communication, punctuality, quality,
      comment: comment.trim().slice(0, 1000) || null,
    });
    setSaving(false);
    if (error) {
      const msg = error.message.includes("duplicate") ? t("reviews.errors.alreadyReviewed") : error.message;
      toast.error(msg);
      return;
    }
    toast.success(t("reviews.success.submitted"));
    onOpenChange(false);
    onSubmitted?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">{t("reviews.dialog.title")}</DialogTitle>
          <DialogDescription>{t("reviews.dialog.subtitle", { vendor: vendorName })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <RatingRow label={t("reviews.fields.overall")} value={rating} onChange={setRating} />
          <RatingRow label={t("reviews.fields.communication")} value={communication} onChange={setCommunication} />
          <RatingRow label={t("reviews.fields.punctuality")} value={punctuality} onChange={setPunctuality} />
          <RatingRow label={t("reviews.fields.quality")} value={quality} onChange={setQuality} />

          <div className="space-y-2">
            <Label htmlFor="review-comment">{t("reviews.fields.comment")}</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("reviews.fields.commentPlaceholder")}
              rows={4}
              maxLength={1000}
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
            {t("reviews.dialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RatingRow = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/50 px-3 py-2">
    <Label className="font-arabic text-sm">{label}</Label>
    <StarRating value={value} onChange={onChange} />
  </div>
);
