import { useEffect, useMemo, useState } from "react";
import { bookingsService, expensesService } from "@/domain";
import { PortalLayout, PortalHeader, PortalSubnav } from "@/components/tekillah/vendor/PortalLayout";
import { REPORTS_SUBNAV } from "@/components/tekillah/vendor/portalSubnav";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const monthKey = (iso: string) => iso.slice(0, 7);
const thisMonth = () => new Date().toISOString().slice(0, 7);

type Booking = { id: string; event_date: string; total_price: number | null; status: string; guest_count: number | null };
type Expense = { id: string; month: string; kind: string; label: string; amount: number; notes: string | null };

const KINDS: Record<string, string> = {
  operating: "مصروف تشغيلي",
  depreciation: "إهلاك",
  salary: "رواتب",
  marketing: "تسويق",
  other: "أخرى",
};

const PartnerReportsPage = () => {
  const { vendor } = usePartnerVendor();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({ month: thisMonth(), kind: "operating", label: "", amount: "" });

  const load = async () => {
    if (!vendor) return;
    const [b, e] = await Promise.all([
      bookingsService.listForVendorSales(vendor.id),
      expensesService.listForVendor(vendor.id),
    ]);
    setBookings(((b.data as unknown) as Booking[]) || []);
    setExpenses(((e.data as unknown) as Expense[]) || []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [vendor?.id]);

  // Monthly roll-up: revenue counts confirmed + completed bookings only, so a
  // cancelled booking drops out of the report automatically.
  const rows = useMemo(() => {
    type Row = {
      month: string; revenue: number; bookings: number; guests: number;
      operating: number; depreciation: number;
      confirmed: number; completed: number; cancelled: number; pending: number;
      bookedDays: Set<string>;
    };
    const map = new Map<string, Row>();
    const touch = (m: string): Row => {
      if (!map.has(m)) {
        map.set(m, {
          month: m, revenue: 0, bookings: 0, guests: 0, operating: 0, depreciation: 0,
          confirmed: 0, completed: 0, cancelled: 0, pending: 0, bookedDays: new Set<string>(),
        });
      }
      return map.get(m)!;
    };
    bookings.forEach((b) => {
      const r = touch(monthKey(b.event_date));
      if (b.status === "pending") r.pending += 1;
      if (b.status === "cancelled" || b.status === "rejected") r.cancelled += 1;
      if (b.status === "confirmed") r.confirmed += 1;
      if (b.status === "completed") r.completed += 1;
      if (!["confirmed", "completed"].includes(b.status)) return;
      // Revenue only counts confirmed + completed, so a cancelled booking drops
      // out of the report (and out of occupancy) automatically.
      r.revenue += Number(b.total_price ?? 0);
      r.bookings += 1;
      r.guests += Number(b.guest_count ?? 0);
      r.bookedDays.add(b.event_date);
    });
    expenses.forEach((x) => {
      const r = touch(monthKey(x.month));
      if (x.kind === "depreciation") r.depreciation += Number(x.amount);
      else r.operating += Number(x.amount);
    });
    return [...map.values()]
      .map((r) => {
        const [y, m] = r.month.split("-").map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        return {
          ...r,
          avgValue: r.bookings > 0 ? r.revenue / r.bookings : 0,
          occupancy: Math.round((r.bookedDays.size / daysInMonth) * 100),
        };
      })
      .sort((a, b) => (a.month < b.month ? 1 : -1));
  }, [bookings, expenses]);

  const totals = rows.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.revenue,
      operating: acc.operating + r.operating,
      depreciation: acc.depreciation + r.depreciation,
      bookings: acc.bookings + r.bookings,
      confirmed: acc.confirmed + r.confirmed,
      completed: acc.completed + r.completed,
      cancelled: acc.cancelled + r.cancelled,
      pending: acc.pending + r.pending,
    }),
    { revenue: 0, operating: 0, depreciation: 0, bookings: 0, confirmed: 0, completed: 0, cancelled: 0, pending: 0 },
  );
  const net = totals.revenue - totals.operating - totals.depreciation;
  const avgValue = totals.bookings > 0 ? totals.revenue / totals.bookings : 0;
  const avgOccupancy = rows.length > 0 ? Math.round(rows.reduce((a, r) => a + r.occupancy, 0) / rows.length) : 0;

  const addExpense = async () => {
    if (!vendor) return;
    const amount = parseFloat(form.amount);
    if (!form.label.trim()) { toast.error("أدخل وصف المصروف"); return; }
    if (!amount || amount <= 0) { toast.error("أدخل مبلغاً صحيحاً"); return; }
    const { error } = await expensesService.create({
      vendor_id: vendor.id,
      month: `${form.month}-01`,
      kind: form.kind,
      label: form.label.trim(),
      amount,
    } as never);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تسجيل المصروف");
    setForm({ month: form.month, kind: form.kind, label: "", amount: "" });
    load();
  };

  const removeExpense = async (id: string) => {
    const { error } = await expensesService.remove(id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        rows.map((r) => ({
          "الشهر": r.month,
          "الإيرادات": Math.round(r.revenue),
          "عدد الحجوزات": r.bookings,
          "مؤكدة": r.confirmed,
          "مكتملة": r.completed,
          "ملغاة/مرفوضة": r.cancelled,
          "بانتظار التأكيد": r.pending,
          "متوسط قيمة الحجز": Math.round(r.avgValue),
          "نسبة الإشغال %": r.occupancy,
          "عدد الضيوف": r.guests,
          "المصاريف التشغيلية": Math.round(r.operating),
          "الإهلاك": Math.round(r.depreciation),
          "صافي الربح": Math.round(r.revenue - r.operating - r.depreciation),
        })),
      ),
      "ملخص شهري",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        bookings.map((b) => ({
          "التاريخ": b.event_date,
          "الحالة": b.status,
          "عدد الضيوف": b.guest_count ?? 0,
          "المبلغ": Number(b.total_price ?? 0),
        })),
      ),
      "الحجوزات",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        expenses.map((x) => ({
          "الشهر": monthKey(x.month),
          "النوع": KINDS[x.kind] ?? x.kind,
          "الوصف": x.label,
          "المبلغ": Number(x.amount),
        })),
      ),
      "المصاريف",
    );
    XLSX.writeFile(wb, `tklh-report-${vendor?.business_name ?? "partner"}-${Date.now()}.xlsx`);
    toast.success("تم تصدير ملف Excel");
  };

  return (
    <PortalLayout>
      <PortalHeader
        title="التقارير الشهرية"
        subtitle="الإيرادات والمصاريف التشغيلية والإهلاك وصافي الربح شهراً بشهر"
        action={
          <Button onClick={exportExcel} disabled={rows.length === 0}>
            <FileSpreadsheet className="ml-2 h-4 w-4" /> تصدير Excel
          </Button>
        }
      />
      <PortalSubnav items={REPORTS_SUBNAV} />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-5">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div className="mt-3 text-2xl font-black">{fmt(totals.revenue)}</div>
          <div className="mt-1 text-xs font-bold text-muted-foreground">إجمالي الإيرادات</div>
        </Card>
        <Card className="p-5">
          <TrendingDown className="h-5 w-5 text-destructive" />
          <div className="mt-3 text-2xl font-black">{fmt(totals.operating)}</div>
          <div className="mt-1 text-xs font-bold text-muted-foreground">المصاريف التشغيلية</div>
        </Card>
        <Card className="p-5">
          <TrendingDown className="h-5 w-5 text-amber-600" />
          <div className="mt-3 text-2xl font-black">{fmt(totals.depreciation)}</div>
          <div className="mt-1 text-xs font-bold text-muted-foreground">الإهلاك</div>
        </Card>
        <Card className="border-primary bg-primary p-5 text-primary-foreground">
          <Wallet className="h-5 w-5 text-secondary" />
          <div className="mt-3 text-2xl font-black">{fmt(net)}</div>
          <div className="mt-1 text-xs font-bold text-primary-foreground/70">صافي الربح</div>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          { label: "مؤكدة", value: totals.confirmed },
          { label: "مكتملة", value: totals.completed },
          { label: "بانتظار التأكيد", value: totals.pending },
          { label: "ملغاة/مرفوضة", value: totals.cancelled },
          { label: "متوسط قيمة الحجز", value: fmt(avgValue) },
          { label: "متوسط الإشغال", value: `${avgOccupancy}%` },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-lg font-black">{s.value}</div>
            <div className="mt-1 text-[11px] font-bold text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="stack-table w-full text-sm">
              <thead className="border-b border-border bg-muted/60">
                <tr className="text-right text-xs font-black text-foreground/70">
                  <th className="p-4">الشهر</th>
                  <th className="p-4">الإيرادات</th>
                  <th className="p-4">الحجوزات</th>
                  <th className="p-4">ملغاة</th>
                  <th className="p-4">متوسط الحجز</th>
                  <th className="p-4">الإشغال</th>
                  <th className="p-4">تشغيلية</th>
                  <th className="p-4">إهلاك</th>
                  <th className="p-4">صافي</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">لا توجد بيانات بعد.</td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.month} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td data-label="الشهر" className="p-4 font-mono font-bold text-primary" dir="ltr">{r.month}</td>
                    <td data-label="الإيرادات" className="p-4 font-black">{fmt(r.revenue)}</td>
                    <td data-label="الحجوزات" className="p-4">{r.bookings}</td>
                    <td data-label="ملغاة" className="p-4 text-muted-foreground">{r.cancelled}</td>
                    <td data-label="متوسط الحجز" className="p-4 text-muted-foreground">{fmt(r.avgValue)}</td>
                    <td data-label="الإشغال" className="p-4 text-muted-foreground">{r.occupancy}%</td>
                    <td data-label="تشغيلية" className="p-4 text-muted-foreground">{fmt(r.operating)}</td>
                    <td data-label="إهلاك" className="p-4 text-muted-foreground">{fmt(r.depreciation)}</td>
                    <td data-label="صافي" className="p-4 font-black">{fmt(r.revenue - r.operating - r.depreciation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="h-fit p-5">
          <h3 className="mb-4 font-black">تسجيل مصروف</h3>
          <div className="space-y-3">
            <div>
              <Label>الشهر</Label>
              <Input type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className="mt-1.5" dir="ltr" />
            </div>
            <div>
              <Label>النوع</Label>
              <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(KINDS).map(([k, label]) => (
                    <SelectItem key={k} value={k}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الوصف</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="كهرباء، صيانة، إهلاك أثاث…" className="mt-1.5" />
            </div>
            <div>
              <Label>المبلغ</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1.5" dir="ltr" />
            </div>
            <Button onClick={addExpense} className="w-full"><Plus className="ml-2 h-4 w-4" /> إضافة</Button>
          </div>

          {expenses.length > 0 && (
            <div className="mt-5 space-y-2 border-t border-border pt-4">
              {expenses.slice(0, 12).map((x) => (
                <div key={x.id} className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 p-3 text-xs">
                  <div>
                    <div className="font-bold">{x.label}</div>
                    <div className="mt-0.5 text-muted-foreground" dir="ltr">
                      {monthKey(x.month)} · {KINDS[x.kind] ?? x.kind} · {fmt(Number(x.amount))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeExpense(x.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PortalLayout>
  );
};

export default PartnerReportsPage;
