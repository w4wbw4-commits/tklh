import { PortalLayout, PortalHeader } from "@/components/tekillah/vendor/PortalLayout";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { VendorBookings } from "@/components/tekillah/vendor/VendorBookings";
import { VendorCalendar } from "@/components/tekillah/vendor/VendorCalendar";
import { VendorPackagesManager } from "@/components/tekillah/vendor/VendorPackagesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PartnerBookingsPage = () => {
  const { vendor, loading } = usePartnerVendor();
  const isApproved = vendor?.approval_status === "approved";

  return (
    <PortalLayout>
      <PortalHeader title="الحجوزات" subtitle="الطلبات الواردة، التقويم والحجز اليدوي، والباقات والعروض" />
      {loading ? (
        <div className="grid place-items-center py-24 text-muted-foreground">جارٍ التحميل…</div>
      ) : !vendor ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          أكمل بياناتك أولاً من تبويب «بياناتي».
        </div>
      ) : !isApproved ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          الحجوزات تظهر بعد اعتماد ملفك من الإدارة.
        </div>
      ) : (
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-card p-1 shadow-card">
            <TabsTrigger value="requests" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              التقويم والحجز اليدوي
            </TabsTrigger>
            <TabsTrigger value="packages" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              الباقات والعروض
            </TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="requests"><VendorBookings vendorId={vendor.id} /></TabsContent>
            <TabsContent value="calendar">
              <VendorCalendar vendorId={vendor.id} vendorName={vendor.business_name} vendorVatNumber={vendor.vat_number ?? null} />
            </TabsContent>
            <TabsContent value="packages">
              <VendorPackagesManager
                vendorId={vendor.id}
                basePrice={Number(vendor.starting_price || 0)}
                userId={vendor.user_id}
              />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </PortalLayout>
  );
};

export default PartnerBookingsPage;
