import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarDays, Ban, Clock, CheckCircle2, Trash2 } from "lucide-react";
import type { AvailabilityRow } from "./types";

interface Props {
  vendorId: string;
}

const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const STATUS_META = {
  blocked: { label: "محجوب", color: "bg-foreground/70", icon: Ban },
  pending: { label: "بانتظار التأكيد", color: "bg-amber-500", icon: Clock },
  booked: { label: "محجوز", color: "bg-primary", icon: CheckCircle2 },
};

export const VendorCalendar = ({ vendorId }: Props) => {
  const [items, setItems] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<Date | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendor_availability")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("date");
    if (error) toast.error(error.message);
    setItems((data ?? []) as AvailabilityRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // realtime updates so a customer booking shows up live
    const channel = supabase
      .channel(`avail-${vendorId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "vendor_availability", filter: `vendor_id=eq.${vendorId}` },
        load
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const byDate = useMemo(() => {
    const m = new Map<string, AvailabilityRow>();
    items.forEach((i) => m.set(i.date, i));
    return m;
  }, [items]);

  const blockDate = async (date: Date) => {
    const dateStr = formatDate(date);
    setSubmitting(true);
    const { error } = await supabase.from("vendor_availability").upsert({
      vendor_id: vendorId,
      date: dateStr,
      status: "blocked",
      note: "محجوب يدوياً",
    }, { onConflict: "vendor_id,date" });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حجب التاريخ");
    setPicked(undefined);
    load();
  };

  const removeBlock = async (id: string) => {
    const { error } = await supabase.from("vendor_availability").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم فتح التاريخ");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-arabic text-2xl font-semibold text-foreground">تقويم التوفّر</h2>
        <p className="mt-1 text-sm text-foreground/65">
          احجب التواريخ المشغولة لتجنّب الحجز المزدوج. الحجوزات الواردة من المنصة تُضاف تلقائياً.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto,1fr]">
        {/* Calendar picker */}
        <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="mb-3 w-full justify-start rounded-full">
                <CalendarDays className="me-2 h-4 w-4" />
                {picked ? formatDate(picked) : "اختر تاريخاً لحجبه"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={picked}
                onSelect={setPicked}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                modifiers={{
                  blocked: items.filter((i) => i.status === "blocked").map((i) => new Date(i.date)),
                  booked: items.filter((i) => i.status === "booked").map((i) => new Date(i.date)),
                  pending: items.filter((i) => i.status === "pending").map((i) => new Date(i.date)),
                }}
                modifiersClassNames={{
                  blocked: "bg-foreground/15 text-foreground",
                  booked: "bg-primary text-primary-foreground",
                  pending: "bg-amber-500/30 text-foreground",
                }}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Button onClick={() => picked && blockDate(picked)} disabled={!picked || submitting}
            className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Ban className="me-2 h-4 w-4" /> حجب هذا اليوم</>}
          </Button>

          <div className="mt-4 space-y-2 text-xs text-foreground/70">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-primary" /> محجوز (مؤكَّد)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-amber-500/60" /> بانتظار التأكيد</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-foreground/20" /> محجوب يدوياً</div>
          </div>
        </div>

        {/* List */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 text-sm font-semibold text-foreground">التواريخ المُدارة</div>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-foreground/50">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-sm text-foreground/55">
              لا توجد تواريخ مدارة بعد. تقويمك مفتوح بالكامل.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((it) => {
                const meta = STATUS_META[it.status];
                const Icon = meta.icon;
                return (
                  <motion.li key={it.id} layout className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-9 w-9 place-items-center rounded-xl ${meta.color} text-primary-foreground`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-medium text-foreground">{it.date}</div>
                        <div className="text-xs text-foreground/60">{it.note ?? meta.label}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal">{meta.label}</Badge>
                      {it.status === "blocked" && (
                        <Button variant="ghost" size="icon" onClick={() => removeBlock(it.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
