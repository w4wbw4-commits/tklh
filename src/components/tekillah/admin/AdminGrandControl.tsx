import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, FileSearch, FileText, Flag, Users, Briefcase, CalendarCheck, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { bookingsService } from "@/domain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SystemStats {
  customers: number;
  vendors: number;
  activeBookings: number;
  pendingDocs: number;
  flaggedContent: number;
}

interface PendingVendor {
  id: string;
  business_name: string;
  iban_certificate_url: string | null;
  commercial_register_url: string | null;
}

interface FlaggedRow {
  id: string;
  type: "review" | "reply";
  preview: string;
}

const sign = async (bucket: string, path: string | null) => {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 5);
  return data?.signedUrl ?? null;
};

export const AdminGrandControl = ({ onJump }: { onJump?: (tab: string) => void }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats>({
    customers: 0, vendors: 0, activeBookings: 0, pendingDocs: 0, flaggedContent: 0,
  });
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [flagged, setFlagged] = useState<FlaggedRow[]>([]);

  const load = async () => {
    setLoading(true);
    const [
      { count: customers },
      { count: vendors },
      { count: activeBookings },
      { data: pending },
      { data: flaggedReviews },
      { data: flaggedReplies },
    ] = await Promise.all([
      supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "vendor"),
      bookingsService.countActive(),
      // Sensitive certificate URLs are revoked from `authenticated`; fetch
      // via the admin-only SECURITY DEFINER RPC.
      supabase.rpc("admin_list_pending_vendor_docs"),
      supabase.from("reviews").select("id, comment").eq("flagged", true).limit(10),
      supabase.from("review_replies").select("id, body").eq("flagged", true).limit(10),
    ]);

    const flaggedList: FlaggedRow[] = [
      ...((flaggedReviews ?? []) as Array<{ id: string; comment: string | null }>).map((r) => ({
        id: r.id, type: "review" as const, preview: r.comment ?? "—",
      })),
      ...((flaggedReplies ?? []) as unknown as Array<{ id: string; body: string }>).map((r) => ({
        id: r.id, type: "reply" as const, preview: r.body,
      })),
    ];

    setStats({
      customers: customers ?? 0,
      vendors: vendors ?? 0,
      activeBookings: activeBookings ?? 0,
      pendingDocs: (pending ?? []).length,
      flaggedContent: flaggedList.length,
    });
    setPendingVendors(((pending ?? []) as PendingVendor[]).slice(0, 5));
    setFlagged(flaggedList);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-grand")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendors" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "review_replies" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const openDoc = async (bucket: string, path: string | null) => {
    const url = await sign(bucket, path);
    if (url) window.open(url, "_blank");
  };

  return (
    <section className="rounded-3xl border border-primary/20 bg-card p-5 shadow-luxury sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-arabic text-lg font-semibold text-foreground">{t("admin.grand.title")}</h2>
          <p className="text-xs text-foreground/60">{t("admin.grand.subtitle")}</p>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>

      {/* System health */}
      <div className="mt-4 grid grid-cols-2 gap-2 xs:grid-cols-3 sm:grid-cols-5">
        <Mini icon={Users} label={t("admin.grand.customers")} value={stats.customers} />
        <Mini icon={Briefcase} label={t("admin.grand.vendors")} value={stats.vendors} />
        <Mini icon={CalendarCheck} label={t("admin.grand.activeBookings")} value={stats.activeBookings} />
        <Mini icon={FileText} label={t("admin.grand.pendingDocs")} value={stats.pendingDocs} accent={stats.pendingDocs > 0} />
        <Mini icon={Flag} label={t("admin.grand.flagged")} value={stats.flaggedContent} accent={stats.flaggedContent > 0} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pending docs */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-arabic text-sm font-semibold">{t("admin.grand.pendingDocsHeading")}</span>
            </div>
            {onJump && (
              <Button size="sm" variant="ghost" onClick={() => onJump("verification")} className="rounded-full text-xs">
                {t("admin.grand.viewAll")}
              </Button>
            )}
          </div>
          {pendingVendors.length === 0 ? (
            <p className="text-xs text-foreground/55">{t("admin.grand.noPendingDocs")}</p>
          ) : (
            <ul className="space-y-2">
              {pendingVendors.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-2.5">
                  <span className="font-arabic text-sm font-medium text-foreground">{v.business_name}</span>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="sm" variant="ghost" disabled={!v.iban_certificate_url}
                      onClick={() => openDoc("iban-documents", v.iban_certificate_url)}
                      className="h-7 rounded-full text-[11px]"
                    >
                      <FileSearch className="me-1 h-3 w-3" /> {t("admin.grand.iban")}
                    </Button>
                    <Button
                      size="sm" variant="ghost" disabled={!v.commercial_register_url}
                      onClick={() => openDoc("vendor-documents", v.commercial_register_url)}
                      className="h-7 rounded-full text-[11px]"
                    >
                      <FileSearch className="me-1 h-3 w-3" /> {t("admin.grand.cr")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Flagged content */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-destructive" />
              <span className="font-arabic text-sm font-semibold">{t("admin.grand.flaggedHeading")}</span>
            </div>
            {onJump && (
              <Button size="sm" variant="ghost" onClick={() => onJump("moderation")} className="rounded-full text-xs">
                {t("admin.grand.viewAll")} <ExternalLink className="ms-1 h-3 w-3" />
              </Button>
            )}
          </div>
          {flagged.length === 0 ? (
            <p className="text-xs text-foreground/55">{t("admin.grand.noFlagged")}</p>
          ) : (
            <ul className="space-y-2">
              {flagged.slice(0, 5).map((r) => (
                <li key={r.id} className="rounded-xl border border-border bg-card p-2.5">
                  <Badge className={`mb-1 ${r.type === "review" ? "bg-amber-500/15 text-amber-700" : "bg-primary/15 text-primary"}`}>
                    {t(`admin.moderation.target.${r.type}`)}
                  </Badge>
                  <p className="line-clamp-2 text-xs text-foreground/70">{r.preview}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

const Mini = ({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: number; accent?: boolean }) => (
  <div className={`rounded-xl border p-3 ${accent ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}>
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-foreground/55">
      <Icon className="h-3 w-3" /> {label}
    </div>
    <div className="mt-1 font-arabic text-lg font-semibold text-foreground">{value}</div>
  </div>
);
