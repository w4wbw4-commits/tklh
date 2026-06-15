import { useTranslation } from "react-i18next";
import { Receipt } from "lucide-react";
import { LegalPage } from "@/components/tekillah/LegalPage";

interface Section { title: string; body: string; }

const RefundPolicy = () => {
  const { t } = useTranslation();
  const sections = (t("terms.refundSections", { returnObjects: true }) as Section[]) || [];
  return (
    <LegalPage
      icon={Receipt}
      title={t("terms.refundTitle")}
      intro={t("terms.refundIntro")}
      sections={sections}
      canonical="/refund-policy"
    />
  );
};

export default RefundPolicy;
