// ---------------------------------------------------------------------------
// Server-side phone OTP flow
// ---------------------------------------------------------------------------
// Replaces the previous client-side OTP + deterministic synthetic password.
//   action = "send"   -> generates a 6-digit code, stores ONLY its SHA-256 hash
//                        in `phone_otp_challenges`, DB-backed rate limiting.
//   action = "verify" -> validates the code server-side, consumes the
//                        challenge, provisions/loads the auth user and returns
//                        a freshly generated one-time password so the browser
//                        can establish a session. No secret material (pepper,
//                        deterministic password) exists in the client bundle.
//
// NOTE: SMS delivery is not wired yet. While `PHONE_OTP_DEV_ECHO` is enabled
// the code is echoed back in the response so the flow stays usable; once an SMS
// provider is connected, send the code from here and disable the echo.
// ---------------------------------------------------------------------------
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "966554430196@phone.tekillah.app";
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
  return Array.from(bytes)
    .map((b) => String(b % 10))
    .join("");
};

/** Random, non-deterministic one-time password used only for the immediate sign-in. */
const randomPassword = () => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex}!Tk1`;
};

const phoneToEmail = (phone: string) => `${phone.replace(/\D+/g, "")}${EMAIL_DOMAIN}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Missing backend configuration");

    const body = await req.json().catch(() => null) as
      | { action?: string; phone?: string; code?: string; displayName?: string }
      | null;
    if (!body?.action || !body?.phone) return json({ error: "Missing required fields" }, 400);

    const action = body.action;
    const phone = String(body.phone);

    // Strict Saudi E.164 validation for every action.
    if (!/^\+9665\d{8}$/.test(phone)) return json({ error: "Invalid phone format" }, 400);

    const email = phoneToEmail(phone);
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return json({ error: "Forbidden" }, 403);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // -------------------------------------------------------------- send ----
    if (action === "send") {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from("phone_otp_challenges")
        .select("id", { count: "exact", head: true })
        .eq("phone", phone)
        .gte("created_at", since);

      if ((count ?? 0) >= SEND_LIMIT_PER_HOUR) {
        return json({ error: "Too many attempts, try later" }, 429);
      }

      const code = randomDigits(6);
      const { error } = await admin.from("phone_otp_challenges").insert({
        phone,
        code_hash: await sha256(code),
        expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      });
      if (error) throw error;

      // TODO: send `code` over SMS once a provider is connected.
      const echo = (Deno.env.get("PHONE_OTP_DEV_ECHO") ?? "true") !== "false";
      return json({ ok: true, ...(echo ? { devCode: code } : {}) });
    }

    // ------------------------------------------------------------ verify ----
    if (action !== "verify") return json({ error: "Unknown action" }, 400);
    if (!body.code || !/^\d{6}$/.test(String(body.code))) {
      return json({ error: "Invalid code" }, 400);
    }

    const { data: challenges, error: loadError } = await admin
      .from("phone_otp_challenges")
      .select("id, code_hash, attempts, expires_at, consumed_at")
      .eq("phone", phone)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1);
    if (loadError) throw loadError;

    const challenge = challenges?.[0];
    if (!challenge) return json({ error: "Invalid code" }, 400);
    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      await admin.from("phone_otp_challenges").update({ consumed_at: new Date().toISOString() }).eq("id", challenge.id);
      return json({ error: "Code expired" }, 400);
    }
    if ((challenge.attempts ?? 0) >= MAX_VERIFY_ATTEMPTS) {
      await admin.from("phone_otp_challenges").update({ consumed_at: new Date().toISOString() }).eq("id", challenge.id);
      return json({ error: "Too many attempts, try later" }, 429);
    }

    if ((await sha256(String(body.code))) !== challenge.code_hash) {
      await admin
        .from("phone_otp_challenges")
        .update({ attempts: (challenge.attempts ?? 0) + 1 })
        .eq("id", challenge.id);
      return json({ error: "Invalid code" }, 400);
    }

    // Single-use: consume before provisioning.
    await admin
      .from("phone_otp_challenges")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", challenge.id);

    const password = randomPassword();
    const displayName = body.displayName ?? phone;

    const { data: usersData, error: listError } = await admin.auth.admin.listUsers();
    if (listError) throw listError;
    let user = usersData.users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase()) ?? null;

    if (!user) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone, display_name: displayName },
      });
      if (createError) throw createError;
      user = created.user;
    } else {
      const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(user.id, {
        password,
        ...(user.email_confirmed_at ? {} : { email_confirm: true }),
        user_metadata: { ...(user.user_metadata ?? {}), phone, display_name: displayName },
      });
      if (updateError) throw updateError;
      user = updated.user ?? user;
    }
    if (!user) throw new Error("Unable to prepare auth user");

    await admin.from("profiles").upsert({ user_id: user.id, phone, display_name: displayName }, { onConflict: "user_id" });
    await admin.from("user_roles").upsert({ user_id: user.id, role: "customer" }, { onConflict: "user_id,role" });

    return json({ ok: true, userId: user.id, email, password });
  } catch (error) {
    console.error("phone-otp failed:", error);
    return json({ error: "Unexpected error" }, 500);
  }
});
