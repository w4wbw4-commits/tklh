import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, Wallet, ReceiptText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { EventRow, BookingWithVendor } from "./types";

const categoryLabels: Record<string, string> = {
  hall: "القاعة",
  catering: "الضيافة",
  photography: "التصوير",
  dj: "الصوتيات",
  decor: "التنسيق",
  cars: "السيارات",
};

export const PaymentsPanel = ({ event }: { event: EventRow }) => {
  const [bookings, setBookings] = useState<BookingWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("bookings")
        .select("*, vendor:vendors(business_name, category, city), package:packages(name, tier)")
        .eq("event_id", event.id)
        .order("created_at", { ascending: false });
      setBookings((data ?? []) as unknown as BookingWithVendor[]);
      setLoading(false);
    })();
  }, [event.id]);

  const totalPrice = bookings.reduce((s, b) => s + Number(b.total_price ?? 0), 0);
  const totalPaid = bookings.reduce((s, b) => s + Number(b.paid_amount ?? 0), 0);
  const remaining = Math.max(0, totalPrice - totalPaid);
  const percent = totalPrice ? (totalPaid / totalPrice) * 100 : 0;

  const downloadInvoice = async (booking: BookingWithVendor) => {
    setDownloadingId(booking.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice", {
        body: {
          eventTitle: event.title,
          eventDate: event.event_date,
          city: event.city,
          customerName: "العميل",
          vendorName: booking.vendor?.business_name ?? "مزوّد",
          packageName: booking.package?.name ?? "خدمة",
          totalPrice: Number(booking.total_price ?? 0),
          paidAmount: Number(booking.paid_amount ?? 0),
          bookingId: booking.id,
        },
      });
      if (error) throw error;
      if (!data?.pdf) throw new Error("لم يتم استلام الفاتورة");
      const a = document.createElement("a");
      a.href = data.pdf;
      a.download = `invoice-${booking.id.slice(0, 8)}.pdf`;
      a.click();
      toast.success("تم تحميل الفاتورة");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "تعذر التحميل";
      toast.error(msg);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Wallet}
          label="إجمالي الميزانية المحجوزة"
          value={`${totalPrice.toLocaleString("ar-SA")} ر.س`}
        />
        <SummaryCard
          icon={TrendingUp}
          label="المدفوع حتى الآن"
          value={`${totalPaid.toLocaleString("ar-SA")} ر.س`}
          highlight
        />
        <SummaryCard
          icon={ReceiptText}
          label="المتبقّي"
          value={`${remaining.toLocaleString("ar-SA")} ر.س`}
        />
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-arabic text-sm font-semibold">تقدّم السداد</h3>
          <span className="font-arabic text-sm font-bold text-primary">
            {Math.round(percent)}%
          </span>
        </div>
        <Progress value={percent} className="h-2" />
      </div>

      {/* Invoices list */}
      <div>
        <h3 className="mb-3 font-arabic text-lg font-semibold">الفواتير</h3>
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-foreground/65">
            لا توجد فواتير بعد.
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((b, i) => {
              const fully =
                Number(b.paid_amount) > 0 &&
                Number(b.paid_amount) >= Number(b.total_price ?? 0);
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-arabic text-sm font-semibold">
                      {b.vendor?.business_name ?? "مزوّد"}
                    </div>
                    <div className="text-xs text-foreground/65">
                      {categoryLabels[b.vendor?.category ?? ""] ?? "خدمة"} •{" "}
                      {b.package?.name ?? "—"}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="font-arabic text-sm font-semibold">
                      {Number(b.total_price ?? 0).toLocaleString("ar-SA")} ر.س
                    </div>
                    <div className="text-[11px] text-foreground/60">
                      {fully
                        ? "مدفوع كلياً"
                        : Number(b.paid_amount) > 0
                        ? `مدفوع: ${Number(b.paid_amount).toLocaleString("ar-SA")}`
                        : "غير مدفوع"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadInvoice(b)}
                    disabled={downloadingId === b.id}
                    className="rounded-full"
                  >
                    {downloadingId === b.id ? (
                      <Loader2 className="me-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="me-1 h-4 w-4" />
                    )}
                    PDF
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div
    className={`rounded-2xl border p-5 shadow-card ${
      highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`grid h-10 w-10 place-items-center rounded-xl ${
          highlight ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs text-foreground/65">{label}</div>
        <div className="mt-0.5 font-arabic text-lg font-semibold text-foreground">{value}</div>
      </div>
    </div>
  </div>
);
