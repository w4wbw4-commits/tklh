// ---------------------------------------------------------------------------
// Domain layer — single data client.
//
// Every domain service imports the client from here (never from a UI file), so
// swapping the transport later (e.g. an HTTP API in front of the database, or a
// React Native client) is a one-file change.
// ---------------------------------------------------------------------------
export { supabase as db } from "@/integrations/supabase/client";
export type { Database } from "@/integrations/supabase/types";
