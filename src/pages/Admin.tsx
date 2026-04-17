import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2, ShieldAlert, Wallet, TrendingUp, Lock, ListChecks,
  CheckCircle2, Clock, LogOut, Receipt, Star, Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { fmtNumber, fmtDate } from "@/i18n/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdminReviewsPanel } from "@/components/tekillah/admin/AdminReviewsPanel";
import { AdminModerationQueue } from "@/components/tekillah/admin/AdminModerationQueue";

interface PaymentRow {
  id: string;
  amount: number;
  vat_amount: number;
  platform_fee: number;
  vendor_net: number;
  total_charged: number;
  status: "held" | "released" | "refunded" | "failed";
  created_at: string;
  booking_id: string;
  vendor_id: string;
  customer_id: string;
}

interface BookingRow {
  id: string;
  event_date: string;
  status: string;
  total_price: number | null;
  paid_amount: number;
  created_at: string;
  vendor: { business_name: string; category: string } | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasingId, setReleasingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/admin", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(Boolean(data));
    })();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: b }] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings")
        .select("id, event_date, status, total_price, paid_amount, created_at, vendor:vendors(business_name, category)")
        .order("created_at", { ascending: false }),
    ]);
    setPayments((p ?? []) as unknown as PaymentRow[]);
    setBookings((b ?? []) as unknown as BookingRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    load();
    // realtime subscription on payments and bookings
    const ch = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const releasePayment = async (id: string) => {
    setReleasingId(id);
    const { error } = await supabase.from("payments")
      .update({ status: "released", released_at: new Date().toISOString(), released_by: user?.id })
      .eq("id", id);
    setReleasingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(t("admin.releaseSuccess"));
  };

  if (authLoading || isAdmin === null) {
    return <div className="grid min-h-screen place-items-center bg-gradient-soft"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-soft p-6">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 font-arabic text-xl font-semibold">{t("admin.deniedTitle")}</h1>
          <p className="mt-2 text-sm text-foreground/65">{t("admin.deniedDesc")}</p>
          <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/">{t("common.backToHome")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalRevenue = payments.reduce((s, p) => s + Number(p.total_charged ?? 0), 0);
  const heldFunds = payments.filter((p) => p.status === "held").reduce((s, p) => s + Number(p.vendor_net ?? 0), 0);
  const platformProfit = payments.reduce((s, p) => s + Number(p.platform_fee ?? 0), 0);
  const totalBookings = bookings.length;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge className="bg-primary/15 text-primary">{t("admin.kicker")}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-full">
              <Link to="/">{t("common.home")}</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate("/"))}
              className="rounded-full text-destructive hover:bg-destructive/10">
              <LogOut className="me-1 h-4 w-4" /> {t("common.logout")}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-arabic text-3xl font-semibold text-foreground sm:text-4xl">{t("admin.title")}</h1>
          <p className="mt-2 text-foreground/65">{t("admin.subtitle")}</p>
        </motion.div>

        {/* KPIs */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={TrendingUp} label={t("admin.totalRevenue")} value={`${fmtNumber(totalRevenue)} ${t("common.currency")}`} highlight />
          <Kpi icon={Lock} label={t("admin.heldFunds")} value={`${fmtNumber(heldFunds)} ${t("common.currency")}`} />
          <Kpi icon={Wallet} label={t("admin.platformProfit")} value={`${fmtNumber(platformProfit)} ${t("common.currency")}`} />
          <Kpi icon={ListChecks} label={t("admin.totalBookings")} value={fmtNumber(totalBookings)} />
        </div>

        <div className="mt-8">
          <Tabs defaultValue="payments">
            <TabsList className="rounded-2xl bg-card p-1 shadow-card">
              <TabsTrigger value="payments" className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Receipt className="h-4 w-4" /> {t("admin.tabPayments")}
              </TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ListChecks className="h-4 w-4" /> {t("admin.tabBookings")}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Star className="h-4 w-4" /> {t("admin.tabReviews")}
              </TabsTrigger>
              <TabsTrigger value="moderation" className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Flag className="h-4 w-4" /> {t("admin.tabModeration")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="mt-6">
              {loading ? (
                <Spinner />
              ) : payments.length === 0 ? (
                <Empty msg={t("admin.noPayments")} />
              ) : (
                <div className="space-y-3">
                  {payments.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-arabic text-sm font-semibold text-foreground">
                            #{p.id.slice(0, 8).toUpperCase()}
                          </div>
                          <div className="text-[11px] text-foreground/55">{fmtDate(p.created_at)}</div>
                        </div>
                        <Badge className={statusBadge(p.status)}>{t(`admin.payStatus.${p.status}`)}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                        <Field label={t("admin.amount")} value={`${fmtNumber(Number(p.amount))} ${t("common.currency")}`} />
                        <Field label={t("admin.vat")} value={`${fmtNumber(Number(p.vat_amount))} ${t("common.currency")}`} />
                        <Field label={t("admin.fee")} value={`${fmtNumber(Number(p.platform_fee))} ${t("common.currency")}`} />
                        <Field label={t("admin.vendorNet")} value={`${fmtNumber(Number(p.vendor_net))} ${t("common.currency")}`} highlight />
                      </div>
                      {p.status === "held" && (
                        <div className="mt-3 flex justify-end">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" disabled={releasingId === p.id}
                                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                                {releasingId === p.id ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="me-1 h-4 w-4" />}
                                {t("admin.releasePayment")}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("admin.releaseConfirmTitle")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("admin.releaseConfirmDesc")}
                                  <span className="mt-3 block rounded-lg bg-secondary p-3 font-arabic font-semibold text-foreground">
                                    {fmtNumber(Number(p.vendor_net))} {t("common.currency")}
                                  </span>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-full">{t("common.cancel")}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => releasePayment(p.id)}
                                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                                  {t("admin.releaseConfirmCta")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              {loading ? (
                <Spinner />
              ) : bookings.length === 0 ? (
                <Empty msg={t("admin.noBookings")} />
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-arabic text-sm font-semibold text-foreground">
                            {b.vendor?.business_name ?? "—"}
                          </div>
                          <div className="text-[11px] text-foreground/55">
                            {b.vendor?.category ? t(`categories.${b.vendor.category}`) : ""} · #{b.id.slice(0, 8).toUpperCase()}
                          </div>
                        </div>
                        <Badge className={bookingBadge(b.status)}>
                          {t(`customer.bookingStatus.${b.status}`)}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                        <Field label={t("admin.eventDate")} value={fmtDate(b.event_date)} />
                        <Field label={t("admin.totalPrice")} value={`${fmtNumber(Number(b.total_price ?? 0))} ${t("common.currency")}`} />
                        <Field label={t("admin.paid")} value={`${fmtNumber(Number(b.paid_amount))} ${t("common.currency")}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <AdminReviewsPanel />
            </TabsContent>

            <TabsContent value="moderation" className="mt-6">
              <AdminModerationQueue />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

const Kpi = ({ icon: Icon, label, value, highlight }: { icon: typeof Wallet; label: string; value: string; highlight?: boolean }) => (
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

const Field = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-foreground/50">{label}</div>
    <div className={`font-arabic ${highlight ? "font-semibold text-primary" : "font-medium text-foreground"}`}>{value}</div>
  </div>
);

const Spinner = () => (
  <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
    <Loader2 className="h-5 w-5 animate-spin text-primary" />
  </div>
);
const Empty = ({ msg }: { msg: string }) => (
  <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-foreground/55">
    <Clock className="mx-auto mb-2 h-6 w-6" />
    {msg}
  </div>
);

const statusBadge = (s: string) => {
  if (s === "held") return "bg-primary/15 text-primary";
  if (s === "released") return "bg-emerald-500/15 text-emerald-700";
  if (s === "refunded") return "bg-amber-500/15 text-amber-700";
  return "bg-destructive/15 text-destructive";
};
const bookingBadge = (s: string) => {
  if (s === "confirmed") return "bg-primary/15 text-primary";
  if (s === "pending") return "bg-amber-500/15 text-amber-700";
  if (s === "completed") return "bg-emerald-500/15 text-emerald-700";
  return "bg-destructive/15 text-destructive";
};

export default Admin;
