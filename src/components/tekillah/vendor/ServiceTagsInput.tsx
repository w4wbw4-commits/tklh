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
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

  return (
    <div className="space-y-2">
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
