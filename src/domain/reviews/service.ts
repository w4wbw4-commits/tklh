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

export const remove = (id: string) =>
  db.from("reviews").delete().eq("id", id);

export const updateFlag = (id: string, flagged: boolean) =>
  db.from("reviews").update({ flagged }).eq("id", id);

export const reply = (payload: Insert<"review_replies">) =>
  db.from("review_replies").insert(payload).select("*").single();

export const updateReply = (id: string, body: string) =>
  db.from("review_replies").update({ body }).eq("id", id).select("*").single();

export const removeReply = (id: string) =>
  db.from("review_replies").delete().eq("id", id);

export const updateReplyFlag = (id: string, flagged: boolean) =>
  db.from("review_replies").update({ flagged }).eq("id", id);

export const report = (payload: Insert<"content_reports">) =>
  db.from("content_reports").insert(payload).select("*").single();

export const listReports = () =>
  db.from("content_reports").select("*").order("created_at", { ascending: false });

export const listPendingReports = () =>
  db
    .from("content_reports")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

export const resolveReport = (
  id: string,
  status: "approved" | "removed",
  byUserId: string,
) =>
  db
    .from("content_reports")
    .update({ status, resolved_by: byUserId, resolved_at: new Date().toISOString() })
    .eq("id", id);

/** Marks a report resolved without recording who resolved it (matches the
 * admin moderation queue's original behaviour). */
export const setReportStatus = (id: string, status: "approved" | "removed") =>
  db
    .from("content_reports")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", id);

/** Subscribe to any change on content_reports (admin moderation queue). */
export const subscribeReports = (onChange: () => void) => {
  const channel = db
    .channel("admin-reports")
    .on("postgres_changes", { event: "*", schema: "public", table: "content_reports" }, onChange)
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
};

// ---- Admin reviews panel -------------------------------------------------

export const listAllForAdmin = () =>
  db
    .from("reviews")
    .select(
      "id, rating, communication, punctuality, quality, comment, created_at, vendor_id, customer_id, vendor:vendors(business_name)",
    )
    .order("created_at", { ascending: false });

export const listRepliesByReviewIds = (reviewIds: string[]) =>
  db
    .from("review_replies")
    .select("id, review_id, body, created_at, updated_at")
    .in("review_id", reviewIds);

// ---- Admin moderation queue hydration -------------------------------------

export const getReviewsByIds = (ids: string[]) =>
  db
    .from("reviews")
    .select("id, comment, vendor:vendors(business_name)")
    .in("id", ids);

/** Matches the moderation queue's original (unfiltered) reply lookup. */
export const listAllReplyBodies = () =>
  db.from("review_replies").select("id, body, vendor_id");

// ---- Vendor ratings summary ------------------------------------------------

export const getRatingsSummary = (vendorId: string) =>
  db
    .from("vendor_ratings_summary" as never)
    .select("*")
    .eq("vendor_id", vendorId)
    .maybeSingle();

// ---- Admin grand-control widget -------------------------------------------

export const listFlaggedReviewsPreview = () =>
  db.from("reviews").select("id, comment").eq("flagged", true).limit(10);

export const listFlaggedRepliesPreview = () =>
  db.from("review_replies").select("id, body").eq("flagged", true).limit(10);

export const listReviewedBookingIds = (bookingIds: string[]) =>
  db.from("reviews").select("booking_id").in("booking_id", bookingIds);
