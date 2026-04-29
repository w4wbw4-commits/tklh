// ---------------------------------------------------------------------------
// ServiceTagsInput
// ---------------------------------------------------------------------------
// Manual entry chip/tag input used by ALL vendor categories (venues, catering,
// photography, DJ, decor, cars, …) so each partner can list their unique
// offerings. Type a service name + Enter (or comma) to add it as a removable
// tag. Backspace on an empty input removes the last tag. Saves as text[] in
// `vendors.extra_services`.
// ---------------------------------------------------------------------------

import { useState, type KeyboardEvent } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SuggestionItem {
  value: string;
  /** Optional secondary value (e.g. English) auto-added in parallel. */
  secondary?: string;
}

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Visible above the chips area (e.g. "أمثلة: إضاءة، بوفيه، كوشة"). */
  hint?: string;
  /** Cap the number of tags to keep things sane. */
  maxTags?: number;
  /** Per-tag character cap. */
  maxLength?: number;
  /** Popular preset suggestions shown as one-tap chips above the input. */
  suggestions?: SuggestionItem[];
  /** Callback fired when a suggestion's secondary value should be mirrored
   *  (e.g. into an EN list). When omitted, only the primary list is updated. */
  onSuggestionSecondary?: (secondary: string) => void;
}

const DEFAULT_MAX_TAGS = 30;
const DEFAULT_MAX_LEN = 40;

export const ServiceTagsInput = ({
  value,
  onChange,
  placeholder,
  disabled,
  hint,
  maxTags = DEFAULT_MAX_TAGS,
  maxLength = DEFAULT_MAX_LEN,
  suggestions,
  onSuggestionSecondary,
}: Props) => {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const cleaned = raw.trim().replace(/\s+/g, " ").slice(0, maxLength);
    if (!cleaned) return;
    // Case-insensitive de-dupe so "Lighting" and "lighting" don't both get added.
    const exists = value.some((t) => t.toLowerCase() === cleaned.toLowerCase());
    if (exists) {
      setDraft("");
      return;
    }
    if (value.length >= maxTags) return;
    onChange([...value, cleaned]);
    setDraft("");
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "،") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      e.preventDefault();
      remove(value.length - 1);
    }
  };

  const addSuggestion = (s: SuggestionItem) => {
    const exists = value.some((t) => t.toLowerCase() === s.value.toLowerCase());
    if (exists) return;
    if (value.length >= maxTags) return;
    onChange([...value, s.value]);
    if (s.secondary && onSuggestionSecondary) onSuggestionSecondary(s.secondary);
  };

  const availableSuggestions = (suggestions ?? []).filter(
    (s) => !value.some((t) => t.toLowerCase() === s.value.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      {availableSuggestions.length > 0 && (
        <div className="rounded-xl border border-dashed border-primary/25 bg-primary/[0.03] p-3">
          <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            <span className="font-arabic">خدمات شائعة — اضغط لإضافتها</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableSuggestions.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => addSuggestion(s)}
                disabled={disabled || value.length >= maxTags}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-background px-2.5 py-1 font-arabic text-[11px] text-foreground/80 transition hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />
                {s.value}
              </button>
            ))}
          </div>
        </div>
      )}
      <div

        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background p-2 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {value.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 font-arabic text-xs font-medium text-primary-foreground shadow-card"
          >
            <span className="max-w-[14ch] truncate">{tag}</span>
            <button
              type="button"
              onClick={() => remove(idx)}
              disabled={disabled}
              aria-label={`إزالة ${tag}`}
              className="grid h-4 w-4 place-items-center rounded-full bg-primary-foreground/20 transition hover:bg-primary-foreground/35 disabled:opacity-50"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, maxLength))}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && commit(draft)}
          placeholder={placeholder ?? "اكتب خدمة واضغط Enter"}
          disabled={disabled || value.length >= maxTags}
          className="h-8 min-w-[10ch] flex-1 border-0 bg-transparent p-0 px-1 text-sm shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-foreground/55">
        <span className="font-arabic">
          {hint ?? "اضغط Enter أو الفاصلة لإضافة الخدمة"}
        </span>
        <span className="inline-flex items-center gap-1 tabular-nums" dir="ltr">
          <Plus className="h-3 w-3" />
          {value.length}/{maxTags}
        </span>
      </div>
    </div>
  );
};
