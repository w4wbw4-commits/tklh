// ---------------------------------------------------------------------------
// SmartPriceField — flexible price input with:
//   • Numeric input with SAR suffix
//   • +/- steppers (smart step size based on value magnitude)
//   • One-tap preset chips (e.g. 5K, 10K, 25K …)
// Replaces the bare number input so vendors can fill realistic prices fast.
// ---------------------------------------------------------------------------

import { Minus, Plus, Wallet, type LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

const sanitizeDigits = (raw: string) =>
  raw
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[^0-9]/g, "");

const formatCompact = (n: number) => {
  if (n >= 1000) {
    const k = n / 1000;
    return Number.isInteger(k) ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(n);
};

interface Props {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
  icon?: LucideIcon;
  /** Quick-pick presets shown as chips below the input. */
  presets?: number[];
  max?: number;
}

export const SmartPriceField = ({
  id,
  label,
  value,
  onChange,
  hint,
  icon: Icon = Wallet,
  presets = [],
  max = 10_000_000,
}: Props) => {
  // Smart step size: keep arrow steppers useful at all magnitudes.
  const step =
    value >= 50_000 ? 5_000 :
    value >= 10_000 ? 1_000 :
    value >= 1_000  ? 500   :
    value >= 100    ? 50    : 10;

  const set = (n: number) => onChange(Math.max(0, Math.min(max, Math.round(n))));

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </Label>

      <div
        dir="ltr"
        className="flex h-11 items-center overflow-hidden rounded-xl border border-input bg-background transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
      >
        <button
          type="button"
          onClick={() => set(value - step)}
          aria-label="نقص"
          className="grid h-full w-10 place-items-center text-foreground/65 transition hover:bg-secondary/60 hover:text-primary"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          pattern="[0-9]*"
          value={value === 0 ? "" : String(value)}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const cleaned = sanitizeDigits(e.target.value);
            set(cleaned === "" ? 0 : parseInt(cleaned, 10));
          }}
          placeholder="0"
          aria-label={label}
          className="h-full flex-1 bg-transparent px-2 text-center text-base tabular-nums text-foreground outline-none placeholder:text-muted-foreground md:text-sm"
        />
        <button
          type="button"
          onClick={() => set(value + step)}
          aria-label="زيادة"
          className="grid h-full w-10 place-items-center text-foreground/65 transition hover:bg-secondary/60 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
        </button>
        <span className="select-none border-s border-border bg-secondary/60 px-3 text-sm font-medium tabular-nums text-foreground/70 leading-[2.75rem]">
          SAR
        </span>
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => {
            const active = value === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => set(p)}
                className={
                  "rounded-full border px-2.5 py-0.5 text-[11px] tabular-nums transition " +
                  (active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground/70 hover:border-primary/50 hover:text-primary")
                }
              >
                {formatCompact(p)}
              </button>
            );
          })}
        </div>
      )}

      {hint && <p className="text-xs text-foreground/55">{hint}</p>}
    </div>
  );
};
