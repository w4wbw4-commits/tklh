import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CheckCircle2, Clock, AlertTriangle, Loader2, Building2,
  UtensilsCrossed, Camera, Music2, Flower2, Car, MessageCircle, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { bookingsService, authService } from "@/domain";
import { fmtDate, fmtTime, toLatinDigits } from "@/i18n/format";
import type { EventRow } from "./types";
import { Link } from "react-router-dom";

const categoryIcons: Record<string, typeof Building2> = {
  hall: Building2,
  catering: UtensilsCrossed,
  photography: Camera,
  dj: Music2,
  decor: Flower2,
  cars: Car,
};

type EmergencyKind = "delay" | "cancellation" | "no_show" | "other";

interface BookingItem {
  id: string;
  status: string;
  event_date: string;
  attendance_confirmed_at: string | null;
  vendor_id: string;
  vendor: { business_name: string | null; category: string | null; phone: string | null } | null;
  package: { name: string | null } | null;
}

interface EmergencyRow {
  id: string;
  booking_id: string;
  status: string;
}

const derivedStatus = (b: BookingItem): "pending" | "confirmed" | "arrived" | "completed" | "rejected" | "cancelled" => {
  if (b.status === "completed") return "completed";
  if (b.status === "rejected") return "rejected";
  if (b.status === "cancelled") return "cancelled";
  if (b.attendance_confirmed_at) return "arrived";
  if (b.status === "confirmed") return "confirmed";
  return "pending";
};

const statusBadge = (s: string) => {
  switch (s) {
    case "arrived":
    case "completed":
      return "bg-emerald-500/15 text-emerald-700";
    case "confirmed":
      return "bg-primary/15 text-primary";
    case "pending":
      return "bg-amber-500/15 text-amber-700";
    default:
      return "bg-destructive/15 text-destructive";
  }
};

