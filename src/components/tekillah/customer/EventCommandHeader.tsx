import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { eventsService } from "@/domain";
import { Button } from "@/components/ui/button";
import { fmtNumber, fmtDate } from "@/i18n/format";
import chairMark from "/tklh-chair-mark.png";
import type { EventRow } from "./types";

/**
 * EventCommandHeader — the top of the customer dashboard: personal welcome,
 * countdown, readiness ring, four live metrics and the "what needs you now"
 * list. Cream paper + green hairlines, wine used only for the alert accent.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const hairline = "1px solid hsl(var(--green) / 0.2)";
const WINE = "hsl(var(--wine))";

type Counts = {
  guestsTotal: number;
  guestsConfirmed: number;
  bookingsTotal: number;
  bookingsConfirmed: number;
  paid: number;
  total: number;
  milestonesTotal: number;
  milestonesDone: number;
  needs: { id: string; title: string; due: string | null }[];
};

const EMPTY: Counts = {
  guestsTotal: 0, guestsConfirmed: 0, bookingsTotal: 0, bookingsConfirmed: 0,
  paid: 0, total: 0, milestonesTotal: 0, milestonesDone: 0, needs: [],
};

/** Readiness ring — the single most important number on the dashboard. */
const Ring = ({ value, label }: { value: number; label: string }) => {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-24 w-24 shrink-0 place-items-center sm:h-[122px] sm:w-[122px]">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--green) / 0.14)" strokeWidth="5" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--green))" strokeWidth="5"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: 1.1, ease: EASE }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-arabic text-2xl font-bold leading-none text-primary tabular-nums">
          {fmtNumber(value)}%
        </div>
        <div className="mt-1 max-w-[80px] text-[10px] font-bold leading-tight text-primary/60">
          {label}
        </div>
      </div>
    </div>
  );
};

