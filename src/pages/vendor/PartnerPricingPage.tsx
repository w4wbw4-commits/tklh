import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalLayout, PortalHeader } from "@/components/tekillah/vendor/PortalLayout";
import { StatusBanner } from "@/components/tekillah/vendor/StatusBanner";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Tag } from "lucide-react";
import { toast } from "sonner";

type Rule = {
  id: string; rule_type: "weekend" | "weekday" | "seasonal";
  label: string | null; adjustment_percent: number;
  start_date: string | null; end_date: string | null; active: boolean;
};

const PartnerPricingPage = () => {
  const { vendor } = usePartnerVendor();
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState({
    rule_type: "weekend" as Rule["rule_type"], label: "", adjustment_percent: "20", start_date: "", end_date: "",
  });

  const fetchRules = async () => {
    if (!vendor) return;
    const { data } = await supabase.from("vendor_pricing_rules" as never).select("*").eq("vendor_id", vendor.id).order("created_at");
    setRules(((data as unknown) as Rule[]) || []);
  };
  useEffect(() => { fetchRules(); /* eslint-disable-next-line */ }, [vendor?.id]);

  const toggleActive = async (r: Rule) => {
    const { error } = await supabase.from("vendor_pricing_rules" as never).update({ active: !r.active } as never).eq("id", r.id);
    if (error) toast.error(error.message); else fetchRules();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("vendor_pricing_rules" as never).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("تم الحذف"); fetchRules(); }
  };

  const addRule = async () => {
    if (!vendor) return;
    const { error } = await supabase.from("vendor_pricing_rules" as never).insert({
      vendor_id: vendor.id, rule_type: newRule.rule_type, label: newRule.label || null,
      adjustment_percent: Number(newRule.adjustment_percent) || 0,
      start_date: newRule.start_date || null, end_date: newRule.end_date || null, active: true,
    } as never);
    if (error) { toast.error(error.message); return; }
    toast.success("تمت إضافة القاعدة");
    setNewRule({ rule_type: "weekend", label: "", adjustment_percent: "20", start_date: "", end_date: "" });
    fetchRules();
  };

  const basePrice = Number(vendor?.starting_price || 0);

  return (
    <PortalLayout>
      <PortalHeader title="إدارة التسعير الديناميكي" subtitle="فعّل عروضاً موسمية وأسعاراً خاصة لزيادة إيراداتك" />
      <StatusBanner vendor={vendor} />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-black"><Tag className="h-4 w-4 text-primary" /> القواعد الحالية</h3>
          {rules.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">لا توجد قواعد بعد — أضف أول قاعدة من اليسار.</p>
          ) : (
            <div className="space-y-3">
              {rules.map((r) => {
                const adjusted = basePrice * (1 + r.adjustment_percent / 100);
                return (
                  <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center gap-3">
                      <Switch checked={r.active} onCheckedChange={() => toggleActive(r)} />
                      <div>
                        <div className="text-sm font-bold">
                          {r.label || (r.rule_type === "weekend" ? "نهاية الأسبوع" : r.rule_type === "weekday" ? "أيام الأسبوع" : "موسمي")}
                          <span className="ms-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-black text-primary-deep">
                            {r.adjustment_percent > 0 ? "+" : ""}{r.adjustment_percent}%
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          السعر: {Math.round(adjusted).toLocaleString("en-US")} 
                          {r.start_date && ` · من ${r.start_date}`}{r.end_date && ` إلى ${r.end_date}`}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => remove(r.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card className="h-fit p-5">
          <h3 className="mb-4 font-black">إضافة قاعدة جديدة</h3>
          <div className="space-y-3">
            <div>
              <Label>النوع</Label>
              <Select value={newRule.rule_type} onValueChange={(v) => setNewRule({ ...newRule, rule_type: v as Rule["rule_type"] })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekend">نهاية الأسبوع</SelectItem>
                  <SelectItem value="weekday">أيام الأسبوع</SelectItem>
                  <SelectItem value="seasonal">عرض موسمي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>اسم العرض (اختياري)</Label><Input value={newRule.label} onChange={(e) => setNewRule({ ...newRule, label: e.target.value })} placeholder="عرض رمضان" className="mt-1.5" /></div>
            <div>
              <Label>نسبة التعديل (%)</Label>
              <Input type="number" value={newRule.adjustment_percent} onChange={(e) => setNewRule({ ...newRule, adjustment_percent: e.target.value })} className="mt-1.5" />
              <p className="mt-1 text-[11px] text-muted-foreground">+ للزيادة، − للخصم</p>
            </div>
            {newRule.rule_type === "seasonal" && (
              <div className="grid grid-cols-2 gap-2">
                <div><Label>من</Label><Input type="date" value={newRule.start_date} onChange={(e) => setNewRule({ ...newRule, start_date: e.target.value })} className="mt-1.5" /></div>
                <div><Label>إلى</Label><Input type="date" value={newRule.end_date} onChange={(e) => setNewRule({ ...newRule, end_date: e.target.value })} className="mt-1.5" /></div>
              </div>
            )}
            <Button onClick={addRule} disabled={!vendor} className="mt-2 w-full font-black"><Plus className="ml-2 h-4 w-4" /> أضف القاعدة</Button>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default PartnerPricingPage;
