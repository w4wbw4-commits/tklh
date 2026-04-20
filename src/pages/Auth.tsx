import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowRight, Loader2, Phone, MessageSquareLock, Pencil } from "lucide-react";
import { Logo } from "@/components/tekillah/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  formatSaudiLocal,
  normalizeSaudiPhone,
  phoneToSyntheticEmail,
  phoneToSyntheticPassword,
  sendOtp,
  verifyOtp,
} from "@/lib/phone";
import { upsertCustomerLead } from "@/lib/leads";

type Stage = "phone" | "otp";

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") || "/dashboard";

  const { user, loading: authLoading } = useAuth();
  const [stage, setStage] = useState<Stage>("phone");
  const [localInput, setLocalInput] = useState("");
  const [phoneE164, setPhoneE164] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!authLoading && user) navigate(redirectTo, { replace: true });
  }, [user, authLoading, navigate, redirectTo]);

  // Cooldown ticker for the "Resend" button
  useEffect(() => {
    if (!resendCooldown) return;
    const id = setTimeout(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeSaudiPhone(localInput);
    if (!normalized) {
      toast.error(t("auth.phone.errors.invalid"));
      return;
    }
    setSubmitting(true);
    try {
      const code = await sendOtp(normalized);
      setPhoneE164(normalized);
      setStage("otp");
      setResendCooldown(30);
      // Dev visibility — production swap will remove this toast.
      toast.success(t("auth.phone.codeSentDev", { code }), { duration: 8000 });
    } catch {
      toast.error(t("auth.phone.errors.sendFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (codeOverride?: string) => {
    if (!phoneE164) return;
    const code = codeOverride ?? otp;
    if (code.length !== 6) {
      toast.error(t("auth.phone.errors.codeLength"));
      return;
    }
    if (!verifyOtp(phoneE164, code)) {
      toast.error(t("auth.phone.errors.codeInvalid"));
      return;
    }

    setSubmitting(true);

    // Phone-only auth: mint a deterministic synthetic email + password so the
    // same phone always maps to the same auth.users row.
    const email = phoneToSyntheticEmail(phoneE164);
    const password = await phoneToSyntheticPassword(phoneE164);

    // Try sign-in first (returning user). If that fails with invalid creds,
    // sign up. Synthetic credentials keep the flow phone-first; the user
    // never sees or types email/password.
    let signedInUserId: string | null = null;
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInData.user) {
      signedInUserId = signInData.user.id;
    } else if (signInErr) {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectTo}`,
          data: { phone: phoneE164, display_name: phoneE164 },
        },
      });
      if (signUpErr || !signUpData.user) {
        setSubmitting(false);
        toast.error(t("auth.phone.errors.authFailed"));
        return;
      }
      signedInUserId = signUpData.user.id;
      // Sign-in afterwards in case session wasn't auto-issued.
      await supabase.auth.signInWithPassword({ email, password });
    }

    // Update profile.phone so admin lists are always consistent.
    if (signedInUserId) {
      await supabase
        .from("profiles")
        .update({ phone: phoneE164 })
        .eq("user_id", signedInUserId);

      // Fire-and-forget lead capture — never block the redirect on this.
      upsertCustomerLead({
        userId: signedInUserId,
        phone: phoneE164,
        status: "verified",
        source: "phone_otp",
      });
    }

    setSubmitting(false);
    toast.success(t("auth.phone.verified"));
    navigate(redirectTo, { replace: true });
  };

  const handleResend = async () => {
    if (!phoneE164 || resendCooldown > 0) return;
    setSubmitting(true);
    try {
      const code = await sendOtp(phoneE164);
      setResendCooldown(30);
      setOtp("");
      toast.success(t("auth.phone.codeSentDev", { code }), { duration: 8000 });
    } catch {
      toast.error(t("auth.phone.errors.sendFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link to="/" className="text-sm text-foreground/70 hover:text-foreground">
          {t("common.backToHome")}
        </Link>
      </header>

      <div className="mx-auto flex max-w-md flex-col items-center px-6 pb-20 pt-10">
        {/* Brand wordmark — geometric Kufic, matches hero */}
        <div className="mb-6 text-center">
          <div
            className="font-wordmark text-5xl font-black text-primary"
            style={{ WebkitTextFillColor: "hsl(var(--primary-deep, var(--primary)))" }}
          >
            تِكِلّه
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {stage === "phone" ? <Phone className="h-6 w-6" /> : <MessageSquareLock className="h-6 w-6" />}
            </div>
            <h1 className="font-arabic text-2xl font-semibold text-foreground sm:text-3xl">
              {stage === "phone" ? t("auth.phone.title") : t("auth.phone.otpTitle")}
            </h1>
            <p className="mt-2 text-sm text-foreground/65">
              {stage === "phone"
                ? t("auth.phone.subtitle")
                : t("auth.phone.otpSubtitle", { phone: phoneE164 })}
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-luxury sm:p-8">
            <AnimatePresence mode="wait">
              {stage === "phone" ? (
                <motion.form
                  key="phone-form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSendCode}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="phone-input">{t("auth.phone.label")}</Label>
                    <div className="flex items-stretch gap-2">
                      {/* Saudi country code chip */}
                      <div
                        dir="ltr"
                        className="flex shrink-0 items-center gap-1.5 rounded-md border border-input bg-secondary/50 px-3 text-sm font-medium text-foreground"
                      >
                        <span aria-hidden>🇸🇦</span>
                        <span>+966</span>
                      </div>
                      <Input
                        id="phone-input"
                        dir="ltr"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        value={localInput}
                        onChange={(e) => setLocalInput(formatSaudiLocal(e.target.value))}
                        placeholder="5X XXX XXXX"
                        className="text-base tracking-wider"
                      />
                    </div>
                    <p className="text-[11px] text-foreground/55">{t("auth.phone.hint")}</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {t("auth.phone.sendCode")}
                        <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="otp-form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <Label>{t("auth.phone.codeLabel")}</Label>
                    <button
                      type="button"
                      onClick={() => { setStage("phone"); setOtp(""); }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Pencil className="h-3 w-3" />
                      {t("auth.phone.editPhone")}
                    </button>
                  </div>

                  <div dir="ltr" className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(v) => {
                        setOtp(v);
                        if (v.length === 6) handleVerify(v);
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleVerify()}
                    disabled={submitting || otp.length !== 6}
                    className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {t("auth.phone.verify")}
                        <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                      </>
                    )}
                  </Button>

                  <div className="text-center text-xs text-foreground/65">
                    {resendCooldown > 0 ? (
                      <span>{t("auth.phone.resendIn", { seconds: resendCooldown })}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={submitting}
                        className="font-medium text-primary hover:underline"
                      >
                        {t("auth.phone.resend")}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-foreground/55">
              {t("auth.phone.legal")}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
