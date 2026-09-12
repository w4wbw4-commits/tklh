import { useEffect, useState } from "react";
import { bookingsService } from "@/domain";
import { PortalLayout, PortalHeader } from "@/components/tekillah/vendor/PortalLayout";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { Card } from "@/components/ui/card";
import { Wallet, Clock, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const monthLabel = (d: Date) => d.toLocaleDateString("ar-SA", { month: "short" });

const PartnerAnalyticsPage = () => {
  const { vendor } = usePartnerVendor();
  const [data, setData] = useState({
    totalEarnings: 0, pendingPayments: 0, growth: 0,
    monthly: [] as Array<{ month: string; revenue: number; bookings: number }>,
  });

  useEffect(() => {
    if (!vendor) return;
    (async () => {
      const { data: rows } = await bookingsService.listForVendorAnalytics(vendor.id);
      const all = (rows as Array<{ event_date: string; total_price: number | null; status: string }>) || [];
      const totalEarnings = all.filter((b) => ["confirmed", "completed"].includes(b.status)).reduce((s, b) => s + Number(b.total_price ?? 0), 0);
      const pendingPayments = all.filter((b) => b.status === "pending").reduce((s, b) => s + Number(b.total_price ?? 0), 0);
      const buckets: Record<string, { revenue: number; bookings: number }> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        buckets[key] = { revenue: 0, bookings: 0 };
      }
      all.forEach((b) => {
        const key = b.event_date.slice(0, 7);
        if (buckets[key] && ["confirmed", "completed"].includes(b.status)) {
          buckets[key].revenue += Number(b.total_price ?? 0); buckets[key].bookings += 1;
        }
      });
      const monthly = Object.entries(buckets).map(([key, v]) => {
        const [y, m] = key.split("-");
        return { month: monthLabel(new Date(Number(y), Number(m) - 1, 1)), ...v };
      });
      const growth = monthly.length >= 2 && monthly[monthly.length - 2].revenue > 0
        ? ((monthly[monthly.length - 1].revenue - monthly[monthly.length - 2].revenue) / monthly[monthly.length - 2].revenue) * 100 : 0;
      setData({ totalEarnings, pendingPayments, growth, monthly });
    })();
  }, [vendor]);

  return (
    <PortalLayout>
      <PortalHeader title="التحليلات والإيرادات" subtitle="نظرة شاملة على أداء قاعتك المالي" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-primary bg-primary p-5 text-primary-foreground"><Wallet className="h-5 w-5 text-secondary" /><div className="mt-3 text-3xl font-black">{fmt(data.totalEarnings)}</div><div className="mt-1 text-xs font-bold text-primary-foreground/70">إجمالي الإيرادات ()</div></Card>
        <Card className="p-5"><Clock className="h-5 w-5 text-secondary" /><div className="mt-3 text-3xl font-black">{fmt(data.pendingPayments)}</div><div className="mt-1 text-xs font-bold text-muted-foreground">مدفوعات معلقة ()</div></Card>
        <Card className="p-5">
          <TrendingUp className={`h-5 w-5 ${data.growth >= 0 ? "text-primary" : "text-destructive"}`} />
          <div className={`mt-3 text-3xl font-black ${data.growth >= 0 ? "text-primary" : "text-destructive"}`}>
            {data.growth >= 0 ? "+" : ""}{data.growth.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs font-bold text-muted-foreground">نمو شهر/شهر</div>
        </Card>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 font-black">الإيرادات الشهرية ()</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 font-black">عدد الحجوزات الشهرية</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="hsl(var(--secondary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default PartnerAnalyticsPage;
