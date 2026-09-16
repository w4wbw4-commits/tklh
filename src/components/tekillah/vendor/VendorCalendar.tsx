import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { availabilityService } from "@/domain";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Loader2,
  Ban,
  Clock,
  CheckCircle2,
  Trash2,
  Plus,
  Phone,
  User,
  Banknote,
  StickyNote,
  CalendarDays,
  Sparkles,
  Lock,
  Unlock,
} from "lucide-react";

interface Props {
  vendorId: string;
}

// We piggy-back on `vendor_availability.note` to store rich event metadata
// (customer name, phone, price, free-form note) as JSON, so a "manual booking"
// can live alongside platform-generated rows without a schema change.
type ManualMeta = {
  kind: "manual"; // marker so we know this came from the calendar UI
  label: string;
  customer_name?: string;
  customer_phone?: string;
  amount?: number;
  text?: string;
};

type Row = {
  id: string;
  vendor_id: string;
  date: string;
  status: "blocked" | "booked" | "pending";
  note: string | null;
  booking_id: string | null;
};

const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fmtAr = (s: string) =>
  new Date(s).toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const STATUS_META = {
  blocked: { label: "محجوب", color: "bg-foreground/70 text-background", icon: Ban, dot: "bg-foreground/60" },
  pending: { label: "محتمل", color: "bg-amber-500 text-white", icon: Clock, dot: "bg-amber-500" },
  booked: { label: "مؤكد", color: "bg-primary text-primary-foreground", icon: CheckCircle2, dot: "bg-primary" },
} as const;

// Try to deserialize the note field — old rows are plain text, new rows are JSON.
const parseMeta = (note: string | null): ManualMeta | null => {
  if (!note) return null;
  try {
    const parsed = JSON.parse(note);
    if (parsed && typeof parsed === "object" && parsed.kind === "manual") return parsed as ManualMeta;
  } catch {
    /* not JSON — legacy plain text */
  }
  return null;
};

