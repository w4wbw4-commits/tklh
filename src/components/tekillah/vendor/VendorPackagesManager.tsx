import { useEffect, useState } from "react";
import { packagesService, availabilityService } from "@/domain";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Trash2, Tag, Pencil, Images, ArrowUp, ArrowDown, Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { VendorPortfolioManager } from "@/components/tekillah/vendor/VendorPortfolioManager";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

type Tier = "basic" | "premium" | "royal";
type Section = "men" | "women" | "both";

type Pkg = {
  id: string;
  name: string;
  tier: Tier;
  price: number;
  description: string | null;
  includes: string[];
  active: boolean;
  approval_status: string;
  sort_order: number;
  section: Section;
  duration_hours: number | null;
  cancellation_policy: string | null;
  available_days: string[];
  image_url: string | null;
  archived: boolean;
};

type Rule = {
  id: string;
  rule_type: "weekend" | "weekday" | "seasonal";
  label: string | null;
  adjustment_percent: number;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  old_price: number | null;
  offer_price: number | null;
  terms: string | null;
  section: Section;
  available_days: string[];
  image_url: string | null;
};

const TIERS: Record<Tier, string> = { basic: "أساسية", premium: "مميزة", royal: "ملكية" };
const SECTIONS: Record<Section, string> = { both: "القسمين", men: "قسم الرجال", women: "قسم النساء" };
const DAYS: Array<{ key: string; label: string }> = [
  { key: "sun", label: "الأحد" },
  { key: "mon", label: "الاثنين" },
  { key: "tue", label: "الثلاثاء" },
  { key: "wed", label: "الأربعاء" },
  { key: "thu", label: "الخميس" },
  { key: "fri", label: "الجمعة" },
  { key: "sat", label: "السبت" },
];

const APPROVAL: Record<string, string> = {
  pending_approval: "بانتظار مراجعة الإدارة",
  approved: "معتمدة وتظهر للعملاء",
  rejected: "مرفوضة — راجع الملاحظات",
};

const daysLabel = (days: string[]) =>
  days.length === 0 || days.length === 7
    ? "كل الأيام"
    : DAYS.filter((d) => days.includes(d.key)).map((d) => d.label).join("، ");

