import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalLayout, PortalHeader } from "@/components/tekillah/vendor/PortalLayout";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

type Booking = { id: string; event_date: string; total_price: number | null; status: string; guest_count: number | null };

const PartnerSalesPage = () => {
  const { vendor } = usePartnerVendor();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!vendor) return;
    const { data } = await supabase.from("bookings").select("id, event_date, total_price, status, guest_count").eq("vendor_id", vendor.id).order("event_date", { ascending: false });
    setBookings((data as Booking[]) || []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [vendor]);

  const totals = bookings.reduce((acc, b) => ({
    count: acc.count + 1,
    revenue: acc.revenue + (["confirmed", "completed"].includes(b.status) ? Number(b.total_price ?? 0) : 0),
  }), { count: 0, revenue: 0 });

  const exportExcel = () => {
    const data = bookings.map((b) => ({
      "التاريخ": b.event_date, "عدد الضيوف": b.guest_count ?? 0,
      "المبلغ": Number(b.total_price ?? 0), "الحالة": b.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المبيعات");
    XLSX.writeFile(wb, `sales-${vendor?.business_name ?? "venue"}-${Date.now()}.xlsx`);
    toast.success("تم تصدير ملف Excel");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text("Sales Report", 105, 18, { align: "center" });
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Vendor: ${vendor?.business_name ?? ""}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);
    doc.text(`Total bookings: ${totals.count}  |  Revenue: ${fmt(totals.revenue)} SAR`, 14, 40);
    autoTable(doc, {
      startY: 48,
      head: [["Date", "Guests", "Amount (SAR)", "Status"]],
      body: bookings.map((b) => [b.event_date, String(b.guest_count ?? 0), fmt(Number(b.total_price ?? 0)), b.status]),
      theme: "striped", headStyles: { fillColor: [82, 92, 50] }, styles: { fontSize: 9 },
    });
    doc.save(`sales-report-${Date.now()}.pdf`);
    toast.success("تم تصدير التقرير");
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["التاريخ", "عدد الضيوف", "المبلغ"],
      ["2026-06-15", 200, 18000],
      ["2026-07-02", 150, 14500],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "tklh-import-template.xlsx");
  };

  return (
    <PortalLayout>
      <PortalHeader title="استيراد وتصدير المبيعات" subtitle="اربط مبيعاتك السابقة وصدّر تقاريرك بضغطة" badge="ربط شغلك الحالي" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card className="p-5"><div className="text-xs font-bold text-muted-foreground">إجمالي الحجوزات</div><div className="mt-2 text-3xl font-black">{fmt(totals.count)}</div></Card>
        <Card className="border-primary bg-primary p-5 text-primary-foreground"><div className="text-xs font-bold text-primary-foreground/70">إجمالي الإيرادات</div><div className="mt-2 text-3xl font-black">{fmt(totals.revenue)} </div></Card>
        <Card className="border-secondary bg-secondary p-5"><div className="text-xs font-bold text-primary-deep">متوسط الحجز</div><div className="mt-2 text-3xl font-black text-primary-deep">{fmt(totals.count ? totals.revenue / totals.count : 0)} </div></Card>
      </div>
      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary-deep"><Upload className="h-6 w-6" /></div>
            <div><h3 className="text-lg font-black">قالب الاستيراد</h3><p className="text-xs text-muted-foreground">حمّل القالب لتنظيم بياناتك قبل الرفع</p></div>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" />
          <div className="flex gap-2">
            <Button onClick={downloadTemplate} variant="outline" className="flex-1"><Download className="ml-2 h-4 w-4" /> قالب جاهز</Button>
          </div>
        </Card>
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary-deep"><Download className="h-6 w-6" /></div>
            <div><h3 className="text-lg font-black">تصدير المبيعات</h3><p className="text-xs text-muted-foreground">للمحاسب أو للأرشيف الشخصي</p></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportExcel} className="flex-1"><FileSpreadsheet className="ml-2 h-4 w-4" /> Excel</Button>
            <Button onClick={exportPDF} variant="outline" className="flex-1"><FileText className="ml-2 h-4 w-4" /> تقرير PDF</Button>
          </div>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/60"><tr className="text-right text-xs font-black text-foreground/70"><th className="p-4">التاريخ</th><th className="p-4">الضيوف</th><th className="p-4">المبلغ</th><th className="p-4">الحالة</th></tr></thead>
            <tbody>
              {bookings.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">لا توجد مبيعات بعد.</td></tr>}
              {bookings.slice(0, 50).map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="p-4 text-muted-foreground">{new Date(b.event_date).toLocaleDateString("ar-SA")}</td>
                  <td className="p-4 text-muted-foreground">{b.guest_count || 0}</td>
                  <td className="p-4 font-black">{fmt(Number(b.total_price ?? 0))} </td>
                  <td className="p-4"><span className="rounded-full bg-muted px-2 py-1 text-[10px] font-black text-foreground/70">{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalLayout>
  );
};

export default PartnerSalesPage;
