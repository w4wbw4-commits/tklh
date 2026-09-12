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

export const listForUserFields = (userId: string, limit = 30) =>
  db
    .from("notifications")
    .select("id, title, body, read, created_at")
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

export const markManyRead = (ids: string[]) =>
  db.from("notifications").update({ read: true }).in("id", ids);

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

/**
 * Subscribe to inserts for one user on a uniquely-named channel (so multiple
 * bells mounted at once — e.g. sidebar + mobile bar — don't collide), passing
 * the inserted row through to the caller.
 */
export const subscribeUnique = <T,>(userId: string, onInsert: (row: T) => void) => {
  const channel = db
    .channel(`admin-bell-${userId}-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      (payload) => onInsert(payload.new as T),
    )
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
};
