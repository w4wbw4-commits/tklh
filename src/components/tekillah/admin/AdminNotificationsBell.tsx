import { useEffect, useState } from "react";
import { Bell, Check, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface NotifRow {
  id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}

interface Props {
  /** Called when the admin taps a signup alert, so the console can jump to that tab. */
  onOpenSignups?: () => void;
  className?: string;
}

/**
 * Admin bar bell: live count of unread admin notifications (new planner-journey
 * signups, incidents, vendor applications…) with realtime INSERT updates.
 */
export const AdminNotificationsBell = ({ onOpenSignups, className }: Props) => {
  const { user } = useAuth();
  const [items, setItems] = useState<NotifRow[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setItems((data ?? []) as NotifRow[]);
  };

  useEffect(() => {
    if (!user) return;
    void load();
    // Unique channel per mounted bell (sidebar + mobile bar both render one).
    const ch = supabase
      .channel(`admin-bell-${user.id}-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const row = payload.new as NotifRow;
          toast.info(row.title, { description: row.body ?? undefined });
          void load();
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const unread = items.filter((i) => !i.read).length;

  const markAllRead = async () => {
    const ids = items.filter((i) => !i.read).map((i) => i.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", ids);
    setItems((s) => s.map((i) => ({ ...i, read: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          aria-label="الإشعارات"
          className={`relative text-foreground hover:bg-muted hover:text-foreground ${className ?? ""}`}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-black text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" dir="rtl">
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="font-arabic text-sm font-bold text-foreground">
            الإشعارات
            {unread > 0 && <Badge className="ms-2 bg-primary text-primary-foreground">{unread}</Badge>}
          </span>
          {unread > 0 && (
            <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => void markAllRead()}>
              <Check className="me-1 h-3.5 w-3.5" /> تعليم الكل كمقروء
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <Inbox className="h-8 w-8 text-foreground/25" />
              <span className="font-arabic text-xs text-foreground/55">لا توجد إشعارات</span>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const isSignup = n.title.includes("رحلة التخطيط");
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isSignup && onOpenSignups) { onOpenSignups(); setOpen(false); }
                      }}
                      className={`w-full p-3 text-start transition-colors hover:bg-muted/50 ${!n.read ? "bg-primary/[0.04]" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-arabic text-[13px] font-bold text-foreground">{n.title}</span>
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      {n.body && <div className="mt-0.5 text-[12px] text-foreground/70">{n.body}</div>}
                      <div className="mt-0.5 text-[10px] text-foreground/45">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ar })}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
