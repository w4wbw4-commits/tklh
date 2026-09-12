import { useEffect, useMemo, useState } from "react";
import {
  Loader2, ClipboardList, MessageSquare, RefreshCw, CalendarDays, MapPin, Users,
  Wallet, Sparkles, ListChecks, Phone, StickyNote, Check,
} from "lucide-react";
import { leadsService } from "@/domain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { fmtDate } from "@/i18n/format";
import { EmptyState } from "@/components/tekillah/EmptyState";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { toast } from "sonner";
import {
  EVENT_TYPES, CATEGORIES, BUDGET_BANDS, labelOf, type EventTypeKey,
} from "@/components/tekillah/wizard/journeyData";
import { VISION_GROUPS } from "@/components/tekillah/wizard/StepVisionPaths";

type InterestStatus = "new" | "contacted" | "awaiting_reply" | "converted" | "lost";

interface InterestRow {
  id: string;
  full_name: string;
  phone: string;
  details: Record<string, unknown> | null;
  status: InterestStatus;
  admin_notes: string | null;
  contacted_at: string | null;
  created_at: string;
}

const STATUS_META: Record<InterestStatus, { ar: string; cls: string }> = {
  new:            { ar: "جديد",          cls: "bg-amber-500/15 text-amber-700" },
  contacted:      { ar: "تم التواصل",     cls: "bg-primary/15 text-primary" },
  awaiting_reply: { ar: "انتظار الرد",    cls: "bg-blue-500/15 text-blue-700" },
  converted:      { ar: "تم الحجز",       cls: "bg-emerald-500/15 text-emerald-700" },
  lost:           { ar: "غير مهتم",       cls: "bg-destructive/15 text-destructive" },
};
const STATUSES = Object.keys(STATUS_META) as InterestStatus[];

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");
const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : null);

/** Full human-readable breakdown of the wizard payload stored with the signup. */
const readDetails = (d: Record<string, unknown> | null) => {
  const details = d ?? {};
  const eventType = str(details.eventType) as EventTypeKey | "";
  const eventLabel = eventType ? labelOf(EVENT_TYPES, eventType, true) : "";
  const catalog = eventType && CATEGORIES[eventType] ? CATEGORIES[eventType] : [];
  const serviceKeys = Array.isArray(details.services) ? details.services.map(String) : [];
  const services = serviceKeys.map(
    (k) => catalog.find((c) => c.key === k)?.ar ?? k,
  );

  const blocks = (details.visionBlocks ?? {}) as Record<string, unknown>;
  const visionBlocks = VISION_GROUPS.map((g) => {
    const val = str(blocks[g.group]);
    if (!val) return null;
    const opt = g.options.find((o) => o.value === val);
    return { label: g.labelAr, value: opt?.ar ?? val };
  }).filter(Boolean) as Array<{ label: string; value: string }>;

  return {
    eventLabel,
    date: str(details.date),
    endDate: str(details.endDate),
    flexibleDate: details.flexibleDate === true,
    city: str(details.city),
    guests: num(details.guests),
    menGuests: num(details.menGuests),
    womenGuests: num(details.womenGuests),
    budget: str(details.budgetBand) ? labelOf(BUDGET_BANDS, str(details.budgetBand), true) : "",
    services,
    visionPath: str(details.visionPath),
    vision: str(details.vision),
    visionBlocks,
    language: str(details.language),
  };
};

