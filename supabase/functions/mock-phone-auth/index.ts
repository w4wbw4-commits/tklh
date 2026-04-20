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

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: usersData, error: listError } = await admin.auth.admin.listUsers();
    if (listError) throw listError;

    let user = usersData.users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase()) ?? null;

    if (!user) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone, display_name: displayName ?? phone },
      });
      if (createError) throw createError;
      user = created.user;
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