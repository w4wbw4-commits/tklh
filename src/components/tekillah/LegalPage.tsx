import { useEffect, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

interface LegalSection {
  title: string;
  body: string;
}

interface LegalPageProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  intro: string;
  sections: LegalSection[];
}

export const LegalPage = ({ icon: Icon, title, intro, sections }: LegalPageProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const PrevIcon = isAr ? ArrowRight : ArrowLeft;
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    document.title = `${title} · Tekillah`;
  }, [title]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-gradient-soft" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link to="/">
              <PrevIcon className="me-1 h-4 w-4" /> {t("common.backToHome")}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1
              className="text-3xl font-semibold sm:text-4xl"
              style={{ color: "hsl(var(--primary-deep))" }}
            >
              {title}
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              {t("terms.lastUpdated", { date: "April 2026" })}
            </p>
          </div>
        </div>

        <p className="mt-8 rounded-2xl border border-border bg-card p-5 text-[15px] leading-relaxed text-foreground/80 shadow-card">
          {intro}
        </p>

        <article className="mt-8 space-y-6">
          {sections.map((s, i) => (
            <section
              key={i}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: "hsl(var(--primary-deep))" }}
              >
                {s.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">
                {s.body}
              </p>
            </section>
          ))}
        </article>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-border/60 pt-8 sm:flex-row">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">
              <PrevIcon className="me-1 h-4 w-4" />
              {t("common.backToHome")}
            </Link>
          </Button>
          <Button onClick={scrollTop} variant="ghost" className="rounded-full">
            <ArrowUp className="me-1 h-4 w-4" />
            {t("common.backToTop")}
          </Button>
        </div>
      </main>

      {showTop && (
        <button
          type="button"
          onClick={scrollTop}
          aria-label={t("common.backToTop")}
          className="fixed bottom-6 end-6 z-40 grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-luxury transition-transform hover:scale-105"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
