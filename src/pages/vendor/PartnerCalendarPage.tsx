import { PortalLayout, PortalHeader, PortalSubnav, BOOKINGS_SUBNAV } from "@/components/tekillah/vendor/PortalLayout";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { VendorCalendar } from "@/components/tekillah/vendor/VendorCalendar";

const PartnerCalendarPage = () => {
  const { vendor, loading } = usePartnerVendor();
  return (
    <PortalLayout>
      <PortalHeader
        title="تقويم الحجوزات"
        subtitle="إدارة الأيام المحجوزة والمحتملة والمتاحة — اضغط أي يوم لإضافة حدث"
        badge="تفاعلي"
      />
      <PortalSubnav items={BOOKINGS_SUBNAV} />
      {loading ? (
        <div className="grid place-items-center py-24 text-muted-foreground">جارٍ التحميل…</div>
      ) : vendor ? (
        <VendorCalendar vendorId={vendor.id} vendorName={vendor.business_name} vendorVatNumber={vendor.vat_number ?? null} />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          أكمل بياناتك أولاً من «بيانات قاعتي» للبدء بإدارة التقويم.
        </div>
      )}
    </PortalLayout>
  );
};

export default PartnerCalendarPage;

