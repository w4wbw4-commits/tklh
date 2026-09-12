// ---------------------------------------------------------------------------
// WhatsApp link helpers
// ---------------------------------------------------------------------------
// Centralised so the platform's WhatsApp number lives in one place. Update the
// `PLATFORM_WHATSAPP_NUMBER` constant (or wire it to an env var) when a real
// concierge line is provisioned.
// ---------------------------------------------------------------------------

// E.164 without the leading "+", per WhatsApp's wa.me spec.
// TODO: replace placeholder with the real Tekillah concierge number.
export const PLATFORM_WHATSAPP_NUMBER = "966564343704";

interface BuildLinkArgs {
  message: string;
  /** Optional override; defaults to platform concierge number. */
  number?: string;
}

export const buildWhatsappLink = ({ message, number = PLATFORM_WHATSAPP_NUMBER }: BuildLinkArgs): string => {
  const cleaned = number.replace(/\D+/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
};
