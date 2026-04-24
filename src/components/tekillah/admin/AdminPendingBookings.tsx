// ---------------------------------------------------------------------------
// Admin pending bookings tracker
// ---------------------------------------------------------------------------
// Shows every booking sitting in the "pending" state — these are bookings
// the customer already submitted (and possibly paid for) but no vendor has
// accepted yet. Admin can drill into a booking to see the full event scope,
// customer contact, and per-vendor accept/reject status, then nudge the
// vendor manually via WhatsApp/phone.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Loader2, Inbox, Phone, MessageCircle, Package, Sparkles,
  Calendar, Users, ClipboardList, Bell,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/tekillah/EmptyState";
import { fmtDate, fmtNumber } from "@/i18n/format";
import { toast } from "sonner";

interface PendingVendorRow {
  id: string;
  status: string;
  total_price: number | null;
  vendor_id: string;
  package_id: string | null;
  vendor: {
    business_name: string;
    category: string;
    phone: string | null;
    user_id: string;
  } | null;
  package: { name: string } | null;
}

interface PendingEventRow {
  event_id: string | null;
  event_title: string;
  event_date: string;
  city: string | null;
  guest_count: number | null;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  platform_package_id: string | null;
  platform_package_name: string | null;
  // The vendor bookings that share this event
  bookings: PendingVendorRow[];
  total_value: number;
  // True when any booking is paid (paid_amount > 0)
  has_payment: boolean;
}

const formatPhoneForLink = (raw: string | null): string => {
  if (!raw) return "";
  return raw.replace(/[^0-9+]/g, "");
};

