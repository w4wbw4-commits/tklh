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
import { Package, Plus, Trash2, Tag, Pencil, Images } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { VendorPortfolioManager } from "@/components/tekillah/vendor/VendorPortfolioManager";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

type Tier = "basic" | "premium" | "royal";
type Pkg = {
  id: string;
  name: string;
  tier: Tier;
  price: number;
  description: string | null;
  includes: string[];
  active: boolean;
  approval_status: string;
};
type Rule = {
  id: string;
  rule_type: "weekend" | "weekday" | "seasonal";
  label: string | null;
  adjustment_percent: number;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
};

const TIERS: Record<Tier, string> = { basic: "أساسية", premium: "مميزة", royal: "ملكية" };

const APPROVAL: Record<string, string> = {
  pending_approval: "بانتظار مراجعة الإدارة",
  approved: "معتمدة وتظهر للعملاء",
  rejected: "مرفوضة — راجع الملاحظات",
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
  const [form, setForm] = useState({ name: "", tier: "basic" as Tier, price: "", description: "", includes: "" });
  const [offer, setOffer] = useState({ label: "", adjustment_percent: "-10", start_date: "", end_date: "" });
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [editForm, setEditForm] = useState({ name: "", tier: "basic" as Tier, price: "", description: "", includes: "" });

  const openEdit = (p: Pkg) => {
    setEditing(p);
    setEditForm({
      name: p.name,
      tier: p.tier,
      price: String(p.price),
      description: p.description ?? "",
      includes: (p.includes ?? []).join("\n"),
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const price = parseFloat(editForm.price);
    if (!editForm.name.trim()) { toast.error("أدخل اسم الباقة"); return; }
    if (!price || price <= 0) { toast.error("أدخل سعراً صحيحاً"); return; }
    setSaving(true);
    const { error } = await packagesService.updateVendorPackage(editing.id, {
      name: editForm.name.trim(),
      tier: editForm.tier,
      price,
      description: editForm.description.trim() || null,
      includes: editForm.includes.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تحديث الباقة — تعديل باقة معتمدة يعيدها للمراجعة");
    setEditing(null);
    load();
  };

  const load = async () => {
    const [p, r] = await Promise.all([
      packagesService.listVendorPackages(vendorId),
      availabilityService.listPricingRulesAsc(vendorId),
    ]);
    setPackages(((p.data as unknown) as Pkg[]) || []);
    setRules(((r.data as unknown) as Rule[]) || []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [vendorId]);

  const addPackage = async () => {
    const price = parseFloat(form.price);
    if (!form.name.trim()) { toast.error("أدخل اسم الباقة"); return; }
    if (!price || price <= 0) { toast.error("أدخل سعراً صحيحاً"); return; }
    setSaving(true);
    const { error } = await packagesService.createVendorPackage({
      vendor_id: vendorId,
      name: form.name.trim(),
      tier: form.tier,
      price,
      description: form.description.trim() || null,
      includes: form.includes.split("\n").map((s) => s.trim()).filter(Boolean),
      active: true,
    } as never);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تمت إضافة الباقة — ستظهر للعملاء بعد اعتماد الإدارة");
    setForm({ name: "", tier: "basic", price: "", description: "", includes: "" });
    load();
  };

  const toggleActive = async (p: Pkg) => {
    const { error } = await packagesService.updateVendorPackage(p.id, { active: !p.active });
    if (error) toast.error(error.message); else load();
  };

  const removePackage = async (id: string) => {
    const { error } = await packagesService.deleteVendorPackage(id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حذف الباقة");
    load();
  };

  const addOffer = async () => {
    const pct = parseFloat(offer.adjustment_percent);
    if (Number.isNaN(pct) || pct === 0) { toast.error("أدخل نسبة الخصم أو الزيادة"); return; }
    if (!offer.start_date || !offer.end_date) { toast.error("حدد بداية ونهاية العرض"); return; }
    if (offer.end_date < offer.start_date) { toast.error("تاريخ النهاية قبل البداية"); return; }
    const { error } = await availabilityService.createPricingRule({
      vendor_id: vendorId,
      rule_type: "seasonal",
      label: offer.label.trim() || null,
      adjustment_percent: pct,
      start_date: offer.start_date,
      end_date: offer.end_date,
      active: true,
    } as never);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تفعيل العرض الموسمي");
    setOffer({ label: "", adjustment_percent: "-10", start_date: "", end_date: "" });
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
              {packages.map((p) => (
                <div key={p.id} className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Switch checked={p.active} onCheckedChange={() => toggleActive(p)} />
                      <div>
                        <div className="text-sm font-bold">
                          {p.name}
                          <span className="ms-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-black text-primary-deep">
                            {TIERS[p.tier]}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{fmt(Number(p.price))} · {p.includes.length} عنصر</div>
                        {p.description && <div className="mt-1 text-xs text-muted-foreground">{p.description}</div>}
                        <Badge variant="secondary" className="mt-2 text-[10px]">{APPROVAL[p.approval_status] ?? p.approval_status}</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removePackage(p.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="h-fit p-5">
          <h3 className="mb-4 font-black">إضافة باقة</h3>
          <div className="space-y-3">
            <div><Label>اسم الباقة</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" placeholder="باقة الزفاف الكاملة" /></div>
            <div>
              <Label>الفئة</Label>
              <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v as Tier })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIERS).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>السعر</Label><Input type="number" dir="ltr" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1.5" /></div>
            <div><Label>الوصف</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" /></div>
            <div>
              <Label>المحتويات (سطر لكل عنصر)</Label>
              <Textarea rows={4} value={form.includes} onChange={(e) => setForm({ ...form, includes: e.target.value })} className="mt-1.5" placeholder={"قاعة كاملة\nبوفيه ٢٠٠ شخص\nتنسيق ورد"} />
            </div>
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
                const adjusted = basePrice * (1 + r.adjustment_percent / 100);
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
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          السعر بعد التعديل: {fmt(adjusted)}
                          {r.start_date && ` · من ${r.start_date}`}{r.end_date && ` إلى ${r.end_date}`}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeRule(r.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="h-fit p-5">
          <h3 className="mb-4 font-black">عرض موسمي جديد</h3>
          <div className="space-y-3">
            <div><Label>اسم العرض</Label><Input value={offer.label} onChange={(e) => setOffer({ ...offer, label: e.target.value })} className="mt-1.5" placeholder="عرض رمضان" /></div>
            <div>
              <Label>نسبة التعديل (%)</Label>
              <Input type="number" dir="ltr" value={offer.adjustment_percent} onChange={(e) => setOffer({ ...offer, adjustment_percent: e.target.value })} className="mt-1.5" />
              <p className="mt-1 text-[11px] text-muted-foreground">− للخصم، + للزيادة</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>من</Label><Input type="date" dir="ltr" value={offer.start_date} onChange={(e) => setOffer({ ...offer, start_date: e.target.value })} className="mt-1.5" /></div>
              <div><Label>إلى</Label><Input type="date" dir="ltr" value={offer.end_date} onChange={(e) => setOffer({ ...offer, end_date: e.target.value })} className="mt-1.5" /></div>
            </div>
            <Button onClick={addOffer} className="w-full"><Plus className="ml-2 h-4 w-4" /> تفعيل العرض</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
