// ---------------------------------------------------------------------------
// Shared caller authentication for TKLH edge functions.
//
// Every function deploys with verify_jwt = false (signing-keys system), so the
// bearer token MUST be validated in code. This module is the single place that
// does it: it resolves the signed-in user from the Authorization header and
// exposes a service-role client for ownership checks. No client-supplied
// identity is ever trusted.
// ---------------------------------------------------------------------------
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/** Service-role client — used only for server-side ownership lookups. */
export const adminClient = (): SupabaseClient =>
  createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

export type CallerUser = { id: string };

/**
 * Resolves the caller from the Authorization bearer token.
 * Returns null when the header is missing or the token is invalid/expired.
 */
export const getCaller = async (req: Request): Promise<CallerUser | null> => {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  // The publishable/anon key is also sent as a bearer by the JS client for
  // anonymous calls — that is not a user session and must be rejected.
  if (!token || token === ANON_KEY) return null;

  const client = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return null;
  return { id: data.user.id };
};

/** True when the caller holds the admin role (checked server-side in the DB). */
export const isAdmin = async (userId: string): Promise<boolean> => {
  const { data } = await adminClient()
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(data);
};

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Trim + hard length cap for any free text that reaches a PDF or an AI prompt. */
export const safeText = (value: unknown, max: number): string =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