export const AdminPendingBookings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<PendingEventRow[]>([]);

  const load = async () => {
    setLoading(true);

    // Pull all pending bookings + their vendor / package / event / customer
    // metadata in one round-trip.
    const { data: rows, error } = await supabase
      .from("bookings")
      .select(`
        id, status, total_price, paid_amount, event_id, vendor_id,
        package_id, platform_package_id, event_date, customer_id,
        vendor:vendors(business_name, category, phone, user_id),
        package:packages(name),
        platform_package:platform_packages(name),
        event:events(title, city, guest_count)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    type RawRow = {
      id: string; status: string; total_price: number | null;
      paid_amount: number | null; event_id: string | null; vendor_id: string;
      package_id: string | null; platform_package_id: string | null;
      event_date: string; customer_id: string;
      vendor: { business_name: string; category: string; phone: string | null; user_id: string } | null;
      package: { name: string } | null;
      platform_package: { name: string } | null;
      event: { title: string; city: string | null; guest_count: number | null } | null;
    };
    const list = (rows ?? []) as unknown as RawRow[];

    // Lookup customer profiles in bulk
    const customerIds = Array.from(new Set(list.map((r) => r.customer_id)));
    const { data: profiles } = customerIds.length
      ? await supabase
          .from("profiles")
          .select("user_id, display_name, phone")
          .in("user_id", customerIds)
      : { data: [] as Array<{ user_id: string; display_name: string | null; phone: string | null }> };
    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.user_id, p]),
    );

    // Group by event_id (or by booking id when there's no event_id)
    const byEvent = new Map<string, PendingEventRow>();
    for (const r of list) {
      const key = r.event_id ?? `solo-${r.id}`;
      const profile = profileMap.get(r.customer_id);
      const existing = byEvent.get(key);
      const bookingRow: PendingVendorRow = {
        id: r.id,
        status: r.status,
        total_price: r.total_price,
        vendor_id: r.vendor_id,
        package_id: r.package_id,
        vendor: r.vendor,
        package: r.package,
      };
      if (existing) {
        existing.bookings.push(bookingRow);
        existing.total_value += Number(r.total_price ?? 0);
        existing.has_payment = existing.has_payment || Number(r.paid_amount ?? 0) > 0;
      } else {
        byEvent.set(key, {
          event_id: r.event_id,
          event_title: r.event?.title ?? t("admin.pending.untitledEvent"),
          event_date: r.event_date,
          city: r.event?.city ?? null,
          guest_count: r.event?.guest_count ?? null,
          customer_id: r.customer_id,
          customer_name: profile?.display_name ?? null,
          customer_phone: profile?.phone ?? null,
          platform_package_id: r.platform_package_id,
          platform_package_name: r.platform_package?.name ?? null,
          bookings: [bookingRow],
          total_value: Number(r.total_price ?? 0),
          has_payment: Number(r.paid_amount ?? 0) > 0,
        });
      }
    }

    setGroups(Array.from(byEvent.values()));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-pending-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remindVendor = async (vendorUserId: string, eventDate: string) => {
    const { error } = await supabase.from("notifications").insert({
      user_id: vendorUserId,
      type: "booking_request",
      title: t("admin.pending.reminderTitle"),
      body: t("admin.pending.reminderBody", { date: fmtDate(eventDate) }),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("admin.pending.reminderSent"));
  };

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={t("admin.pending.empty")}
        description={t("admin.pending.emptyDesc")}
      />
    );
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-600" />
          <h2 className="font-arabic text-sm font-semibold text-foreground">
            {t("admin.pending.title")}
          </h2>
          <Badge className="bg-amber-500/20 text-amber-700">
            {fmtNumber(groups.length)}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-foreground/65">{t("admin.pending.subtitle")}</p>
      </header>

      <div className="space-y-3">
        {groups.map((g) => (
          <PendingCard key={g.event_id ?? g.bookings[0]?.id} group={g} onRemind={remindVendor} />
        ))}
      </div>
    </section>
  );
};

const PendingCard = ({
  group, onRemind,
}: {
  group: PendingEventRow;
  onRemind: (vendorUserId: string, eventDate: string) => void;
}) => {
  const { t } = useTranslation();
  const isPackage = Boolean(group.platform_package_id);

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, rejected: 0 };
    for (const b of group.bookings) {
      if (b.status === "confirmed") counts.confirmed += 1;
      else if (b.status === "rejected") counts.rejected += 1;
      else counts.pending += 1;
    }
    return counts;
  }, [group.bookings]);

  return (
    <article className="rounded-2xl border border-amber-500/30 bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-amber-500/15 text-amber-700">
              {t("admin.pending.statusPending")}
            </Badge>
            <Badge className={isPackage ? "bg-primary/15 text-primary" : "bg-secondary text-foreground/70"}>
              {isPackage ? (
                <><Package className="me-1 inline h-3 w-3" /> {t("admin.pending.typePackage")}</>
              ) : (
                <><Sparkles className="me-1 inline h-3 w-3" /> {t("admin.pending.typeCustom")}</>
              )}
            </Badge>
            {group.has_payment && (
              <Badge className="bg-emerald-500/15 text-emerald-700">
                {t("admin.pending.paid")}
              </Badge>
            )}
          </div>
          <h3 className="mt-2 truncate font-arabic text-sm font-semibold text-foreground">
            {group.event_title}
            {group.platform_package_name && (
              <span className="ms-2 text-xs font-normal text-foreground/60">
                · {group.platform_package_name}
              </span>
            )}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-foreground/60">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {fmtDate(group.event_date)}
            </span>
            {group.guest_count != null && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> {fmtNumber(group.guest_count)}
              </span>
            )}
            {group.city && <span>· {group.city}</span>}
          </div>
        </div>
        <div className="text-end">
          <div className="text-[10px] uppercase tracking-wider text-foreground/50">
            {t("admin.pending.totalValue")}
          </div>
          <div className="font-arabic text-sm font-semibold text-primary">
            {fmtNumber(group.total_value)} {t("common.currency")}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <MiniStat label={t("admin.pending.awaiting")} value={statusCounts.pending} accent="amber" />
        <MiniStat label={t("admin.pending.accepted")} value={statusCounts.confirmed} accent="emerald" />
        <MiniStat label={t("admin.pending.rejected")} value={statusCounts.rejected} accent="muted" />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="rounded-full">
              <ClipboardList className="me-1 h-4 w-4" />
              {t("admin.pending.viewDetails")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-arabic">
                {t("admin.pending.detailsTitle")}
              </DialogTitle>
            </DialogHeader>
            <DetailsBody group={group} onRemind={onRemind} />
          </DialogContent>
        </Dialog>
      </div>
    </article>
  );
};

const MiniStat = ({
  label, value, accent,
}: { label: string; value: number; accent: "amber" | "emerald" | "muted" }) => {
  const cls =
    accent === "amber" ? "border-amber-500/30 bg-amber-500/5 text-amber-700" :
    accent === "emerald" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700" :
    "border-border bg-secondary text-foreground/65";
  return (
    <div className={`rounded-xl border p-2 ${cls}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="font-arabic text-base font-semibold">{fmtNumber(value)}</div>
    </div>
  );
};

