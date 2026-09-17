// ---------------------------------------------------------------------------
// Partner authentication — phone + password.
//
//   action = "send-code"      issue a verification code for a phone number
//                             (purpose: "register" | "reset")
//   action = "register"       verify code, create the auth account with the
//                             password the partner chose (NO vendor role yet —
//                             the role is granted only by admin approval)
//   action = "reset-password" verify code, set a new password on an existing
//                             account
//
// The code is stored hashed in `phone_otp_challenges` (single use, 5 min TTL,
// rate limited). Delivery goes through _shared/sms.ts, which has NO provider
// connected: the response then says delivered:false so the UI can be honest,
// and the code is returned only while PHONE_OTP_DEV_ECHO is not "false".
// ---------------------------------------------------------------------------
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { sendSms, smsConfigured } from "../_shared/sms.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL_DOMAIN = "@phone.tekillah.app";
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
const SEND_LIMIT_PER_HOUR = 5;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sha256 = async (value: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const randomDigits = (length: number) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => String(b % 10)).join("");
};

const phoneToEmail = (phone: string) => `${phone.replace(/\D+/g, "")}${EMAIL_DOMAIN}`;

/** Same rule the UI enforces: 8+ chars with at least one letter and one digit. */
const passwordOk = (value: unknown): value is string =>
  typeof value === "string" && value.length >= 8 && value.length <= 72 &&
  /[A-Za-z\u0600-\u06FF]/.test(value) && /\d/.test(value);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Missing backend configuration");

    const body = await req.json().catch(() => null) as {
      action?: string; phone?: string; code?: string; password?: string; purpose?: string;
    } | null;

    if (!body?.action || !body?.phone) return json({ error: "missing_fields" }, 400);
    const phone = String(body.phone);
    if (!/^\+9665\d{8}$/.test(phone)) return json({ error: "invalid_phone" }, 400);

    const email = phoneToEmail(phone);
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const findUser = async () => {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
    };

    // ------------------------------------------------------------ send-code --
    if (body.action === "send-code") {
      const purpose = body.purpose === "reset" ? "reset" : "register";
      const existing = await findUser();
      if (purpose === "register" && existing) return json({ error: "phone_exists" }, 409);
      if (purpose === "reset" && !existing) return json({ error: "no_account" }, 404);

      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from("phone_otp_challenges")
        .select("id", { count: "exact", head: true })
        .eq("phone", phone)
        .gte("created_at", since);
      if ((count ?? 0) >= SEND_LIMIT_PER_HOUR) return json({ error: "rate_limited" }, 429);

      const code = randomDigits(6);
      const { error } = await admin.from("phone_otp_challenges").insert({
        phone,
        code_hash: await sha256(code),
        expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      });
      if (error) throw error;

      const delivery = await sendSms(phone, `رمز تِكله: ${code}`);
      const echo = (Deno.env.get("PHONE_OTP_DEV_ECHO") ?? "true") !== "false";
      return json({
        ok: true,
        delivered: delivery.delivered,
        smsConfigured: smsConfigured(),
        ...(delivery.delivered || !echo ? {} : { devCode: code }),
      });
    }

    // ------------------------------------------- register / reset-password ---
    if (body.action !== "register" && body.action !== "reset-password") {
      return json({ error: "unknown_action" }, 400);
    }
    if (!body.code || !/^\d{6}$/.test(String(body.code))) return json({ error: "invalid_code" }, 400);
    if (!passwordOk(body.password)) return json({ error: "weak_password" }, 400);

    const { data: challenges, error: loadError } = await admin
      .from("phone_otp_challenges")
      .select("id, code_hash, attempts, expires_at")
      .eq("phone", phone)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1);
    if (loadError) throw loadError;

    const challenge = challenges?.[0];
    if (!challenge) return json({ error: "invalid_code" }, 400);
    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      await admin.from("phone_otp_challenges")
        .update({ consumed_at: new Date().toISOString() }).eq("id", challenge.id);
      return json({ error: "code_expired" }, 400);
    }
    if ((challenge.attempts ?? 0) >= MAX_VERIFY_ATTEMPTS) {
      await admin.from("phone_otp_challenges")
        .update({ consumed_at: new Date().toISOString() }).eq("id", challenge.id);
      return json({ error: "rate_limited" }, 429);
    }
    if ((await sha256(String(body.code))) !== challenge.code_hash) {
      await admin.from("phone_otp_challenges")
        .update({ attempts: (challenge.attempts ?? 0) + 1 }).eq("id", challenge.id);
      return json({ error: "invalid_code" }, 400);
    }
    // The challenge is consumed only after the account operation succeeds, so a
    // rejected password does not force the partner to request a new code.
    const consumeChallenge = () =>
      admin.from("phone_otp_challenges")
        .update({ consumed_at: new Date().toISOString() }).eq("id", challenge.id);

    const user = await findUser();

    if (body.action === "register") {
      if (user) return json({ error: "phone_exists" }, 409);
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password: body.password,
        email_confirm: true,
        user_metadata: { phone, display_name: phone },
      });
      if (createError) {
        if ((createError as { code?: string }).code === "weak_password") {
          return json({ error: "pwned_password" }, 400);
        }
        throw createError;
      }
      const newUser = created.user;
      if (!newUser) throw new Error("Unable to create account");
      await admin.from("profiles").upsert(
        { user_id: newUser.id, phone, display_name: phone },
        { onConflict: "user_id" },
      );
      await consumeChallenge();
      // Deliberately NO vendor role here — approval grants it.
      return json({ ok: true, userId: newUser.id, email });
    }

    if (!user) return json({ error: "no_account" }, 404);
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      password: body.password,
      ...(user.email_confirmed_at ? {} : { email_confirm: true }),
    });
    if (updateError) {
      if ((updateError as { code?: string }).code === "weak_password") {
        return json({ error: "pwned_password" }, 400);
      }
      throw updateError;
    }
    await consumeChallenge();
    return json({ ok: true, userId: user.id, email });
  } catch (error) {
    console.error("partner-auth failed:", error);
    return json({ error: "unexpected_error" }, 500);
  }
});
