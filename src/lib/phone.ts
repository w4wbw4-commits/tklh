// ---------------------------------------------------------------------------
// Phone helpers — Saudi-first OTP flow
// ---------------------------------------------------------------------------
// While we wait for the Twilio connector to be linked, OTPs are generated and
// validated entirely on the client. The same UI, state machine and persistence
// will work once we swap to a real edge-function-backed sender; only the body
// of `sendOtp` and `verifyOtp` will change.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Mock OTP storage — keyed by E.164 phone, expires after 5 minutes.
// Lives in sessionStorage so a page refresh doesn't break the flow.
// In production this entire block is replaced by an edge function call.
// ---------------------------------------------------------------------------
const STORAGE_KEY = "tk.mock_otps";
const OTP_TTL_MS = 5 * 60 * 1000;

interface StoredOtp {
  code: string;
  expiresAt: number;
}

const readStore = (): Record<string, StoredOtp> => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
};

const writeStore = (next: Record<string, StoredOtp>) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

/** Generate a 6-digit OTP, persist it, and return it for dev visibility. */
export const sendOtp = async (phoneE164: string): Promise<string> => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const store = readStore();
  store[phoneE164] = { code, expiresAt: Date.now() + OTP_TTL_MS };
  writeStore(store);
  // Tiny artificial delay so the spinner feels real.
  await new Promise((r) => setTimeout(r, 350));
  return code;
};

/** Returns true if the supplied code matches and hasn't expired. */
export const verifyOtp = (phoneE164: string, code: string): boolean => {
  const store = readStore();
  const entry = store[phoneE164];
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    delete store[phoneE164];
    writeStore(store);
    return false;
  }
  if (entry.code !== code.trim()) return false;
  // Single-use
  delete store[phoneE164];
  writeStore(store);
  return true;
};

// ---------------------------------------------------------------------------
// Phone → Supabase email/password mapping
// ---------------------------------------------------------------------------
// Supabase Auth requires an identifier; with phone-only login we mint a
// deterministic email + password derived from the verified phone number.
// The user never sees these credentials — they only ever enter the OTP.
// ---------------------------------------------------------------------------
const EMAIL_DOMAIN = "phone.tekillah.app";
// Stable pepper. Rotating it would invalidate every existing phone account.
const PASSWORD_PEPPER = "tk-phone-v1";

export const phoneToSyntheticEmail = (phoneE164: string): string => {
  // +9665XXXXXXXX → 9665XXXXXXXX@phone.tekillah.app
  return `${phoneE164.replace(/\D+/g, "")}@${EMAIL_DOMAIN}`;
};

/**
 * Deterministic 24-char password derived from the phone + a fixed pepper.
 * SubtleCrypto SHA-256 → hex, sliced. Stable across sessions and devices,
 * so any verified phone always lands on the same auth.users row.
 */
export const phoneToSyntheticPassword = async (phoneE164: string): Promise<string> => {
  const enc = new TextEncoder().encode(`${PASSWORD_PEPPER}:${phoneE164}`);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // 24 hex chars + a fixed suffix to satisfy the 8-char minimum + complexity.
  return `${hex.slice(0, 24)}!Tk1`;
};
