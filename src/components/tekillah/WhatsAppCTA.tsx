import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { buildWhatsappLink } from "@/lib/whatsapp";

interface Props {
  /** Plan / event id surfaced in the prefilled message so concierge can look it up. */
  planId?: string;
  /** Optional custom message — overrides the default i18n string when supplied. */
  customMessage?: string;
  className?: string;
}

/**
 * Premium olive-green WhatsApp CTA — used at the end of the planning wizard
 * and anywhere we want to hand the customer over to a human concierge.
 * Avoids the stock bright-green logo so it sits naturally in the brand palette.
 */
export const WhatsAppCTA = ({ planId, customMessage, className }: Props) => {
  const { t } = useTranslation();

  const message =
    customMessage ??
    t("whatsapp.prefilledMessage", { planId: planId ?? "—" });

  return (
    <motion.a
      href={buildWhatsappLink({ message })}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`group inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary px-6 py-3 font-arabic text-sm font-semibold text-primary-foreground shadow-luxury transition-all hover:bg-primary/90 ${className ?? ""}`}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/30">
        <WhatsAppGlyph className="h-4 w-4 text-primary-foreground" />
      </span>
      <span className="text-pretty">{t("whatsapp.cta")}</span>
    </motion.a>
  );
};

/**
 * Single-tone WhatsApp glyph (no green) — currentColor so it inherits the
 * olive palette and stays elegant against the button.
 */
const WhatsAppGlyph = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 32 32"
    fill="currentColor"
    className={className}
  >
    <path d="M16.04 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.6-1.72a12.74 12.74 0 0 0 6.24 1.6h.01c7.06 0 12.8-5.73 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05A12.71 12.71 0 0 0 16.04 3.2Zm0 23.36h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.92 1.02 1.05-3.82-.25-.4a10.61 10.61 0 0 1-1.62-5.65c0-5.86 4.77-10.62 10.63-10.62 2.84 0 5.5 1.11 7.51 3.12a10.55 10.55 0 0 1 3.12 7.51c0 5.86-4.77 10.62-10.62 10.62Zm5.83-7.95c-.32-.16-1.88-.93-2.18-1.04-.29-.11-.5-.16-.7.16-.21.32-.81 1.03-.99 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.7-1.69-.96-2.32-.25-.61-.52-.53-.7-.54l-.6-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.07-1.1 2.6s1.13 3.02 1.29 3.23c.16.21 2.22 3.39 5.39 4.75.75.32 1.34.51 1.8.65.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.37.19-1.51-.08-.13-.29-.21-.61-.37Z"/>
  </svg>
);
