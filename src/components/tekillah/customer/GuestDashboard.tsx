import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tekillah/Logo";
import { Button as UIButton } from "@/components/ui/button";
import {
  LayoutDashboard, Map, Users, Receipt, Radio, ListChecks, ArrowRight,
} from "lucide-react";
import chairMark from "@/assets/tklh-chair-mark.png.asset.json";

/**
 * GuestDashboard — the visitor mode of /dashboard.
 *
 * Why: a curious visitor clicking "متابعة الخطة" should never hit a login
 * wall. They land in the real dashboard shell (header, six tabs, four metric
 * frames) with no fabricated numbers — and the empty middle becomes the
 * strongest marketing message on the site: their seat is waiting.
 */
export const GuestDashboard = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState("overview");

  const tabs = [
    { v: "overview", Icon: LayoutDashboard },
    { v: "timeline", Icon: Map },
    { v: "bookings", Icon: ListChecks },
    { v: "guests", Icon: Users },
    { v: "payments", Icon: Receipt },
    { v: "day", Icon: Radio },
  ];

  const hairline = { border: "1px solid hsl(var(--green) / 0.16)" } as const;

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Real dashboard header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden text-xs uppercase tracking-[0.2em] text-primary sm:inline">
              {t("customer.kicker")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UIButton variant="ghost" size="sm" asChild className="rounded-full">
              <Link to="/">{t("common.home")}</Link>
            </UIButton>
            <UIButton size="sm" asChild className="rounded-full">
              <Link to="/auth?redirect=/dashboard">{t("customer.guest.signIn")}</Link>
            </UIButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* The six real tabs — clickable, same visitor state on each */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="flex h-auto w-full gap-1 overflow-x-auto rounded-2xl p-1 sm:grid sm:grid-cols-6">
            {tabs.map(({ v, Icon }) => (
              <TabsTrigger key={v} value={v} className="shrink-0 gap-2 rounded-xl py-2">
                <Icon className="h-4 w-4" strokeWidth={1.6} /> {t(`customer.tabs.${v}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Faint metric frames — structure without fake data */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl px-4 py-5" style={hairline}>
              <div className="h-2 w-16 rounded-full" style={{ backgroundColor: "hsl(var(--green) / 0.12)" }} />
              <div className="mt-3 h-5 w-10 rounded-md" style={{ backgroundColor: "hsl(var(--green) / 0.08)" }} />
            </div>
          ))}
        </div>


        {/* The emptiness is the message */}
        <section className="mt-10 rounded-3xl px-6 py-16 text-center sm:px-12 sm:py-24"
          style={{ ...hairline, backgroundColor: "hsl(var(--cream))" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto w-fit"
          >
            <img
              src={chairMark.url}
              alt=""
              aria-hidden
              className="mx-auto h-40 w-40 object-contain sm:h-56 sm:w-56"
              draggable={false}
            />
            <div
              className="mx-auto mt-3 h-3 w-32 rounded-full blur-md sm:w-44"
              style={{ backgroundColor: "hsl(var(--green) / 0.18)" }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            className="mt-10 font-arabic text-3xl font-bold leading-tight text-primary sm:text-5xl"
          >
            {t("customer.guest.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="mx-auto mt-4 max-w-xl font-arabic text-base text-[hsl(var(--brown))] sm:text-lg"
          >
            {t("customer.guest.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.68, ease: "easeOut" }}
            className="mt-10 flex flex-col items-center gap-4"
          >
            <Button asChild size="lg" className="rounded-full px-8 text-base">
              <Link to="/planner">
                {t("customer.guest.cta")}
                <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
              </Link>
            </Button>
            <Link
              to="/auth?redirect=/dashboard"
              className="text-sm text-[hsl(var(--brown))] underline-offset-4 hover:text-primary hover:underline"
            >
              {t("customer.guest.haveAccount")}
            </Link>
          </motion.div>
        </section>
      </main>
    </div>
  );
};
