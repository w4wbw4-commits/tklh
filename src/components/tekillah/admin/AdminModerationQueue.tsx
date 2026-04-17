import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ShieldCheck, Trash2, ClipboardList, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fmtRelative } from "@/i18n/format";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReportRow {
  id: string;
  target_type: "review" | "reply";
  target_id: string;
  reporter_id: string;
  reason: "inappropriate" | "spam" | "harassment" | "other";
  details: string | null;
  status: "pending" | "approved" | "removed";
  created_at: string;
  // hydrated client-side
  content?: string | null;
  contextLabel?: string | null;
}

export const AdminModerationQueue = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("content_reports")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    const list = (data ?? []) as unknown as ReportRow[];

    // Hydrate target content
    const reviewIds = list.filter((r) => r.target_type === "review").map((r) => r.target_id);
    const replyIds = list.filter((r) => r.target_type === "reply").map((r) => r.target_id);
    const contentMap: Record<string, string | null> = {};
    const contextMap: Record<string, string | null> = {};

    if (reviewIds.length) {
      const { data: revs } = await supabase
        .from("reviews")
        .select("id, comment, vendor:vendors(business_name)")
        .in("id", reviewIds);
      ((revs ?? []) as unknown as Array<{ id: string; comment: string | null; vendor: { business_name: string } | null }>).forEach((r) => {
        contentMap[r.id] = r.comment;
        contextMap[r.id] = r.vendor?.business_name ?? null;
      });
    }
    if (replyIds.length) {
      const { data: reps } = await supabase
        .from("review_replies")
        .select("id, body, vendor_id");
      ((reps ?? []) as unknown as Array<{ id: string; body: string }>).forEach((r) => {
        contentMap[r.id] = r.body;
      });
    }

    setReports(list.map((r) => ({
      ...r,
      content: contentMap[r.target_id] ?? null,
      contextLabel: contextMap[r.target_id] ?? null,
    })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-reports")
      .on("postgres_changes", { event: "*", schema: "public", table: "content_reports" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const approve = async (r: ReportRow) => {
    setBusy(r.id);
    // remove the flagged mark on the target and mark the report approved (kept)
    if (r.target_type === "review") {
      await supabase.from("reviews").update({ flagged: false }).eq("id", r.target_id);
    } else {
      await supabase.from("review_replies").update({ flagged: false }).eq("id", r.target_id);
    }
    const { error } = await supabase
      .from("content_reports")
      .update({ status: "approved", resolved_at: new Date().toISOString() })
      .eq("id", r.id);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success(t("admin.moderation.approved"));
    load();
  };

  const remove = async (r: ReportRow) => {
    setBusy(r.id);
    if (r.target_type === "review") {
      await supabase.from("reviews").delete().eq("id", r.target_id);
    } else {
      await supabase.from("review_replies").delete().eq("id", r.target_id);
    }
    const { error } = await supabase
      .from("content_reports")
      .update({ status: "removed", resolved_at: new Date().toISOString() })
      .eq("id", r.id);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success(t("admin.moderation.removed"));
    load();
  };

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-foreground/55">
        <ClipboardList className="mx-auto mb-2 h-6 w-6" />
        {t("admin.moderation.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-amber-500/15 text-amber-700">
                  {t(`admin.moderation.target.${r.target_type}`)}
                </Badge>
                <Badge className="bg-destructive/15 text-destructive">
                  {t(`report.reasons.${r.reason}`)}
                </Badge>
                {r.contextLabel && (
                  <span className="text-xs text-foreground/55">· {r.contextLabel}</span>
                )}
              </div>
              <div className="mt-1 text-[11px] text-foreground/55">{fmtRelative(r.created_at)}</div>
            </div>
          </div>

          {r.content && (
            <p className="mt-3 rounded-xl bg-secondary/40 p-3 text-sm text-foreground/80">{r.content}</p>
          )}

          {r.details && (
            <p className="mt-2 rounded-xl border border-border bg-background p-3 text-xs text-foreground/65">
              <span className="font-semibold">{t("report.detailsLabel")}: </span>{r.details}
            </p>
          )}

          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button
              size="sm" variant="ghost"
              disabled={busy === r.id}
              onClick={() => approve(r)}
              className="rounded-full text-emerald-700 hover:bg-emerald-500/10"
            >
              {busy === r.id ? <Loader2 className="me-1 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="me-1 h-3.5 w-3.5" />}
              {t("admin.moderation.approveBtn")}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="rounded-full text-destructive hover:bg-destructive/10">
                  <Trash2 className="me-1 h-3.5 w-3.5" />
                  {t("admin.moderation.removeBtn")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("admin.moderation.removeConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("admin.moderation.removeConfirmDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => remove(r)}
                    className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("admin.moderation.removeConfirmCta")}
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
