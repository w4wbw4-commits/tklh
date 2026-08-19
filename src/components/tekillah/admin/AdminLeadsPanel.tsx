import { useEffect, useState } from "react";
import { Loader2, Inbox, Phone as PhoneIcon, MessageSquare, BadgeCheck, ChevronDown, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { fmtDate, toLatinDigits } from "@/i18n/format";
import { EmptyState } from "@/components/tekillah/EmptyState";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

interface LeadRow {
  id: string;
  phone: string;
  display_name: string | null;
  contact_email: string | null;
  status: LeadStatus;
  source: string;
  event_id: string | null;
  booking_id: string | null;
  created_at: string;
  notes: string | null;
}

const STATUS_OPTIONS: LeadStatus[] = ["verified", "planned", "booked", "completed", "lost"];

const statusBadge = (s: LeadStatus) => {
  if (s === "verified") return "bg-amber-500/15 text-amber-700";
  if (s === "planned") return "bg-primary/15 text-primary";
  if (s === "booked") return "bg-blue-500/15 text-blue-700";
  if (s === "completed") return "bg-emerald-500/15 text-emerald-700";
  return "bg-destructive/15 text-destructive";
};

export const AdminLeadsPanel = () => {
  const { t } = useTranslation();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");

  const load = async () => {
    setLoading(true);
    const query = supabase
      .from("customer_leads")
      .select("id, phone, display_name, contact_email, status, source, event_id, booking_id, created_at, notes")
      .order("created_at", { ascending: false })
      .limit(200);
    const { data, error } = filter === "all"
      ? await query
      : await query.eq("status", filter);
    if (error) {
      toast.error(error.message);
      setLeads([]);
    } else {
      setLeads((data ?? []) as LeadRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-leads")
      .on("postgres_changes", { event: "*", schema: "public", table: "customer_leads" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: string, next: LeadStatus) => {
    const { error } = await supabase
      .from("customer_leads")
      .update({ status: next })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("admin.leads.statusUpdated"));
  };

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-arabic text-lg font-semibold text-foreground">{t("admin.leads.title")}</h3>
          <p className="text-sm text-foreground/65">{t("admin.leads.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as LeadStatus | "all")}>
            <SelectTrigger className="h-9 w-44 rounded-full">
              <SelectValue />
              <ChevronDown className="ms-1 h-3.5 w-3.5 opacity-60" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.leads.filterAll")}</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{t(`admin.leads.status.${s}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t("admin.leads.empty")}
          description={t("admin.leads.emptyDesc")}
        />
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                      <PhoneIcon className="h-4 w-4" />
                    </span>
                    <div dir="ltr" className="font-arabic text-base font-semibold text-foreground">
                      {toLatinDigits(lead.phone)}
                    </div>
                    {lead.display_name && lead.display_name !== lead.phone && (
                      <span className="text-sm text-foreground/65">· {lead.display_name}</span>
                    )}
                    <Badge className={statusBadge(lead.status)}>
                      {t(`admin.leads.status.${lead.status}`)}
                    </Badge>
                  </div>
                  {lead.contact_email && (
                    <div dir="ltr" className="mt-1 flex items-center gap-1 text-xs text-foreground/70">
                      <Mail className="h-3 w-3" />
                      <span>{lead.contact_email}</span>
                    </div>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-foreground/55">
                    <span>{t("admin.leads.created")}: {fmtDate(lead.created_at)}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3" /> {t(`admin.leads.source.${lead.source}`, { defaultValue: lead.source })}
                    </span>
                    {lead.event_id && <><span>·</span><span>{t("admin.leads.hasEvent")}</span></>}
                    {lead.booking_id && <><span>·</span><span>{t("admin.leads.hasBooking")}</span></>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={lead.status}
                    onValueChange={(v) => updateStatus(lead.id, v as LeadStatus)}
                  >
                    <SelectTrigger className="h-9 w-36 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{t(`admin.leads.status.${s}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <a
                      href={buildWhatsappLink({
                        message: t("admin.leads.whatsappMessage", { phone: lead.phone }),
                        number: lead.phone,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="me-1 h-3.5 w-3.5" />
                      {t("admin.leads.whatsapp")}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
