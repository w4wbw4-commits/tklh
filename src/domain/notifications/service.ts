import { db } from "@/domain/client";
import type { Insert } from "@/domain/types";

// ---------------------------------------------------------------------------
// notifications domain — reads, mark-as-read, realtime subscription.
// ---------------------------------------------------------------------------

export const listForUser = (userId: string, limit = 50) =>
  db
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

export const countUnread = (userId: string) =>
  db
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

export const markRead = (id: string) =>
  db.from("notifications").update({ read: true }).eq("id", id);

export const markAllRead = (userId: string) =>
  db.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);

export const create = (payload: Insert<"notifications">) =>
  db.from("notifications").insert(payload);

/** Subscribe to inserts for one user. Returns an unsubscribe function. */
export const subscribe = (userId: string, onInsert: () => void) => {
  const channel = db
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      () => onInsert(),
    )
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
};
