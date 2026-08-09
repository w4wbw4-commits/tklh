/**
 * WhatsAppFab — the floating concierge button.
 *
 * Pinned to the bottom-left corner on every breakpoint (physically left, not
 * flipped by RTL) so it never lands on top of the primary CTAs, which live in
 * the centre / start of the page. Respects the iPhone safe area.
 */
import { useTranslation } from "react-i18next";
import { buildWhatsappLink } from "@/lib/whatsapp";

const WhatsAppGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.04 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.6-1.72a12.74 12.74 0 0 0 6.24 1.6h.01c7.06 0 12.8-5.73 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05A12.71 12.71 0 0 0 16.04 3.2Zm5.83 16.41c-.32-.16-1.88-.93-2.18-1.04-.29-.11-.5-.16-.7.16-.21.32-.81 1.03-.99 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.7-1.69-.96-2.32-.25-.61-.52-.53-.7-.54l-.6-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.07-1.1 2.6s1.13 3.02 1.29 3.23c.16.21 2.22 3.39 5.39 4.75.75.32 1.34.51 1.8.65.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.37.19-1.51-.08-.13-.29-.21-.61-.37Z" />
  </svg>
);

export const WhatsAppFab = () => {
  const { t } = useTranslation();
  const label = t("whatsapp.cta");

  return (
    <a
      href={buildWhatsappLink({ message: t("whatsapp.prefilledMessage", { planId: "—" }) })}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed z-40 grid h-12 w-12 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
      style={{
        left: "1rem",
        bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        backgroundColor: "hsl(var(--green))",
        color: "hsl(var(--cream))",
        border: "1px solid hsl(var(--gold) / 0.5)",
      }}
    >
      <WhatsAppGlyph className="h-6 w-6" />
    </a>
  );
};