const DetailsBody = ({
  group, onRemind,
}: {
  group: PendingEventRow;
  onRemind: (vendorUserId: string, eventDate: string) => void;
}) => {
  const { t } = useTranslation();
  const phoneLink = formatPhoneForLink(group.customer_phone);

  return (
    <div className="space-y-5">
      {/* Customer */}
      <section className="rounded-xl border border-border bg-background p-4">
        <h3 className="mb-2 font-arabic text-sm font-semibold text-foreground">
          {t("admin.pending.customer")}
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-foreground/50">
              {t("admin.pending.customerName")}
            </div>
            <div className="font-arabic font-medium text-foreground">
              {group.customer_name ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-foreground/50">
              {t("admin.pending.customerPhone")}
            </div>
            <div className="font-arabic font-medium text-foreground" dir="ltr">
              {group.customer_phone ?? "—"}
            </div>
          </div>
        </div>
        {phoneLink && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm" variant="outline" asChild
              className="rounded-full"
            >
              <a href={`tel:${phoneLink}`}>
                <Phone className="me-1 h-3 w-3" /> {t("admin.pending.callCustomer")}
              </a>
            </Button>
            <Button
              size="sm" variant="outline" asChild
              className="rounded-full"
            >
              <a
                href={`https://wa.me/${phoneLink.replace(/^\+/, "")}`}
                target="_blank" rel="noreferrer"
              >
                <MessageCircle className="me-1 h-3 w-3" /> {t("admin.pending.whatsappCustomer")}
              </a>
            </Button>
          </div>
        )}
      </section>

      {/* Service list */}
      <section className="rounded-xl border border-border bg-background p-4">
        <h3 className="mb-3 font-arabic text-sm font-semibold text-foreground">
          {t("admin.pending.servicesList")}
        </h3>
        <ul className="space-y-2">
          {group.bookings.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge className={vendorStatusBadge(b.status)}>
                    {t(`admin.pending.vendorStatus.${b.status}`)}
                  </Badge>
                  <span className="font-arabic text-sm font-medium text-foreground">
                    {b.vendor?.business_name ?? "—"}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-foreground/60">
                  {b.vendor?.category ? t(`categories.${b.vendor.category}`) : ""}
                  {b.package?.name ? ` · ${b.package.name}` : ""}
                  {b.total_price != null
                    ? ` · ${fmtNumber(Number(b.total_price))} ${t("common.currency")}`
                    : ""}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {b.vendor?.phone && (
                  <Button
                    size="sm" variant="ghost" asChild
                    className="h-7 rounded-full text-[11px]"
                  >
                    <a href={`tel:${formatPhoneForLink(b.vendor.phone)}`}>
                      <Phone className="me-1 h-3 w-3" />
                      {t("admin.pending.call")}
                    </a>
                  </Button>
                )}
                {b.vendor?.phone && (
                  <Button
                    size="sm" variant="ghost" asChild
                    className="h-7 rounded-full text-[11px]"
                  >
                    <a
                      href={`https://wa.me/${formatPhoneForLink(b.vendor.phone).replace(/^\+/, "")}`}
                      target="_blank" rel="noreferrer"
                    >
                      <MessageCircle className="me-1 h-3 w-3" />
                      WhatsApp
                    </a>
                  </Button>
                )}
                {b.vendor?.user_id && b.status === "pending" && (
                  <Button
                    size="sm" variant="outline"
                    onClick={() => onRemind(b.vendor!.user_id, group.event_date)}
                    className="h-7 rounded-full text-[11px]"
                  >
                    <Bell className="me-1 h-3 w-3" />
                    {t("admin.pending.remind")}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

const vendorStatusBadge = (s: string) => {
  if (s === "confirmed") return "bg-emerald-500/15 text-emerald-700";
  if (s === "rejected" || s === "cancelled") return "bg-destructive/15 text-destructive";
  if (s === "completed") return "bg-primary/15 text-primary";
  return "bg-amber-500/15 text-amber-700";
};
