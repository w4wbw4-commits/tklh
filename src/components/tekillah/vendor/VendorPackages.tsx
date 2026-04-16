import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Crown, Star, Sparkles } from "lucide-react";
import { TIER_LABELS, type PackageRow } from "./types";

const TIER_ICONS = { basic: Star, premium: Sparkles, royal: Crown };

const pkgSchema = z.object({
  name: z.string().trim().min(2).max(80),
  tier: z.enum(["basic", "premium", "royal"]),
  price: z.number().min(0).max(10000000),
  description: z.string().trim().max(500).optional(),
});

interface Props {
  vendorId: string;
}

export const VendorPackages = ({ vendorId }: Props) => {
  const [items, setItems] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [tier, setTier] = useState<PackageRow["tier"]>("basic");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [includesText, setIncludesText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("packages").select("*").eq("vendor_id", vendorId).order("price");
    if (error) toast.error(error.message);
    setItems((data ?? []) as PackageRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [vendorId]);

  const reset = () => {
    setName(""); setTier("basic"); setPrice(0); setDescription(""); setIncludesText(""); setAdding(false);
  };

  const handleSave = async () => {
    const parsed = pkgSchema.safeParse({ name, tier, price: Number(price), description });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setSaving(true);
    const includes = includesText.split("\n").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("packages").insert({
      vendor_id: vendorId, name, tier, price: Number(price),
      description: description || null, includes,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تمت إضافة الباقة");
    reset();
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حذف الباقة");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-arabic text-2xl font-semibold text-foreground">الباقات والأسعار</h2>
          <p className="mt-1 text-sm text-foreground/65">
            عرّف باقات واضحة ليختار العميل بسهولة. الأسعار تُغذّي حاسبة الميزانية في المنصة.
          </p>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="me-1 h-4 w-4" /> باقة جديدة
          </Button>
        )}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 shadow-card">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>اسم الباقة</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: باقة الأمسية الذهبية" />
                </div>
                <div className="space-y-2">
                  <Label>المستوى</Label>
                  <Select value={tier} onValueChange={(v) => setTier(v as PackageRow["tier"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIER_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>السعر (ر.س)</Label>
                  <Input type="number" min={0} step={500} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>الوصف</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="ملخّص قصير عن ما تشمله الباقة" className="min-h-[80px] font-arabic" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>ما تشمله الباقة (سطر لكل عنصر)</Label>
                  <Textarea value={includesText} onChange={(e) => setIncludesText(e.target.value)}
                    placeholder={"تنسيق كامل للقاعة\nطاولات وكراسي فاخرة\n٤ ساعات تصوير"} className="min-h-[100px] font-arabic" />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" onClick={reset}>إلغاء</Button>
                <Button onClick={handleSave} disabled={saving}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ الباقة"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-foreground/50">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-foreground/60">
          لم تُضف باقات بعد. أضف أوّل باقة لتبدأ في استقبال الطلبات.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const Icon = TIER_ICONS[p.tier];
            return (
              <motion.div key={p.id} layout
                className="group relative rounded-3xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-luxury">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <Badge variant="secondary" className="font-normal">{TIER_LABELS[p.tier]}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}
                    className="h-8 w-8 text-destructive opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 font-arabic text-lg font-semibold text-foreground">{p.name}</div>
                <div className="mt-2 font-arabic text-2xl font-semibold text-primary">
                  {Number(p.price).toLocaleString("ar-SA")} <span className="text-sm font-normal text-foreground/60">ر.س</span>
                </div>
                {p.description && <p className="mt-3 text-sm text-foreground/70">{p.description}</p>}
                {p.includes.length > 0 && (
                  <ul className="mt-4 space-y-1.5 text-sm text-foreground/75">
                    {p.includes.map((it, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" /> {it}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
