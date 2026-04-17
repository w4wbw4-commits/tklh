import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Loader2, Wallet, ReceiptText, TrendingUp, CreditCard, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { EventRow, BookingWithVendor } from "./types";
import { useTranslation } from "react-i18next";
import { fmtNumber } from "@/i18n/format";
import { RateBookingDialog } from "@/components/tekillah/reviews/RateBookingDialog";
import { useAuth } from "@/hooks/useAuth";

export const PaymentsPanel = ({ event }: { event: EventRow }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [rateOpenFor, setRateOpenFor] = useState<BookingWithVendor | null>(null);
  const cur = t("common.currency");

  const refreshReviewed = async (bookingIds: string[]) => {
    if (!bookingIds.length) { setReviewedIds(new Set()); return; }
    const { data } = await supabase.from("reviews").select("booking_id").in("booking_id", bookingIds);
    setReviewedIds(new Set((data ?? []).map((r) => r.booking_id)));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("bookings")
        .select("*, vendor:vendors(business_name, category, city), package:packages(name, tier)")
        .eq("event_id", event.id).order("created_at", { ascending: false });
      const list = (data ?? []) as unknown as BookingWithVendor[];
      setBookings(list);
      await refreshReviewed(list.map((b) => b.id));
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
          eventTitle: event.title, eventDate: event.event_date, city: event.city,
          customerName: t("customer.payments.customer"),
          vendorName: booking.vendor?.business_name ?? t("customer.overview.vendorFallback"),
          packageName: booking.package?.name ?? t("customer.overview.serviceFallback"),
          totalPrice: Number(booking.total_price ?? 0),
          paidAmount: Number(booking.paid_amount ?? 0),
          bookingId: booking.id,
        },
      });
      if (error) throw error;
      if (!data?.pdf) throw new Error(t("customer.payments.noInvoice"));
      const a = document.createElement("a");
      a.href = data.pdf; a.download = `invoice-${booking.id.slice(0, 8)}.pdf`; a.click();
      toast.success(t("customer.payments.downloadSuccess"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("customer.payments.downloadFailed");
      toast.error(msg);
    } finally { setDownloadingId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard icon={Wallet} label={t("customer.payments.totalBooked")} value={`${fmtNumber(totalPrice)} ${cur}`} />
        <SummaryCard icon={TrendingUp} label={t("customer.payments.paidSoFar")} value={`${fmtNumber(totalPaid)} ${cur}`} highlight />
        <SummaryCard icon={ReceiptText} label={t("customer.payments.remaining")} value={`${fmtNumber(remaining)} ${cur}`} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-arabic text-sm font-semibold">{t("customer.payments.progress")}</h3>
          <span className="font-arabic text-sm font-bold text-primary">{Math.round(percent)}%</span>
        </div>
        <Progress value={percent} className="h-2" />
      </div>

      <div>
        <h3 className="mb-3 font-arabic text-lg font-semibold">{t("customer.payments.invoices")}</h3>
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-foreground/65">
            {t("customer.payments.empty")}
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((b, i) => {
              const fully = Number(b.paid_amount) > 0 && Number(b.paid_amount) >= Number(b.total_price ?? 0);
              return (
                <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex-1 min-w-0">
                    <div className="font-arabic text-sm font-semibold">
                      {b.vendor?.business_name ?? t("customer.overview.vendorFallback")}
                    </div>
                    <div className="text-xs text-foreground/65">
                      {b.vendor?.category ? t(`categories.${b.vendor.category}`) : t("customer.overview.serviceFallback")} • {b.package?.name ?? "—"}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="font-arabic text-sm font-semibold">{fmtNumber(Number(b.total_price ?? 0))} {cur}</div>
                    <div className="text-[11px] text-foreground/60">
                      {fully ? t("customer.payments.fullyPaid")
                        : Number(b.paid_amount) > 0 ? t("customer.payments.paidPartial", { amount: fmtNumber(Number(b.paid_amount)) })
                        : t("customer.payments.unpaid")}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!fully && (
                      <Button asChild size="sm"
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link to={`/checkout/${b.id}`}>
                          <CreditCard className="me-1 h-4 w-4" />
                          {t("customer.payments.payNow")}
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link to={`/invoice/${b.id}`}>
                        <FileText className="me-1 h-4 w-4" />
                        {t("customer.payments.viewInvoice")}
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => downloadInvoice(b)}
                      disabled={downloadingId === b.id} className="rounded-full">
                      {downloadingId === b.id ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <Download className="me-1 h-4 w-4" />}
                      PDF
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, highlight }: {
  icon: typeof Wallet; label: string; value: string; highlight?: boolean;
}) => (
  <div className={`rounded-2xl border p-5 shadow-card ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
    <div className="flex items-center gap-3">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${highlight ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs text-foreground/65">{label}</div>
        <div className="mt-0.5 font-arabic text-lg font-semibold text-foreground">{value}</div>
      </div>
    </div>
  </div>
);
