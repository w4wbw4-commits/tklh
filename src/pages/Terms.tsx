import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";

const Terms = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const PrevIcon = isAr ? ArrowRight : ArrowLeft;

  useEffect(() => {
    document.title = `${t("terms.tosTitle")} · Tekillah`;
  }, [t]);

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
        <h1 className="font-arabic text-3xl font-semibold text-foreground sm:text-4xl">
          {t("terms.tosTitle")}
        </h1>
        <p className="mt-2 text-sm text-foreground/60">{t("terms.lastUpdated", { date: "April 2026" })}</p>

        <article className="prose prose-sm mt-8 max-w-none space-y-5 text-foreground/80">
          {(t("terms.tosBody", { returnObjects: true }) as string[]).map((p, i) => (
            <p key={i} className="leading-relaxed">{p}</p>
          ))}
        </article>
      </main>
    </div>
  );
};

export default Terms;
