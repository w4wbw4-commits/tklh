import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  className?: string;
}

const SIZE_MAP = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-7 w-7" };

export const StarRating = ({ value, onChange, size = "md", readonly, className }: StarRatingProps) => {
  return (
    <div className={cn("inline-flex items-center gap-1", className)} dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const interactive = !readonly && onChange;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange(n)}
            className={cn(
              "transition-transform",
              interactive && "hover:scale-110 cursor-pointer",
              !interactive && "cursor-default",
            )}
            aria-label={`${n} stars`}
          >
            <Star
              className={cn(
                SIZE_MAP[size],
                filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-foreground/30",
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
