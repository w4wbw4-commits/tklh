import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Eye, EyeOff, CalendarIcon, ShieldCheck, Briefcase, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fmtNumber } from "@/i18n/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmptyState } from "@/components/tekillah/EmptyState";
import { AdminEditVendorDialog } from "./AdminEditVendorDialog";

type Category = "hall" | "catering" | "photography" | "dj" | "decor" | "cars";
const CATEGORIES: Category[] = ["hall", "catering", "photography", "dj", "decor", "cars"];

interface VendorRow {
  id: string;
  business_name: string;
  category: Category;
  city: string | null;
  created_at: string;
  hidden: boolean;
  hidden_until: string | null;
}

// Format a date as DD/MM/YYYY using English numerals (no Arabic-Indic digits).
const fmtEn = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

export const AdminVendorsPanel = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<Category>("hall");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendors")
      .select("id, business_name, category, city, created_at, hidden, hidden_until")
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setVendors((data ?? []) as VendorRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-vendors-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendors" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const grouped = useMemo(() => {
    const map: Record<Category, VendorRow[]> = {
      hall: [], catering: [], photography: [], dj: [], decor: [], cars: [],
    };
    vendors.forEach((v) => map[v.category]?.push(v));
    return map;
  }, [vendors]);

  // Treat as "currently hidden" if flagged hidden AND (no expiry OR expiry in the future).
  const isCurrentlyHidden = (v: VendorRow) =>
    v.hidden && (!v.hidden_until || new Date(v.hidden_until).getTime() > Date.now());

  const setVisibility = async (id: string, payload: { hidden: boolean; hidden_until: string | null }) => {
    const { error } = await supabase.from("vendors").update(payload).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("admin.vendors.visibilityUpdated"));
    await load();
  };

  // Permanently delete a vendor and every record that references them.
  // Order matters: child rows that admin policies allow us to manage must be
  // cleared before the parent vendor row, otherwise FK constraints reject the
  // delete. Any failure is surfaced via toast and aborts the chain.
  const deleteVendor = async (id: string) => {
    const tasks: Array<{ label: string; run: () => Promise<{ error: unknown }> }> = [
      { label: "media",        run: () => supabase.from("vendor_portfolio_items").delete().eq("vendor_id", id) },
      { label: "availability", run: () => supabase.from("vendor_availability").delete().eq("vendor_id", id) },
      { label: "packages",     run: () => supabase.from("packages").delete().eq("vendor_id", id) },
      { label: "bookings",     run: () => supabase.from("bookings").delete().eq("vendor_id", id) },
      { label: "vendor",       run: () => supabase.from("vendors").delete().eq("id", id) },
    ];
    for (const step of tasks) {
      const { error } = await step.run();
      if (error) {
        toast.error(`${step.label}: ${(error as { message?: string })?.message ?? "error"}`);
        throw error;
      }
    }
    toast.success(t("admin.vendors.deleted"));
    await load();
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-arabic text-lg font-semibold text-foreground">
            {t("admin.vendors.title")}
          </h2>
          <p className="mt-1 text-sm text-foreground/65">{t("admin.vendors.subtitle")}</p>
        </div>
        <Badge className="bg-primary/15 text-primary">
          {fmtNumber(vendors.length)} {t("admin.vendors.totalLabel")}
        </Badge>
      </div>

      <Tabs value={activeCat} onValueChange={(v) => setActiveCat(v as Category)}>
        <TabsList className="flex-wrap h-auto rounded-2xl bg-background p-1">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="rounded-xl gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t(`categories.${cat}`)}
              <span className="text-[10px] opacity-70">({fmtNumber(grouped[cat].length)})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-5">
            {loading ? (
              <div className="grid place-items-center p-10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : grouped[cat].length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title={t("admin.vendors.emptyTitle")}
                description={t("admin.vendors.emptyDesc")}
              />
            ) : (
              <ul className="space-y-3">
                {grouped[cat].map((v) => {
                  const hidden = isCurrentlyHidden(v);
                  return (
                    <li
                      key={v.id}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 transition",
                        hidden ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-background",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "grid h-10 w-10 place-items-center rounded-xl",
                          hidden ? "bg-amber-500/15 text-amber-700" : "bg-primary/15 text-primary",
                        )}>
                          {hidden ? <EyeOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-arabic text-sm font-semibold text-foreground">
                            {v.business_name}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-foreground/55">
                            <Badge variant="outline" className="rounded-full font-normal">
                              {t(`categories.${v.category}`)}
                            </Badge>
                            {v.city && <span>· {v.city}</span>}
                            <span>· {t("admin.vendors.joined")} {fmtEn(v.created_at)}</span>
                            {hidden && v.hidden_until && (
                              <Badge className="bg-amber-500/15 text-amber-700">
                                {t("admin.vendors.hiddenUntilLabel")} {fmtEn(v.hidden_until)}
                              </Badge>
                            )}
                            {hidden && !v.hidden_until && (
                              <Badge className="bg-amber-500/15 text-amber-700">
                                {t("admin.vendors.hiddenPermanent")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(v.id)}
                          className="rounded-full"
                        >
                          <Pencil className="me-1.5 h-3.5 w-3.5" />
                          {t("admin.vendors.edit")}
                        </Button>
                        {hidden ? (
                          <Button
                            size="sm"
                            onClick={() => setVisibility(v.id, { hidden: false, hidden_until: null })}
                            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Eye className="me-1.5 h-3.5 w-3.5" />
                            {t("admin.vendors.show")}
                          </Button>
                        ) : (
                          <HideDialog
                            onConfirm={(hu) => setVisibility(v.id, { hidden: true, hidden_until: hu })}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AdminEditVendorDialog
        open={!!editingId}
        onOpenChange={(o) => { if (!o) setEditingId(null); }}
        vendorId={editingId}
        onSaved={load}
      />
    </section>
  );
};

// Modal for choosing how to hide: permanent / by date / by duration.
const HideDialog = ({ onConfirm }: { onConfirm: (hiddenUntilIso: string | null) => void }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"permanent" | "date" | "duration">("permanent");
  const [date, setDate] = useState<Date | undefined>();
  const [duration, setDuration] = useState<"1w" | "2w" | "1m" | "3m">("1w");

  const handleConfirm = () => {
    let until: string | null = null;
    if (mode === "date" && date) {
      until = date.toISOString();
    } else if (mode === "duration") {
      const now = new Date();
      const map = { "1w": 7, "2w": 14, "1m": 30, "3m": 90 } as const;
      now.setDate(now.getDate() + map[duration]);
      until = now.toISOString();
    }
    onConfirm(until);
    setOpen(false);
    // reset
    setMode("permanent"); setDate(undefined); setDuration("1w");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-amber-500/40 text-amber-700 hover:bg-amber-500/10"
        >
          <EyeOff className="me-1.5 h-3.5 w-3.5" />
          {t("admin.vendors.hide")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">{t("admin.vendors.hideDialogTitle")}</DialogTitle>
          <DialogDescription>{t("admin.vendors.hideDialogDesc")}</DialogDescription>
        </DialogHeader>

        <RadioGroup value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3">
            <RadioGroupItem value="permanent" id="hm-p" />
            <Label htmlFor="hm-p" className="flex-1 cursor-pointer font-arabic text-sm">
              {t("admin.vendors.hidePermanent")}
              <p className="mt-0.5 text-[11px] font-normal text-foreground/55">
                {t("admin.vendors.hidePermanentDesc")}
              </p>
            </Label>
          </div>

          <div className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="date" id="hm-d" />
              <Label htmlFor="hm-d" className="flex-1 cursor-pointer font-arabic text-sm">
                {t("admin.vendors.hideByDate")}
                <p className="mt-0.5 text-[11px] font-normal text-foreground/55">
                  {t("admin.vendors.hideByDateDesc")}
                </p>
              </Label>
            </div>
            {mode === "date" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mt-3 w-full justify-start rounded-xl">
                    <CalendarIcon className="me-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : t("admin.vendors.pickDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="duration" id="hm-du" />
              <Label htmlFor="hm-du" className="flex-1 cursor-pointer font-arabic text-sm">
                {t("admin.vendors.hideByDuration")}
                <p className="mt-0.5 text-[11px] font-normal text-foreground/55">
                  {t("admin.vendors.hideByDurationDesc")}
                </p>
              </Label>
            </div>
            {mode === "duration" && (
              <RadioGroup
                value={duration}
                onValueChange={(v) => setDuration(v as typeof duration)}
                className="mt-3 grid grid-cols-2 gap-2"
              >
                {(["1w", "2w", "1m", "3m"] as const).map((d) => (
                  <Label
                    key={d}
                    htmlFor={`du-${d}`}
                    className={cn(
                      "cursor-pointer rounded-xl border p-2.5 text-center font-arabic text-xs transition",
                      duration === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground/70",
                    )}
                  >
                    <RadioGroupItem value={d} id={`du-${d}`} className="sr-only" />
                    {t(`admin.vendors.duration.${d}`)}
                  </Label>
                ))}
              </RadioGroup>
            )}
          </div>
        </RadioGroup>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mode === "date" && !date}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <EyeOff className="me-1.5 h-3.5 w-3.5" />
            {t("admin.vendors.confirmHide")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
