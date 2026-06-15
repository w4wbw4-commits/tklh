import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalLayout, PortalHeader } from "@/components/tekillah/vendor/PortalLayout";
import { StatusBanner } from "@/components/tekillah/vendor/StatusBanner";
import { usePartnerVendor } from "@/hooks/usePartnerVendor";
import { VendorProfileForm } from "@/components/tekillah/vendor/VendorProfileForm";
import { WelcomeDialog } from "@/components/tekillah/vendor/WelcomeDialog";
import { useAuth } from "@/hooks/useAuth";
import type { VendorRow } from "@/components/tekillah/vendor/types";

const PartnerProfilePage = () => {
  const { vendor, user, loading, refresh } = usePartnerVendor();
  const { loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [welcomeVendor, setWelcomeVendor] = useState<VendorRow | null>(null);

  // Redirect unauthenticated visitors to login instead of hanging on a spinner.
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/partner/profile", { replace: true });
    }
  }, [authLoading, user, navigate]);


  const handleSaved = (v: VendorRow) => {
    refresh();
    // Show welcome popup on first save (when profile didn't exist before).
    if (!vendor) {
      setWelcomeVendor(v);
      setWelcomeOpen(true);
    }
  };

  return (
    <PortalLayout>
      <PortalHeader title="بيانات قاعتي" subtitle="معلومات الشركة، السجل التجاري، والباقات" />
      <StatusBanner vendor={vendor} />
      {loading || !user ? (
        <div className="grid place-items-center py-24 text-muted-foreground">جارٍ التحميل…</div>
      ) : (
        <VendorProfileForm userId={user.id} vendor={vendor} onSaved={handleSaved} />
      )}
      <WelcomeDialog
        open={welcomeOpen}
        onOpenChange={setWelcomeOpen}
        vendor={welcomeVendor}
        onEnter={() => {
          setWelcomeOpen(false);
          navigate("/partner");
        }}
      />
    </PortalLayout>
  );
};

export default PartnerProfilePage;
