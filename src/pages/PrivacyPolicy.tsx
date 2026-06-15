import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { LegalPage } from "@/components/tekillah/LegalPage";

interface Section { title: string; body: string; }

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const sections = (t("terms.privacySections", { returnObjects: true }) as Section[]) || [];
  return (
    <LegalPage
      icon={ShieldCheck}
      title={t("terms.privacyTitle")}
      intro={t("terms.privacyIntro")}
      sections={sections}
      canonical="/privacy"
    />
  );
};

export default PrivacyPolicy;
