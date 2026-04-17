import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Loader2, ArrowLeft, ArrowRight, ShieldCheck, Lock, BadgeCheck, CreditCard, Smartphone, Apple, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fmtNumber, fmtDate } from "@/i18n/format";
import type { Database } from "@/integrations/supabase/types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  vendor: { business_name: string; category: string } | null;
  package: { name: string } | null;
};

type PaymentMethodKey = "mada" | "apple_pay" | "stc_pay" | "credit_card";

const ACTIVE_METHODS: { key: PaymentMethodKey; icon: typeof CreditCard }[] = [
  { key: "mada", icon: Wallet },
  { key: "apple_pay", icon: Apple },
  { key: "stc_pay", icon: Smartphone },
  { key: "credit_card", icon: CreditCard },
];

const COMING_SOON: { key: "tamara" | "tabby" }[] = [
  { key: "tamara" },
  { key: "tabby" },
];

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentMethodKey>("mada");
  const [vatPercent, setVatPercent] = useState(15);
  const [commissionPercent, setCommissionPercent] = useState(12);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate(`/auth?redirect=/checkout/${bookingId}`, { replace: true });
  }, [authLoading, user, bookingId, navigate]);

  useEffect(() => {
    if (!user || !bookingId) return;
    (async () => {
      setLoading(true);
      const [{ data: b }, { data: s }] = await Promise.all([
        supabase
          .from("bookings")
          .select("*, vendor:vendors(business_name, category), package:packages(name)")
          .eq("id", bookingId)
          .maybeSingle(),
        supabase.from("platform_settings").select("vat_percent, commission_percent").maybeSingle(),
      ]);
      setBooking(b as unknown as Booking | null);
      if (s) {
        setVatPercent(Number(s.vat_percent));
        setCommissionPercent(Number(s.commission_percent));
      }
      setLoading(false);
    })();
  }, [user, bookingId]);

  const split = useMemo(() => {
    const amount = Number(booking?.total_price ?? 0);
    const vat = Math.round((amount * vatPercent) / 100);
    const platformFee = Math.round((amount * commissionPercent) / 100);
    const vendorNet = amount - platformFee;
    const total = amount + vat;
    return { amount, vat, platformFee, vendorNet, total };
  }, [booking, vatPercent, commissionPercent]);

  const handlePay = async () => {
    if (!user || !booking) return;
    setSubmitting(true);
    const { error } = await supabase.from("payments").insert({
      booking_id: booking.id,
      customer_id: user.id,
      vendor_id: booking.vendor_id,
      amount: split.amount,
      vat_amount: split.vat,
      platform_fee: split.platformFee,
      vendor_net: split.vendorNet,
      total_charged: split.total,
      method,
      status: "held",
      reference: `MOCK-${Date.now()}`,
    });
    if (!error) {
      // mark booking as paid_amount = amount (mock)
      await supabase
        .from("bookings")
        .update({ paid_amount: split.amount })
        .eq("id", booking.id);
    }
    setSubmitting(false);
    if (error) {
      toast.error(t("checkout.payFailed"));
      return;
    }
    toast.success(t("checkout.paySuccess"));
    navigate(`/success?booking=${booking.id}`);
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

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link to="/dashboard"><PrevIcon className="me-1 h-4 w-4" /> {t("checkout.backToDashboard")}</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">{t("checkout.kicker")}</span>
          <h1 className="mt-3 font-arabic text-3xl font-semibold text-foreground sm:text-4xl">{t("checkout.title")}</h1>
          <p className="mt-2 text-sm text-foreground/65">{t("checkout.subtitle")}</p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: Methods */}
          <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-arabic text-lg font-semibold text-foreground">{t("checkout.activeMethods")}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ACTIVE_METHODS.map(({ key, icon: Icon }) => {
                  const selected = method === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMethod(key)}
                      className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                        selected
                          ? "border-primary bg-primary/5 shadow-card"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${selected ? "text-primary" : "text-foreground/65"}`} />
                      <span className="font-arabic text-xs font-medium text-foreground">
                        {t(`checkout.methods.${key}`)}
                      </span>
                      {selected && (
                        <span className="absolute end-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                          <BadgeCheck className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-arabic text-lg font-semibold text-foreground">{t("checkout.installments")}</h2>
              <p className="mt-1 text-xs text-foreground/60">{t("checkout.installmentsDesc")}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {COMING_SOON.map(({ key }) => (
                  <div
                    key={key}
                    className="relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-dashed border-border bg-background/50 p-4 opacity-70"
                    aria-disabled="true"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-foreground/60">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <span className="font-arabic text-sm font-semibold text-foreground/70">
                      {t(`checkout.providers.${key}`)}
                    </span>
                    <span className="absolute -end-8 top-3 rotate-45 bg-primary px-8 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {t("checkout.comingSoon")}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-arabic text-sm font-semibold text-foreground">{t("checkout.escrowTitle")}</div>
                  <p className="text-xs text-foreground/65">{t("checkout.escrowDesc")}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-luxury">
              <h2 className="font-arabic text-lg font-semibold text-foreground">{t("checkout.summary")}</h2>
              <div className="mt-4 space-y-3 text-sm">
                <Row label={booking.vendor?.business_name ?? t("customer.overview.vendorFallback")}
                     value={booking.package?.name ?? "—"} muted />
                <Row label={t("checkout.eventDate")} value={fmtDate(booking.event_date)} muted />
                <hr className="border-border" />
                <Row label={t("checkout.subtotal")} value={`${fmtNumber(split.amount)} ${cur}`} />
                <Row label={t("checkout.platformFee", { pct: commissionPercent })} value={`${fmtNumber(split.platformFee)} ${cur}`} muted small />
                <Row label={t("checkout.vat", { pct: vatPercent })} value={`${fmtNumber(split.vat)} ${cur}`} />
                <hr className="border-border" />
                <Row label={t("checkout.total")} value={`${fmtNumber(split.total)} ${cur}`} bold />
              </div>

              <Button onClick={handlePay} disabled={submitting}
                className="mt-6 h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("checkout.payNow")}
              </Button>

              <div className="mt-5 flex items-center justify-center gap-3 text-[11px] text-foreground/55">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {t("checkout.badgeSecure")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {t("checkout.badgeSaudi")}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

const Row = ({ label, value, muted, bold, small }: { label: string; value: string; muted?: boolean; bold?: boolean; small?: boolean; }) => (
  <div className={`flex items-center justify-between ${small ? "text-xs" : ""}`}>
    <span className={`${muted ? "text-foreground/65" : "text-foreground"} ${bold ? "font-arabic text-base font-semibold" : ""}`}>{label}</span>
    <span className={`${bold ? "font-arabic text-lg font-bold text-primary" : "font-arabic font-medium text-foreground"}`}>{value}</span>
  </div>
);

export default Checkout;
