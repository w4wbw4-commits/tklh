import { useEffect, useState } from "react";
import { Loader2, ClipboardList, MessageSquare, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/i18n/format";
import { EmptyState } from "@/components/tekillah/EmptyState";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { toast } from "sonner";

interface InterestRow {
  id: string;
  full_name: string;
  phone: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

/** Human-readable chips out of the wizard payload stored with each signup. */
const detailChips = (d: Record<string, unknown> | null): string[] => {
  if (!d) return [];
  const out: string[] = [];
  if (d.eventType) out.push(String(d.eventType));
  if (d.city) out.push(String(d.city));
  if (d.date) out.push(String(d.date));
  if (d.endDate) out.push(`→ ${String(d.endDate)}`);
  if (d.guests) out.push(`${String(d.guests)} ضيف`);
  if (d.budgetBand) out.push(String(d.budgetBand));
  if (Array.isArray(d.services) && d.services.length) out.push(d.services.join(" · "));
  if (d.visionPath) out.push(String(d.visionPath));
  return out;
};

export const AdminPlannerInterest = () => {
  const [rows, setRows] = useState<InterestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("planner_interest")
      .select("id, full_name, phone, details, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast.error(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as unknown as InterestRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="ما وصلنا أي تسجيل بعد"
        description="كل من يسجل بياناته في رحلة التخطيط يظهر هنا مباشرة."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-arabic text-sm text-foreground/70">
          {rows.length} تسجيل في رحلة التخطيط
        </p>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => void load()}>
          <RefreshCw className="me-1 h-4 w-4" />
          تحديث
        </Button>
      </div>

      {rows.map((r) => {
        const chips = detailChips(r.details);
        return (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-arabic text-sm font-semibold text-foreground">{r.full_name}</div>
                <div dir="ltr" className="text-[12px] tabular-nums text-foreground/70">{r.phone}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-foreground/55">{fmtDate(r.created_at)}</span>
                <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <a
                    href={buildWhatsappLink({
                      number: r.phone,
                      message: `حياك ${r.full_name} 👋 معك فريق تكله — وصلنا تسجيلك، وجاهزين نجهّز لك كل شي.`,
                    })}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageSquare className="me-1 h-4 w-4" />
                    واتساب
                  </a>
                </Button>
              </div>
            </div>

            {chips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {chips.map((c, i) => (
                  <Badge key={i} variant="secondary" className="font-arabic text-[11px]">
                    {c}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
