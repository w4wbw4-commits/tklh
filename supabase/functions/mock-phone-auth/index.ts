import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MockPhoneAuthPayload {
  email: string;
  password: string;
  phone: string;
  displayName?: string;
}

// Hard-block any attempt to provision/overwrite the primary admin account
// or any address outside our synthetic phone-auth domain.
const ADMIN_EMAIL = "966554430196@phone.tekillah.app";
const ALLOWED_EMAIL_DOMAIN = "@phone.tekillah.app";

// Naive in-memory rate limit per phone (resets when isolate restarts).
// Best-effort defense against bulk account provisioning.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const attempts = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (phone: string): boolean => {
  const now = Date.now();
  const entry = attempts.get(phone);
  if (!entry || entry.resetAt < now) {
    attempts.set(phone, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing backend configuration");
    }

    const { email, password, phone, displayName }: MockPhoneAuthPayload = await req.json();
    if (!email || !password || !phone) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Hardening guards ---------------------------------------------------
    // 1. Validate phone shape (Saudi E.164)
    if (!/^\+9665\d{8}$/.test(phone)) {
      return new Response(JSON.stringify({ error: "Invalid phone format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Email must belong to our synthetic domain and match the supplied phone
    const lowerEmail = email.toLowerCase();
    const expectedEmail = `${phone.replace(/\D+/g, "")}${ALLOWED_EMAIL_DOMAIN}`;
    if (!lowerEmail.endsWith(ALLOWED_EMAIL_DOMAIN) || lowerEmail !== expectedEmail) {
      return new Response(JSON.stringify({ error: "Email does not match phone" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Never allow this endpoint to touch the primary admin account.
    if (lowerEmail === ADMIN_EMAIL.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Rate-limit per phone to slow bulk provisioning.
    if (!checkRateLimit(phone)) {
      return new Response(JSON.stringify({ error: "Too many attempts, try later" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // ------------------------------------------------------------------------

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: usersData, error: listError } = await admin.auth.admin.listUsers();
    if (listError) throw listError;

    let user = usersData.users.find((entry) => entry.email?.toLowerCase() === lowerEmail) ?? null;

    if (!user) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone, display_name: displayName ?? phone },
      });
      if (createError) throw createError;
      user = created.user;
    } else {
      // Existing user — make sure email is confirmed and password matches the
      // deterministic synthetic one (covers users created before email_confirm
      // was set, or whose password drifted).
      const needsConfirm = !user.email_confirmed_at;
      const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(user.id, {
        password,
        ...(needsConfirm ? { email_confirm: true } : {}),
        user_metadata: { ...(user.user_metadata ?? {}), phone, display_name: displayName ?? phone },
      });
      if (updateError) throw updateError;
      user = updated.user ?? user;
    }

    if (!user) throw new Error("Unable to prepare mock auth user");

    await admin.from("profiles").upsert({
      user_id: user.id,
      phone,
      display_name: displayName ?? phone,
    }, { onConflict: "user_id" });

    await admin.from("user_roles").upsert({
      user_id: user.id,
      role: "customer",
    }, { onConflict: "user_id,role" });

    return new Response(JSON.stringify({ ok: true, userId: user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
