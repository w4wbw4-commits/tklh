import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { availabilityService, paymentsService } from "@/domain";
import { dayBuckets, vendorHasSections } from "@/domain/availability/rules";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  /** Used on the mandatory invoice created for every manual booking. */
  vendorName?: string;
  vendorVatNumber?: string | null;
  /** CR / freelance certificate reference — printed on the invoice. */
  vendorCrUrl?: string | null;
}

type ManualSection = "both" | "men" | "women";

const SECTION_LABEL: Record<ManualSection, string> = {
  both: "القسمان معاً",
  men: "قسم الرجال",
  women: "قسم النساء",
};

const SECTION_EN: Record<ManualSection, string> = {
  both: "Men + Women",
  men: "Men",
  women: "Women",
};

const EVENT_TYPES = ["زواج", "خطوبة", "تخرج", "مؤتمر", "عقد قران", "مناسبة عامة"] as const;

type PaymentStatus = "unpaid" | "deposit" | "paid";

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  unpaid: "غير مدفوع",
  deposit: "عربون مدفوع",
  paid: "مدفوع بالكامل",
};

const PAYMENT_EN: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  deposit: "Deposit paid",
  paid: "Paid in full",
};

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
  section?: ManualSection;
  invoice_number?: string;
  event_type?: string;
  event_time?: string;
  package_label?: string;
  discount?: number;
  vat_applicable?: boolean;
  payment_status?: PaymentStatus;
};

type SectionStatus = "blocked" | "booked" | "pending" | null;

