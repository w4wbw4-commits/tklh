import { PortalLayout, PortalHeader } from "@/components/tekillah/vendor/PortalLayout";
import { StatusBanner } from "@/components/tekillah/vendor/StatusBanner";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { VendorReviews } from "@/components/tekillah/vendor/VendorReviews";

const PartnerReviewsPage = () => {
  const { vendor, user, loading } = usePartnerVendor();
  return (
    <PortalLayout>
      <PortalHeader title="التقييمات" subtitle="ردود العملاء والتقييمات الواردة" />
      <StatusBanner vendor={vendor} />
      {loading ? (
        <div className="grid place-items-center py-24 text-muted-foreground">جارٍ التحميل…</div>
      ) : vendor && user && vendor.approval_status === "approved" ? (
        <VendorReviews vendorId={vendor.id} vendorUserId={user.id} />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          التقييمات تظهر بعد اعتماد الملف وبدء استلام الحجوزات.
        </div>
      )}
    </PortalLayout>
  );
};

export default PartnerReviewsPage;
