import { supabase } from "@/integrations/supabase/client";

export const TERMS_VERSION = "1.0";

export type TermsScope = "booking" | "vendor_onboarding";

export const recordTermsAcceptance = async (
  userId: string,
  scope: TermsScope,
  relatedId?: string,
) => {
  try {
    await supabase.from("terms_acceptances" as never).insert({
      user_id: userId,
      scope,
      version: TERMS_VERSION,
      related_id: relatedId ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 400) : null,
    });
  } catch {
    // Non-blocking — legal record is best-effort and shouldn't break flow.
  }
};