type Row = {
  id: string;
  vendor_id: string;
  date: string;
  status: "blocked" | "booked" | "pending";
  note: string | null;
  booking_id: string | null;
  men_status?: SectionStatus;
  women_status?: SectionStatus;
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

export const VendorCalendar = ({ vendorId, vendorName, vendorVatNumber }: Props) => {
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
    section: "both" as ManualSection,
  });

  // Last invoice issued from this sheet — enables the PDF download button.
  // No WhatsApp/API sending: the partner downloads the file and sends it.
  const [lastInvoice, setLastInvoice] = useState<{
    invoice_number: string;
    issue_date: string;
    customer_name: string | null;
    customer_phone: string | null;
    subtotal: number;
    vat_amount: number;
    total: number;
    event_date: string;
    section: ManualSection;
  } | null>(null);

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
      section: meta?.section ?? "both",
    });
    setLastInvoice(null);
    setSheetOpen(true);
  };

  // Save (insert or update) a manual entry on a date. A manual booking always
  // produces a tax invoice — the partner then downloads the PDF and sends it.
  const save = async () => {
    if (!picked) return;
    if (isPlatformBooking) {
      toast.error("هذا اليوم محجوز عبر المنصة — لا يمكن تعديله يدوياً.");
      return;
    }
    const isBooking = form.status !== "blocked";
    const amount = form.amount ? Number(form.amount) : 0;
    const alreadyInvoiced = !!parseMeta(existingForPicked?.note ?? null)?.invoice_number;
    if (isBooking && !alreadyInvoiced) {
      if (!form.customer_name.trim()) {
        toast.error("اسم العميل مطلوب لإصدار الفاتورة");
        return;
      }
      if (!amount || amount <= 0) {
        toast.error("المبلغ مطلوب — الفاتورة إلزامية لكل حجز يدوي");
        return;
      }
    }

    setSubmitting(true);

    // 1) Mandatory invoice first, so we can store its number on the day.
    let invoiceNumber = parseMeta(existingForPicked?.note ?? null)?.invoice_number;
    let issued: typeof lastInvoice = null;
    if (isBooking && !alreadyInvoiced) {
      const subtotal = +(amount / 1.15).toFixed(2);
      const vat = +(amount - subtotal).toFixed(2);
      const { data: numData } = await paymentsService.nextInvoiceNumber();
      const number = (numData as unknown as string) ?? "";
      const { error: invErr } = await paymentsService.createVendorInvoice({
        vendor_id: vendorId,
        invoice_number: number,
        customer_name: form.customer_name.trim() || null,
        customer_phone: form.customer_phone.trim() || null,
        subtotal,
        vat_amount: vat,
        total: amount,
        notes: `حجز يدوي · ${formatDate(picked)} · ${SECTION_LABEL[form.section]}`,
        source: "manual",
        vendor_vat_number: vendorVatNumber ?? null,
      } as never);
      if (invErr) {
        setSubmitting(false);
        toast.error(`لم يتم إصدار الفاتورة: ${invErr.message}`);
        return;
      }
      invoiceNumber = number;
      issued = {
        invoice_number: number,
        issue_date: new Date().toISOString().slice(0, 10),
        customer_name: form.customer_name.trim() || null,
        customer_phone: form.customer_phone.trim() || null,
        subtotal,
        vat_amount: vat,
        total: amount,
        event_date: formatDate(picked),
        section: form.section,
      };
    }

    // 2) Block the day (and the specific section when the vendor serves both).
    const meta: ManualMeta = {
      kind: "manual",
      label: form.label || (form.status === "blocked" ? "محجوب يدوياً" : "حجز يدوي"),
      customer_name: form.customer_name || undefined,
      customer_phone: form.customer_phone || undefined,
      amount: amount || undefined,
      text: form.text || undefined,
      section: isBooking ? form.section : undefined,
      invoice_number: invoiceNumber,
    };
    const payload: Record<string, unknown> = {
      vendor_id: vendorId,
      date: formatDate(picked),
      status: form.status,
      note: JSON.stringify(meta),
    };
    if (hasSections && isBooking) {
      payload.men_status = form.section === "women" ? null : form.status;
      payload.women_status = form.section === "men" ? null : form.status;
    }
    const { error } = await availabilityService.block(payload as never);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (issued) {
      setLastInvoice(issued);
      toast.success(`تم الحجز وإصدار الفاتورة ${issued.invoice_number} — حمّل ملف PDF وأرسله للعميل`);
    } else {
      toast.success(existingForPicked ? "تم تحديث اليوم" : "تمت إضافة الحدث");
      setSheetOpen(false);
    }
    load();
  };

  // Download the invoice PDF (no automatic sending anywhere).
  const downloadInvoicePDF = () => {
    if (!lastInvoice) return;
    const money = (n: number) => Math.round(n).toLocaleString("en-US");
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("TAX INVOICE", 105, 20, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${lastInvoice.invoice_number}`, 14, 35);
    doc.text(`Date: ${lastInvoice.issue_date}`, 14, 42);
    doc.text(`Vendor: ${vendorName ?? ""}`, 14, 49);
    doc.text(`VAT No: ${vendorVatNumber || "-"}`, 14, 56);
    doc.text(`Customer: ${lastInvoice.customer_name ?? "-"}`, 14, 63);
    doc.text(`Phone: ${lastInvoice.customer_phone ?? "-"}`, 14, 70);
    doc.text(`Event date: ${lastInvoice.event_date}`, 14, 77);
    autoTable(doc, {
      startY: 88,
      head: [["Description", "Subtotal (SAR)", "VAT 15%", "Total (SAR)"]],
      body: [[
        `Manual booking (${lastInvoice.section})`,
        money(lastInvoice.subtotal),
        money(lastInvoice.vat_amount),
        money(lastInvoice.total),
      ]],
      theme: "grid",
      headStyles: { fillColor: [82, 92, 50] },
    });
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ${money(lastInvoice.total)} SAR`, 196, finalY, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(vendorName ?? "", 14, 285);
    doc.text("Generated by TKLH", 196, 285, { align: "right" });
    doc.save(`${lastInvoice.invoice_number}.pdf`);
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

  // Confirm a pending (محتمل) manual booking in one tap — flips the day and
  // its section statuses from pending to booked, without touching the invoice.
  const confirmById = async (id: string) => {
    const row = items.find((r) => r.id === id);
    if (!row) return;
    if (row.booking_id) {
      toast.error("حجوزات المنصة تُؤكد من قائمة الطلبات.");
      return;
    }
    if (row.status !== "pending") return;
    const patch: Record<string, unknown> = { status: "booked" };
    if (row.men_status === "pending") patch.men_status = "booked";
    if (row.women_status === "pending") patch.women_status = "booked";
    const { error } = await availabilityService.updateAvailabilityById(id, patch as never);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("تم تأكيد الحجز");
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

  // Does this vendor serve men/women sections independently? The database only
  // fills men_status/women_status for dual-section categories (halls,
  // photographers), so the split view follows the data, never a UI guess.
  const hasSections = useMemo(() => vendorHasSections(items), [items]);

  // Day colouring is derived only from vendor_availability, through the shared
  // availability rules the customer catalog uses — no duplicated logic here.
  const dayModifiers = useMemo(() => dayBuckets(items, formatDate(new Date())), [items]);


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
            modifiers={dayModifiers}
            modifiersClassNames={{
              blocked: "!bg-foreground/15 !text-foreground line-through",
              booked: "!bg-primary !text-primary-foreground font-bold",
              pending: "!bg-amber-500/80 !text-white font-bold",
              menBooked: "!bg-gradient-to-l !from-blue-500 !from-50% !to-transparent !to-50% font-bold",
              womenBooked: "!bg-gradient-to-r !from-purple-500 !from-50% !to-transparent !to-50% font-bold",
              menPending: "!bg-gradient-to-l !from-amber-500 !from-50% !to-transparent !to-50% font-bold",
              womenPending: "!bg-gradient-to-r !from-orange-400 !from-50% !to-transparent !to-50% font-bold",
              freeToday: "!bg-cream !text-foreground ring-2 ring-inset ring-amber-400 font-bold",
            }}
            classNames={{ day_today: "font-bold" }}

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
              <span className="h-3 w-3 rounded-sm border border-border bg-background" /> متاح
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-primary" /> القسمان محجوزان
            </div>
            {hasSections && (
              <>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-gradient-to-l from-blue-500 from-50% to-transparent to-50% ring-1 ring-border" /> قسم الرجال محجوز
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-gradient-to-r from-purple-500 from-50% to-transparent to-50% ring-1 ring-border" /> قسم النساء محجوز
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-amber-500/80" /> طلب غير مؤكد
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
                        {!fromPlatform && it.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmById(it.id)}
                            className="h-8 rounded-full border-primary/40 px-3 text-xs text-primary hover:bg-primary/10"
                          >
                            <CheckCircle2 className="me-1 h-3.5 w-3.5" /> تأكيد الحجز
                          </Button>
                        )}
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

            {/* Section picker — only for vendors serving men and women separately */}
            {hasSections && form.status !== "blocked" && (
              <div>
                <Label className="mb-2 block text-xs font-semibold text-foreground/70">القسم</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["men", "women", "both"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={isPlatformBooking}
                      onClick={() => setForm((f) => ({ ...f, section: s }))}
                      className={`rounded-2xl border p-3 text-xs font-bold transition-all ${
                        form.section === s
                          ? "border-transparent bg-primary text-primary-foreground shadow-md"
                          : "border-border bg-background text-foreground/70 hover:border-primary/50"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {SECTION_LABEL[s]}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-foreground/55">
                  حجز قسم واحد يترك القسم الآخر متاحاً للعملاء في نفس التاريخ.
                </p>
              </div>
            )}

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

            {/* Mandatory invoice for manual bookings — download only, no sending */}
            {lastInvoice && (
              <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
                <div className="text-xs font-bold text-primary">
                  الفاتورة {lastInvoice.invoice_number} صادرة بمبلغ {Math.round(lastInvoice.total).toLocaleString("en-US")}
                </div>
                <p className="mt-1 text-[11px] text-foreground/60">
                  حمّل ملف PDF وأرسله للعميل عبر واتساب يدوياً.
                </p>
                <Button onClick={downloadInvoicePDF} className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  تحميل الفاتورة PDF
                </Button>
              </div>
            )}

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
                {existingForPicked && !isPlatformBooking && existingForPicked.status === "pending" && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await confirmById(existingForPicked.id);
                      setSheetOpen(false);
                    }}
                    disabled={submitting}
                    className="border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <CheckCircle2 className="me-2 h-4 w-4" /> تأكيد الحجز
                  </Button>
                )}
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
