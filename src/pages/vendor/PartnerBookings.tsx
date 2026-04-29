import { PortalLayout, PortalHeader } from "@/components/tekillah/vendor/PortalLayout";
import { StatusBanner } from "@/components/tekillah/vendor/StatusBanner";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { VendorBookings } from "@/components/tekillah/vendor/VendorBookings";

const PartnerBookingsPage = () => {
  const { vendor, loading } = usePartnerVendor();
  const isApproved = vendor?.approval_status === "approved";

  return (
    <PortalLayout>
      <PortalHeader title="الحجوزات" subtitle="إدارة كل طلبات الحجز الواردة لقاعتك" />
      <StatusBanner vendor={vendor} />
      {loading ? (
        <div className="grid place-items-center py-24 text-muted-foreground">جارٍ التحميل…</div>
      ) : !vendor ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          أكمل بياناتك أولاً من تبويب «بيانات قاعتي».
        </div>
      ) : !isApproved ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          الحجوزات تظهر بعد اعتماد ملفك من الإدارة.
        </div>
      ) : (
        <VendorBookings vendorId={vendor.id} />
      )}
    </PortalLayout>
  );
};

export default PartnerBookingsPage;
