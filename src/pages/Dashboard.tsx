import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";
import {
  LogOut, Map, Users, Receipt, Radio, Loader2, Plus, ListChecks,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EventOverview } from "@/components/tekillah/customer/EventOverview";
import { EventTimeline } from "@/components/tekillah/customer/EventTimeline";
import { BookingsTimeline } from "@/components/tekillah/customer/BookingsTimeline";
import { GuestManager } from "@/components/tekillah/customer/GuestManager";
import { EventDayMode } from "@/components/tekillah/customer/EventDayMode";
import { PaymentsPanel } from "@/components/tekillah/customer/PaymentsPanel";
import { CreateEventDialog } from "@/components/tekillah/customer/CreateEventDialog";
import { EventCommandHeader } from "@/components/tekillah/customer/EventCommandHeader";
import { GuestDashboard } from "@/components/tekillah/customer/GuestDashboard";

import chairMark from "@/assets/tklh-chair-mark.png.asset.json";
import type { EventRow } from "@/components/tekillah/customer/types";
import { useTranslation } from "react-i18next";
import { fmtDate } from "@/i18n/format";
import { clearPendingPlan, isPendingPlanReady, loadPendingPlan } from "@/lib/pendingPlan";
import { finalisePlan } from "@/lib/finalisePlan";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventRow | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [tab, setTab] = useState("overview");
  const [createOpen, setCreateOpen] = useState(false);

  // Visitors are welcome: no redirect — they get the guest dashboard below.




  // ---------------------------------------------------------------------------
  // Recover a pending plan saved by guest wizard before sign-in.
  // Runs once per user — finalises → toast → redirect to checkout.
  // ---------------------------------------------------------------------------
  const consumedPlanRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user || consumedPlanRef.current === user.id) return;
    const snap = loadPendingPlan();
    if (!isPendingPlanReady(snap)) return;
    consumedPlanRef.current = user.id;
    (async () => {
      try {
        const result = await finalisePlan({ userId: user.id, plan: snap, t });
        clearPendingPlan();
        toast.success(t("wizard.planRestored"));
        if (result.bookingIds.length > 0) {
          navigate(`/checkout/${result.bookingIds[0]}`, { replace: true });
        } else {
          await loadEvents();
        }
      } catch {
        // Keep the snapshot so the user can retry — it's their work.
        toast.error(t("wizard.planRestoreFailed"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;
    setLoadingEvents(true);
    const { data } = await supabase
      .from("events").select("*").eq("customer_id", user.id)
      .order("event_date", { ascending: true });
    const list = (data ?? []) as EventRow[];
    setEvents(list);
    setActiveEvent((prev) => list.find((e) => e.id === prev?.id) ?? list[0] ?? null);
    setLoadingEvents(false);
  };

  useEffect(() => { if (user) loadEvents(); else setLoadingEvents(false); /* eslint-disable-next-line */ }, [user]);

  if (authLoading || (user && loadingEvents)) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-soft">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <GuestDashboard />;


  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Logo />
            <span className="hidden truncate text-xs tracking-[0.18em] text-primary/70 md:inline">
              {t("customer.kicker")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {events.length > 0 && (
              <select
                value={activeEvent?.id ?? ""}
                onChange={(e) => setActiveEvent(events.find((ev) => ev.id === e.target.value) ?? null)}
                className="max-w-[9.5rem] truncate rounded-full border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 sm:max-w-none sm:text-sm"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} • {fmtDate(ev.event_date)}
                  </option>
                ))}
              </select>
            )}
            <Button size="sm" onClick={() => setCreateOpen(true)}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 sm:me-1" />
              <span className="hidden sm:inline">{t("customer.newEvent")}</span>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden rounded-full sm:inline-flex">
              <Link to="/">{t("common.home")}</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate("/"))}
              className="rounded-full text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4 sm:me-1" />
              <span className="hidden sm:inline">{t("common.logout")}</span>
            </Button>
          </div>
        </div>
      </header>


      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {!activeEvent ? (
            <div
              className="rounded-3xl p-10 text-center sm:p-14"
              style={{ border: "1px solid hsl(var(--green) / 0.2)", backgroundColor: "hsl(var(--cream))" }}
            >
              <img
                src={chairMark.url}
                alt=""
                aria-hidden
                className="mx-auto mb-5 h-16 w-16 object-contain opacity-30"
                draggable={false}
              />
              <h2 className="font-arabic text-xl font-bold text-primary">{t("customer.noneTitle")}</h2>
              <p className="mt-2 text-sm text-[hsl(var(--brown))]">{t("customer.noneDesc")}</p>
              <Button onClick={() => setCreateOpen(true)} className="mt-6 rounded-full">
                <Plus className="me-1 h-4 w-4" /> {t("customer.createBtn")}
              </Button>
            </div>
          ) : (
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              {/* Command strip always visible — the anchor of the page */}
              <EventCommandHeader
                event={activeEvent}
                userName={
                  (user.user_metadata?.full_name as string | undefined) ??
                  user.email?.split("@")[0] ??
                  null
                }
                onOpenTab={setTab}
              />

              {/* Section switcher: "نظرة عامة" is a real tab like the rest */}
              <div className="sticky top-[4.25rem] z-20 -mx-4 mt-6 bg-background/80 px-4 py-2 backdrop-blur-md sm:mx-0 sm:px-0">
                <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-2xl p-1 sm:grid-cols-6">
                  {[
                    { v: "overview", Icon: LayoutGrid },
                    { v: "timeline", Icon: Map },
                    { v: "bookings", Icon: ListChecks },
                    { v: "guests", Icon: Users },
                    { v: "payments", Icon: Receipt },
                    { v: "day", Icon: Radio },
                  ].map(({ v, Icon }) => (
                    <TabsTrigger
                      key={v}
                      value={v}
                      className="flex-col gap-1 rounded-xl px-1 py-2 text-[11px] sm:flex-row sm:gap-2 sm:text-sm"
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
                      <span className="truncate">{t(`customer.tabs.${v}`)}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="mt-6 sm:mt-8">
                <TabsContent value="overview" className="mt-0"><EventOverview event={activeEvent} /></TabsContent>
                <TabsContent value="timeline" className="mt-0"><EventTimeline event={activeEvent} /></TabsContent>
                <TabsContent value="bookings" className="mt-0"><BookingsTimeline event={activeEvent} /></TabsContent>
                <TabsContent value="guests" className="mt-0"><GuestManager event={activeEvent} /></TabsContent>
                <TabsContent value="payments" className="mt-0"><PaymentsPanel event={activeEvent} /></TabsContent>
                <TabsContent value="day" className="mt-0"><EventDayMode event={activeEvent} /></TabsContent>
              </div>
            </Tabs>
          )}



        </motion.div>
      </main>

      <CreateEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        userId={user.id}
        onCreated={async (id) => {
          await loadEvents();
          const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
          if (data) setActiveEvent(data as EventRow);
        }}
      />
    </div>
  );
};

export default Dashboard;
