import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, MailCheck, KeyRound } from "lucide-react";
import { Logo } from "@/components/tekillah/Logo";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = z.string().trim().email({ message: t("auth.errors.invalidEmail") }).max(255);
    try {
      schema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) toast.error(err.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success(t("auth.forgot.sentToast"));
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("auth.backToSignIn")}
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
              {sent ? <MailCheck className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
            </div>
            <h1 className="font-arabic text-3xl font-semibold text-foreground">
              {sent ? t("auth.forgot.sentTitle") : t("auth.forgot.title")}
            </h1>
            <p className="mt-2 text-sm text-foreground/65">
              {sent ? t("auth.forgot.sentDesc", { email }) : t("auth.forgot.desc")}
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-luxury sm:p-8">
            {sent ? (
              <div className="space-y-4 text-center">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <p className="text-sm text-foreground/80">{t("auth.forgot.checkInbox")}</p>
                  <p className="mt-2 font-arabic text-base font-semibold text-primary">{email}</p>
                </div>
                <Button onClick={() => { setSent(false); setEmail(""); }}
                  variant="outline" className="h-11 w-full rounded-full">
                  {t("auth.forgot.resend")}
                </Button>
                <Link to="/auth"
                  className="block text-sm font-medium text-foreground/70 hover:text-foreground">
                  {t("auth.backToSignIn")}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fp-email">{t("auth.email")}</Label>
                  <Input id="fp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email" />
                </div>
                <Button type="submit" disabled={submitting}
                  className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.forgot.send")}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
