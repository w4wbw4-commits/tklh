import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalLayout, PortalHeader } from "@/components/tekillah/vendor/PortalLayout";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ChefHat, Sparkles, Users, Truck, Box } from "lucide-react";
import { toast } from "sonner";

type Booking = { id: string; event_date: string; vendor_id: string };
type Item = { id: string; booking_id: string; vendor_id: string; category: "catering" | "decoration" | "staff" | "logistics" | "other"; title: string; done: boolean };

const catIcons = {
  catering: { Icon: ChefHat, label: "ضيافة" },
  decoration: { Icon: Sparkles, label: "ديكور" },
  staff: { Icon: Users, label: "فريق العمل" },
  logistics: { Icon: Truck, label: "لوجستيات" },
  other: { Icon: Box, label: "أخرى" },
};

const defaultItems = [
  { category: "catering" as const, title: "تأكيد قائمة الطعام مع العميل" },
  { category: "catering" as const, title: "حصر عدد الضيوف النهائي" },
  { category: "decoration" as const, title: "إعداد قاعة الاستقبال" },
  { category: "decoration" as const, title: "تركيب الإضاءة وممر الزفة" },
  { category: "staff" as const, title: "جدول مواعيد الفريق" },
  { category: "logistics" as const, title: "تجهيز موقف السيارات" },
];

const PartnerChecklistsPage = () => {
  const { vendor } = usePartnerVendor();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!vendor) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from("bookings").select("id, event_date, vendor_id")
        .eq("vendor_id", vendor.id).gte("event_date", today)
        .in("status", ["pending", "confirmed"]).order("event_date");
      const list = (data as Booking[]) || [];
      setBookings(list);
      if (list[0] && !selected) setSelected(list[0].id);
    })();
  // eslint-disable-next-line
  }, [vendor?.id]);

  useEffect(() => {
    if (!selected || !vendor) { setItems([]); return; }
    (async () => {
      const { data } = await supabase.from("booking_checklists" as never).select("*").eq("booking_id", selected).order("category");
      let list = ((data as unknown) as Item[]) || [];
      // Auto-seed defaults if empty
      if (list.length === 0) {
        const seeds = defaultItems.map((d) => ({ ...d, booking_id: selected, vendor_id: vendor.id, done: false }));
        const { data: inserted } = await supabase.from("booking_checklists" as never).insert(seeds as never).select();
        list = ((inserted as unknown) as Item[]) || [];
      }
      setItems(list);
    })();
  }, [selected, vendor]);

  const toggle = async (item: Item) => {
    setItems(items.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)));
    const { error } = await supabase.from("booking_checklists" as never).update({ done: !item.done } as never).eq("id", item.id);
    if (error) { toast.error(error.message); setItems(items); }
  };

  const grouped = items.reduce<Record<string, Item[]>>((acc, i) => {
    (acc[i.category] = acc[i.category] || []).push(i); return acc;
  }, {});
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  const pct = total ? (done / total) * 100 : 0;

  return (
    <PortalLayout>
      <PortalHeader title="قوائم مهام التشغيل" subtitle="مهام تحضير لكل مناسبة لتضمن جاهزية الفريق" />
      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="p-4 lg:col-span-4">
          <h3 className="mb-3 px-2 font-black">المناسبات القادمة</h3>
          {bookings.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">لا توجد مناسبات قادمة.</p>
          ) : (
            <div className="space-y-1.5">
              {bookings.map((b) => (
                <button key={b.id} onClick={() => setSelected(b.id)}
                  className={`w-full rounded-xl border p-3 text-right transition-colors ${selected === b.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/40 hover:border-primary/40"}`}>
                  <div className="text-sm font-bold">حجز #{b.id.slice(0, 6)}</div>
                  <div className={`mt-0.5 text-xs ${selected === b.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(b.event_date).toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" })}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-5 lg:col-span-8">
          {!selected ? (
            <p className="py-12 text-center text-sm text-muted-foreground">اختر مناسبة لعرض قائمة المهام.</p>
          ) : (
            <>
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-black">التقدم</span>
                  <span className="text-muted-foreground">{done} / {total} ({Math.round(pct)}%)</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
              <div className="space-y-5">
                {Object.entries(grouped).map(([cat, list]) => {
                  const meta = catIcons[cat as keyof typeof catIcons];
                  return (
                    <div key={cat}>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-primary-deep"><meta.Icon className="h-4 w-4" /></span>
                        <h4 className="font-black">{meta.label}</h4>
                      </div>
                      <div className="space-y-1.5 pe-10">
                        {list.map((it) => (
                          <label key={it.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 hover:bg-muted/60">
                            <Checkbox checked={it.done} onCheckedChange={() => toggle(it)} />
                            <span className={`text-sm ${it.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{it.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>
    </PortalLayout>
  );
};

export default PartnerChecklistsPage;
