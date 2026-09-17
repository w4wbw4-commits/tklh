import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Loader2, MessageSquareWarning } from "lucide-react";
import { partnerService } from "@/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/tekillah/PasswordInput";
import { PartnerAuthShell, PhoneField } from "@/components/tekillah/vendor/PartnerAuthShell";
import { formatSaudiLocal, normalizeSaudiPhone } from "@/lib/phone";

const errorText = (code: string) =>
  ({
    no_account: "لا يوجد حساب شريك مرتبط بهذا الرقم",
    rate_limited: "تم إرسال عدد كبير من الرموز، حاول بعد ساعة",
    invalid_code: "رمز التحقق غير صحيح",
    code_expired: "انتهت صلاحية الرمز، اطلب رمزًا جديدًا",
    weak_password: "كلمة المرور يجب أن تكون 8 خانات على الأقل وتتضمن حرفًا ورقمًا",
  })[code] ?? "تعذر إكمال العملية، حاول مرة أخرى";

/**
 * Partner password reset: mobile number → verification code → new password →
 * signed in. No SMS provider is connected yet, so when delivery is not
 * possible we say so plainly instead of pretending a message was sent.
 */
const PartnerForgotPassword = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notDelivered, setNotDelivered] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const sendCode = async () => {
    const phone = normalizeSaudiPhone(phoneLocal);
    if (!phone) {
      toast.error("أدخل رقم جوال سعودي صحيح (5XXXXXXXX)");
      return;
    }
    setBusy(true);
    try {
      const res = await partnerService.sendPartnerCode(phone, "reset");
      setNotDelivered(!res.delivered);
      setDevCode(res.devCode ?? null);
      setStage("code");
      if (res.delivered) toast.success("أرسلنا رمز التحقق إلى جوالك");
    } catch (e) {
      toast.error(errorText((e as Error).message));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const phone = normalizeSaudiPhone(phoneLocal);
    if (!phone) return;
    setBusy(true);
    try {
      await partnerService.resetPartnerPassword(phone, code.trim(), password);
      const { error } = await partnerService.signInWithPhonePassword(phone, password);
      if (error) {
        toast.success("تم تحديث كلمة المرور، سجّل الدخول الآن");
        navigate("/partner/login", { replace: true });
        return;
      }
      toast.success("تم تحديث كلمة المرور");
      navigate("/partner", { replace: true });
    } catch (e) {
      toast.error(errorText((e as Error).message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PartnerAuthShell
      title="استعادة كلمة المرور | شركاء تِكله"
      description="استعد كلمة مرور حساب الشريك في تِكله عبر رقم جوالك."
      canonical="/partner/forgot-password"
      eyebrow="لوحة تحكم الشريك"
      heading="نسيت كلمة المرور"
      sub={
        stage === "phone"
          ? "أدخل رقم جوالك المسجّل وسنرسل لك رمز تحقق لتعيين كلمة مرور جديدة."
          : "أدخل رمز التحقق ثم كلمة المرور الجديدة."
      }
      footer={
        <Link to="/partner/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          العودة لتسجيل الدخول
        </Link>
      }
    >
      {stage === "phone" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="pf-phone">رقم الجوال</Label>
            <PhoneField id="pf-phone" value={formatSaudiLocal(phoneLocal)} onChange={setPhoneLocal} />
          </div>
          <Button
            onClick={sendCode}
            disabled={busy}
            className="h-12 w-full rounded-full bg-primary-deep text-base text-primary-foreground hover:bg-primary-deep/90"
          >
            {busy ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
            إرسال رمز التحقق
            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
          </Button>
        </>
      ) : (
        <>
          {notDelivered ? (
            <div className="flex gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm leading-relaxed text-foreground/80">
              <MessageSquareWarning className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div>
                خدمة الرسائل النصية غير مربوطة بعد، لذلك لم تُرسل رسالة فعلية إلى جوالك.
                {devCode ? (
                  <>
                    {" "}الرمز للتجربة الحالية:{" "}
                    <span dir="ltr" className="font-bold tracking-[0.3em] text-primary-deep">{devCode}</span>
                  </>
                ) : (
                  " تواصل مع فريق تِكله لإكمال استعادة كلمة المرور."
                )}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="pf-code">رمز التحقق</Label>
            <Input
              id="pf-code"
              dir="ltr"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D+/g, ""))}
              placeholder="••••••"
              className="h-12 rounded-xl text-center text-lg tracking-[0.4em]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-pass">كلمة المرور الجديدة</Label>
            <PasswordInput
              id="pf-pass"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder="8 خانات على الأقل، حرف ورقم"
              show={show}
              onToggle={() => setShow((s) => !s)}
              t={(k) => (k === "auth.hidePassword" ? "إخفاء كلمة المرور" : "إظهار كلمة المرور")}
            />
          </div>

          <Button
            onClick={submit}
            disabled={busy || code.length !== 6 || password.length < 8}
            className="h-12 w-full rounded-full bg-primary-deep text-base text-primary-foreground hover:bg-primary-deep/90"
          >
            {busy ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
            تعيين كلمة المرور والدخول
          </Button>

          <button
            type="button"
            onClick={() => setStage("phone")}
            className="w-full text-center text-sm text-foreground/60 underline-offset-4 hover:underline"
          >
            تغيير رقم الجوال
          </button>
        </>
      )}
    </PartnerAuthShell>
  );
};

export default PartnerForgotPassword;
