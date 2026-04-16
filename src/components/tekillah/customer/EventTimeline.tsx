import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { EventRow, MilestoneRow, MilestoneStatus } from "./types";

export const EventTimeline = ({ event }: { event: EventRow }) => {
  const [items, setItems] = useState<MilestoneRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("timeline_milestones")
      .select("*")
      .eq("event_id", event.id)
      .order("sort_order", { ascending: true });
    setItems((data ?? []) as MilestoneRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  const updateStatus = async (id: string, status: MilestoneStatus) => {
    const { error } = await supabase
      .from("timeline_milestones")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("تعذر التحديث");
      return;
    }
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  const totalDone = items.filter((m) => m.status === "done").length;
  const progress = items.length ? (totalDone / items.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-arabic text-lg font-semibold">خارطة الطريق</h3>
            <p className="text-xs text-foreground/65">
              {totalDone} من {items.length} مهمة مكتملة
            </p>
          </div>
          <div className="font-arabic text-2xl font-bold text-primary">
            {Math.round(progress)}%
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6 }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      <div className="relative space-y-4 ps-8">
        <div className="absolute right-[14px] top-2 bottom-2 w-px bg-border" />
        {items.map((m, i) => {
          const Icon =
            m.status === "done"
              ? CheckCircle2
              : m.status === "in_progress"
              ? Clock
              : Circle;
          const color =
            m.status === "done"
              ? "text-primary bg-primary/10"
              : m.status === "in_progress"
              ? "text-amber-700 bg-amber-100"
              : "text-foreground/55 bg-secondary";
          const dueDate = new Date(m.due_date);
          const daysAway = Math.ceil(
            (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          );

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <div
                className={`absolute -right-8 grid h-7 w-7 place-items-center rounded-full ring-4 ring-background ${color}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-arabic text-sm font-semibold">{m.title}</h4>
                    {m.description && (
                      <p className="mt-1 text-xs text-foreground/65">{m.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-foreground/60">
                      <span>
                        {dueDate.toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {m.status !== "done" && daysAway >= 0 && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-foreground/70">
                          خلال {daysAway} يوماً
                        </span>
                      )}
                      {m.status !== "done" && daysAway < 0 && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">
                          متأخر {Math.abs(daysAway)} يوم
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {m.status !== "done" ? (
                      <>
                        {m.status !== "in_progress" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full text-xs"
                            onClick={() => updateStatus(m.id, "in_progress")}
                          >
                            ابدأ
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="rounded-full bg-primary text-xs text-primary-foreground hover:bg-primary/90"
                          onClick={() => updateStatus(m.id, "done")}
                        >
                          أنجزت ✓
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-xs text-foreground/60"
                        onClick={() => updateStatus(m.id, "pending")}
                      >
                        تراجع
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
