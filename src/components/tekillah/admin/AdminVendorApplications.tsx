import { useEffect, useState } from "react";
import { Loader2, Inbox, Building2, User, MessageSquare, Mail, ChevronDown } from "lucide-react";
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

type AppStatus = Database["public"]["Enums"]["vendor_application_status"];

interface ApplicationRow {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  entity_type: Database["public"]["Enums"]["applicant_entity_type"];
  service_type: string;
  city: string | null;
  notes: string | null;
  status: AppStatus;
  created_at: string;
}

const STATUSES: AppStatus[] = ["new", "contacted", "approved", "rejected"];

const STATUS_LABEL: Record<AppStatus, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  approved: "مقبول",
  rejected: "مرفوض",
};

const SERVICE_LABEL: Record<string, string> = {
  hall: "قاعات",
  catering: "ضيافة",
  photography: "تصوير",
  dj: "صوتيات وDJ",
  decor: "تنسيق وديكور",
  cars: "سيارات",
};

const statusBadge = (s: AppStatus) => {
  if (s === "new") return "bg-amber-500/15 text-amber-700";
  if (s === "contacted") return "bg-blue-500/15 text-blue-700";
  if (s === "approved") return "bg-emerald-500/15 text-emerald-700";
  return "bg-destructive/15 text-destructive";
};

export const AdminVendorApplications = () => {
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AppStatus | "all">("all");

  const load = async () => {
    setLoading(true);
    const query = supabase
      .from("vendor_applications")
      .select("id, full_name, phone, email, entity_type, service_type, city, notes, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    const { data, error } = filter === "all" ? await query : await query.eq("status", filter);
    if (error) {
      toast.error(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as ApplicationRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-vendor-applications")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendor_applications" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: string, next: AppStatus) => {
    const { error } = await supabase
      .from("vendor_applications")
      .update({ status: next, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تحديث حالة الطلب");
    load();
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
          <h3 className="font-arabic text-lg font-semibold text-foreground">طلبات الانضمام</h3>
          <p className="text-sm text-foreground/65">مزودو خدمة سجلوا بياناتهم وينتظرون المراجعة والقبول</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as AppStatus | "all")}>
          <SelectTrigger className="h-9 w-44 rounded-full">
            <SelectValue />
            <ChevronDown className="ms-1 h-3.5 w-3.5 opacity-60" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الطلبات</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Inbox} title="لا توجد طلبات" description="ستظهر هنا طلبات مزودي الخدمة الجديدة فور استلامها." />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                      {r.entity_type === "company" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </span>
                    <span className="font-arabic text-base font-semibold text-foreground">{r.full_name}</span>
                    <Badge className={statusBadge(r.status)}>{STATUS_LABEL[r.status]}</Badge>
                    <Badge variant="outline">{SERVICE_LABEL[r.service_type] ?? r.service_type}</Badge>
                    <Badge variant="outline">{r.entity_type === "company" ? "مؤسسة" : "فرد"}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-foreground/60">
                    <span dir="ltr">{toLatinDigits(r.phone)}</span>
                    <span>·</span>
                    <span dir="ltr" className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>
                    {r.city && <><span>·</span><span>{r.city}</span></>}
                    <span>·</span>
                    <span>{fmtDate(r.created_at)}</span>
                  </div>
                  {r.notes && <p className="max-w-2xl text-xs leading-relaxed text-foreground/70">{r.notes}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v as AppStatus)}>
                    <SelectTrigger className="h-9 w-36 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <a
                      href={buildWhatsappLink({
                        number: r.phone,
                        message: `مرحباً ${r.full_name}، معك فريق تِكله بخصوص طلب انضمامك كمزود خدمة.`,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="me-1 h-3.5 w-3.5" />
                      واتساب
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
