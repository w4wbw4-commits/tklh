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

// ---------------------------------------------------------------------------
// Partner scope: notifications that belong to the vendor's own services and
// bookings. A user may also hold admin/customer roles, so platform-wide and
// customer-side notices are excluded from the partner portal feed.
// ---------------------------------------------------------------------------

const NON_PARTNER_TITLES = new Set<string>([
  // admin-wide
  "📥 حجز جديد على المنصة",
  "📨 طلب انضمام مزود خدمة جديد",
  "تسجيل جديد في رحلة التخطيط",
  "🚨 بلاغ جودة جديد",
  "🚨 بلاغ طارئ من عميل",
  // customer-side
  "✅ تم استلام طلبك بنجاح",
  "✅ تم استلام الدفعة بنجاح",
  "✅ وصل المزوّد",
]);

export const isPartnerNotification = (n: { title: string }) => !NON_PARTNER_TITLES.has(n.title);

/**
 * Where a partner notification should take you. Titles are the stable signal
 * (the DB triggers write them), so the mapping lives next to the filter above.
 */
export const partnerLinkFor = (n: { type?: string | null; title: string }): string => {
  const t = n.title;
  if (t.includes("تقييم")) return "/partner/reviews";
  if (t.includes("دفعة") || t.includes("تحويل") || t.includes("مالي") || t.includes("فاتورة"))
    return "/partner/reports";
  if (t.includes("عرض") || t.includes("باقة") || t.includes("تسعير")) return "/partner/pricing";
  if (t.includes("ملف") || t.includes("توثيق") || t.includes("اعتماد")) return "/partner/profile";
  if (t.includes("تقويم") || t.includes("تذكير") || t.includes("موعد")) return "/partner/calendar";
  if (n.type === "payment_confirmed") return "/partner/reports";
  if (n.type === "event_reminder") return "/partner/calendar";
  return "/partner/bookings";
};

/** Vendor-only feed for the partner portal. */
export const listForVendorUser = async (userId: string, limit = 50) => {
  const res = await listForUser(userId, limit);
  if (res.error || !res.data) return res;
  return { ...res, data: res.data.filter(isPartnerNotification) };
};

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
