// ---------------------------------------------------------------------------
// ImageSlot — reserved frame for photography that isn't shot yet. Uses the
// site's corner radius language and a faint thin-line Tklh chair mark so the
// layout reads finished rather than broken.
// ---------------------------------------------------------------------------
import { useTranslation } from "react-i18next";

const ChairMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} aria-hidden="true">
    {/* backrest */}
    <path d="M34 20 C34 14 40 11 50 11 C60 11 66 14 66 20 L66 52" stroke="currentColor" />
    <path d="M34 20 L34 52" stroke="currentColor" />
    <path d="M34 30 H66" stroke="currentColor" />
    <path d="M34 40 H66" stroke="currentColor" />
    {/* seat */}
    <path d="M28 52 H72 L69 62 H31 Z" stroke="currentColor" />
    {/* legs */}
    <path d="M34 62 L32 88" stroke="currentColor" />
    <path d="M66 62 L68 88" stroke="currentColor" />
  </svg>
);

interface ImageSlotProps {
  /** Aspect ratio, e.g. "4/3" or "16/9". */
  ratio?: string;
  className?: string;
  label?: string;
}

export const ImageSlot = ({ ratio = "4/3", className, label }: ImageSlotProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  return (
    <div
      style={{ aspectRatio: ratio }}
      className={`relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[28px] border border-gold/25 bg-cream/50 shadow-card backdrop-blur ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/[0.07] to-transparent" />
      <ChairMark className="relative h-16 w-16 text-gold/45 sm:h-20 sm:w-20" />
      <span className={`relative text-[11px] font-bold text-primary-deep/45 ${isAr ? "font-arabic" : ""}`}>
        {label ?? t("imageSlot.label")}
      </span>
    </div>
  );
};
