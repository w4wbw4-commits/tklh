import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Trash2, MessageSquareText, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fmtDate } from "@/i18n/format";
import { StarRating } from "@/components/tekillah/reviews/StarRating";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminReview {
  id: string;
  rating: number;
  communication: number;
  punctuality: number;
  quality: number;
  comment: string | null;
  created_at: string;
  vendor_id: string;
  customer_id: string;
  vendor: { business_name: string } | null;
}

interface ReplyRow {
  id: string;
  review_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export const AdminReviewsPanel = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [replies, setReplies] = useState<Record<string, ReplyRow>>({});
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, communication, punctuality, quality, comment, created_at, vendor_id, customer_id, vendor:vendors(business_name)")
      .order("created_at", { ascending: false });
    const list = (data ?? []) as unknown as AdminReview[];
    setReviews(list);
    const ids = Array.from(new Set(list.map((r) => r.customer_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles").select("user_id, display_name").in("user_id", ids);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p) => { map[p.user_id] = p.display_name ?? "—"; });
      setProfiles(map);
    }
    const reviewIds = list.map((r) => r.id);
    if (reviewIds.length) {
      const { data: reps } = await supabase
        .from("review_replies" as never)
        .select("id, review_id, body, created_at, updated_at")
        .in("review_id", reviewIds);
      const map: Record<string, ReplyRow> = {};
      ((reps ?? []) as unknown as ReplyRow[]).forEach((r) => { map[r.review_id] = r; });
      setReplies(map);
    } else {
      setReplies({});
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("reviews.success.deleted"));
    load();
  };

  const removeReply = async (id: string) => {
    const { error } = await supabase.from("review_replies" as never).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("reviews.success.replyDeleted"));
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
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-foreground/55">
        <MessageSquareText className="mx-auto mb-2 h-6 w-6" />
        {t("admin.reviews.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/15 text-primary">{r.vendor?.business_name ?? "—"}</Badge>
                <span className="text-xs text-foreground/55">←</span>
                <span className="font-arabic text-sm font-semibold text-foreground">
                  {profiles[r.customer_id] ?? t("reviews.anonymous")}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-foreground/55">{fmtDate(r.created_at)}</div>
            </div>
            <StarRating value={r.rating} readonly size="sm" />
          </div>

          {r.comment && (
            <p className="mt-3 rounded-xl bg-secondary/40 p-3 text-sm text-foreground/80">{r.comment}</p>
          )}

          {replies[r.id] && (
            <div className="mt-3 rounded-xl border-s-4 border-primary/60 bg-primary/5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {t("reviews.reply.label")}
                </span>
                <span className="text-[11px] text-foreground/55">{fmtDate(replies[r.id].updated_at)}</span>
              </div>
              <p className="mt-2 text-sm text-foreground/85">{replies[r.id].body}</p>
              <div className="mt-2 flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="rounded-full text-destructive hover:bg-destructive/10">
                      <Trash2 className="me-1 h-3.5 w-3.5" />
                      {t("reviews.deleteReplyBtn")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("reviews.deleteReplyConfirmTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>{t("reviews.deleteReplyConfirmDesc")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">{t("common.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeReply(replies[r.id].id)}
                        className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t("reviews.deleteReplyConfirmCta")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 text-[11px] text-foreground/65">
              <span><Star className="me-0.5 inline h-3 w-3 fill-amber-400 text-amber-400" />{t("reviews.fields.communication")}: {r.communication}/5</span>
              <span><Star className="me-0.5 inline h-3 w-3 fill-amber-400 text-amber-400" />{t("reviews.fields.punctuality")}: {r.punctuality}/5</span>
              <span><Star className="me-0.5 inline h-3 w-3 fill-amber-400 text-amber-400" />{t("reviews.fields.quality")}: {r.quality}/5</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="rounded-full text-destructive hover:bg-destructive/10">
                  <Trash2 className="me-1 h-3.5 w-3.5" />
                  {t("admin.reviews.deleteBtn")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("admin.reviews.deleteConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("admin.reviews.deleteConfirmDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => remove(r.id)}
                    className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("admin.reviews.deleteConfirmCta")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
};
