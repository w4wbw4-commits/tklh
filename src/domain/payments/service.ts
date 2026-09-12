import { db } from "@/domain/client";
import type { Insert } from "@/domain/types";

// ---------------------------------------------------------------------------
// payments domain — payments, platform settings, splits, vendor invoices,
// payout requests. The split is computed by the `compute_payment_split`
// database function so web and mobile always agree on the numbers.
// ---------------------------------------------------------------------------

export const getPublicSettings = () =>
  db.from("platform_settings_public").select("*").maybeSingle();

export const computeSplit = async (amount: number) => {
  const { data, error } = await db.rpc("compute_payment_split", { _amount: amount });
  const row = Array.isArray(data) ? data[0] : data;
  return { split: row ?? null, error };
};

export const create = (payload: Insert<"payments">) =>
  db.from("payments").insert(payload).select("*").single();

export const listAll = () =>
  db.from("payments").select("*").order("created_at", { ascending: false });

export const listForBooking = (bookingId: string) =>
  db.from("payments").select("*").eq("booking_id", bookingId);

export const release = (id: string, byUserId: string) =>
  db
    .from("payments")
    .update({ status: "released", released_at: new Date().toISOString(), released_by: byUserId })
    .eq("id", id);

export const listVendorInvoices = (vendorId: string) =>
  db
    .from("vendor_invoices")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("issue_date", { ascending: false });

export const nextInvoiceNumber = () => db.rpc("generate_vendor_invoice_number");

export const createVendorInvoice = (payload: Insert<"vendor_invoices">) =>
  db.from("vendor_invoices").insert(payload).select("*").single();

export const listPayoutRequests = (vendorId?: string) => {
  const q = db.from("payout_requests").select("*").order("created_at", { ascending: false });
  return vendorId ? q.eq("vendor_id", vendorId) : q;
};
