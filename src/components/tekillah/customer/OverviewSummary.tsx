import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Building2, UtensilsCrossed, Camera, Music2, Flower2, Car,
  MessageCircle, ArrowRight, CheckCircle2, Circle, Clock, Mail,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { eventsService } from "@/domain";
import { Button } from "@/components/ui/button";
import { fmtNumber, fmtDate } from "@/i18n/format";
import { buildWhatsappLink } from "@/lib/whatsapp";
import type { EventRow } from "./types";

/**
 * OverviewSummary — the "one glance" part of the customer dashboard:
 * a compact timeline, a short vendor summary and the Tklh team card.
 * Every block is a doorway: details live inside their own tab.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const hairline = "1px solid hsl(var(--green) / 0.2)";

const categoryIcons: Record<string, typeof Building2> = {
  hall: Building2, catering: UtensilsCrossed, photography: Camera,
  dj: Music2, decor: Flower2, cars: Car,
};

type Milestone = { id: string; title: string; status: string; due_date: string | null };
type Booking = {
  id: string; status: string; total_price: number | null;
  vendor: { business_name: string; category: string } | null;
};

const statusIcon = (s: string) =>
  s === "done" ? CheckCircle2 : s === "in_progress" ? Clock : Circle;

export const OverviewSummary = ({
  event,
  onOpenTab,
}: {
  event: EventRow;
  onOpenTab: (tab: string) => void;
}) => {
  const { t } = useTranslation();
  const cur = t("common.currency");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    (async () => {
      const [m, b] = await Promise.all([
        eventsService.listMilestoneSummaries(event.id),
        supabase.from("bookings")
          .select("id, status, total_price, vendor:vendors(business_name, category)")
          .eq("event_id", event.id).order("created_at", { ascending: true }),
      ]);
      setMilestones((m.data ?? []) as Milestone[]);
      setBookings((b.data ?? []) as unknown as Booking[]);
    })();
  }, [event.id]);

  // Show the story: the last done step, then what's coming.
  const firstOpen = Math.max(0, milestones.findIndex((x) => x.status !== "done"));
  const slice = milestones.slice(Math.max(0, firstOpen - 1), Math.max(0, firstOpen - 1) + 4);

  const wa = buildWhatsappLink({
    message: t("customer.summary.team.waMessage", { title: event.title }),
  });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
      {/* Mini timeline */}
      <motion.section
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="rounded-3xl p-5 sm:p-6 lg:col-span-2"
        style={{ border: hairline, backgroundColor: "hsl(var(--cream))" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-arabic text-lg font-bold text-primary sm:text-xl">
            {t("customer.summary.timeline.title")}
          </h2>
          <Button size="sm" variant="ghost" className="rounded-full text-xs"
            onClick={() => onOpenTab("timeline")}>
            {t("customer.summary.viewAll")}
            <ArrowRight className="ms-1 h-3.5 w-3.5 rtl:rotate-180" />
          </Button>
        </div>

        {slice.length === 0 ? (
          <p className="mt-4 text-[13.5px] text-[hsl(var(--brown))]">
            {t("customer.summary.timeline.empty")}
          </p>
        ) : (
          <ol className="relative mt-5 space-y-0 ps-6">
            <span className="absolute inset-y-2 start-[7px] w-px"
              style={{ backgroundColor: "hsl(var(--green) / 0.2)" }} aria-hidden />
            {slice.map((m) => {
              const Icon = statusIcon(m.status);
              const done = m.status === "done";
              return (
                <li key={m.id} className="relative py-2.5">
                  <span className="absolute -start-6 top-3 grid h-[15px] w-[15px] place-items-center rounded-full"
                    style={{ backgroundColor: "hsl(var(--cream))" }}>
                    <Icon className="h-[15px] w-[15px]"
                      style={{ color: done ? "hsl(var(--green))" : "hsl(var(--green) / 0.45)" }} />
                  </span>
                  <span className={`block text-[14.5px] font-bold ${done ? "text-primary/55 line-through" : "text-primary"}`}>
                    {m.title}
                  </span>
                  {m.due_date && (
                    <span className="mt-0.5 block text-[12px] text-[hsl(var(--brown))]">
                      {fmtDate(m.due_date)}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </motion.section>

      {/* Tklh team card */}
      <motion.section
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
        className="flex flex-col justify-between rounded-3xl p-5 sm:p-6"
        style={{ border: hairline, backgroundColor: "hsl(var(--green) / 0.04)" }}
      >
        <div>
          <h2 className="font-arabic text-lg font-bold text-primary sm:text-xl">
            {t("customer.summary.team.title")}
          </h2>
          <p className="mt-2 text-[13.5px] leading-[1.9] text-[hsl(var(--brown))]">
            {t("customer.summary.team.desc")}
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <Button asChild className="rounded-full">
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="me-1.5 h-4 w-4" />
              {t("customer.summary.team.cta")}
            </a>
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenTab("guests")}>
            <Mail className="me-1.5 h-4 w-4" />
            {t("customer.summary.team.invites")}
          </Button>
        </div>
      </motion.section>

      {/* Vendors at a glance */}
      <motion.section
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
        className="rounded-3xl p-5 sm:p-6 lg:col-span-3"
        style={{ border: hairline, backgroundColor: "hsl(var(--cream))" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-arabic text-lg font-bold text-primary sm:text-xl">
            {t("customer.summary.vendors.title")}
          </h2>
          <Button size="sm" variant="ghost" className="rounded-full text-xs"
            onClick={() => onOpenTab("bookings")}>
            {t("customer.summary.viewAll")}
            <ArrowRight className="ms-1 h-3.5 w-3.5 rtl:rotate-180" />
          </Button>
        </div>

        {bookings.length === 0 ? (
          <p className="mt-4 text-[13.5px] text-[hsl(var(--brown))]">
            {t("customer.summary.vendors.empty")}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.slice(0, 6).map((b) => {
              const Icon = categoryIcons[b.vendor?.category ?? ""] ?? Building2;
              const confirmed = b.status === "confirmed" || b.status === "completed";
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onOpenTab("bookings")}
                  className="flex min-h-[56px] items-center gap-3 rounded-2xl px-3.5 py-3 text-start transition-colors hover:bg-[hsl(var(--green)/0.05)]"
                  style={{ border: hairline }}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary"
                    style={{ backgroundColor: "hsl(var(--green) / 0.08)" }}>
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold text-primary">
                      {b.vendor?.business_name ?? t("customer.overview.vendorFallback")}
                    </span>
                    <span className="block truncate text-[11.5px] text-[hsl(var(--brown))]">
                      {b.vendor?.category ? t(`categories.${b.vendor.category}`) : t("customer.overview.serviceFallback")}
                      {b.total_price ? ` · ${fmtNumber(Number(b.total_price))} ${cur}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                    style={{
                      backgroundColor: confirmed ? "hsl(var(--green))" : "hsl(var(--green) / 0.1)",
                      color: confirmed ? "hsl(var(--cream))" : "hsl(var(--green))",
                    }}>
                    {t(`customer.bookingStatus.${b.status}`)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </motion.section>
    </div>
  );
};