/** Weekday multi-select shared by the package and offer forms. */
const DayPicker = ({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) => (
  <div className="mt-1.5 flex flex-wrap gap-1.5">
    {DAYS.map((d) => {
      const on = value.includes(d.key);
      return (
        <button
          key={d.key}
          type="button"
          onClick={() => onChange(on ? value.filter((k) => k !== d.key) : [...value, d.key])}
          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
            on ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground"
          }`}
        >
          {d.label}
        </button>
      );
    })}
  </div>
);

type PkgForm = {
  name: string; tier: Tier; price: string; description: string; includes: string;
  section: Section; duration_hours: string; cancellation_policy: string;
  available_days: string[]; image_url: string;
};

const EMPTY_PKG: PkgForm = {
  name: "", tier: "basic", price: "", description: "", includes: "",
  section: "both", duration_hours: "", cancellation_policy: "",
  available_days: [], image_url: "",
};

type OfferForm = {
  label: string; adjustment_percent: string; start_date: string; end_date: string;
  old_price: string; offer_price: string; terms: string; section: Section;
  available_days: string[]; image_url: string;
};

const EMPTY_OFFER: OfferForm = {
  label: "", adjustment_percent: "-10", start_date: "", end_date: "",
  old_price: "", offer_price: "", terms: "", section: "both",
  available_days: [], image_url: "",
};

/**
 * Packages + seasonal offers for one partner. Both live inside the bookings
 * experience so the sidebar stays short.
 */
export const VendorPackagesManager = ({
  vendorId,
  basePrice,
  userId,
}: { vendorId: string; basePrice: number; userId?: string | null }) => {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PkgForm>(EMPTY_PKG);
  const [offer, setOffer] = useState<OfferForm>(EMPTY_OFFER);
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [editForm, setEditForm] = useState<PkgForm>(EMPTY_PKG);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [ruleForm, setRuleForm] = useState<OfferForm>(EMPTY_OFFER);

  const load = async () => {
    const [p, r] = await Promise.all([
      packagesService.listVendorPackages(vendorId),
      availabilityService.listPricingRulesAsc(vendorId),
    ]);
    setPackages(((p.data as unknown) as Pkg[]) || []);
    setRules(((r.data as unknown) as Rule[]) || []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [vendorId]);

  // ---- packages -----------------------------------------------------------

  const pkgPatch = (f: PkgForm) => ({
    name: f.name.trim(),
    tier: f.tier,
    price: parseFloat(f.price),
    description: f.description.trim() || null,
    includes: f.includes.split("\n").map((s) => s.trim()).filter(Boolean),
    section: f.section,
    duration_hours: f.duration_hours ? parseFloat(f.duration_hours) : null,
    cancellation_policy: f.cancellation_policy.trim() || null,
    available_days: f.available_days,
    image_url: f.image_url.trim() || null,
  });

  const validPkg = (f: PkgForm) => {
    if (!f.name.trim()) { toast.error("أدخل اسم الباقة"); return false; }
    const price = parseFloat(f.price);
    if (!price || price <= 0) { toast.error("أدخل سعراً صحيحاً"); return false; }
    if (f.duration_hours && parseFloat(f.duration_hours) <= 0) { toast.error("أدخل مدة صحيحة"); return false; }
    return true;
  };

  const addPackage = async () => {
    if (!validPkg(form)) return;
    setSaving(true);
    const { error } = await packagesService.createVendorPackage({
      vendor_id: vendorId,
      ...pkgPatch(form),
      active: true,
      sort_order: packages.length,
    } as never);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تمت إضافة الباقة — ستظهر للعملاء بعد اعتماد الإدارة");
    setForm(EMPTY_PKG);
    load();
  };

  const openEdit = (p: Pkg) => {
    setEditing(p);
    setEditForm({
      name: p.name,
      tier: p.tier,
      price: String(p.price),
      description: p.description ?? "",
      includes: (p.includes ?? []).join("\n"),
      section: p.section ?? "both",
      duration_hours: p.duration_hours != null ? String(p.duration_hours) : "",
      cancellation_policy: p.cancellation_policy ?? "",
      available_days: p.available_days ?? [],
      image_url: p.image_url ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editing || !validPkg(editForm)) return;
    setSaving(true);
    const { error } = await packagesService.updateVendorPackage(editing.id, pkgPatch(editForm) as never);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تحديث الباقة — تعديل باقة معتمدة يعيدها للمراجعة");
    setEditing(null);
    load();
  };

  const toggleActive = async (p: Pkg) => {
    const { error } = await packagesService.updateVendorPackage(p.id, { active: !p.active });
    if (error) toast.error(error.message); else load();
  };

  /** Deletes only when no booking references the package; otherwise archives. */
  const removePackage = async (p: Pkg) => {
    const { count } = await packagesService.countBookingsForPackage(p.id);
    if ((count ?? 0) > 0) {
      const { error } = await packagesService.archiveVendorPackage(p.id);
      if (error) { toast.error(error.message); return; }
      toast.success("الباقة مرتبطة بحجوزات سابقة — تم أرشفتها وإخفاؤها عن العملاء");
      load();
      return;
    }
    const { error } = await packagesService.deleteVendorPackage(p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حذف الباقة");
    load();
  };

  const restorePackage = async (p: Pkg) => {
    const { error } = await packagesService.restoreVendorPackage(p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("تمت استعادة الباقة — فعّلها لتظهر للعملاء");
    load();
  };

  /** Swap sort_order with the neighbour so partners control display order. */
  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= packages.length) return;
    const a = packages[index];
    const b = packages[target];
    const next = [...packages];
    next[index] = b; next[target] = a;
    setPackages(next);
    const results = await Promise.all(
      next.map((p, i) => packagesService.setPackageSortOrder(p.id, i)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) toast.error(failed.error.message);
    load();
  };

  // ---- seasonal offers ----------------------------------------------------

  const offerPct = (f: OfferForm) => {
    const oldP = parseFloat(f.old_price);
    const newP = parseFloat(f.offer_price);
    if (oldP > 0 && newP > 0) return Math.round(((newP - oldP) / oldP) * 1000) / 10;
    return parseFloat(f.adjustment_percent);
  };

  const offerPatch = (f: OfferForm) => ({
    label: f.label.trim() || null,
    adjustment_percent: offerPct(f),
    start_date: f.start_date,
    end_date: f.end_date,
    old_price: f.old_price ? parseFloat(f.old_price) : null,
    offer_price: f.offer_price ? parseFloat(f.offer_price) : null,
    terms: f.terms.trim() || null,
    section: f.section,
    available_days: f.available_days,
    image_url: f.image_url.trim() || null,
  });

  const validOffer = (f: OfferForm) => {
    const pct = offerPct(f);
    if (Number.isNaN(pct) || pct === 0) { toast.error("أدخل نسبة الخصم أو سعر العرض"); return false; }
    if (!f.start_date || !f.end_date) { toast.error("حدد بداية ونهاية العرض"); return false; }
    if (f.end_date < f.start_date) { toast.error("تاريخ النهاية قبل البداية"); return false; }
    return true;
  };

  const addOffer = async () => {
    if (!validOffer(offer)) return;
    const { error } = await availabilityService.createPricingRule({
      vendor_id: vendorId,
      rule_type: "seasonal",
      active: true,
      ...offerPatch(offer),
    } as never);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تفعيل العرض الموسمي");
    setOffer(EMPTY_OFFER);
    load();
  };

  const openRuleEdit = (r: Rule) => {
    setEditingRule(r);
    setRuleForm({
      label: r.label ?? "",
      adjustment_percent: String(r.adjustment_percent),
      start_date: r.start_date ?? "",
      end_date: r.end_date ?? "",
      old_price: r.old_price != null ? String(r.old_price) : "",
      offer_price: r.offer_price != null ? String(r.offer_price) : "",
      terms: r.terms ?? "",
      section: r.section ?? "both",
      available_days: r.available_days ?? [],
      image_url: r.image_url ?? "",
    });
  };

  const saveRuleEdit = async () => {
    if (!editingRule || !validOffer(ruleForm)) return;
    setSaving(true);
    const { error } = await availabilityService.updatePricingRule(editingRule.id, offerPatch(ruleForm) as never);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تحديث العرض");
    setEditingRule(null);
    load();
  };

  const toggleRule = async (r: Rule) => {
    const { error } = await availabilityService.updatePricingRule(r.id, { active: !r.active });
    if (error) toast.error(error.message); else load();
  };

  const removeRule = async (id: string) => {
    const { error } = await availabilityService.deletePricingRule(id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حذف العرض");
    load();
  };

  const offerFields = (f: OfferForm, set: (v: OfferForm) => void) => (
    <>
      <div><Label>اسم العرض</Label><Input value={f.label} onChange={(e) => set({ ...f, label: e.target.value })} className="mt-1.5" placeholder="عرض رمضان" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>السعر قبل العرض</Label><Input type="number" dir="ltr" value={f.old_price} onChange={(e) => set({ ...f, old_price: e.target.value })} className="mt-1.5" /></div>
        <div><Label>سعر العرض</Label><Input type="number" dir="ltr" value={f.offer_price} onChange={(e) => set({ ...f, offer_price: e.target.value })} className="mt-1.5" /></div>
      </div>
      <div>
        <Label>نسبة التعديل (%)</Label>
        <Input type="number" dir="ltr" value={f.adjustment_percent} onChange={(e) => set({ ...f, adjustment_percent: e.target.value })} className="mt-1.5" />
        <p className="mt-1 text-[11px] text-muted-foreground">تُحسب تلقائياً من السعرين عند إدخالهما — أو أدخلها يدوياً (− للخصم، + للزيادة)</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>من</Label><Input type="date" dir="ltr" value={f.start_date} onChange={(e) => set({ ...f, start_date: e.target.value })} className="mt-1.5" /></div>
        <div><Label>إلى</Label><Input type="date" dir="ltr" value={f.end_date} onChange={(e) => set({ ...f, end_date: e.target.value })} className="mt-1.5" /></div>
      </div>
      <div>
        <Label>القسم</Label>
        <Select value={f.section} onValueChange={(v) => set({ ...f, section: v as Section })}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(SECTIONS).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div><Label>أيام التوفر</Label><DayPicker value={f.available_days} onChange={(v) => set({ ...f, available_days: v })} /></div>
      <div><Label>الخدمات والشروط</Label><Textarea rows={2} value={f.terms} onChange={(e) => set({ ...f, terms: e.target.value })} className="mt-1.5" /></div>
      <div><Label>رابط صورة العرض</Label><Input dir="ltr" value={f.image_url} onChange={(e) => set({ ...f, image_url: e.target.value })} className="mt-1.5" placeholder="https://" /></div>
    </>
  );

  const pkgFields = (f: PkgForm, set: (v: PkgForm) => void) => (
    <>
      <div><Label>اسم الباقة</Label><Input value={f.name} onChange={(e) => set({ ...f, name: e.target.value })} className="mt-1.5" placeholder="باقة الزفاف الكاملة" /></div>
      <div>
        <Label>الفئة</Label>
        <Select value={f.tier} onValueChange={(v) => set({ ...f, tier: v as Tier })}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(TIERS).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>السعر</Label><Input type="number" dir="ltr" value={f.price} onChange={(e) => set({ ...f, price: e.target.value })} className="mt-1.5" /></div>
        <div><Label>المدة (ساعات)</Label><Input type="number" dir="ltr" value={f.duration_hours} onChange={(e) => set({ ...f, duration_hours: e.target.value })} className="mt-1.5" /></div>
      </div>
      <div>
        <Label>القسم</Label>
        <Select value={f.section} onValueChange={(v) => set({ ...f, section: v as Section })}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(SECTIONS).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div><Label>أيام التوفر</Label><DayPicker value={f.available_days} onChange={(v) => set({ ...f, available_days: v })} /></div>
      <div><Label>الوصف</Label><Textarea rows={2} value={f.description} onChange={(e) => set({ ...f, description: e.target.value })} className="mt-1.5" /></div>
      <div>
        <Label>المحتويات (سطر لكل عنصر)</Label>
        <Textarea rows={4} value={f.includes} onChange={(e) => set({ ...f, includes: e.target.value })} className="mt-1.5" placeholder={"قاعة كاملة\nبوفيه ٢٠٠ شخص\nتنسيق ورد"} />
      </div>
      <div><Label>سياسة الإلغاء</Label><Textarea rows={2} value={f.cancellation_policy} onChange={(e) => set({ ...f, cancellation_policy: e.target.value })} className="mt-1.5" placeholder="إلغاء مجاني قبل ١٤ يوماً" /></div>
      <div><Label>رابط صورة الباقة</Label><Input dir="ltr" value={f.image_url} onChange={(e) => set({ ...f, image_url: e.target.value })} className="mt-1.5" placeholder="https://" /></div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-black">
            <Package className="h-4 w-4 text-primary" /> باقاتي
          </h3>
          {packages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">لا توجد باقات بعد — أضف أول باقة من النموذج.</p>
          ) : (
            <div className="space-y-3">
              {packages.map((p, i) => (
                <div key={p.id} className={`rounded-xl border border-border p-4 ${p.archived ? "bg-muted/20 opacity-70" : "bg-muted/40"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Switch checked={p.active} disabled={p.archived} onCheckedChange={() => toggleActive(p)} />
                      <div>
                        <div className="text-sm font-bold">
                          {p.name}
                          <span className="ms-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-black text-primary-deep">
                            {TIERS[p.tier]}
                          </span>
                          <span className="ms-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-black text-primary-deep">
                            {SECTIONS[p.section ?? "both"]}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {fmt(Number(p.price))} · {p.includes.length} عنصر
                          {p.duration_hours ? ` · ${p.duration_hours} ساعة` : ""}
                          {` · ${daysLabel(p.available_days ?? [])}`}
                        </div>
                        {p.description && <div className="mt-1 text-xs text-muted-foreground">{p.description}</div>}
                        {p.cancellation_policy && <div className="mt-1 text-xs text-muted-foreground">سياسة الإلغاء: {p.cancellation_policy}</div>}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge variant="secondary" className="text-[10px]">{APPROVAL[p.approval_status] ?? p.approval_status}</Badge>
                          {p.archived && <Badge variant="outline" className="text-[10px]">مؤرشفة</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="تحريك لأعلى">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => move(i, 1)} disabled={i === packages.length - 1} aria-label="تحريك لأسفل">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)} aria-label="تعديل">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {p.archived ? (
                        <Button variant="ghost" size="sm" onClick={() => restorePackage(p)} aria-label="استعادة">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => removePackage(p)} className="text-destructive hover:bg-destructive/10" aria-label="حذف">
                          {p.includes ? <Trash2 className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="h-fit p-5">
          <h3 className="mb-4 font-black">إضافة باقة</h3>
          <div className="space-y-3">
            {pkgFields(form, setForm)}
            <Button onClick={addPackage} disabled={saving} className="w-full"><Plus className="ml-2 h-4 w-4" /> إضافة الباقة</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-black">
            <Tag className="h-4 w-4 text-primary" /> العروض الموسمية
          </h3>
          {rules.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">لا توجد عروض بعد.</p>
          ) : (
            <div className="space-y-3">
              {rules.map((r) => {
                const adjusted = r.offer_price ?? basePrice * (1 + r.adjustment_percent / 100);
                return (
                  <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center gap-3">
                      <Switch checked={r.active} onCheckedChange={() => toggleRule(r)} />
                      <div>
                        <div className="text-sm font-bold">
                          {r.label || (r.rule_type === "weekend" ? "نهاية الأسبوع" : r.rule_type === "weekday" ? "أيام الأسبوع" : "عرض موسمي")}
                          <span className="ms-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-black text-primary-deep">
                            {r.adjustment_percent > 0 ? "+" : ""}{r.adjustment_percent}%
                          </span>
                          <span className="ms-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-black text-primary-deep">
                            {SECTIONS[r.section ?? "both"]}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {r.old_price ? `قبل: ${fmt(Number(r.old_price))} · ` : ""}
                          السعر بعد التعديل: {fmt(Number(adjusted))}
                          {r.start_date && ` · من ${r.start_date}`}{r.end_date && ` إلى ${r.end_date}`}
                          {` · ${daysLabel(r.available_days ?? [])}`}
                        </div>
                        {r.terms && <div className="mt-1 text-xs text-muted-foreground">{r.terms}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openRuleEdit(r)} aria-label="تعديل العرض">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeRule(r.id)} className="text-destructive hover:bg-destructive/10" aria-label="حذف العرض">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="h-fit p-5">
          <h3 className="mb-4 font-black">عرض موسمي جديد</h3>
          <div className="space-y-3">
            {offerFields(offer, setOffer)}
            <Button onClick={addOffer} className="w-full"><Plus className="ml-2 h-4 w-4" /> تفعيل العرض</Button>
          </div>
        </Card>
      </div>

      {userId && (
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-black">
            <Images className="h-4 w-4 text-primary" /> صور وفيديو الباقات
          </h3>
          <VendorPortfolioManager vendorId={vendorId} userId={userId} />
        </Card>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
          <DialogHeader><DialogTitle>تعديل الباقة</DialogTitle></DialogHeader>
          <div className="space-y-3">{pkgFields(editForm, setEditForm)}</div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>إلغاء</Button>
            <Button onClick={saveEdit} disabled={saving}>حفظ التعديل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingRule} onOpenChange={(v) => !v && setEditingRule(null)}>
        <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
          <DialogHeader><DialogTitle>تعديل العرض الموسمي</DialogTitle></DialogHeader>
          <div className="space-y-3">{offerFields(ruleForm, setRuleForm)}</div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingRule(null)}>إلغاء</Button>
            <Button onClick={saveRuleEdit} disabled={saving}>حفظ التعديل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
