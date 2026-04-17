import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Trash2, MessageSquareText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fmtDate } from "@/i18n/format";
import { StarRating } from "./StarRating";

interface ReviewItem {
  id: string;
  rating: number;
  communication: number;
  punctuality: number;
  quality: number;
  comment: string | null;
  created_at: string;
  customer_id: string;
}

interface Props {
  vendorId: string;
  /** Show admin delete button */
  isAdmin?: boolean;
}

export const ReviewsList = ({ vendorId, isAdmin }: Props) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, communication, punctuality, quality, comment, created_at, customer_id")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });
    const list = (data ?? []) as ReviewItem[];
    setReviews(list);
    const ids = Array.from(new Set(list.map((r) => r.customer_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles").select("user_id, display_name").in("user_id", ids);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p) => { map[p.user_id] = p.display_name ?? "—"; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [vendorId]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("reviews.success.deleted"));
    load();
  };

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-foreground/55">
        <MessageSquareText className="mx-auto mb-2 h-6 w-6" />
        {t("reviews.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="font-arabic text-sm font-semibold text-foreground">
                {profiles[r.customer_id] ?? t("reviews.anonymous")}
              </div>
              <div className="mt-0.5 text-[11px] text-foreground/55">{fmtDate(r.created_at)}</div>
            </div>
            <StarRating value={r.rating} readonly size="sm" />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <SubRating label={t("reviews.fields.communication")} value={r.communication} />
            <SubRating label={t("reviews.fields.punctuality")} value={r.punctuality} />
            <SubRating label={t("reviews.fields.quality")} value={r.quality} />
          </div>

          {r.comment && (
            <p className="mt-3 rounded-xl bg-secondary/40 p-3 text-sm text-foreground/80">{r.comment}</p>
          )}

          {isAdmin && (
            <div className="mt-3 flex justify-end">
              <Button
                size="sm" variant="ghost"
                onClick={() => remove(r.id)}
                className="rounded-full text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="me-1 h-3.5 w-3.5" />
                {t("reviews.deleteBtn")}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const SubRating = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg bg-background px-2 py-1.5 text-center">
    <div className="text-[10px] uppercase tracking-wider text-foreground/50">{label}</div>
    <div className="font-arabic text-xs font-semibold text-foreground">{value}/5</div>
  </div>
);