const Info = ({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) => (
  <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/55">
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
    <div className="mt-1 font-arabic text-sm font-semibold text-foreground">{value}</div>
  </div>
);

export const AdminPlannerInterest = () => {
  const [rows, setRows] = useState<InterestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<InterestStatus | "all">("all");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await leadsService.listPlannerInterestForAdmin();
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
    return leadsService.subscribePlannerInterest(() => void load());
  }, []);

  const setStatus = async (id: string, status: InterestStatus) => {
    const stamp = status === "contacted" || status === "awaiting_reply" ? new Date().toISOString() : undefined;
    const patch = stamp ? { status, contacted_at: stamp } : { status };
    const { error } = await leadsService.updatePlannerInterestStatus(id, patch);
    if (error) { toast.error(error.message); return; }
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status, contacted_at: stamp ?? x.contacted_at } : x)));
    toast.success("تم تحديث حالة المتابعة");
  };

  const saveNotes = async (id: string) => {
    const admin_notes = notesDraft[id] ?? "";
    const { error } = await leadsService.updatePlannerInterestNotes(id, admin_notes);
    if (error) { toast.error(error.message); return; }
    setRows((r) => r.map((x) => (x.id === id ? { ...x, admin_notes } : x)));
    setNotesDraft((d) => { const n = { ...d }; delete n[id]; return n; });
    toast.success("تم حفظ الملاحظة");
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    STATUSES.forEach((s) => { c[s] = rows.filter((r) => r.status === s).length; });
    return c;
  }, [rows]);

  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", ...STATUSES] as const).map((k) => {
          const active = filter === k;
          const label = k === "all" ? "الكل" : STATUS_META[k].ar;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`rounded-full border px-3 py-1.5 font-arabic text-xs font-bold transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/70 hover:bg-secondary/40"
              }`}
            >
              {label}
              <span className={`ms-1.5 tabular-nums ${active ? "opacity-80" : "text-foreground/45"}`}>
                {counts[k] ?? 0}
              </span>
            </button>
          );
        })}
        <Button variant="outline" size="sm" className="ms-auto rounded-full" onClick={() => void load()}>
          <RefreshCw className="me-1 h-4 w-4" /> تحديث
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={rows.length === 0 ? "ما وصلنا أي تسجيل بعد" : "ما فيه تسجيلات بهذه الحالة"}
          description="كل من يسجل بياناته في رحلة التخطيط يظهر هنا مع كل تفاصيل مناسبته."
        />
      ) : (
        visible.map((r) => {
          const d = readDetails(r.details);
          const guestsText = d.menGuests || d.womenGuests
            ? `${d.guests ?? 0} · ${d.menGuests ?? 0} رجال / ${d.womenGuests ?? 0} نساء`
            : d.guests
              ? `${d.guests} ضيف`
              : "—";
          return (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-arabic text-base font-bold text-foreground">{r.full_name}</span>
                    <Badge className={`font-arabic text-[11px] ${STATUS_META[r.status].cls}`}>
                      {STATUS_META[r.status].ar}
                    </Badge>
                    {d.eventLabel && (
                      <Badge variant="secondary" className="font-arabic text-[11px]">{d.eventLabel}</Badge>
                    )}
                  </div>
                  <div dir="ltr" className="mt-1 flex items-center gap-1 text-[12px] tabular-nums text-foreground/70">
                    <Phone className="h-3 w-3" /> {r.phone}
                  </div>
                  <div className="mt-0.5 text-[11px] text-foreground/50">
                    سُجّل {fmtDate(r.created_at)}
                    {r.contacted_at && ` · تواصلنا ${fmtDate(r.contacted_at)}`}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={r.status} onValueChange={(v) => void setStatus(r.id, v as InterestStatus)}>
                    <SelectTrigger className="h-9 w-40 rounded-full font-arabic text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="font-arabic text-xs">
                          {STATUS_META[s].ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <a
                      href={buildWhatsappLink({
                        number: r.phone,
                        message: `حياك ${r.full_name} 👋 معك فريق تِكله — وصلنا تسجيلك${d.eventLabel ? ` لمناسبة ${d.eventLabel}` : ""}، وجاهزين نجهّز لك كل شي.`,
                      })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageSquare className="me-1 h-4 w-4" /> واتساب
                    </a>
                  </Button>
                </div>
              </div>

              {/* Full details */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Info
                  icon={CalendarDays}
                  label="التاريخ"
                  value={
                    d.date
                      ? `${fmtDate(d.date)}${d.endDate ? ` → ${fmtDate(d.endDate)}` : ""}${d.flexibleDate ? " (مرن)" : ""}`
                      : "—"
                  }
                />
                <Info icon={MapPin} label="المدينة" value={d.city || "—"} />
                <Info icon={Users} label="الضيوف" value={guestsText} />
                <Info icon={Wallet} label="الميزانية" value={d.budget || "—"} />
              </div>

              {d.services.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/55">
                    <ListChecks className="h-3.5 w-3.5" /> الخدمات المختارة ({d.services.length})
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {d.services.map((s, i) => (
                      <Badge key={i} variant="secondary" className="font-arabic text-[11px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {(d.visionBlocks.length > 0 || d.vision || d.visionPath) && (
                <div className="mt-3 rounded-xl border border-border/70 bg-muted/20 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/55">
                    <Sparkles className="h-3.5 w-3.5" /> الرؤية
                    {d.visionPath && (
                      <span className="font-arabic font-normal text-foreground/50">
                        · {d.visionPath === "self" ? "بنى اختياراته بنفسه" : "يبي فريق تِكله يجهّز له"}
                      </span>
                    )}
                  </div>
                  {d.visionBlocks.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {d.visionBlocks.map((b, i) => (
                        <Badge key={i} variant="outline" className="font-arabic text-[11px]">
                          {b.label}: {b.value}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {d.vision && (
                    <p className="mt-2 whitespace-pre-wrap font-arabic text-sm leading-7 text-foreground/80">
                      {d.vision}
                    </p>
                  )}
                </div>
              )}

              {/* Internal notes */}
              <div className="mt-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/55">
                  <StickyNote className="h-3.5 w-3.5" /> ملاحظات داخلية
                </div>
                <Textarea
                  value={notesDraft[r.id] ?? r.admin_notes ?? ""}
                  onChange={(e) => setNotesDraft((n) => ({ ...n, [r.id]: e.target.value }))}
                  placeholder="نتيجة المكالمة، الميزانية الفعلية، أي شي مهم…"
                  className="mt-1.5 min-h-[64px] rounded-xl font-arabic text-sm"
                />
                {notesDraft[r.id] !== undefined && notesDraft[r.id] !== (r.admin_notes ?? "") && (
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" className="rounded-full" onClick={() => void saveNotes(r.id)}>
                      <Check className="me-1 h-4 w-4" /> حفظ الملاحظة
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
