import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, BellRing, Check, CalendarCheck, CreditCard, Clock, Inbox } from "lucide-react";
import type { NotificationRow } from "./types";

const TYPE_META: Record<string, { icon: any; color: string }> = {
  booking_request: { icon: CalendarCheck, color: "bg-primary/10 text-primary" },
  booking_confirmed: { icon: Check, color: "bg-primary/15 text-primary" },
  payment_confirmed: { icon: CreditCard, color: "bg-secondary text-foreground" },
  event_reminder: { icon: Clock, color: "bg-accent text-accent-foreground" },
  general: { icon: Bell, color: "bg-secondary text-foreground" },
};

interface Props {
  userId: string;
}

export const VendorNotifications = ({ userId }: Props) => {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(50);
    if (error) toast.error(error.message);
    setItems((data ?? []) as NotificationRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`notif-${userId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        load
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const markAllRead = async () => {
    const ids = items.filter((i) => !i.read).map((i) => i.id);
    if (ids.length === 0) return;
    const { error } = await supabase.from("notifications").update({ read: true }).in("id", ids);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-arabic text-2xl font-semibold text-foreground">
            الإشعارات
            {unread > 0 && (
              <Badge className="bg-primary text-primary-foreground hover:bg-primary">{unread}</Badge>
            )}
          </h2>
          <p className="mt-1 text-sm text-foreground/65">
            طلبات الحجز، التأكيدات، والمدفوعات في مكان واحد.
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={markAllRead} className="rounded-full">
            <Check className="me-1 h-4 w-4" /> تعليم الكل كمقروء
          </Button>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-foreground/50">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox className="h-10 w-10 text-foreground/30" />
            <div className="text-sm text-foreground/55">لا توجد إشعارات بعد</div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.general;
              const Icon = meta.icon;
              return (
                <motion.li key={n.id} layout
                  className={`flex items-start gap-4 p-5 transition-colors ${!n.read ? "bg-primary/[0.03]" : ""}`}>
                  <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-arabic font-semibold text-foreground">{n.title}</div>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    {n.body && <div className="mt-1 text-sm text-foreground/70">{n.body}</div>}
                    <div className="mt-1 text-xs text-foreground/50">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ar })}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
