import { PortalLayout, PortalHeader } from "@/components/tekillah/vendor/PortalLayout";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { VendorNotifications } from "@/components/tekillah/vendor/VendorNotifications";

const PartnerNotificationsPage = () => {
  const { user, loading } = usePartnerVendor();
  return (
    <PortalLayout>
      <PortalHeader title="الإشعارات" subtitle="كل التنبيهات المتعلقة بحسابك وقاعتك" />
      {loading || !user ? (
        <div className="grid place-items-center py-24 text-muted-foreground">جارٍ التحميل…</div>
      ) : (
        <VendorNotifications userId={user.id} />
      )}
    </PortalLayout>
  );
};

export default PartnerNotificationsPage;
