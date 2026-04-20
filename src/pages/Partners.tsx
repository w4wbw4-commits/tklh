import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  Building2,
  UtensilsCrossed,
  Camera,
  Flower2,
  Music2,
  LayoutDashboard,
  Users,
  LineChart,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Logo } from "@/components/tekillah/Logo";
import { Footer } from "@/components/tekillah/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const partnerSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+9665\d{8}$/, "phone"),
  email: z.string().trim().email().max(255),
  city: z.string().trim().min(2).max(80),
  category: z.enum(["halls", "catering", "photography", "decor", "audio"]),
  about: z.string().trim().min(10).max(1000),
});

const Partners = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    email: "",
    city: "",
    category: "" as "" | "halls" | "catering" | "photography" | "decor" | "audio",
    about: "",
  });

  const categoryIcons = {
    halls: Building2,
    catering: UtensilsCrossed,
    photography: Camera,
    decor: Flower2,
    audio: Music2,
  } as const;

  const categories = ["halls", "catering", "photography", "decor", "audio"] as const;

  const benefits = [
    { icon: LayoutDashboard, key: "manage" },
    { icon: Users, key: "reach" },
    { icon: LineChart, key: "reports" },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = partnerSchema.safeParse(form);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue.path[0] as keyof typeof form;
      toast({
        variant: "destructive",
        title: t(`partners.validation.${field === "about" ? "about" : field}`, {
          defaultValue: t("partners.validation.businessName"),
        }),
      });
      return;
    }
    setSubmitting(true);
    // Simulated submission — wires to backend later
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setSubmitted(true);
    toast({
      title: t("partners.form.successTitle"),
      description: t("partners.form.successBody"),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-soft" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link to="/">{t("common.main")}</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            {t("partners.kicker")}
          </span>
          <h1
            className="mt-4 font-wordmark text-balance text-4xl font-bold sm:text-5xl"
            style={{ color: "hsl(var(--primary-deep))" }}
          >
            {t("partners.title")}
          </h1>
          <p className="font-arabic mx-auto mt-4 max-w-2xl text-base leading-[1.9] text-muted-foreground sm:text-lg">
            {t("partners.subtitle")}
          </p>
        </motion.div>
      </section>

      {/* Categories pills */}
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => {
            const Icon = categoryIcons[c];
            return (
              <motion.button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: c }))}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                  form.category === c
                    ? "border-primary bg-primary/5 shadow-card"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <Icon className="h-6 w-6 text-primary" strokeWidth={1.4} />
                <span className="font-arabic text-xs font-medium text-foreground sm:text-sm">
                  {t(`partners.categories.${c}`)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto mt-12 max-w-3xl px-4 sm:px-6">
        <Card className="border-primary/15 shadow-luxury">
          <CardContent className="p-6 sm:p-10">
            {submitted ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-primary" strokeWidth={1.4} />
                <h2
                  className="mt-4 font-wordmark text-2xl font-bold"
                  style={{ color: "hsl(var(--primary-deep))" }}
                >
                  {t("partners.form.successTitle")}
                </h2>
                <p className="font-arabic mt-3 text-muted-foreground">
                  {t("partners.form.successBody")}
                </p>
                <Button asChild className="mt-6 rounded-full">
                  <Link to="/">{t("common.backToHome")}</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="font-arabic">
                      {t("partners.form.businessName")}
                    </Label>
                    <Input
                      id="businessName"
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      placeholder={t("partners.form.businessNamePh")}
                      maxLength={120}
                      required
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName" className="font-arabic">
                      {t("partners.form.contactName")}
                    </Label>
                    <Input
                      id="contactName"
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      placeholder={t("partners.form.contactNamePh")}
                      maxLength={120}
                      required
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-arabic">
                      {t("partners.form.phone")}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder={t("partners.form.phonePh")}
                      maxLength={16}
                      required
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-arabic">
                      {t("partners.form.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={t("partners.form.emailPh")}
                      maxLength={255}
                      required
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="font-arabic">
                      {t("partners.form.city")}
                    </Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder={t("partners.form.cityPh")}
                      maxLength={80}
                      required
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="font-arabic">
                      {t("partners.categories.label")}
                    </Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) =>
                        setForm({ ...form, category: v as typeof form.category })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder={t("partners.categories.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {t(`partners.categories.${c}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about" className="font-arabic">
                    {t("partners.form.about")}
                  </Label>
                  <Textarea
                    id="about"
                    value={form.about}
                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                    placeholder={t("partners.form.aboutPh")}
                    rows={5}
                    maxLength={1000}
                    required
                    dir="rtl"
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="font-arabic h-12 w-full rounded-full text-base shadow-luxury"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t("partners.form.submitting")}
                    </>
                  ) : (
                    t("partners.form.submit")
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Benefits */}
      <section className="mx-auto mt-20 max-w-6xl px-4 pb-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h2
            className="font-wordmark text-balance text-3xl font-bold sm:text-4xl"
            style={{ color: "hsl(var(--primary-deep))" }}
          >
            {t("partners.benefits.title")}
          </h2>
          <p className="font-arabic mx-auto mt-3 max-w-xl text-muted-foreground">
            {t("partners.benefits.subtitle")}
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-3xl border border-primary/15 bg-secondary/30 p-7 text-right shadow-card transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-luxury"
            >
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-background">
                <b.icon className="h-6 w-6 text-primary" strokeWidth={1.4} />
              </div>
              <h3
                className="font-wordmark text-xl font-bold"
                style={{ color: "hsl(var(--primary-deep))" }}
              >
                {t(`partners.benefits.${b.key}.title`)}
              </h3>
              <p className="font-arabic mt-2 text-sm leading-[1.9] text-muted-foreground">
                {t(`partners.benefits.${b.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partners;