export const VendorCalendar = ({ vendorId }: Props) => {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [picked, setPicked] = useState<Date | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Form state for adding / editing a manual entry
  const [form, setForm] = useState({
    status: "pending" as Row["status"],
    customer_name: "",
    customer_phone: "",
    amount: "",
    label: "",
    text: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await availabilityService.listForVendor(vendorId);
    if (error) toast.error(error.message);
    setItems((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = availabilityService.subscribeToVendorAvailability(`avail-${vendorId}`, vendorId, load);
    return () => {
      availabilityService.unsubscribe(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const byDate = useMemo(() => {
    const m = new Map<string, Row>();
    items.forEach((i) => m.set(i.date, i));
    return m;
  }, [items]);

  const existingForPicked = picked ? byDate.get(formatDate(picked)) : undefined;
  const isPlatformBooking = !!existingForPicked?.booking_id;

  // Open the side sheet for a specific date.
  const openDate = (d: Date) => {
    setPicked(d);
    const row = byDate.get(formatDate(d));
    const meta = parseMeta(row?.note ?? null);
    setForm({
      status: row?.status ?? "pending",
      customer_name: meta?.customer_name ?? "",
      customer_phone: meta?.customer_phone ?? "",
      amount: meta?.amount ? String(meta.amount) : "",
      label: meta?.label ?? "",
      text: meta?.text ?? (!meta && row?.note ? row.note : ""),
    });
    setSheetOpen(true);
  };

  // Save (insert or update) a manual entry on a date.
  const save = async () => {
    if (!picked) return;
    if (isPlatformBooking) {
      toast.error("هذا اليوم محجوز عبر المنصة — لا يمكن تعديله يدوياً.");
      return;
    }
    setSubmitting(true);
    const meta: ManualMeta = {
      kind: "manual",
      label: form.label || (form.status === "blocked" ? "محجوب يدوياً" : "حجز يدوي"),
      customer_name: form.customer_name || undefined,
      customer_phone: form.customer_phone || undefined,
      amount: form.amount ? Number(form.amount) : undefined,
      text: form.text || undefined,
    };
    const payload = {
      vendor_id: vendorId,
      date: formatDate(picked),
      status: form.status,
      note: JSON.stringify(meta),
    };
    const { error } = await availabilityService.block(payload);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(existingForPicked ? "تم تحديث اليوم" : "تمت إضافة الحدث");
    setSheetOpen(false);
    load();
  };

  // Delete an entry — only allowed for non-platform rows.
  const remove = async () => {
    if (!existingForPicked) return;
    if (isPlatformBooking) {
      toast.error("لا يمكن حذف حجز قادم من المنصة.");
      return;
    }
    setSubmitting(true);
    const { error } = await availabilityService.deleteAvailabilityById(existingForPicked.id);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("تم فتح اليوم");
    setSheetOpen(false);
    load();
  };

  // Quick-block from list view
  const removeById = async (id: string) => {
    const row = items.find((r) => r.id === id);
    if (row?.booking_id) {
      toast.error("لا يمكن حذف حجز قادم من المنصة.");
      return;
    }
    const { error } = await availabilityService.deleteAvailabilityById(id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("تم فتح التاريخ");
    load();
  };

  // Stats for the small header chips
  const stats = useMemo(() => {
    const today = formatDate(new Date());
    const upcoming = items.filter((i) => i.date >= today);
    return {
      booked: upcoming.filter((i) => i.status === "booked").length,
      pending: upcoming.filter((i) => i.status === "pending").length,
      blocked: upcoming.filter((i) => i.status === "blocked").length,
    };
  }, [items]);

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.date.localeCompare(b.date)), [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-arabic text-2xl font-semibold text-foreground">تقويم الحجوزات</h2>
          <p className="mt-1 text-sm text-foreground/65">
            اضغط على أي يوم لإضافة <span className="font-bold text-primary">حجز محتمل</span>،{" "}
            <span className="font-bold text-primary">حجز مؤكد</span>، أو حجبه. الحجوزات القادمة من المنصة تُضاف تلقائياً
            ويمكن التعرف عليها بختم خاص.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="gap-1.5 rounded-full bg-primary px-3 py-1.5 text-primary-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" /> مؤكد: {stats.booked}
          </Badge>
          <Badge className="gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-white">
            <Clock className="h-3.5 w-3.5" /> محتمل: {stats.pending}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1.5">
            <Ban className="h-3.5 w-3.5" /> محجوب: {stats.blocked}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto,1fr]">
        {/* Interactive calendar — click any day to open the sheet */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            اختر اليوم لإدارته
          </div>
          <Calendar
            mode="single"
            selected={picked}
            onSelect={(d) => d && openDate(d)}
            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
            modifiers={{
              blocked: items.filter((i) => i.status === "blocked").map((i) => new Date(i.date)),
              booked: items.filter((i) => i.status === "booked").map((i) => new Date(i.date)),
              pending: items.filter((i) => i.status === "pending").map((i) => new Date(i.date)),
            }}
            modifiersClassNames={{
              blocked: "!bg-foreground/15 !text-foreground line-through",
              booked: "!bg-primary !text-primary-foreground font-bold",
              pending: "!bg-amber-500/80 !text-white font-bold",
            }}
            className="pointer-events-auto rounded-2xl border border-border/60 bg-background p-3"
          />
          <Button
            onClick={() => openDate(new Date())}
            className="mt-4 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="me-2 h-4 w-4" /> أضف حدثاً اليوم
          </Button>
          <div className="mt-4 space-y-1.5 text-xs text-foreground/70">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-primary" /> مؤكد (محجوز)
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-amber-500/80" /> محتمل (بانتظار التأكيد)
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-foreground/20" /> محجوب يدوياً
            </div>
          </div>
        </div>

        {/* Upcoming list */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">التواريخ المُدارة</span>
            <span className="text-xs text-foreground/55">{items.length} عنصر</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-foreground/50">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center text-sm text-foreground/55">
              <Sparkles className="mx-auto mb-2 h-5 w-5 text-primary/60" />
              تقويمك مفتوح بالكامل — اضغط أي يوم في التقويم لإضافة حجز.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {sortedItems.map((it) => {
                  const meta = STATUS_META[it.status];
                  const Icon = meta.icon;
                  const detail = parseMeta(it.note);
                  const fromPlatform = !!it.booking_id;
                  return (
                    <motion.li
                      key={it.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="group flex items-center justify-between gap-3 py-3"
                    >
                      <button
                        type="button"
                        onClick={() => openDate(new Date(it.date))}
                        className="flex flex-1 items-center gap-3 rounded-xl px-2 py-1 text-start transition-colors hover:bg-muted/40"
                      >
                        <span className={`grid h-10 w-10 place-items-center rounded-xl ${meta.color}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{fmtAr(it.date)}</span>
                            {fromPlatform && (
                              <Badge variant="outline" className="rounded-full border-primary/40 text-[10px] text-primary">
                                <Sparkles className="me-1 h-2.5 w-2.5" /> من المنصة
                              </Badge>
                            )}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-foreground/60">
                            {detail?.customer_name
                              ? `${detail.customer_name}${detail.amount ? ` · ${detail.amount.toLocaleString("en-US")} ` : ""}`
                              : detail?.label || detail?.text || meta.label}
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <Badge className={`rounded-full font-normal ${meta.color}`}>{meta.label}</Badge>
                        {!fromPlatform && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeById(it.id)}
                            className="h-8 w-8 text-destructive opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                            aria-label="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>

      {/* Day editor sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md" dir="rtl">
          <SheetHeader className="text-start">
            <SheetTitle className="flex items-center gap-2 font-arabic text-xl">
              <CalendarDays className="h-5 w-5 text-primary" />
              {picked ? fmtAr(formatDate(picked)) : "إدارة اليوم"}
            </SheetTitle>
            <SheetDescription>
              {isPlatformBooking
                ? "هذا اليوم مرتبط بحجز من منصة TKLH — للعرض فقط."
                : "اختر نوع الحدث وعب التفاصيل التي تساعدك على متابعة العميل."}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            {/* Status picker */}
            <div>
              <Label className="mb-2 block text-xs font-semibold text-foreground/70">نوع اليوم</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["pending", "booked", "blocked"] as const).map((s) => {
                  const m = STATUS_META[s];
                  const active = form.status === s;
                  const Icon = m.icon;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isPlatformBooking}
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all ${
                        active
                          ? `${m.color} border-transparent shadow-md`
                          : "border-border bg-background text-foreground/70 hover:border-primary/50"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-bold">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer details — hidden when blocked */}
            {form.status !== "blocked" && (
              <>
                <div>
                  <Label htmlFor="cust-name" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                    <User className="h-3.5 w-3.5" /> اسم العميل
                  </Label>
                  <Input
                    id="cust-name"
                    value={form.customer_name}
                    onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                    placeholder="مثال: عائلة الشمري"
                    disabled={isPlatformBooking}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cust-phone" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                      <Phone className="h-3.5 w-3.5" /> الجوال
                    </Label>
                    <Input
                      id="cust-phone"
                      dir="ltr"
                      inputMode="tel"
                      value={form.customer_phone}
                      onChange={(e) => setForm((f) => ({ ...f, customer_phone: e.target.value }))}
                      placeholder="+9665XXXXXXXX"
                      disabled={isPlatformBooking}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                      <Banknote className="h-3.5 w-3.5" /> المبلغ ()
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      inputMode="numeric"
                      value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder="15000"
                      disabled={isPlatformBooking}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="label" className="mb-1.5 block text-xs font-semibold text-foreground/70">
                عنوان مختصر (اختياري)
              </Label>
              <Input
                id="label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="حجز خاص، صيانة، عرس آل ..."
                disabled={isPlatformBooking}
              />
            </div>

            <div>
              <Label htmlFor="note" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                <StickyNote className="h-3.5 w-3.5" /> ملاحظات
              </Label>
              <Textarea
                id="note"
                value={form.text}
                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                placeholder="تفاصيل إضافية تساعدك على التحضير..."
                rows={3}
                disabled={isPlatformBooking}
              />
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
              {existingForPicked && !isPlatformBooking ? (
                <Button
                  variant="ghost"
                  onClick={remove}
                  disabled={submitting}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="me-2 h-4 w-4" /> حذف
                </Button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setSheetOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={save}
                  disabled={submitting || isPlatformBooking}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPlatformBooking ? (
                    <>
                      <Lock className="me-2 h-4 w-4" /> غير قابل للتعديل
                    </>
                  ) : existingForPicked ? (
                    <>
                      <Unlock className="me-2 h-4 w-4" /> تحديث
                    </>
                  ) : (
                    <>
                      <Plus className="me-2 h-4 w-4" /> حفظ الحدث
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
