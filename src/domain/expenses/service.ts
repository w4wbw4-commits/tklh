import { db } from "@/domain/client";
import type { Insert, Update } from "@/domain/types";

// ---------------------------------------------------------------------------
// expenses domain — vendor operating expenses / depreciation lines used by the
// partner monthly reports. Owned by the vendor (RLS scoped to vendors.user_id).
// ---------------------------------------------------------------------------

export const listForVendor = (vendorId: string) =>
  db
    .from("vendor_expenses")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("month", { ascending: false })
    .order("created_at", { ascending: false });

export const create = (payload: Insert<"vendor_expenses">) =>
  db.from("vendor_expenses").insert(payload).select("*").single();

export const update = (id: string, patch: Update<"vendor_expenses">) =>
  db.from("vendor_expenses").update(patch).eq("id", id);

export const remove = (id: string) => db.from("vendor_expenses").delete().eq("id", id);
