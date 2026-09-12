import { db } from "@/domain/client";

// ---------------------------------------------------------------------------
// Edge Function contracts. Mobile clients call the same endpoints.
// ---------------------------------------------------------------------------

export const invokePhoneOtp = (body: Record<string, unknown>) =>
  db.functions.invoke("phone-otp", { body });

export const invokeGenerateInvoice = (body: Record<string, unknown>) =>
  db.functions.invoke("generate-invoice", { body });

export const invokeGenerateInvitation = (body: Record<string, unknown>) =>
  db.functions.invoke("generate-invitation", { body });
