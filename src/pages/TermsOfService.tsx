import { useTranslation } from "react-i18next";
import { ScrollText } from "lucide-react";
import { LegalPage } from "@/components/tekillah/LegalPage";

interface Section { title: string; body: string; }

const TermsOfService = () => {
  const { t } = useTranslation();
  const sections = (t("terms.tosSections", { returnObjects: true }) as Section[]) || [];
  return (
    <LegalPage
      icon={ScrollText}
      title={t("terms.tosTitle")}
      intro={t("terms.tosIntro")}
      sections={sections}
      canonical="/terms"
    />
  );
};

export default TermsOfService;
