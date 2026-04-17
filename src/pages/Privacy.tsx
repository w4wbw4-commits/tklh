import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";

interface PrivacySection { title: string; body: string; }

const Privacy = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const PrevIcon = isAr ? ArrowRight : ArrowLeft;

  useEffect(() => {
    document.title = `${t("terms.privacyTitle")} · Tekillah`;
  }, [t]);

  const sections = (t("terms.privacySections", { returnObjects: true }) as PrivacySection[]) || [];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link to="/"><PrevIcon className="me-1 h-4 w-4" /> {t("common.backToHome")}</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-arabic text-3xl font-semibold text-foreground sm:text-4xl">{t("terms.privacyTitle")}</h1>
            <p className="mt-2 text-sm text-foreground/60">{t("terms.lastUpdated", { date: "April 2026" })}</p>
          </div>
        </div>

        <p className="mt-8 rounded-2xl border border-border bg-card p-5 text-[15px] leading-relaxed text-foreground/80 shadow-card">
          {t("terms.privacyIntro")}
        </p>

        <article className="mt-8 space-y-6">
          {sections.map((s, i) => (
            <section key={i} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-arabic text-lg font-semibold text-primary-deep">{s.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{s.body}</p>
            </section>
          ))}
        </article>
      </main>
    </div>
  );
};

export default Privacy;
