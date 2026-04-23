import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Plus, Save, Users, Users2, CalendarDays, CalendarRange, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABELS, type VendorRow } from "@/components/tekillah/vendor/types";
import { fmtNumber } from "@/i18n/format";

// Convert Arabic-Indic digits → Western digits, strip non-digits
const sanitizeDigits = (raw: string) => {
  const ar = "٠١٢٣٤٥٦٧٨٩";
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  return raw
    .split("")
    .map((c) => {
      const i = ar.indexOf(c);
      if (i >= 0) return String(i);
      const j = fa.indexOf(c);
      if (j >= 0) return String(j);
      return c;
    })
    .join("")
    .replace(/[^\d]/g, "");
};

const schema = z.object({
  business_name: z.string().trim().min(2).max(120),
  category: z.enum(["hall", "catering", "photography", "dj", "decor", "cars"]),
  city: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  bio: z.string().trim().max(800).optional(),
  weekday_price: z.number().min(1),
  weekend_price: z.number().min(1),
  min_deposit: z.number().min(1),
  men_capacity: z.number().int().min(0).optional().nullable(),
  women_capacity: z.number().int().min(0).optional().nullable(),
});

interface Props {
  adminUserId: string;
  /** Called after successful insert so the parent can refresh stats. */
  onCreated?: () => void;
}

export const AdminAddVendorDialog = ({ adminUserId, onCreated }: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<VendorRow["category"]>("hall");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [weekdayPrice, setWeekdayPrice] = useState<number | "">("");
  const [weekendPrice, setWeekendPrice] = useState<number | "">("");
  const [minDeposit, setMinDeposit] = useState<number | "">("");
  const [menCapacity, setMenCapacity] = useState<number | "">("");
  const [womenCapacity, setWomenCapacity] = useState<number | "">("");

  const isVenue = category === "hall";

  const reset = () => {
    setBusinessName(""); setCategory("hall"); setCity(""); setPhone(""); setBio("");
    setWeekdayPrice(""); setWeekendPrice(""); setMinDeposit("");
    setMenCapacity(""); setWomenCapacity("");
  };

  const handleSave = async () => {
    const parsed = schema.safeParse({
      business_name: businessName,
      category,
      city,
      phone,
      bio,
      weekday_price: Number(weekdayPrice),
      weekend_price: Number(weekendPrice),
      min_deposit: Number(minDeposit),
      men_capacity: isVenue && menCapacity !== "" ? Number(menCapacity) : null,
      women_capacity: isVenue && womenCapacity !== "" ? Number(womenCapacity) : null,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSaving(true);
    const startingPrice = Math.min(Number(weekdayPrice), Number(weekendPrice));
    const payload = {
      user_id: adminUserId,
      business_name: businessName,
      category,
      bio: bio || null,
      city: city || null,
      phone: phone || null,
      daily_capacity: 1,
      starting_price: startingPrice,
      weekday_price: Number(weekdayPrice),
      weekend_price: Number(weekendPrice),
      min_deposit: Number(minDeposit),
      men_capacity: isVenue && menCapacity !== "" ? Number(menCapacity) : null,
      women_capacity: isVenue && womenCapacity !== "" ? Number(womenCapacity) : null,
      portfolio_urls: [],
      // Admin bypass: instantly approved, active and visible publicly
      approval_status: "approved" as const,
      active: true,
      verified: true,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminUserId,
    };

    const { error } = await supabase.from("vendors").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("admin.addVendor.successToast"));
    reset();
    setOpen(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> {t("admin.addVendor.cta")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-arabic text-xl">{t("admin.addVendor.title")}</DialogTitle>
          <DialogDescription className="font-arabic">{t("admin.addVendor.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Basic */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="font-arabic">{t("admin.addVendor.businessName")}</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                placeholder={t("admin.addVendor.businessNamePh") ?? ""} />
            </div>
            <div className="space-y-2">
              <Label className="font-arabic">{t("admin.addVendor.category")}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as VendorRow["category"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-arabic">{t("admin.addVendor.city")}</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("admin.addVendor.cityPh") ?? ""} />
            </div>
            <div className="space-y-2">
              <Label className="font-arabic">{t("admin.addVendor.phone")}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" placeholder="05xxxxxxxx" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="font-arabic">{t("admin.addVendor.bio")}</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
                className="min-h-[80px] font-arabic"
                placeholder={t("admin.addVendor.bioPh") ?? ""} />
            </div>
          </div>

          {/* Pricing — two-column grid */}
          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet className="h-4 w-4 text-primary" /> {t("admin.addVendor.pricingTitle")}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NumField label={t("vendor.profile.weekdayPrice")} icon={CalendarDays} value={weekdayPrice} onChange={setWeekdayPrice} unit={t("common.currency")} />
              <NumField label={t("vendor.profile.weekendPrice")} icon={CalendarRange} value={weekendPrice} onChange={setWeekendPrice} unit={t("common.currency")} />
              <div className="sm:col-span-2">
                <NumField label={t("vendor.profile.minDeposit")} icon={Wallet} value={minDeposit} onChange={setMinDeposit}
                  unit={t("common.currency")} hint={t("vendor.profile.depositHint")} />
              </div>
            </div>
          </div>

          {/* Capacity — halls only */}
          {isVenue && (
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" /> {t("vendor.profile.venueCapacityTitle")}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NumField label={t("vendor.profile.menCapacity")} icon={Users} value={menCapacity} onChange={setMenCapacity} />
                <NumField label={t("vendor.profile.womenCapacity")} icon={Users2} value={womenCapacity} onChange={setWomenCapacity} />
              </div>
            </div>
          )}

          {weekdayPrice && weekendPrice ? (
            <div className="rounded-xl bg-primary/10 p-3 text-center text-xs font-medium text-primary">
              {t("admin.addVendor.previewStart")}{" "}
              <span className="font-arabic text-sm font-semibold" dir="ltr">
                {fmtNumber(Math.min(Number(weekdayPrice), Number(weekendPrice)))}
              </span>{" "}
              {t("common.currency")}
            </div>
          ) : null}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full">
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <Save className="me-1 h-4 w-4" />}
            {t("admin.addVendor.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NumField = ({
  label, value, onChange, icon: Icon, unit, hint,
}: {
  label: string;
  value: number | "";
  onChange: (n: number | "") => void;
  icon: typeof Users;
  unit?: string;
  hint?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 font-arabic text-xs">
      <Icon className="h-3.5 w-3.5 text-primary" /> {label}
    </Label>
    <div className="relative">
      <Input
        inputMode="numeric"
        dir="ltr"
        value={value === "" ? "" : String(value)}
        onChange={(e) => {
          const cleaned = sanitizeDigits(e.target.value);
          onChange(cleaned === "" ? "" : Number(cleaned));
        }}
        className="font-arabic text-end"
        placeholder="0"
      />
      {unit && <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-foreground/50">{unit}</span>}
    </div>
    {hint && <p className="text-[10px] text-foreground/55">{hint}</p>}
  </div>
);
