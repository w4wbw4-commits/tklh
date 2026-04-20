import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  show: boolean;
  onToggle: () => void;
  t: (k: string) => string;
}

/**
 * Reusable password input with a show/hide eye toggle. Extracted from the old
 * email-based Auth page so the password reset flow can keep working after we
 * pivoted Auth to phone-OTP.
 */
export const PasswordInput = ({
  id, value, onChange, placeholder, autoComplete, show, onToggle, t,
}: PasswordInputProps) => (
  <div className="relative">
    <Input
      id={id}
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="pe-10"
    />
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")}
      className="absolute end-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-md text-foreground/50 transition-colors hover:bg-secondary hover:text-foreground"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
);
