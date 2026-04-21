import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Check, X, CalendarDays, Users, Inbox, ChevronDown, MapPin, Sparkles, ListChecks, User } from "lucide-react";
import { EmptyState } from "@/components/tekillah/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, fmtNumber } from "@/i18n/format";

interface BookingRow {
  id: string;
  event_date: string;
  status: string;
  total_price: number | null;
  paid_amount: number;
  guest_count: number | null;
  customer_id: string;
  event_id: string | null;
  package_id: string | null;
  notes: string | null;
  package: { name: string; includes: string[] | null; description: string | null } | null;
  event: { title: string; city: string | null; theme: string | null; notes: string | null } | null;
}

const STATUS_FILTERS = ["all", "pending", "confirmed", "completed", "rejected"] as const;
type Filter = typeof STATUS_FILTERS[number];

export const VendorBookings = ({ vendorId }: { vendorId: string }) => {
  const { t } = useTranslation();
  const [list, setList] = useState<BookingRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings")
      .select("id, event_date, status, total_price, paid_amount, guest_count, customer_id, event_id, package_id, notes, package:packages(name, includes, description), event:events(title, city, theme, notes)")
      .eq("vendor_id", vendorId)
      .order("event_date", { ascending: true });
    const rows = (data ?? []) as unknown as BookingRow[];
    setList(rows);

    const ids = Array.from(new Set(rows.map((r) => r.customer_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p) => { map[p.user_id] = p.display_name ?? "—"; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel(`vendor-bookings-${vendorId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `vendor_id=eq.${vendorId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [vendorId]);

  const setStatus = async (id: string, status: "confirmed" | "rejected") => {
    setActing(id);
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    setActing(null);
    if (error) { toast.error(error.message); return; }
    toast.success(t(`vendor.bookings.${status === "confirmed" ? "confirmed" : "rejected"}`));
  };

  const filtered = filter === "all" ? list : list.filter((b) => b.status === filter);
  const counts = STATUS_FILTERS.reduce<Record<Filter, number>>((acc, k) => {
    acc[k] = k === "all" ? list.length : list.filter((b) => b.status === k).length;
    return acc;
  }, { all: 0, pending: 0, confirmed: 0, completed: 0, rejected: 0 });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-arabic text-2xl font-semibold text-foreground">{t("vendor.bookings.title")}</h2>
        <p className="mt-1 text-sm text-foreground/65">{t("vendor.bookings.subtitle")}</p>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === k
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/70 hover:bg-secondary"
            }`}
          >
            {k === "all" ? t("common.all", "الكل") : t(`customer.bookingStatus.${k}`)}
            <span className="ms-1 opacity-70">({counts[k]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t("vendor.bookings.empty")}
          description={t("vendor.bookings.emptyDesc")}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((b, i) => {
            const isOpen = openId === b.id;
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-arabic text-sm font-semibold text-foreground">
                      #{b.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div className="text-[11px] text-foreground/55">
                      {b.package?.name ?? "—"}
                      {b.event?.title ? ` · ${b.event.title}` : ""}
                    </div>
                  </div>
                  <Badge className={badgeFor(b.status)}>{t(`customer.bookingStatus.${b.status}`)}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <Stat icon={User} label={t("vendor.bookings.customer", "العميل")} value={profiles[b.customer_id] ?? "—"} />
                  <Stat icon={CalendarDays} label={t("vendor.bookings.eventDate")} value={fmtDate(b.event_date)} />
                  <Stat icon={Users} label={t("vendor.bookings.guests")} value={String(b.guest_count ?? 0)} />
                  <Stat label={t("vendor.bookings.amount")} value={`${fmtNumber(Number(b.total_price ?? 0))} ${t("common.currency")}`} highlight />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setOpenId(isOpen ? null : b.id)}
                    className="rounded-full text-foreground/70 hover:bg-secondary">
                    <ChevronDown className={`me-1 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    {isOpen ? t("vendor.bookings.hideDetails", "إخفاء التفاصيل") : t("vendor.bookings.viewDetails", "عرض التفاصيل")}
                  </Button>
                  {b.status === "pending" && (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => setStatus(b.id, "confirmed")} disabled={acting === b.id}
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Check className="me-1 h-4 w-4" /> {t("vendor.bookings.accept")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "rejected")} disabled={acting === b.id}
                        className="rounded-full text-destructive hover:bg-destructive/10">
                        <X className="me-1 h-4 w-4" /> {t("vendor.bookings.reject")}
                      </Button>
                    </div>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3 rounded-xl border border-border bg-secondary/30 p-4 text-xs">
                        {b.event && (
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {b.event.city && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                <span className="text-foreground/70">{b.event.city}</span>
                              </div>
                            )}
                            {b.event.theme && (
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <span className="text-foreground/70">{b.event.theme}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {b.package && (
                          <div>
                            <div className="mb-2 flex items-center gap-2 font-arabic text-[11px] font-semibold uppercase tracking-wider text-primary">
                              <ListChecks className="h-3.5 w-3.5" />
                              {t("vendor.bookings.servicesIncluded", "الخدمات المختارة من العميل")}
                            </div>
                            {b.package.description && (
                              <p className="mb-2 text-foreground/75">{b.package.description}</p>
                            )}
                            {b.package.includes && b.package.includes.length > 0 && (
                              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                                {b.package.includes.map((it, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-foreground/80">
                                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                                    <span>{it}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        {(b.notes || b.event?.notes) && (
                          <div>
                            <div className="mb-1 font-arabic text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
                              {t("vendor.bookings.customerNotes", "ملاحظات العميل")}
                            </div>
                            <p className="rounded-lg bg-background p-2 text-foreground/80">
                              {b.notes || b.event?.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, highlight }: { icon?: typeof CalendarDays; label: string; value: string; highlight?: boolean }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-foreground/50 inline-flex items-center gap-1">
      {Icon && <Icon className="h-3 w-3" />}{label}
    </div>
    <div className={`font-arabic ${highlight ? "font-semibold text-primary" : "font-medium text-foreground"}`}>{value}</div>
  </div>
);

const badgeFor = (s: string) => {
  if (s === "confirmed") return "bg-primary/15 text-primary";
  if (s === "pending") return "bg-amber-500/15 text-amber-700";
  if (s === "completed") return "bg-emerald-500/15 text-emerald-700";
  return "bg-destructive/15 text-destructive";
};
