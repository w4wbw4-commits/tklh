import { db } from "@/domain/client";
import * as authService from "@/domain/auth/service";
import * as storageService from "@/domain/storage/service";
import { phoneToSyntheticEmail } from "@/lib/phone";
import type { Database } from "@/integrations/supabase/types";

// ---------------------------------------------------------------------------
// partner domain — registration, phone+password sign-in, password reset and
// the application record that admin review turns into a vendor account.
//
// Authority stays server-side: the edge function `partner-auth` owns account
// creation and password changes, RLS owns row access, and the vendor role is
// granted only by `approve_vendor_application` (admin-only, SECURITY DEFINER).
// ---------------------------------------------------------------------------

export type ApplicationRow = Database["public"]["Tables"]["vendor_applications"]["Row"];
export type ApplicationInsert = Database["public"]["Tables"]["vendor_applications"]["Insert"];

const invoke = async <T>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await db.functions.invoke("partner-auth", { body });
  if (error) {
    // Edge functions surface the JSON body on non-2xx via context.
    const ctx = (error as { context?: { json?: () => Promise<{ error?: string }> } }).context;
    const parsed = ctx?.json ? await ctx.json().catch(() => null) : null;
    throw new Error(parsed?.error ?? "unexpected_error");
  }
  const payload = data as (T & { error?: string }) | null;
  if (!payload || payload.error) throw new Error(payload?.error ?? "unexpected_error");
  return payload as T;
};

export interface CodeDelivery {
  ok: true;
  /** True only when a real SMS provider accepted the message. */
  delivered: boolean;
  smsConfigured: boolean;
  /** Present only while no SMS provider is connected (development fallback). */
  devCode?: string;
}

export const sendPartnerCode = (phoneE164: string, purpose: "register" | "reset") =>
  invoke<CodeDelivery>({ action: "send-code", phone: phoneE164, purpose });

/** Creates the auth account only. No vendor role, no vendor profile. */
export const registerPartnerAccount = (phoneE164: string, code: string, password: string) =>
  invoke<{ ok: true; userId: string; email: string }>({
    action: "register", phone: phoneE164, code, password,
  });

export const resetPartnerPassword = (phoneE164: string, code: string, password: string) =>
  invoke<{ ok: true; userId: string; email: string }>({
    action: "reset-password", phone: phoneE164, code, password,
  });

/** Phone + password sign-in (phone maps to the account's synthetic email). */
export const signInWithPhonePassword = (phoneE164: string, password: string) =>
  authService.signInWithPassword(phoneToSyntheticEmail(phoneE164), password);

// ---- Application record ---------------------------------------------------

export const submitApplication = (payload: ApplicationInsert) =>
  db.from("vendor_applications").insert(payload).select("id").single();

export const getMyApplication = (userId: string) =>
  db
    .from("vendor_applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

export const updateMyApplication = (id: string, patch: Partial<ApplicationInsert>) =>
  db.from("vendor_applications").update(patch).eq("id", id);

/** Admin-only: creates/links the vendor profile and grants the vendor role. */
export const approveApplication = (applicationId: string) =>
  db.rpc("approve_vendor_application", { _application_id: applicationId });

// ---- Document & media uploads ---------------------------------------------

const ext = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "bin";

/** Private bucket — CR, freelance doc and ID scans are never public. */
export const uploadPrivateDoc = async (userId: string, kind: string, file: File) => {
  const path = `${userId}/${kind}-${Date.now()}.${ext(file)}`;
  const { error } = await storageService.upload("vendor-documents", path, file);
  if (error) throw error;
  return path;
};

/** Public bucket — business photos and portfolio shown to customers. */
export const uploadPortfolioMedia = async (userId: string, file: File) => {
  const path = `${userId}/apply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext(file)}`;
  const { error } = await storageService.upload("vendor-portfolios", path, file);
  if (error) throw error;
  return storageService.publicUrl("vendor-portfolios", path);
};
