import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id?: string;
}

export const TermsCheckbox = ({ checked, onCheckedChange, id = "tos" }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-border bg-secondary/40 p-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(Boolean(v))}
        className="mt-0.5"
      />
      <label htmlFor={id} className="cursor-pointer text-xs leading-relaxed text-foreground/75">
        {t("terms.agreePrefix")}{" "}
        <Link to="/terms" target="_blank" className="font-semibold text-primary underline-offset-2 hover:underline">
          {t("terms.tosLink")}
        </Link>{" "}
        {t("common.and")}{" "}
        <Link to="/privacy" target="_blank" className="font-semibold text-primary underline-offset-2 hover:underline">
          {t("terms.privacyLink")}
        </Link>
        .
      </label>
    </div>
  );
};
