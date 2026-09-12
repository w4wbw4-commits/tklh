import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Printer, Download, ArrowLeft, ArrowRight, ShieldCheck, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";
import { bookingsService, paymentsService, functionsService } from "@/domain";
import { useAuth } from "@/hooks/useAuth";
import { fmtDate, fmtNumber } from "@/i18n/format";
import type { Database } from "@/integrations/supabase/types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  vendor: { business_name: string; category: string; city: string | null } | null;
  package: { name: string; description: string | null } | null;
  event: { title: string; city: string | null; guest_count: number | null } | null;
};

const Invoice = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [vatPct, setVatPct] = useState(15);
  const [fee, setFee] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate(`/auth?redirect=/invoice/${bookingId}`, { replace: true });
  }, [authLoading, user, bookingId, navigate]);

  useEffect(() => {
    if (!user || !bookingId) return;
    (async () => {
      setLoading(true);
      const [{ data: b }, { data: s }] = await Promise.all([
        bookingsService.getByIdInvoiceDetail(bookingId),
        paymentsService.getPublicSettings(),
      ]);
      const booking = b as unknown as Booking | null;
      setBooking(booking);
      if (s) setVatPct(Number(s.vat_percent));
      const subtotal = Number(booking?.total_price ?? 0);
      if (subtotal > 0) {
        const { split: row } = await paymentsService.computeSplit(subtotal);
        if (row) setFee(Number(row.platform_fee ?? 0));
      }
      setLoading(false);
    })();
  }, [user, bookingId]);

  const split = useMemo(() => {
    const subtotal = Number(booking?.total_price ?? 0);
    const vat = Math.round((subtotal * vatPct) / 100);
    const total = subtotal + vat;
    const paid = Number(booking?.paid_amount ?? 0);
    const balance = Math.max(0, total - paid);
    return { subtotal, vat, fee, total, paid, balance };
  }, [booking, vatPct, fee]);


  const handlePrint = () => window.print();

  const handleDownload = async () => {
    if (!booking) return;
    setDownloading(true);
    try {
      const { data, error } = await functionsService.invokeGenerateInvoice({
        eventTitle: booking.event?.title ?? t("customer.create.defaultTitle"),
        eventDate: booking.event_date,
        city: booking.event?.city,
        customerName: t("customer.payments.customer"),
        vendorName: booking.vendor?.business_name ?? "—",
        packageName: booking.package?.name ?? "—",
        totalPrice: split.subtotal,
        paidAmount: split.paid,
        bookingId: booking.id,
        vatPercent: vatPct,
        platformFee: split.fee,
      });
      if (error) throw error;
      if (!data?.pdf) throw new Error(t("customer.payments.noInvoice"));
      const a = document.createElement("a");
      a.href = data.pdf;
      a.download = `tekillah-invoice-${booking.id.slice(0, 8)}.pdf`;
      a.click();
      toast.success(t("customer.payments.downloadSuccess"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("customer.payments.downloadFailed"));
    } finally {
      setDownloading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-soft">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-soft p-6">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <p className="font-arabic text-lg text-foreground/70">{t("checkout.notFound")}</p>
          <Button asChild className="mt-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/dashboard">{t("checkout.backToDashboard")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const cur = t("common.currency");
  const PrevIcon = isAr ? ArrowRight : ArrowLeft;
  const today = new Date();

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Toolbar (hidden on print) */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-full">
              <Link to="/dashboard"><PrevIcon className="me-1 h-4 w-4" /> {t("checkout.backToDashboard")}</Link>
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm" className="rounded-full">
              <Printer className="me-1 h-4 w-4" /> {t("invoice.print")}
            </Button>
            <Button onClick={handleDownload} disabled={downloading} size="sm"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              {downloading ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <Download className="me-1 h-4 w-4" />}
              {t("invoice.downloadPdf")}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Invoice paper */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-luxury print:rounded-none print:border-0 print:shadow-none">
          {/* Brand band */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-primary p-6 text-primary-foreground sm:p-8">
            <div>
              <div className="font-arabic text-2xl font-bold">TKLH · تِكله</div>
              <div className="mt-1 text-xs opacity-80">{t("invoice.tagline")}</div>
            </div>
            <div className="text-end">
              <div className="font-arabic text-xl font-bold tracking-wider">{t("invoice.title")}</div>
              <div className="mt-1 font-mono text-xs opacity-90">#{booking.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 gap-6 border-b border-border p-6 sm:grid-cols-3 sm:p-8">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                {t("invoice.billTo")}
              </div>
              <div className="mt-1 font-arabic font-medium text-foreground">
                {t("customer.payments.customer")}
              </div>
              <div className="text-xs text-foreground/55">{user?.email}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                {t("invoice.eventDate")}
              </div>
              <div className="mt-1 font-arabic font-medium text-foreground">
                {fmtDate(booking.event_date)}
              </div>
              {booking.event?.city && <div className="text-xs text-foreground/55">{booking.event.city}</div>}
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                {t("invoice.issueDate")}
              </div>
              <div className="mt-1 font-arabic font-medium text-foreground">{fmtDate(today)}</div>
            </div>
          </div>

          {/* Service rows */}
          <div className="p-6 sm:p-8">
            <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                {t("invoice.serviceCol")}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                {t("invoice.amountCol")}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="font-arabic text-base font-semibold text-foreground">
                  {booking.vendor?.business_name ?? "—"}
                </div>
                <div className="text-xs text-foreground/65">
                  {booking.vendor?.category ? t(`categories.${booking.vendor.category}`) : ""} · {booking.package?.name ?? "—"}
                </div>
                {booking.package?.description && (
                  <div className="mt-1 text-xs text-foreground/55">{booking.package.description}</div>
                )}
                {booking.guest_count != null && (
                  <div className="mt-1 text-[11px] text-foreground/50">
                    {t("invoice.guests", { count: booking.guest_count })}
                  </div>
                )}
              </div>
              <div className="font-arabic text-base font-semibold text-foreground whitespace-nowrap">
                {fmtNumber(split.subtotal)} {cur}
              </div>
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-border pt-4">
              <Row label={t("invoice.subtotal")} value={`${fmtNumber(split.subtotal)} ${cur}`} />
              <Row label={t("checkout.platformFee", { pct: "" })} value={`${fmtNumber(split.fee)} ${cur}`} muted small />
              <Row label={t("checkout.vat", { pct: vatPct })} value={`${fmtNumber(split.vat)} ${cur}`} />
              <Row label={t("invoice.paid")} value={`${fmtNumber(split.paid)} ${cur}`} muted />
              <div className="mt-3 flex items-center justify-between border-t border-primary/30 pt-3">
                <span className="font-arabic text-base font-bold text-foreground">{t("invoice.balanceDue")}</span>
                <span className="font-arabic text-2xl font-bold text-primary">
                  {fmtNumber(split.balance)} {cur}
                </span>
              </div>
            </div>
          </div>

          {/* Footer trust band */}
          <div className="border-t border-border bg-secondary/30 p-6 text-center sm:p-8">
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-foreground/65">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {t("checkout.badgeSecure")}
              </span>
              <span className="inline-flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {t("checkout.badgeSaudi")}
              </span>
              <span>{t("invoice.escrowProtected")}</span>
            </div>
            <p className="mt-3 text-[11px] text-foreground/50">{t("invoice.thanks")}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

const Row = ({ label, value, muted, small }: { label: string; value: string; muted?: boolean; small?: boolean }) => (
  <div className={`flex items-center justify-between py-1 ${small ? "text-xs" : "text-sm"}`}>
    <span className={muted ? "text-foreground/60" : "text-foreground"}>{label}</span>
    <span className={`font-arabic font-medium ${muted ? "text-foreground/70" : "text-foreground"}`}>{value}</span>
  </div>
);

export default Invoice;
