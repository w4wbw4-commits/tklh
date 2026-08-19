import { useEffect, useRef, useState } from "react";
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
import { ArrowRight, CheckCircle2, Loader2, Phone, MessageSquareLock, Pencil } from "lucide-react";
import { Logo } from "@/components/tekillah/Logo";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  formatSaudiLocal,
  normalizeSaudiPhone,
  phoneToSyntheticEmail,
  requestOtp,
  verifyOtpAndGetCredentials,
} from "@/lib/phone";
import { upsertCustomerLead } from "@/lib/leads";
import { isPendingPlanReady, loadPendingPlan } from "@/lib/pendingPlan";

type Stage = "phone" | "otp" | "profile";

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const explicitRedirect = params.get("redirect");

  // Decide where the user should land after auth:
  // - explicit `?redirect=` always wins (e.g. came from /dashboard guard)
  // - else: if a pending guest plan is waiting, go to /dashboard so it
  //   finalises and forwards to /checkout/:bookingId
  // - else: go home.
  const computeRedirect = (emailHint?: string | null, phoneHint?: string | null) => {
    if (explicitRedirect) return explicitRedirect;
    // Primary admin allowlist — always route to /admin after login.
    const email = emailHint ?? user?.email;
    const phone = phoneHint ?? user?.phone;
    if (email === "966554430196@phone.tekillah.app" || phone === "+966554430196") {
      return "/admin";
    }
    return isPendingPlanReady(loadPendingPlan()) ? "/dashboard" : "/";
  };

  const { user, loading: authLoading } = useAuth();
  const [stage, setStage] = useState<Stage>("phone");
  const [localInput, setLocalInput] = useState("");
  const [phoneE164, setPhoneE164] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [fullName, setFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [signedUserId, setSignedUserId] = useState<string | null>(null);
  const verifyInFlightRef = useRef(false);
  // Set once the first-time profile step is required, so the auto-redirect
  // effect doesn't skip it after the session is established.
  const holdForProfileRef = useRef(false);

  useEffect(() => {
    if (!authLoading && user && !holdForProfileRef.current) {
      navigate(computeRedirect(), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, navigate]);

  // Cooldown ticker for the "Resend" button
  useEffect(() => {
    if (!resendCooldown) return;
    const id = setTimeout(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const showDevCodeToast = (code?: string) => {
    if (!code) {
      toast.success(t("auth.phone.codeSentDevDesc"));
      return;
    }
    toast.success(t("auth.phone.codeSentDev", { code }), {
      duration: 12000,
      description: t("auth.phone.codeSentDevDesc"),
      action: {
        label: t("auth.phone.copyCode"),
        onClick: () => {
          navigator.clipboard?.writeText(code).catch(() => {});
          toast.success(t("auth.phone.codeCopied"));
        },
      },
    });
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeSaudiPhone(localInput);
    if (!normalized) {
      toast.error(t("auth.phone.errors.invalid"));
      return;
    }
    setSubmitting(true);
    try {
      const { devCode } = await requestOtp(normalized);
      setPhoneE164(normalized);
      setStage("otp");
      setResendCooldown(30);
      setOtp("");
      setOtpError(null);
      setOtpVerified(false);
      showDevCodeToast(devCode);
    } catch {
      toast.error(t("auth.phone.errors.sendFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (codeOverride?: string) => {
    if (!phoneE164 || verifyInFlightRef.current) return;
    const code = codeOverride ?? otp;
    setOtpError(null);
    setOtpVerified(false);

    if (code.length !== 6) {
      setOtpError(t("auth.phone.errors.codeLength"));
      return;
    }

    verifyInFlightRef.current = true;
    setSubmitting(true);

    try {
      // The code is validated on the server; it also returns single-use
      // credentials for the immediate sign-in.
      const { userId, email, password, needsProfile, displayName, contactEmail: savedEmail } =
        await verifyOtpAndGetCredentials(phoneE164, code);
      setOtpVerified(true);
      if (needsProfile) holdForProfileRef.current = true;

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !signInData.user) throw signInError ?? new Error("Sign-in failed");

      const uid = userId ?? signInData.user.id;
      setSignedUserId(uid);

      upsertCustomerLead({
        userId: uid,
        phone: phoneE164,
        displayName: displayName ?? undefined,
        contactEmail: savedEmail ?? undefined,
        status: "verified",
        source: "phone_otp",
      });

      // First-time user (or missing details): collect name + email before
      // sending them into the app.
      if (needsProfile) {
        setFullName(displayName ?? "");
        setContactEmail(savedEmail ?? "");
        setProfileError(null);
        setStage("profile");
        return;
      }

      const hasPendingPlan = isPendingPlanReady(loadPendingPlan());
      if (hasPendingPlan) setSavingPlan(true);

      toast.success(t("auth.phone.verified"));
      const dest = computeRedirect(email, phoneE164);
      setTimeout(() => navigate(dest, { replace: true }), 250);
    } catch {
      holdForProfileRef.current = false;
      setOtpVerified(false);
      setOtpError(t("auth.phone.errors.codeInvalid"));
    } finally {
      setSubmitting(false);
      verifyInFlightRef.current = false;
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneE164) return;
    const name = fullName.trim();
    const mail = contactEmail.trim().toLowerCase();

    if (name.length < 2) {
      setProfileError(t("auth.phone.errors.nameRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setProfileError(t("auth.phone.errors.emailRequired"));
      return;
    }

    setProfileError(null);
    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      const uid = signedUserId ?? sessionData.user?.id;
      if (!uid) throw new Error("No session");

      const { error } = await supabase
        .from("profiles")
        .update({ display_name: name, contact_email: mail, phone: phoneE164 })
        .eq("user_id", uid);
      if (error) throw error;

      await upsertCustomerLead({
        userId: uid,
        phone: phoneE164,
        displayName: name,
        contactEmail: mail,
        status: "verified",
        source: "phone_otp",
      });

      holdForProfileRef.current = false;
      toast.success(t("auth.phone.profileSaved"));

      const hasPendingPlan = isPendingPlanReady(loadPendingPlan());
      if (hasPendingPlan) setSavingPlan(true);
      const dest = computeRedirect(sessionData.user?.email ?? null, phoneE164);
      setTimeout(() => navigate(dest, { replace: true }), 250);
    } catch {
      setProfileError(t("auth.phone.errors.profileFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!phoneE164 || resendCooldown > 0) return;
    setSubmitting(true);
    try {
      const { devCode } = await requestOtp(phoneE164);
      setResendCooldown(30);
      setOtp("");
      setOtpError(null);
      setOtpVerified(false);
      showDevCodeToast(devCode);
    } catch {
      toast.error(t("auth.phone.errors.sendFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-soft">
      <SEO
        title="تسجيل الدخول | TKLH"
        description="سجل الدخول إلى منصة تِكله TKLH عبر رقم جوالك السعودي لإدارة مناسبتك وحجوزاتك."
        canonical="/auth"
        noindex
      />
      <AnimatePresence>
        {savingPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-10 py-8 shadow-luxury">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-arabic text-base font-medium text-foreground">
                {t("auth.phone.savingPlan")}
              </p>
              <p className="text-xs text-foreground/60">{t("auth.phone.savingPlanHint")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link to="/" className="text-sm text-foreground/70 hover:text-foreground">
          {t("common.backToHome")}
        </Link>
      </header>

      <div className="mx-auto flex max-w-md flex-col items-center px-6 pb-20 pt-10">
        {/* Official TKLH lockup */}
        <div className="mb-6 flex justify-center">
          <Logo className="scale-125" />
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
                      onClick={() => { setStage("phone"); setOtp(""); setOtpError(null); setOtpVerified(false); }}
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
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      containerClassName="justify-center"
                      onChange={(v) => {
                        setOtpError(null);
                        if (otpVerified) setOtpVerified(false);
                        setOtp(v);
                        if (v.length === 6) handleVerify(v);
                      }}
                      className="tabular-nums"
                    >
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} className={otpVerified ? "border-success ring-1 ring-success/20 text-success" : otpError ? "border-destructive" : ""} />
                        <InputOTPSlot index={1} className={otpVerified ? "border-success ring-1 ring-success/20 text-success" : otpError ? "border-destructive" : ""} />
                        <InputOTPSlot index={2} className={otpVerified ? "border-success ring-1 ring-success/20 text-success" : otpError ? "border-destructive" : ""} />
                        <InputOTPSlot index={3} className={otpVerified ? "border-success ring-1 ring-success/20 text-success" : otpError ? "border-destructive" : ""} />
                        <InputOTPSlot index={4} className={otpVerified ? "border-success ring-1 ring-success/20 text-success" : otpError ? "border-destructive" : ""} />
                        <InputOTPSlot index={5} className={otpVerified ? "border-success ring-1 ring-success/20 text-success" : otpError ? "border-destructive" : ""} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="min-h-5 text-center text-xs">
                    {otpVerified ? (
                      <span className="inline-flex items-center gap-1 font-medium text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("auth.phone.verified")}
                      </span>
                    ) : otpError ? (
                      <span className="text-destructive">{otpError}</span>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleVerify()}
                    disabled={submitting || otp.length !== 6 || otpVerified}
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
