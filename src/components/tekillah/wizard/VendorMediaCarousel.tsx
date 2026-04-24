import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface MediaItem {
  url: string;
  type: "image" | "video";
  caption?: string | null;
}

interface Props {
  items: MediaItem[];
  vendorName: string;
}

/**
 * Compact swipeable media carousel for vendor cards.
 * - Supports images + videos uploaded by the vendor.
 * - LTR/RTL safe arrow navigation (uses logical "previous/next").
 * - Falls back to an elegant placeholder when the vendor has no media yet.
 */
export const VendorMediaCarousel = ({ items, vendorName }: Props) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  if (!items.length) {
    return (
      <div className="relative grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-muted to-primary/5">
        <div className="flex flex-col items-center gap-1.5 text-foreground/45">
          <ImageOff className="h-6 w-6" />
          <span className="font-arabic text-xs">{t("wizard.vendors.noMedia")}</span>
        </div>
      </div>
    );
  }

  const current = items[index];
  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + items.length) % items.length);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
      {current.type === "video" ? (
        <video
          key={current.url}
          src={current.url}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          key={current.url}
          src={current.url}
          alt={current.caption || vendorName}
          loading="lazy"
          className="h-full w-full object-cover transition-opacity duration-300"
        />
      )}

      {items.length > 1 && (
        <>
          {/* Arrows — positioned with logical inset so they auto-mirror in RTL. */}
          <button
            type="button"
            aria-label={t("wizard.vendors.prevMedia")}
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute start-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-soft backdrop-blur transition hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4 rtl:hidden" />
            <ChevronRight className="hidden h-4 w-4 rtl:block" />
          </button>
          <button
            type="button"
            aria-label={t("wizard.vendors.nextMedia")}
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute end-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-soft backdrop-blur transition hover:bg-background"
          >
            <ChevronRight className="h-4 w-4 rtl:hidden" />
            <ChevronLeft className="hidden h-4 w-4 rtl:block" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-primary" : "w-1.5 bg-background/70"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Video badge */}
      {current.type === "video" && (
        <span className="pointer-events-none absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-medium text-primary backdrop-blur">
          <Play className="h-3 w-3" />
          {t("wizard.vendors.video")}
        </span>
      )}
    </div>
  );
};
