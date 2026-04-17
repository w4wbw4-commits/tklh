import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Loader2, Building2, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/tekillah/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const redirectTo = params.get("redirect") || "/dashboard";

  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const emailSchema = z.string().trim().email({ message: t("auth.errors.invalidEmail") }).max(255);
  const passwordSchema = z.string().min(8, { message: t("auth.errors.shortPassword") }).max(72);
  const nameSchema = z.string().trim().min(2, { message: t("auth.errors.shortName") }).max(80);

  useEffect(() => {
    if (!authLoading && user) navigate(redirectTo, { replace: true });
  }, [user, authLoading, navigate, redirectTo]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) toast.error(err.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? t("auth.errors.invalidCreds") : error.message);
      return;
    }
    toast.success(t("auth.success.signin"));
    navigate(redirectTo, { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(displayName);
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) toast.error(err.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${redirectTo}`,
        data: { display_name: displayName },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("already") ? t("auth.errors.alreadyExists") : error.message);
      return;
    }
    toast.success(t("auth.success.signup"));
    navigate(redirectTo, { replace: true });
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${redirectTo}`,
    });
    if (result.error) {
      setGoogleLoading(false);
      toast.error(t("auth.errors.googleFailed"));
      return;
    }
    if (result.redirected) return;
    navigate(redirectTo, { replace: true });
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <h1 className="font-arabic text-3xl font-semibold text-foreground">
              {redirectTo.includes("vendor") ? t("auth.vendorTitle") : t("auth.customerTitle")}
            </h1>
            <p className="mt-2 text-sm text-foreground/65">{t("auth.subtitle")}</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-luxury sm:p-8">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-secondary/60">
                <TabsTrigger value="signin" className="rounded-full">{t("auth.signin")}</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full">{t("auth.signup")}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="si-email">{t("auth.email")}</Label>
                    <Input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="si-pass">{t("auth.password")}</Label>
                    <PasswordInput id="si-pass" value={password} onChange={setPassword}
                      placeholder="••••••••" autoComplete="current-password"
                      show={showPass} onToggle={() => setShowPass((s) => !s)} t={t} />
                  </div>
                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                      {t("auth.forgotPassword")}
                    </Link>
                  </div>
                  <Button type="submit" disabled={submitting}
                    className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>{t("auth.signin")} <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" /></>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="su-name">{t("auth.name")}</Label>
                    <Input id="su-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={t("auth.namePlaceholder")} autoComplete="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">{t("auth.email")}</Label>
                    <Input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-pass">{t("auth.password")}</Label>
                    <PasswordInput id="su-pass" value={password} onChange={setPassword}
                      placeholder={t("auth.passwordPlaceholder")} autoComplete="new-password"
                      show={showPass} onToggle={() => setShowPass((s) => !s)} t={t} />
                  </div>
                  <Button type="submit" disabled={submitting}
                    className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>{t("auth.createAccount")} <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" /></>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] uppercase tracking-wider text-foreground/50">{t("common.or")}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button type="button" variant="outline" onClick={handleGoogle} disabled={googleLoading}
              className="h-11 w-full rounded-full border-border bg-background hover:bg-secondary/60">
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <GoogleIcon className="me-2 h-4 w-4" />
                  {t("auth.continueWithGoogle")}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

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

export const PasswordInput = ({ id, value, onChange, placeholder, autoComplete, show, onToggle, t }: PasswordInputProps) => (
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

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>
  </svg>
);

export default Auth;
