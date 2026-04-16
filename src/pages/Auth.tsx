import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Loader2, Building2 } from "lucide-react";
import { Logo } from "@/components/tekillah/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const emailSchema = z.string().trim().email({ message: "بريد إلكتروني غير صحيح" }).max(255);
const passwordSchema = z.string().min(6, { message: "كلمة المرور 6 أحرف على الأقل" }).max(72);
const nameSchema = z.string().trim().min(2, { message: "الاسم قصير" }).max(80);

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const redirectTo = params.get("redirect") || "/dashboard";

  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      toast.error(error.message === "Invalid login credentials" ? "بيانات الدخول غير صحيحة" : error.message);
      return;
    }
    toast.success("تم تسجيل الدخول");
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
      toast.error(error.message.includes("already") ? "هذا البريد مسجّل مسبقاً" : error.message);
      return;
    }
    toast.success("تم إنشاء الحساب");
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link to="/" className="text-sm text-foreground/70 hover:text-foreground">
          العودة للرئيسية
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
              {redirectTo.includes("vendor") ? "دخول الشركاء" : "حسابك في تكلّة"}
            </h1>
            <p className="mt-2 text-sm text-foreground/65">
              سجّل دخولك للوصول إلى لوحتك ومناسباتك
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-luxury sm:p-8">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-secondary/60">
                <TabsTrigger value="signin" className="rounded-full">دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full">حساب جديد</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="si-email">البريد الإلكتروني</Label>
                    <Input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="si-pass">كلمة المرور</Label>
                    <Input id="si-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" autoComplete="current-password" />
                  </div>
                  <Button type="submit" disabled={submitting}
                    className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>دخول <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" /></>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="su-name">الاسم</Label>
                    <Input id="su-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="اسمك أو اسم العمل" autoComplete="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">البريد الإلكتروني</Label>
                    <Input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-pass">كلمة المرور</Label>
                    <Input id="su-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="6 أحرف على الأقل" autoComplete="new-password" />
                  </div>
                  <Button type="submit" disabled={submitting}
                    className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>إنشاء الحساب <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" /></>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
