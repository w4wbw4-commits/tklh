import { db } from "@/domain/client";
import type { Insert } from "@/domain/types";

// ---------------------------------------------------------------------------
// reviews domain — reviews, vendor replies, content reports/moderation.
// Public reads go through SECURITY DEFINER RPCs so reviewer identity stays
// protected, exactly as today.
// ---------------------------------------------------------------------------

export const listForVendor = (vendorId: string) =>
  db.rpc("get_vendor_reviews", { _vendor_id: vendorId });

export const listRepliesForVendor = (vendorId: string) =>
  db.rpc("get_vendor_review_replies", { _vendor_id: vendorId });

export const create = (payload: Insert<"reviews">) =>
  db.from("reviews").insert(payload).select("*").single();

export const reply = (payload: Insert<"review_replies">) =>
  db.from("review_replies").insert(payload).select("*").single();

export const report = (payload: Insert<"content_reports">) =>
  db.from("content_reports").insert(payload).select("*").single();

export const listReports = () =>
  db.from("content_reports").select("*").order("created_at", { ascending: false });

export const resolveReport = (
  id: string,
  status: "approved" | "removed",
  byUserId: string,
) =>
  db
    .from("content_reports")
    .update({ status, resolved_by: byUserId, resolved_at: new Date().toISOString() })
    .eq("id", id);
