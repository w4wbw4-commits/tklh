// ---------------------------------------------------------------------------
// ExtraServicesPicker
// ---------------------------------------------------------------------------
// Renders the optional venue add-ons (lighting, buffet, sound system, kosha,
// coordinator, Wi-Fi, parking, etc.) as toggleable chips. Used by both the
// vendor "بياناتي" form and the admin Add/Edit dialogs so vendors and admins
// always see the exact same list of choices.
// ---------------------------------------------------------------------------

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { VENUE_EXTRA_SERVICES } from "./types";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export const ExtraServicesPicker = ({ value, onChange, disabled }: Props) => {
  const toggle = (key: string) => {
    if (disabled) return;
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {VENUE_EXTRA_SERVICES.map((opt) => {
        const active = value.includes(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            disabled={disabled}
            aria-pressed={active}
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-arabic text-xs transition-all",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-card"
                : "border-border bg-background text-foreground/75 hover:border-primary/50 hover:bg-primary/5",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <span
              className={cn(
                "grid h-4 w-4 place-items-center rounded-full border transition-colors",
                active
                  ? "border-primary-foreground/60 bg-primary-foreground/20"
                  : "border-border bg-background",
              )}
            >
              {active && <Check className="h-3 w-3" />}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
