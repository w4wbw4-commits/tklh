import { PortalLayout, PortalHeader } from "@/components/tekillah/vendor/PortalLayout";
import { StatusBanner } from "@/components/tekillah/vendor/StatusBanner";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { VendorCalendar } from "@/components/tekillah/vendor/VendorCalendar";

const PartnerCalendarPage = () => {
  const { vendor, loading } = usePartnerVendor();
  const isApproved = vendor?.approval_status === "approved";
  return (
    <PortalLayout>
      <PortalHeader title="تقويم الحجوزات" subtitle="عرض وإدارة الأيام المحجوزة والمتاحة" />
      <StatusBanner vendor={vendor} />
      {loading ? (
        <div className="grid place-items-center py-24 text-muted-foreground">جارٍ التحميل…</div>
      ) : vendor && isApproved ? (
        <VendorCalendar vendorId={vendor.id} />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          التقويم متاح بعد اعتماد ملفك من الإدارة.
        </div>
      )}
    </PortalLayout>
  );
};

export default PartnerCalendarPage;
