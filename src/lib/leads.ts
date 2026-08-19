import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

interface UpsertArgs {
  userId: string;
  phone: string;            // already E.164 +966...
  displayName?: string | null;
  contactEmail?: string | null;
  status?: LeadStatus;
  source?: string;
  eventId?: string | null;
  bookingId?: string | null;
}

/**
 * Upsert a customer lead row keyed by (user_id, phone). Used both at OTP
 * verification (status='verified') and after the wizard completes a booking
 * (status='booked'). Failures are logged but never thrown — lead capture is
 * non-blocking from the user's perspective.
 */
export const upsertCustomerLead = async ({
  userId, phone, displayName, contactEmail, status = "verified", source = "phone_otp",
  eventId = null, bookingId = null,
}: UpsertArgs) => {
  // First try to find an existing lead row for this user+phone
  const { data: existing } = await supabase
    .from("customer_leads")
    .select("id, status")
    .eq("user_id", userId)
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    // Don't downgrade status (e.g. don't move 'booked' back to 'verified')
    const order: LeadStatus[] = ["verified", "planned", "booked", "completed", "lost"];
    const currentRank = order.indexOf(existing.status as LeadStatus);
    const nextRank = order.indexOf(status);
    const finalStatus = nextRank > currentRank ? status : (existing.status as LeadStatus);
    const { error } = await supabase
      .from("customer_leads")
      .update({
        status: finalStatus,
        display_name: displayName ?? undefined,
        contact_email: contactEmail ?? undefined,
        event_id: eventId ?? undefined,
        booking_id: bookingId ?? undefined,
        source,
      })
      .eq("id", existing.id);
    if (error) console.warn("[leads] update failed", error.message);
    return existing.id;
  }

  const { data, error } = await supabase
    .from("customer_leads")
    .insert({
      user_id: userId,
      phone,
      display_name: displayName ?? null,
      contact_email: contactEmail ?? null,
      status,
      source,
      event_id: eventId,
      booking_id: bookingId,
    })
    .select("id")
    .single();
  if (error) {
    console.warn("[leads] insert failed", error.message);
    return null;
  }
  return data.id;
};
