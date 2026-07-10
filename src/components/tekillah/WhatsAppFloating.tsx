/**
 * Compact primary CTA — routes users straight to the planning wizard.
 * Localized via i18n (AR/EN).
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const WhatsAppFloating = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const label = t("whatsapp.planNow");

  return (
    <Link
      to="/planner"
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm ring-1 ring-white/60 transition-transform hover:scale-105 active:scale-95"
      style={{ background: "#163726", color: "#A7CAA1" }}
    >
      <span className={isAr ? "font-arabic" : ""}>{label}</span>
    </Link>
  );
};
