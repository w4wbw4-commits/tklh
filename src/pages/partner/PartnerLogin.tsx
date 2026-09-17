import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { partnerService } from "@/domain";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/tekillah/PasswordInput";
import { PartnerAuthShell, PhoneField } from "@/components/tekillah/vendor/PartnerAuthShell";
import { formatSaudiLocal, normalizeSaudiPhone } from "@/lib/phone";

/**
 * Partner sign-in — mobile number + password.
 * The account is created at registration; the vendor role (and therefore portal
 * access) is granted only after admin approval, enforced by RLS and the
 * RequirePartner guard.
 */
const PartnerLogin = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/partner";

  const [phoneLocal, setPhoneLocal] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const phone = normalizeSaudiPhone(phoneLocal);
    if (!phone) {
      toast.error("أدخل رقم جوال سعودي صحيح (5XXXXXXXX)");
      return;
    }
    if (!password) {
      toast.error("أدخل كلمة المرور");
      return;
    }
    setBusy(true);
    const { error } = await partnerService.signInWithPhonePassword(phone, password);
    setBusy(false);
    if (error) {
      toast.error("رقم الجوال أو كلمة المرور غير صحيحة");
      return;
    }
    navigate(redirect, { replace: true });
  };

  return (
    <PartnerAuthShell
      title="دخول الشركاء | تِكله"
      description="سجّل الدخول إلى لوحة تحكم الشريك في تِكله برقم جوالك وكلمة المرور."
      canonical="/partner/login"
      eyebrow="لوحة تحكم الشريك"
      heading="تسجيل الدخول"
      sub="أدخل رقم جوالك وكلمة المرور للوصول إلى حجوزاتك وتقويمك وفواتيرك."
      footer={
        <>
          ليس لديك حساب؟{" "}
          <Link to="/partner/register" className="font-semibold text-primary underline-offset-4 hover:underline">
            انضم كمزود خدمة جديد
          </Link>
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="pl-phone">رقم الجوال</Label>
        <PhoneField id="pl-phone" value={formatSaudiLocal(phoneLocal)} onChange={setPhoneLocal} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pl-pass">كلمة المرور</Label>
        <PasswordInput
          id="pl-pass"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="••••••••"
          show={show}
          onToggle={() => setShow((s) => !s)}
          t={(k) => (k === "auth.hidePassword" ? "إخفاء كلمة المرور" : "إظهار كلمة المرور")}
        />
      </div>

      <Button
        onClick={submit}
        disabled={busy}
        className="h-12 w-full rounded-full bg-primary-deep text-base text-primary-foreground hover:bg-primary-deep/90"
      >
        {busy ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
        دخول
        <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
      </Button>

      <p className="text-center text-sm">
        <Link to="/partner/forgot-password" className="text-primary underline-offset-4 hover:underline">
          نسيت كلمة المرور؟
        </Link>
      </p>
    </PartnerAuthShell>
  );
};

export default PartnerLogin;
