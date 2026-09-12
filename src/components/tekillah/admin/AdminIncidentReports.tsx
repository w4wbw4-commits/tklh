import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, AlertOctagon, ExternalLink, CheckCircle2, XCircle, ImageIcon } from "lucide-react";
import { incidentsService, storageService } from "@/domain";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { fmtDate } from "@/i18n/format";

type IncidentKind = "quality" | "no_show" | "late" | "damage" | "safety" | "other";
type IncidentStatus = "open" | "in_review" | "resolved" | "dismissed";

interface IncidentRow {
  id: string;
  customer_id: string;
  vendor_id: string;
  booking_id: string;
  kind: IncidentKind;
  description: string;
  attachments: string[];
  status: IncidentStatus;
  admin_notes: string | null;
  created_at: string;
  vendor: { business_name: string; category: string } | null;
}

const sign = async (path: string) => {
  const { data } = await storageService.signedUrl(storageService.BUCKETS.incidentAttachments, path, 60 * 10);
  return data?.signedUrl ?? null;
};

export const AdminIncidentReports = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<IncidentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedThumbs, setSignedThumbs] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await incidentsService.listIncidentsWithVendor();

    const list = (data ?? []) as unknown as IncidentRow[];
    setRows(list);

    // Pre-sign first attachment of each report for thumbnails
    const thumbs: Record<string, string> = {};
    await Promise.all(
      list.map(async (r) => {
        if (r.attachments[0]) {
          const url = await sign(r.attachments[0]);
          if (url) thumbs[r.id] = url;
        }
      }),
    );
    setSignedThumbs(thumbs);
    setLoading(false);
  };

  useEffect(() => {
    load();
    return incidentsService.subscribeIncidents(load);
  }, []);

  const updateStatus = async (id: string, status: IncidentStatus) => {
    setBusyId(id);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await incidentsService.updateIncident(id, {
      status,
      admin_notes: notes[id] ?? null,
      resolved_at: status === "resolved" || status === "dismissed" ? new Date().toISOString() : null,
      resolved_by: u?.user?.id ?? null,
    });
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("admin.incidents.updated"));
  };

  const openAttachment = async (path: string) => {
    const url = await sign(path);
    if (url) window.open(url, "_blank", "noopener");
  };

  const statusBadge = (s: IncidentStatus) => {
    if (s === "open") return "bg-destructive/15 text-destructive";
    if (s === "in_review") return "bg-amber-500/15 text-amber-700";
    if (s === "resolved") return "bg-emerald-500/15 text-emerald-700";
    return "bg-muted text-foreground/65";
  };

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-arabic text-xl font-semibold text-foreground">
          {t("admin.incidents.title")}
        </h2>
        <p className="mt-1 text-sm text-foreground/60">{t("admin.incidents.subtitle")}</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-foreground/55">
          <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
          {t("admin.incidents.empty")}
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="h-4 w-4 text-destructive" />
                    <span className="font-arabic text-base font-semibold text-foreground">
                      {r.vendor?.business_name ?? "—"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-foreground/55">
                    {r.vendor?.category ? t(`categories.${r.vendor.category}`) : ""} ·{" "}
                    {t(`admin.incidents.kind.${r.kind}`)} · {fmtDate(r.created_at)} · #
                    {r.booking_id.slice(0, 8).toUpperCase()}
                  </div>
                </div>
                <Badge className={statusBadge(r.status)}>
                  {t(`admin.incidents.status.${r.status}`)}
                </Badge>
              </div>

              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-background p-3 text-sm text-foreground/80">
                {r.description}
              </p>

              {r.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.attachments.map((path, i) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => openAttachment(path)}
                      className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-secondary"
                    >
                      {i === 0 && signedThumbs[r.id] ? (
                        <img
                          src={signedThumbs[r.id]}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <ImageIcon className="m-auto mt-6 h-6 w-6 text-foreground/40" />
                      )}
                      <span className="absolute inset-0 grid place-items-center bg-background/0 text-[10px] font-medium text-primary opacity-0 transition group-hover:bg-background/70 group-hover:opacity-100">
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {r.status !== "resolved" && r.status !== "dismissed" && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={notes[r.id] ?? r.admin_notes ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    placeholder={t("admin.incidents.notesPlaceholder")}
                    className="min-h-[70px] font-arabic"
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    {r.status === "open" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === r.id}
                        onClick={() => updateStatus(r.id, "in_review")}
                        className="rounded-full"
                      >
                        {t("admin.incidents.markInReview")}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === r.id}
                      onClick={() => updateStatus(r.id, "dismissed")}
                      className="rounded-full text-foreground/60"
                    >
                      <XCircle className="me-1 h-4 w-4" /> {t("admin.incidents.dismiss")}
                    </Button>
                    <Button
                      size="sm"
                      disabled={busyId === r.id}
                      onClick={() => updateStatus(r.id, "resolved")}
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {busyId === r.id ? (
                        <Loader2 className="me-1 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="me-1 h-4 w-4" />
                      )}
                      {t("admin.incidents.resolve")}
                    </Button>
                  </div>
                </div>
              )}

              {r.admin_notes && (r.status === "resolved" || r.status === "dismissed") && (
                <p className="mt-3 rounded-xl bg-secondary p-3 text-xs text-foreground/70">
                  <span className="font-semibold">{t("admin.incidents.adminNote")}:</span>{" "}
                  {r.admin_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
