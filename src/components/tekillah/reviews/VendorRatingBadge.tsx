import { Star, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { fmtRating, fmtNumber } from "@/i18n/format";

interface Props {
  avg: number;
  count: number;
  /** Show "Top Rated" badge if avg >= 4.7 and count >= 3 */
  showTopBadge?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export const VendorRatingBadge = ({ avg, count, showTopBadge = true, size = "sm", className }: Props) => {
  const { t } = useTranslation();
  const isTop = showTopBadge && avg >= 4.7 && count >= 3;
  const noReviews = count === 0;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5",
        size === "md" && "px-2.5 py-1",
      )}>
        <Star className={cn("fill-amber-400 text-amber-400", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        <span className={cn("font-arabic font-semibold text-amber-700", size === "sm" ? "text-[11px]" : "text-sm")}>
          {noReviews ? t("reviews.new") : fmtRating(avg)}
        </span>
        {!noReviews && (
          <span className={cn("text-foreground/55", size === "sm" ? "text-[10px]" : "text-xs")}>
            ({fmtNumber(count)})
          </span>
        )}
      </div>
      {isTop && (
        <div className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5">
          <Award className={cn("text-primary", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
          <span className={cn("font-arabic font-semibold text-primary", size === "sm" ? "text-[10px]" : "text-xs")}>
            {t("reviews.topRated")}
          </span>
        </div>
      )}
    </div>
  );
};