const Metric = ({
  label, value, sub, ratio, alert, seal,
}: {
  label: string; value: string; sub: string; ratio?: number; alert?: boolean; seal?: boolean;
}) => (
  <div
    className="rounded-2xl p-4 sm:p-5"
    style={{
      border: alert ? `1px solid ${WINE}` : hairline,
      backgroundColor: alert ? "hsl(var(--wine) / 0.06)" : "hsl(var(--cream))",
    }}
  >
    <div className="flex items-start justify-between gap-2">
      <span
        className="text-[12px] font-bold tracking-wide"
        style={{ color: alert ? WINE : "hsl(var(--green) / 0.65)" }}
      >
        {label}
      </span>
      {seal && (
        <span
          className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: "hsl(var(--green))", color: "hsl(var(--cream))" }}
        >
          ✓
        </span>
      )}
    </div>
    <div
      className="font-arabic mt-2 text-2xl font-bold tabular-nums sm:text-3xl"
      style={{ color: alert ? WINE : "hsl(var(--green))" }}
    >
      {value}
    </div>
    <div className="mt-1 text-[12px] text-[hsl(var(--brown))]">{sub}</div>
    {typeof ratio === "number" && (
      <div
        className="mt-3 h-[3px] w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "hsl(var(--green) / 0.12)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: alert ? WINE : "hsl(var(--green))" }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(4, ratio * 100))}%` }}
          transition={{ duration: 0.9, ease: EASE }}
        />
      </div>
    )}
  </div>
);

export const EventCommandHeader = ({
  event,
  userName,
  onOpenTab,
}: {
  event: EventRow;
  userName?: string | null;
  onOpenTab: (tab: string) => void;
}) => {
  const { t } = useTranslation();
  const cur = t("common.currency");
  const [c, setC] = useState<Counts>(EMPTY);

  useEffect(() => {
    (async () => {
      const [guests, bookings, milestones] = await Promise.all([
        eventsService.listGuestRsvpStatuses(event.id),
        supabase.from("bookings").select("status, total_price, paid_amount").eq("event_id", event.id),
        eventsService.listMilestoneSummaries(event.id),
      ]);
      const g = guests.data ?? [];
      const b = bookings.data ?? [];
      const m = (milestones.data ?? []) as { id: string; title: string; status: string; due_date: string | null }[];
      setC({
        guestsTotal: g.length || Number(event.guest_count ?? 0),
        guestsConfirmed: g.filter((x) => x.rsvp_status === "confirmed").length,
        bookingsTotal: b.length,
        bookingsConfirmed: b.filter((x) => x.status === "confirmed" || x.status === "completed").length,
        paid: b.reduce((s, x) => s + Number(x.paid_amount ?? 0), 0),
        total: b.reduce((s, x) => s + Number(x.total_price ?? 0), 0) || Number(event.total_budget ?? 0),
        milestonesTotal: m.length,
        milestonesDone: m.filter((x) => x.status === "done").length,
        needs: m.filter((x) => x.status === "in_progress").slice(0, 3)
          .map((x) => ({ id: x.id, title: x.title, due: x.due_date })),
      });
    })();
  }, [event.id, event.guest_count, event.total_budget]);

  const days = useMemo(() => {
    const diff = new Date(event.event_date).getTime() - Date.now();
    return Math.floor(diff / 86_400_000);
  }, [event.event_date]);

  const readiness = useMemo(() => {
    const parts: number[] = [];
    if (c.milestonesTotal) parts.push(c.milestonesDone / c.milestonesTotal);
    if (c.bookingsTotal) parts.push(c.bookingsConfirmed / c.bookingsTotal);
    if (c.total) parts.push(Math.min(1, c.paid / c.total));
    if (c.guestsTotal) parts.push(Math.min(1, c.guestsConfirmed / c.guestsTotal));
    if (!parts.length) return 8;
    return Math.max(4, Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100));
  }, [c]);

  const rest = Math.max(0, c.total - c.paid);

  return (
    <div className="space-y-5">
      {/* Welcome + countdown + readiness */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
        style={{ border: hairline, backgroundColor: "hsl(var(--cream))" }}
      >
        {/* Official chair mark — file only, never redrawn */}
        <img
          src={chairMark}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -top-4 end-2 h-40 w-40 select-none object-contain opacity-[0.05]"
          draggable={false}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/55">
              {t("customer.kicker")}
            </span>
            <h1 className="font-arabic mt-3 text-2xl font-bold leading-snug text-primary sm:text-3xl">
              {userName
                ? t("customer.command.welcome", { name: userName })
                : t("customer.command.welcomeGuest")}
            </h1>
            <p className="mt-2 text-[14.5px] text-[hsl(var(--brown))]">
              {event.title} · {fmtDate(event.event_date)}
              {event.city ? ` · ${event.city}` : ""}
            </p>
            <p className="font-arabic mt-4 text-lg font-bold text-primary sm:text-xl">
              {days > 0
                ? t("customer.command.countdownLabel", { days: fmtNumber(days) })
                : days === 0
                  ? t("customer.command.countdownToday")
                  : t("customer.command.countdownPast")}
            </p>
          </div>
          <Ring value={readiness} label={t("customer.command.readiness")} />
        </div>
      </motion.section>

      {/* Metrics — every tile is a doorway into its own tab */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <button type="button" onClick={() => onOpenTab("guests")} className="text-start">
          <Metric
            label={t("customer.command.metrics.guests")}
            value={`${fmtNumber(c.guestsConfirmed)} / ${fmtNumber(c.guestsTotal)}`}
            sub={t("customer.command.metrics.guestsSub", {
              confirmed: fmtNumber(c.guestsConfirmed), total: fmtNumber(c.guestsTotal),
            })}
            ratio={c.guestsTotal ? c.guestsConfirmed / c.guestsTotal : 0}
          />
        </button>
        <button type="button" onClick={() => onOpenTab("bookings")} className="text-start">
          <Metric
            label={t("customer.command.metrics.bookings")}
            value={`${fmtNumber(c.bookingsConfirmed)} / ${fmtNumber(Math.max(c.bookingsTotal, c.bookingsConfirmed))}`}
            sub={t("customer.command.metrics.bookingsSub", {
              confirmed: fmtNumber(c.bookingsConfirmed), total: fmtNumber(c.bookingsTotal),
            })}
            ratio={c.bookingsTotal ? c.bookingsConfirmed / c.bookingsTotal : 0}
            seal={c.bookingsConfirmed > 0}
          />
        </button>
        <button type="button" onClick={() => onOpenTab("payments")} className="text-start">
          <Metric
            label={t("customer.command.metrics.budget")}
            value={`${fmtNumber(c.paid)} ${cur}`}
            sub={t("customer.command.metrics.budgetSub", { rest: `${fmtNumber(rest)} ${cur}` })}
            ratio={c.total ? c.paid / c.total : 0}
          />
        </button>
        <button type="button" onClick={() => onOpenTab("timeline")} className="text-start">
          <Metric
            label={t("customer.command.metrics.plan")}
            value={`${fmtNumber(c.milestonesDone)} / ${fmtNumber(c.milestonesTotal)}`}
            sub={t("customer.command.metrics.planSub", {
              done: fmtNumber(c.milestonesDone), total: fmtNumber(c.milestonesTotal),
            })}
            ratio={c.milestonesTotal ? c.milestonesDone / c.milestonesTotal : 0}
          />
        </button>
      </div>
    </div>
  );
};

