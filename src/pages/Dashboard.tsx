import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";
import {
  LogOut,
  LayoutDashboard,
  Map,
  Users,
  Receipt,
  Radio,
  Loader2,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EventOverview } from "@/components/tekillah/customer/EventOverview";
import { EventTimeline } from "@/components/tekillah/customer/EventTimeline";
import { GuestManager } from "@/components/tekillah/customer/GuestManager";
import { EventDayMode } from "@/components/tekillah/customer/EventDayMode";
import { PaymentsPanel } from "@/components/tekillah/customer/PaymentsPanel";
import { CreateEventDialog } from "@/components/tekillah/customer/CreateEventDialog";
import type { EventRow } from "@/components/tekillah/customer/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventRow | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [tab, setTab] = useState("overview");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const loadEvents = async () => {
    if (!user) return;
    setLoadingEvents(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("customer_id", user.id)
      .order("event_date", { ascending: true });
    const list = (data ?? []) as EventRow[];
    setEvents(list);
    setActiveEvent((prev) => list.find((e) => e.id === prev?.id) ?? list[0] ?? null);
    setLoadingEvents(false);
  };

  useEffect(() => {
    if (user) loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading || loadingEvents) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-soft">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden text-xs uppercase tracking-[0.2em] text-primary sm:inline">
              لوحة العميل
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {events.length > 0 && (
              <select
                value={activeEvent?.id ?? ""}
                onChange={(e) =>
                  setActiveEvent(events.find((ev) => ev.id === e.target.value) ?? null)
                }
                className="rounded-full border border-border bg-card px-3 py-2 text-sm text-foreground shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} • {new Date(ev.event_date).toLocaleDateString("ar-SA")}
                  </option>
                ))}
              </select>
            )}
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="me-1 h-4 w-4" /> مناسبة جديدة
            </Button>
            <Button variant="ghost" size="sm" asChild className="rounded-full">
              <Link to="/">الرئيسية</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut().then(() => navigate("/"))}
              className="rounded-full text-destructive hover:bg-destructive/10"
            >
              <LogOut className="me-1 h-4 w-4" /> خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="font-arabic text-3xl font-semibold text-foreground sm:text-4xl">
              {activeEvent ? activeEvent.title : "ابدأ بإنشاء مناسبتك"}
            </h1>
            <p className="mt-2 text-foreground/70">
              {activeEvent
                ? "كل ما تحتاجه لتنظيم ليلتك في مكان واحد."
                : "أنشئ مناسبتك لتظهر هنا لوحة التحكم الكاملة."}
            </p>
          </div>

          {!activeEvent ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-card">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h2 className="font-arabic text-xl font-semibold">لا توجد مناسبات بعد</h2>
              <p className="mt-2 text-sm text-foreground/65">
                أنشئ أول مناسبة لتفتح لك لوحة التحكم الكاملة.
              </p>
              <Button
                onClick={() => setCreateOpen(true)}
                className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="me-1 h-4 w-4" /> أنشئ مناسبة
              </Button>
            </div>
          ) : (
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-card p-1 shadow-card sm:grid-cols-5">
                <TabsTrigger
                  value="overview"
                  className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" /> نظرة عامة
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Map className="h-4 w-4" /> الخط الزمني
                </TabsTrigger>
                <TabsTrigger
                  value="guests"
                  className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Users className="h-4 w-4" /> الضيوف
                </TabsTrigger>
                <TabsTrigger
                  value="payments"
                  className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Receipt className="h-4 w-4" /> الفواتير
                </TabsTrigger>
                <TabsTrigger
                  value="day"
                  className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Radio className="h-4 w-4" /> يوم الحفل
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="overview">
                  <EventOverview event={activeEvent} />
                </TabsContent>
                <TabsContent value="timeline">
                  <EventTimeline event={activeEvent} />
                </TabsContent>
                <TabsContent value="guests">
                  <GuestManager event={activeEvent} />
                </TabsContent>
                <TabsContent value="payments">
                  <PaymentsPanel event={activeEvent} />
                </TabsContent>
                <TabsContent value="day">
                  <EventDayMode event={activeEvent} />
                </TabsContent>
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
