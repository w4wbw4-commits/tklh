import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";

const Success = () => {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const bookingId = params.get("booking");
  const isAr = i18n.language === "ar";
  const ArrowI = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-soft">
      {/* Decorative confetti dots */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: -40 }}
            animate={{
              opacity: [0, 1, 0.4],
              y: [0, 80 + (i % 5) * 30, 200 + (i % 3) * 60],
              x: [(i % 2 ? 1 : -1) * (i * 6), 0],
            }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.18 }}
            className={`absolute h-2 w-2 rounded-full ${i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-primary/50" : "bg-foreground/20"}`}
            style={{ left: `${(i * 47) % 100}%`, top: `${(i * 13) % 30}%` }}
          />
        ))}
      </div>

      <header className="relative z-10 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-65px)] max-w-2xl flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-luxury"
        >
          <CheckCircle2 className="h-12 w-12" />
          <Sparkles className="absolute -end-2 -top-2 h-6 w-6 text-primary/80" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 font-arabic text-balance text-4xl font-semibold text-foreground sm:text-5xl"
        >
          {t("success.title")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 max-w-lg text-pretty text-foreground/70"
        >
          {t("success.subtitle")}
        </motion.p>

        {bookingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground/70 shadow-card"
          >
            <span className="text-foreground/55">{t("success.refNumber")}</span>
            <span className="font-arabic font-semibold text-primary">#{bookingId.slice(0, 8).toUpperCase()}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90">
            <Link to="/dashboard">
              {t("success.cta")}
              <ArrowI className="ms-2 h-4 w-4" />
            </Link>
          </Button>
          {bookingId && (
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link to={`/invoice/${bookingId}`}>
                <Receipt className="me-2 h-4 w-4" />
                {t("success.viewInvoice")}
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant="ghost" className="rounded-full px-8">
            <Link to="/">{t("common.backToHome")}</Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Success;
