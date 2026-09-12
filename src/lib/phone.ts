// ---------------------------------------------------------------------------
// Phone helpers — Saudi-first OTP flow
// ---------------------------------------------------------------------------
// OTP generation AND verification happen server-side in the `phone-otp` edge
// function. The browser never generates, stores or validates codes, and no
// password-derivation secret ships in the client bundle.
// ---------------------------------------------------------------------------
import { functionsService } from "@/domain";

const SAUDI_DIAL_CODE = "+966";

/** Strip any non-digit, drop a leading 0 or 966, then prepend +966. */
export const normalizeSaudiPhone = (raw: string): string | null => {
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return null;
  let local = digits;
  if (local.startsWith("966")) local = local.slice(3);
  if (local.startsWith("0")) local = local.slice(1);
  // Saudi mobile numbers are 9 digits starting with 5 (5XXXXXXXX)
  if (!/^5\d{8}$/.test(local)) return null;
  return `${SAUDI_DIAL_CODE}${local}`;
};

/** Display the local part as 5X XXX XXXX while typing. */
export const formatSaudiLocal = (raw: string): string => {
  const digits = raw.replace(/\D+/g, "").slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
};

const invokeOtp = async <T>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await functionsService.invokePhoneOtp(body);
  if (error) throw error;
  const payload = data as (T & { error?: string }) | null;
  if (!payload || payload.error) throw new Error(payload?.error ?? "otp_failed");
  return payload as T;
};

/**
 * Ask the server to issue a code. Returns the code only while SMS delivery is
 * not configured (the server decides via `PHONE_OTP_DEV_ECHO`).
 */
export const requestOtp = async (phoneE164: string): Promise<{ devCode?: string }> =>
  invokeOtp<{ ok: true; devCode?: string }>({ action: "send", phone: phoneE164 });

export interface VerifyOtpResult {
  userId: string;
  email: string;
  password: string;
  /** True when the account still lacks a real name or a contact email. */
  needsProfile: boolean;
  displayName: string | null;
  contactEmail: string | null;
}

/**
 * Verify the code server-side. On success the server provisions the account and
 * returns single-use credentials for the immediate sign-in, plus whether the
 * profile (name + email) still has to be collected.
 */
export const verifyOtpAndGetCredentials = async (
  phoneE164: string,
  code: string,
  displayName?: string | null,
  contactEmail?: string | null,
): Promise<VerifyOtpResult> =>
  invokeOtp<{ ok: true } & VerifyOtpResult>({
    action: "verify",
    phone: phoneE164,
    code: code.trim(),
    ...(displayName ? { displayName } : {}),
    ...(contactEmail ? { contactEmail } : {}),
  });


// Synthetic email mapping is not secret — it is derived from the phone number
// and is also validated server-side.
const EMAIL_DOMAIN = "phone.tekillah.app";

export const phoneToSyntheticEmail = (phoneE164: string): string =>
  `${phoneE164.replace(/\D+/g, "")}@${EMAIL_DOMAIN}`;
