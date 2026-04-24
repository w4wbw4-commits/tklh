// ---------------------------------------------------------------------------
// PlatformPackages — public landing-page section
// ---------------------------------------------------------------------------
// Reads the published rows from `platform_packages` and renders them as a
// luxurious gallery. Tapping a card opens a detail dialog showing all media
// and inclusions; the "Book now" CTA pre-selects the package and scrolls to
// the wizard's package-detail step (handled inside PlanningWizard via the
// `?pkg=<id>` URL param it watches on mount).
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft, Check, PackageOpen, Play, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { fmtNumber } from "@/i18n/format";
import type { PlatformPackageRow } from "./admin/AdminPackageDialog";

export const PlatformPackages = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [items, setItems] = useState<PlatformPackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<PlatformPackageRow | null>(null);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("platform_packages")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });
      setItems((data ?? []) as unknown as PlatformPackageRow[]);
      setLoading(false);
    };
    load();
    const ch = supabase
      .channel("public-platform-packages")
      .on("postgres_changes", { event: "*", schema: "public", table: "platform_packages" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Hide section entirely when no published packages
  if (!loading && items.length === 0) return null;

  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const bookPackage = (id: string) => {
    setActive(null);
    // Tell the wizard which package to fast-track via the URL.
    const url = new URL(window.location.href);
    url.searchParams.set("pkg", id);
    url.hash = "wizard";
    window.history.pushState({}, "", url.toString());
    // Scroll & nudge wizard via hashchange listener
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    setTimeout(() => {
      document.getElementById("wizard")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <section id="packages" className="relative bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            {t("platformPackages.sectionKicker")}
          </span>
          <h2 className="mt-4 font-arabic text-balance text-3xl font-semibold text-foreground sm:text-4xl">
            {t("platformPackages.sectionTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-foreground/65 font-arabic sm:text-base">
            {t("platformPackages.sectionSubtitle")}
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, idx) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition hover:shadow-luxury"
            >
              <div className="relative aspect-[16/10] w-full bg-secondary">
                {p.thumbnail_url ? (
                  <img
                    src={p.thumbnail_url}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <PackageOpen className="h-10 w-10 text-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                <div
                  className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-luxury backdrop-blur"
                  style={{ background: "var(--gradient-olive)" }}
                >
                  <Sparkles className="h-3 w-3" />
                  <span className="font-arabic tracking-wide">{t("platformPackages.cardBadge")}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-arabic text-xl font-semibold text-foreground">{p.name}</h3>
                {p.description && (
                  <p className="mt-1.5 text-sm text-foreground/70 font-arabic line-clamp-2">
                    {p.description}
                  </p>
                )}

                <div className="mt-4 flex items-end justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/55">
                      {t("platformPackages.from")}
                    </div>
                    <div className="font-arabic text-2xl font-semibold text-foreground tabular-nums">
                      {fmtNumber(Number(p.price))}
                      <span className="ms-1 text-sm font-normal text-foreground/60">ر.س</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => { setActive(p); setActiveMediaIdx(0); }}
                    className="flex-1 rounded-full"
                  >
                    {t("platformPackages.viewDetails")}
                  </Button>
                  <Button
                    onClick={() => bookPackage(p.id)}
                    className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Zap className="me-1 h-4 w-4" />
                    {t("platformPackages.bookNow")}
                    <Arrow className="ms-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="font-arabic text-2xl">{active.name}</DialogTitle>
                {active.description && (
                  <DialogDescription className="font-arabic">{active.description}</DialogDescription>
                )}
              </DialogHeader>

              {/* Gallery */}
              {active.media.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-secondary">
                  <div className="relative aspect-[16/9] w-full bg-secondary">
                    {active.media[activeMediaIdx]?.type === "video" ? (
                      <video
                        src={active.media[activeMediaIdx].url}
                        controls
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={active.media[activeMediaIdx]?.url ?? active.thumbnail_url ?? ""}
                        alt={active.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  {active.media.length > 1 && (
                    <div className="hide-scrollbar flex gap-2 overflow-x-auto p-2">
                      {active.media.map((m, i) => (
                        <button
                          key={m.url}
                          type="button"
                          onClick={() => setActiveMediaIdx(i)}
                          className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition ${
                            i === activeMediaIdx ? "border-primary ring-2 ring-primary/40" : "border-border opacity-80"
                          }`}
                        >
                          {m.type === "image" ? (
                            <img src={m.url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full w-full place-items-center bg-black/60">
                              <Play className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Includes */}
              {active.includes.length > 0 && (
                <div className="mt-4 rounded-2xl border border-border bg-card p-4">
                  <div className="text-sm font-semibold text-foreground font-arabic flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {t("platformPackages.includesTitle")}
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {active.includes.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="font-arabic">{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <div className="font-arabic text-2xl font-semibold text-foreground tabular-nums">
                  {fmtNumber(Number(active.price))}
                  <span className="ms-1 text-sm font-normal text-foreground/60">ر.س</span>
                </div>
                <Button
                  onClick={() => bookPackage(active.id)}
                  className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                >
                  <Zap className="me-1 h-4 w-4" />
                  {t("platformPackages.bookNow")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
