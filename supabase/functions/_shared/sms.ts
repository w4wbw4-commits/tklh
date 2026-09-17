// ---------------------------------------------------------------------------
// SMS delivery — single, isolated integration point.
//
// TKLH has NO SMS provider connected yet. This module is the only place that
// would talk to one, so wiring a real provider later is a change in this file
// and nowhere else.
//
// Contract: `sendSms` NEVER pretends a message was delivered. When no provider
// credentials are present it returns { delivered: false, reason: "no_provider" }
// and the caller must tell the truth to the user.
//
// To connect a provider (e.g. Unifonic / Taqnyat / Twilio), add these secrets
// in Project Settings → Secrets and implement the request below:
//   SMS_PROVIDER          e.g. "unifonic"
//   SMS_PROVIDER_API_KEY  provider API key / token
//   SMS_PROVIDER_SENDER   approved sender name
// ---------------------------------------------------------------------------

export type SmsResult =
  | { delivered: true }
  | { delivered: false; reason: "no_provider" | "provider_error"; detail?: string };

export const smsConfigured = (): boolean =>
  Boolean(Deno.env.get("SMS_PROVIDER") && Deno.env.get("SMS_PROVIDER_API_KEY"));

export const sendSms = async (phoneE164: string, message: string): Promise<SmsResult> => {
  if (!smsConfigured()) {
    console.log(`[sms] no provider configured — message for ${phoneE164} not sent`);
    return { delivered: false, reason: "no_provider" };
  }

  // ---- INTEGRATION POINT --------------------------------------------------
  // Implement the provider request here once credentials exist. Until then the
  // guard above returns early, so this branch is never reached.
  try {
    const endpoint = Deno.env.get("SMS_PROVIDER_ENDPOINT");
    if (!endpoint) return { delivered: false, reason: "no_provider" };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SMS_PROVIDER_API_KEY")}`,
      },
      body: JSON.stringify({
        sender: Deno.env.get("SMS_PROVIDER_SENDER"),
        recipient: phoneE164,
        body: message,
      }),
    });
    if (!res.ok) {
      return { delivered: false, reason: "provider_error", detail: `HTTP ${res.status}` };
    }
    return { delivered: true };
  } catch (error) {
    return { delivered: false, reason: "provider_error", detail: String(error) };
  }
};
