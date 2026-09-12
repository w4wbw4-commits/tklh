import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Check, X } from "lucide-react";
import { Logo } from "@/components/tekillah/Logo";
import { authService } from "@/domain";
import { PasswordInput } from "@/components/tekillah/PasswordInput";

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showA, setShowA] = useState(false);
  const [showB, setShowB] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  // The recovery link will create a session via the URL hash automatically.
  useEffect(() => {
    const { data: sub } = authService.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setValidSession(true);
      }
    });
    authService.getSession().then(({ data }) => {
      if (data.session) setValidSession(true);
      else if (validSession === null) setValidSession(false);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checks = useMemo(() => ({
    length: pwd.length >= 8,
    match: pwd.length > 0 && pwd === confirm,
  }), [pwd, confirm]);

  const canSubmit = checks.length && checks.match && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    const { error } = await authService.updatePassword(pwd);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await authService.signOut();
    toast.success(t("auth.reset.success"));
    navigate("/auth", { replace: true });
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
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="font-arabic text-3xl font-semibold text-foreground">
              {t("auth.reset.title")}
            </h1>
            <p className="mt-2 text-sm text-foreground/65">{t("auth.reset.desc")}</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-luxury sm:p-8">
            {validSession === false ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-foreground/70">{t("auth.reset.invalidLink")}</p>
                <Link to="/forgot-password">
                  <Button className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {t("auth.reset.requestNew")}
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rp-pwd">{t("auth.reset.newPassword")}</Label>
                  <PasswordInput id="rp-pwd" value={pwd} onChange={setPwd}
                    placeholder="••••••••" autoComplete="new-password"
                    show={showA} onToggle={() => setShowA((s) => !s)} t={t} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rp-confirm">{t("auth.reset.confirmPassword")}</Label>
                  <PasswordInput id="rp-confirm" value={confirm} onChange={setConfirm}
                    placeholder="••••••••" autoComplete="new-password"
                    show={showB} onToggle={() => setShowB((s) => !s)} t={t} />
                </div>

                <ul className="space-y-1.5 rounded-xl bg-secondary/40 p-3 text-xs">
                  <Rule ok={checks.length} label={t("auth.reset.ruleLength")} />
                  <Rule ok={checks.match} label={t("auth.reset.ruleMatch")} />
                </ul>

                <Button type="submit" disabled={!canSubmit}
                  className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.reset.update")}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Rule = ({ ok, label }: { ok: boolean; label: string }) => (
  <li className={`flex items-center gap-2 ${ok ? "text-primary" : "text-foreground/55"}`}>
    <span className={`grid h-4 w-4 place-items-center rounded-full ${ok ? "bg-primary text-primary-foreground" : "bg-border text-foreground/40"}`}>
      {ok ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
    </span>
    {label}
  </li>
);

export default ResetPassword;