export const BookingsTimeline = ({ event }: { event: EventRow }) => {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<BookingItem[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogBooking, setDialogBooking] = useState<BookingItem | null>(null);
  const [kind, setKind] = useState<EmergencyKind>("delay");
  const [details, setDetails] = useState("");
  const [needsReplacement, setNeedsReplacement] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: bookings }, { data: ers }] = await Promise.all([
      bookingsService.listTimelineForEvent(event.id),
      supabase
        .from("emergency_requests")
        .select("id, booking_id, status")
        .eq("event_id", event.id),
    ]);
    setItems((bookings ?? []) as unknown as BookingItem[]);
    setEmergencies((ers ?? []) as EmergencyRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`bookings-timeline-${event.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `event_id=eq.${event.id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_requests", filter: `event_id=eq.${event.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  const openEmergencies = useMemo(
    () => new Set(emergencies.filter((e) => e.status !== "resolved").map((e) => e.booking_id)),
    [emergencies],
  );

  const openDialog = (b: BookingItem) => {
    if (openEmergencies.has(b.id)) {
      toast.info(t("customer.bookingsTimeline.alreadyOpen"));
      return;
    }
    setDialogBooking(b);
    setKind("delay");
    setDetails("");
    setNeedsReplacement(false);
  };

  const submitReport = async () => {
    if (!dialogBooking) return;
    setSubmitting(true);
    const { data: auth } = await authService.getUser();
    if (!auth?.user) { setSubmitting(false); return; }
    const { error } = await supabase.from("emergency_requests").insert({
      customer_id: auth.user.id,
      booking_id: dialogBooking.id,
      vendor_id: dialogBooking.vendor_id,
      event_id: event.id,
      kind,
      details: details.trim() || null,
      needs_replacement: needsReplacement,
    });
    setSubmitting(false);
    if (error) { toast.error(t("customer.bookingsTimeline.submitFailed")); return; }
    toast.success(t("customer.bookingsTimeline.submitted"));
    setDialogBooking(null);
    load();
  };

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h3 className="font-arabic text-lg font-semibold">{t("customer.bookingsTimeline.title")}</h3>
        <p className="mt-1 text-xs text-foreground/65">{t("customer.bookingsTimeline.subtitle")}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-foreground/60">
          {t("customer.bookingsTimeline.empty")}
        </div>
      ) : (
        <div className="relative space-y-4 ps-8">
          <div className="absolute end-[14px] top-2 bottom-2 w-px bg-border" />
          {items.map((b, i) => {
            const status = derivedStatus(b);
            const Icon = categoryIcons[b.vendor?.category ?? ""] ?? Building2;
            const StatusIcon = status === "arrived" || status === "completed"
              ? CheckCircle2
              : status === "confirmed"
              ? Clock
              : status === "pending"
              ? Clock
              : AlertTriangle;
            const dotClass = status === "arrived" || status === "completed"
              ? "text-emerald-700 bg-emerald-100"
              : status === "confirmed"
              ? "text-primary bg-primary/10"
              : status === "pending"
              ? "text-amber-700 bg-amber-100"
              : "text-destructive bg-destructive/10";

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <div className={`absolute -end-8 grid h-7 w-7 place-items-center rounded-full ring-4 ring-background ${dotClass}`}>
                  <StatusIcon className="h-4 w-4" />
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </div>
                      <div>
                        <h4 className="font-arabic text-sm font-semibold text-foreground">
                          {b.vendor?.business_name ?? "—"}
                        </h4>
                        <div className="mt-0.5 text-[11px] text-foreground/60">
                          {b.package?.name ?? "—"} • {fmtDate(b.event_date)}
                        </div>
                        {b.attendance_confirmed_at && (
                          <div className="mt-1 text-[11px] text-emerald-700">
                            {t("customer.bookingsTimeline.arrivedAt", {
                              time: fmtTime(b.attendance_confirmed_at),
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={statusBadge(status)}>
                      {t(`customer.bookingsTimeline.status.${status}`)}
                    </Badge>
                  </div>
                  {(status === "confirmed" || status === "pending") && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(b)}
                        className="rounded-full text-destructive hover:bg-destructive/10"
                      >
                        <AlertTriangle className="me-1 h-4 w-4" />
                        {t("customer.bookingsTimeline.reportTrigger")}
                      </Button>
                      {b.vendor?.phone && (
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="rounded-full text-foreground/70"
                        >
                          <a href={`tel:${toLatinDigits(b.vendor.phone)}`}>
                            <Phone className="me-1 h-4 w-4" />
                            {toLatinDigits(b.vendor.phone)}
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={!!dialogBooking} onOpenChange={(v) => !v && setDialogBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-arabic">{t("customer.bookingsTimeline.reportTitle")}</DialogTitle>
            <DialogDescription>{t("customer.bookingsTimeline.reportDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="font-arabic text-sm">{t("customer.bookingsTimeline.kindLabel")}</Label>
              <RadioGroup value={kind} onValueChange={(v) => setKind(v as EmergencyKind)} className="mt-2 grid grid-cols-2 gap-2">
                {(["delay", "cancellation", "no_show", "other"] as EmergencyKind[]).map((k) => (
                  <label
                    key={k}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm hover:bg-secondary"
                  >
                    <RadioGroupItem value={k} />
                    <span className="font-arabic">{t(`customer.bookingsTimeline.kind.${k}`)}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="emergency-details" className="font-arabic text-sm">
                {t("customer.bookingsTimeline.detailsLabel")}
              </Label>
              <Textarea
                id="emergency-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t("customer.bookingsTimeline.detailsPlaceholder")}
                className="mt-2 min-h-[88px]"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3">
              <Checkbox checked={needsReplacement} onCheckedChange={(v) => setNeedsReplacement(!!v)} className="mt-0.5" />
              <span className="font-arabic text-sm">{t("customer.bookingsTimeline.needReplacement")}</span>
            </label>

            <Button
              variant="ghost"
              asChild
              className="w-full justify-start rounded-xl text-sm text-foreground/75 hover:text-primary"
            >
              <Link to="/planner">
                <MessageCircle className="me-2 h-4 w-4" />
                {t("customer.bookingsTimeline.contactSupport")}
              </Link>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogBooking(null)} className="rounded-full">
              {t("common.cancel")}
            </Button>
            <Button
              onClick={submitReport}
              disabled={submitting}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
              {t("customer.bookingsTimeline.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
