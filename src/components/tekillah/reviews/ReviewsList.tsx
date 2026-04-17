import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Trash2, MessageSquareText, Reply, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { fmtRelative } from "@/i18n/format";
import { StarRating } from "./StarRating";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface ReplyItem {
  id: string;
  review_id: string;
  vendor_id: string;
  vendor_user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  vendorId: string;
  /** Show admin delete button on reviews and replies */
  isAdmin?: boolean;
  /** When true, vendor (current auth user) can reply to reviews on this vendor profile */
  canReply?: boolean;
  /** Auth user id of the logged-in vendor (used to author the reply) */
  vendorUserId?: string;
}

export const ReviewsList = ({ vendorId, isAdmin, canReply, vendorUserId }: Props) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [replies, setReplies] = useState<Record<string, ReplyItem>>({});
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

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

    const reviewIds = list.map((r) => r.id);
    if (reviewIds.length) {
      const { data: reps } = await supabase
        .from("review_replies" as never)
        .select("id, review_id, vendor_id, vendor_user_id, body, created_at, updated_at")
        .in("review_id", reviewIds);
      const repMap: Record<string, ReplyItem> = {};
      ((reps ?? []) as unknown as ReplyItem[]).forEach((r) => { repMap[r.review_id] = r; });
      setReplies(repMap);
    } else {
      setReplies({});
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [vendorId]);

  const removeReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("reviews.success.deleted"));
    load();
  };

  const startReply = (reviewId: string, current?: string) => {
    setEditingId(reviewId);
    setDraft(current ?? "");
  };
  const cancelReply = () => { setEditingId(null); setDraft(""); };

  const submitReply = async (reviewId: string) => {
    const body = draft.trim();
    if (!body) { toast.error(t("reviews.reply.empty")); return; }
    if (body.length > 1000) { toast.error(t("reviews.reply.tooLong")); return; }
    if (!vendorUserId) return;
    setBusyId(reviewId);
    const existing = replies[reviewId];
    const { error } = existing
      ? await supabase.from("review_replies" as never).update({ body }).eq("id", existing.id)
      : await supabase.from("review_replies" as never).insert({
          review_id: reviewId, vendor_id: vendorId, vendor_user_id: vendorUserId, body,
        });
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(existing ? t("reviews.success.replyUpdated") : t("reviews.success.replyPosted"));
    cancelReply();
    load();
  };

  const deleteReply = async (replyId: string) => {
    const { error } = await supabase.from("review_replies" as never).delete().eq("id", replyId);
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
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-foreground/55">
        <MessageSquareText className="mx-auto mb-2 h-6 w-6" />
        {t("reviews.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => {
        const reply = replies[r.id];
        const isEditing = editingId === r.id;
        return (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-arabic text-sm font-semibold text-foreground">
                  {profiles[r.customer_id] ?? t("reviews.anonymous")}
                </div>
                <div className="mt-0.5 text-[11px] text-foreground/55">{fmtRelative(r.created_at)}</div>
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

            {/* Reply block */}
            {reply && !isEditing && (
              <div className="mt-3 rounded-xl border-s-4 border-primary/60 bg-primary/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {t("reviews.reply.label")}
                  </span>
                  <span className="text-[11px] text-foreground/55">{fmtRelative(reply.updated_at)}</span>
                </div>
                <p className="mt-2 text-sm text-foreground/85">{reply.body}</p>
                {(canReply || isAdmin) && (
                  <div className="mt-2 flex justify-end gap-1">
                    {canReply && (
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => startReply(r.id, reply.body)}
                        className="rounded-full text-foreground/70"
                      >
                        <Pencil className="me-1 h-3.5 w-3.5" />
                        {t("reviews.reply.editBtn")}
                      </Button>
                    )}
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
                          <AlertDialogCancel className="rounded-full">{t("reviews.reply.cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteReply(reply.id)}
                            className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t("reviews.deleteReplyConfirmCta")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            )}

            {/* Reply editor */}
            {canReply && isEditing && (
              <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t("reviews.reply.placeholder")}
                  maxLength={1000}
                  className="min-h-[88px] bg-background"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-foreground/50">{draft.length}/1000</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={cancelReply} className="rounded-full">
                      {t("reviews.reply.cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => submitReply(r.id)}
                      disabled={busyId === r.id}
                      className="rounded-full"
                    >
                      {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t("reviews.reply.submit")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action row */}
            <div className="mt-3 flex flex-wrap justify-end gap-1">
              {canReply && !reply && !isEditing && (
                <Button
                  size="sm" variant="ghost"
                  onClick={() => startReply(r.id)}
                  className="rounded-full text-primary hover:bg-primary/10"
                >
                  <Reply className="me-1 h-3.5 w-3.5" />
                  {t("reviews.reply.openBtn")}
                </Button>
              )}
              {isAdmin && (
                <Button
                  size="sm" variant="ghost"
                  onClick={() => removeReview(r.id)}
                  className="rounded-full text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="me-1 h-3.5 w-3.5" />
                  {t("reviews.deleteBtn")}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SubRating = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg bg-background px-2 py-1.5 text-center">
    <div className="text-[10px] uppercase tracking-wider text-foreground/50">{label}</div>
    <div className="font-arabic text-xs font-semibold text-foreground">{value}/5</div>
  </div>
);
