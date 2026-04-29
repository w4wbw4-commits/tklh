// ---------------------------------------------------------------------------
// SmartCombobox — searchable dropdown that also lets the user type a custom
// value if their option isn't in the preset list. Used for cities, regions,
// and districts in vendor onboarding to make data entry faster and cleaner.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SmartOption {
  value: string;        // primary value (Arabic)
  label: string;        // displayed label
  secondary?: string;   // secondary label, e.g. English transliteration
}

interface Props {
  value: string;
  onChange: (next: string) => void;
  /** Optional secondary value (e.g. English) that gets cleared/synced too. */
  secondaryValue?: string;
  onSecondaryChange?: (next: string) => void;
  options: SmartOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Allow free-form custom values not in the preset list. */
  allowCustom?: boolean;
}

export const SmartCombobox = ({
  value,
  onChange,
  secondaryValue,
  onSecondaryChange,
  options,
  placeholder = "اختر…",
  searchPlaceholder = "ابحث أو اكتب قيمة جديدة…",
  emptyText = "لا توجد نتائج",
  allowCustom = true,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = options.filter((o) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      o.label.toLowerCase().includes(q) ||
      o.value.toLowerCase().includes(q) ||
      (o.secondary?.toLowerCase().includes(q) ?? false)
    );
  });

  const exactMatch = options.find(
    (o) => o.value.toLowerCase() === query.trim().toLowerCase(),
  );

  const handlePick = (opt: SmartOption) => {
    onChange(opt.value);
    if (opt.secondary && onSecondaryChange) onSecondaryChange(opt.secondary);
    setOpen(false);
    setQuery("");
  };

  const handleAddCustom = () => {
    const cleaned = query.trim();
    if (!cleaned) return;
    onChange(cleaned);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            autoFocus
          />
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-1">
            {filtered.length === 0 && !allowCustom && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                {emptyText}
              </div>
            )}
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePick(opt)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-start text-sm transition-colors hover:bg-secondary/60"
              >
                <span className="flex flex-col">
                  <span className="font-arabic text-foreground">{opt.label}</span>
                  {opt.secondary && (
                    <span className="text-[11px] text-muted-foreground" dir="ltr">
                      {opt.secondary}
                    </span>
                  )}
                </span>
                {value === opt.value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
            {allowCustom && query.trim() && !exactMatch && (
              <button
                type="button"
                onClick={handleAddCustom}
                className="mt-1 flex w-full items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 px-2.5 py-2 text-start text-sm text-primary transition-colors hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" />
                <span className="font-arabic">
                  استخدم «{query.trim()}»
                </span>
              </button>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
