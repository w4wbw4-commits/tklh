import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Clock, Trash2, Loader2, Sparkles, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { EventRow, GuestRow, RsvpStatus } from "./types";
import { InvitationDialog } from "./InvitationDialog";
import { useTranslation } from "react-i18next";
import { fmtNumber } from "@/i18n/format";

export const GuestManager = ({ event }: { event: EventRow }) => {
  const { t } = useTranslation();
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [seats, setSeats] = useState("1");
  const [adding, setAdding] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const guestSchema = z.object({
    name: z.string().trim().min(2, t("customer.guests.shortName")).max(80),
    phone: z.string().trim().max(20).optional().or(z.literal("")),
    seats: z.coerce.number().int().min(1).max(20),
  });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("guests").select("*")
      .eq("event_id", event.id).order("created_at", { ascending: false });
    setGuests((data ?? []) as GuestRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [event.id]);

  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = guestSchema.safeParse({ name, phone, seats });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setAdding(true);
    const { error } = await supabase.from("guests").insert({
      event_id: event.id, customer_id: event.customer_id,
      name: parsed.data.name, phone: parsed.data.phone || null, seats: parsed.data.seats,
    });
    setAdding(false);
    if (error) { toast.error(t("customer.guests.addFailed")); return; }
    setName(""); setPhone(""); setSeats("1");
    toast.success(t("customer.guests.added"));
    load();
  };

  const updateRsvp = async (id: string, rsvp_status: RsvpStatus) => {
    const { error } = await supabase.from("guests").update({ rsvp_status }).eq("id", id);
    if (error) { toast.error(t("customer.guests.updateFailed")); return; }
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, rsvp_status } : g)));
  };

  const removeGuest = async (id: string) => {
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (error) { toast.error(t("customer.guests.deleteFailed")); return; }
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const totals = {
    confirmed: guests.filter((g) => g.rsvp_status === "confirmed").length,
    declined: guests.filter((g) => g.rsvp_status === "declined").length,
    pending: guests.filter((g) => g.rsvp_status === "pending").length,
    seats: guests.filter((g) => g.rsvp_status === "confirmed").reduce((s, g) => s + (g.seats ?? 1), 0),
  };

  const rsvpClasses: Record<RsvpStatus, string> = {
    confirmed: "bg-primary/10 text-primary border-primary/20",
    declined: "bg-destructive/10 text-destructive border-destructive/20",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
  };
  const rsvpIcons: Record<RsvpStatus, typeof CheckCircle2> = {
    confirmed: CheckCircle2, declined: XCircle, pending: Clock,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill label={t("customer.guests.stats.confirmed")} value={totals.confirmed} className="bg-primary/10 text-primary" />
        <StatPill label={t("customer.guests.stats.pending")} value={totals.pending} className="bg-amber-50 text-amber-700" />
        <StatPill label={t("customer.guests.stats.declined")} value={totals.declined} className="bg-destructive/10 text-destructive" />
        <StatPill label={t("customer.guests.stats.seats")} value={totals.seats} className="bg-secondary text-foreground" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-arabic text-lg font-semibold">{t("customer.guests.addGuest")}</h3>
          <Button type="button" onClick={() => setInviteOpen(true)}
            className="rounded-full bg-gradient-olive text-primary-foreground hover:opacity-90">
            <Sparkles className="me-1 h-4 w-4" /> {t("customer.guests.designInvite")}
          </Button>
        </div>
        <form onSubmit={addGuest} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("customer.guests.name")} />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("customer.guests.phone")} />
          <Input type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)}
            className="w-24" placeholder={t("customer.guests.seats")} />
          <Button type="submit" disabled={adding}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          </Button>
        </form>
      </div>

      <div>
        <h3 className="mb-3 font-arabic text-lg font-semibold">{t("customer.guests.list")}</h3>
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : guests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-foreground/65">
            {t("customer.guests.empty")}
          </div>
        ) : (
          <div className="space-y-2">
            {guests.map((g, i) => {
              const Icon = rsvpIcons[g.rsvp_status];
              return (
                <motion.div key={g.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card sm:p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary font-arabic text-sm font-semibold text-primary">
                    {g.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-arabic text-sm font-semibold truncate">{g.name}</div>
                    <div className="text-xs text-foreground/60">
                      {g.phone || t("customer.guests.noPhone")} • {t("customer.guests.seatLabel", { count: g.seats ?? 1 })}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${rsvpClasses[g.rsvp_status]}`}>
                    <Icon className="h-3 w-3" /> {t(`customer.guests.rsvp.${g.rsvp_status}`)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-primary hover:bg-primary/10"
                      onClick={() => updateRsvp(g.id, "confirmed")} title={t("customer.guests.rsvp.confirmed")}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-amber-700 hover:bg-amber-100"
                      onClick={() => updateRsvp(g.id, "pending")} title={t("customer.guests.rsvp.pending")}>
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => updateRsvp(g.id, "declined")} title={t("customer.guests.rsvp.declined")}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-foreground/55 hover:bg-secondary"
                      onClick={() => removeGuest(g.id)} title={t("common.delete")}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <InvitationDialog open={inviteOpen} onOpenChange={setInviteOpen} event={event} />
    </div>
  );
};

const StatPill = ({ label, value, className }: { label: string; value: number; className: string }) => (
  <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
    <div className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>{label}</div>
    <div className="mt-2 font-arabic text-2xl font-bold text-foreground">{fmtNumber(value)}</div>
  </div>
);
