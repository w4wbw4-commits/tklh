import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

// Convert Arabic-Indic / Persian digits to Latin and strip non-digits.
const toLatinDigits = (input: string): string =>
  input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[^\d]/g, "");

export const NumberStepper = ({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 10,
  placeholder = "0",
  ariaLabel,
  className,
}: NumberStepperProps) => {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const handleInput = (raw: string) => {
    const cleaned = toLatinDigits(raw);
    if (cleaned === "") {
      onChange(min);
      return;
    }
    onChange(clamp(parseInt(cleaned, 10)));
  };

  const dec = () => onChange(clamp(value - step));
  const inc = () => onChange(clamp(value + step));

  return (
    <div
      dir="ltr"
      className={cn(
        "flex items-center gap-2 rounded-xl border border-input bg-background p-1 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={dec}
        disabled={value <= min}
        aria-label="decrement"
        className="h-9 w-9 shrink-0 rounded-lg text-primary hover:bg-primary/10 disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={String(value)}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={(e) => e.target.select()}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-9 flex-1 border-0 bg-transparent text-center text-lg font-semibold tabular-nums text-primary shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={inc}
        disabled={value >= max}
        aria-label="increment"
        className="h-9 w-9 shrink-0 rounded-lg text-primary hover:bg-primary/10 disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
