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
import { pickLocalized, pickLocalizedArray } from "@/i18n/localized";
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
    <section id="packages" className="relative overflow-hidden bg-hero-warm py-20 sm:py-28">
      {/* Decorative background motif */}
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 opacity-[0.05]">
        <svg viewBox="0 0 100 100" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.5">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" />
          <path d="M20 20 L80 80 M80 20 L20 80" />
          <circle cx="50" cy="50" r="30" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Editorial header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/60 px-5 py-1.5 backdrop-blur-sm">
            <span className="h-1 w-1 rounded-full bg-gold shadow-[0_0_8px_hsl(var(--gold))]" />
            <span className="font-arabic text-[11px] font-bold tracking-[0.2em] text-gold">
              {t("platformPackages.sectionKicker")}
            </span>
            <span className="h-1 w-1 rounded-full bg-gold shadow-[0_0_8px_hsl(var(--gold))]" />
          </div>

          <h2 className="mb-5 bg-gradient-to-b from-[hsl(35_45%_40%)] via-gold to-[hsl(35_45%_40%)] bg-clip-text font-arabic text-4xl font-black leading-[1.5] text-transparent md:text-5xl">
            {t("platformPackages.sectionTitle")}
          </h2>

          <div className="flex items-center justify-center gap-4 opacity-70 sm:gap-6">
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60 sm:w-24" />
            <span className="font-arabic text-sm font-light italic text-green sm:text-lg">
              {t("platformPackages.sectionSubtitle")}
            </span>
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60 sm:w-24" />
          </div>
        </motion.div>

        {/* Packages grid */}
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          {items.map((p, idx) => {
            const displayName = pickLocalized(p.name, p.name_en);
            const displayDesc = pickLocalized(p.description, p.description_en);
            // Middle card (when 3 items) is the elevated/featured tier.
            const isFeatured = items.length >= 3 && idx === 1;

            if (isFeatured) {
              return (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.06 }}
                  className="group relative z-10 flex flex-col rounded-[2.5rem] border-2 border-gold bg-green p-4 shadow-[0_50px_100px_-20px_hsl(var(--gold)/0.3)] transition-all duration-700 hover:-translate-y-2 md:-my-4"
                >
                  {/* Featured badge */}
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <span className="rounded-full border border-cream/20 bg-gradient-to-r from-[hsl(35_45%_40%)] to-gold px-6 py-1.5 font-arabic text-xs font-bold text-cream shadow-lg shadow-gold/30">
                      {t("platformPackages.featuredBadge", "الموصى بها")}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-secondary shadow-2xl">
                    {p.thumbnail_url ? (
                      <img
                        src={p.thumbnail_url}
                        alt={displayName}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <PackageOpen className="h-10 w-10 text-cream/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-green/90 via-transparent to-transparent opacity-90" />
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-7 p-7">
                    <div className="space-y-2 text-center">
                      <h3 className="font-arabic text-3xl font-black text-cream">{displayName}</h3>
                      {displayDesc && (
                        <p className="font-arabic text-sm leading-relaxed text-gold line-clamp-2">
                          {displayDesc}
                        </p>
                      )}
                    </div>

                    {/* Price block — glassy */}
                    <div className="flex flex-col items-center rounded-2xl border border-cream/10 bg-cream/5 py-7 backdrop-blur-md">
                      <span className="mb-2 font-arabic text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                        {t("platformPackages.from")}
                      </span>
                      <div className="flex items-baseline gap-3 font-arabic tabular-nums">
                        <span className="text-5xl font-black leading-none text-cream drop-shadow-md">
                          {fmtNumber(Number(p.price))}
                        </span>
                        <span className="text-lg font-bold text-gold">{t("common.currency")}</span>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="mt-auto flex flex-col gap-3">
                      <button
                        onClick={() => bookPackage(p.id)}
                        className="group/btn flex w-full items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-[hsl(35_45%_40%)] to-gold py-4 font-arabic text-base font-bold text-cream shadow-xl shadow-black/20 transition-all hover:brightness-110"
                      >
                        <Zap className="h-4 w-4" />
                        <span>{t("platformPackages.bookNow")}</span>
                        <span className="h-px w-8 bg-cream/40 transition-all group-hover/btn:w-12" />
                      </button>
                      <button
                        onClick={() => { setActive(p); setActiveMediaIdx(0); }}
                        className="font-arabic text-xs font-medium text-gold/80 transition-colors hover:text-cream"
                      >
                        {t("platformPackages.viewDetails")}
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            }

            // Side cards — cream
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.06 }}
                className="group relative flex flex-col rounded-[2rem] border border-gold/20 bg-cream/60 p-3 backdrop-blur-sm transition-all duration-700 hover:-translate-y-2 hover:bg-cream hover:shadow-[0_40px_80px_-20px_hsl(var(--green)/0.15)]"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.5rem] border border-gold/10 bg-secondary">
                  {p.thumbnail_url ? (
                    <img
                      src={p.thumbnail_url}
                      alt={displayName}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <PackageOpen className="h-10 w-10 text-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-green/60 via-transparent to-transparent opacity-80" />
                  <div className="absolute left-4 top-4 rounded-full border border-cream/20 bg-cream/10 p-2 backdrop-blur-md">
                    <Sparkles className="h-4 w-4 text-cream/90" strokeWidth={2} />
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-6 p-6">
                  <div className="space-y-1.5">
                    <h3 className="font-arabic text-2xl font-black text-green">{displayName}</h3>
                    {displayDesc && (
                      <p className="font-arabic text-xs leading-relaxed text-green/60 line-clamp-2">
                        {displayDesc}
                      </p>
                    )}
                  </div>

                  {/* Price block */}
                  <div className="relative border-y border-gold/10 py-6">
                    <div className="flex flex-col items-center">
                      <span className="mb-1 font-arabic text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                        {t("platformPackages.from")}
                      </span>
                      <div className="flex items-baseline gap-2 font-arabic tabular-nums">
                        <span className="text-4xl font-black text-green">
                          {fmtNumber(Number(p.price))}
                        </span>
                        <span className="text-sm font-bold text-gold">{t("common.currency")}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      onClick={() => bookPackage(p.id)}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-green/20 py-3.5 font-arabic text-sm font-bold text-green transition-all hover:bg-green hover:text-cream"
                    >
                      <Zap className="h-4 w-4" />
                      <span>{t("platformPackages.bookNow")}</span>
                      <Arrow className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setActive(p); setActiveMediaIdx(0); }}
                      className="font-arabic text-xs font-medium text-green/60 transition-colors hover:text-green"
                    >
                      {t("platformPackages.viewDetails")}
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Detail dialog — luxurious editorial layout */}
      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-gold/20 bg-cream p-0">
          {active && (() => {
            const aName = pickLocalized(active.name, active.name_en);
            const aDesc = pickLocalized(active.description, active.description_en);
            const aIncludes = pickLocalizedArray(active.includes, active.includes_en);
            // Build a media list — fall back to thumbnail if no gallery items
            const galleryMedia = active.media.length > 0
              ? active.media
              : (active.thumbnail_url ? [{ url: active.thumbnail_url, type: "image" as const }] : []);
            const currentMedia = galleryMedia[activeMediaIdx] ?? galleryMedia[0];

            return (
            <>
              {/* Accessible header (visually hidden) */}
              <DialogHeader className="sr-only">
                <DialogTitle>{aName}</DialogTitle>
                {aDesc && <DialogDescription>{aDesc}</DialogDescription>}
              </DialogHeader>

              {/* HERO — large image with overlay branding */}
              {currentMedia && (
                <div className="relative w-full overflow-hidden bg-green">
                  <div className="relative aspect-[16/10] w-full">
                    {currentMedia.type === "video" ? (
                      <video
                        src={currentMedia.url}
                        controls
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={currentMedia.url}
                        alt={aName}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {/* Gradient overlay for readability */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-green via-green/40 to-transparent" />
                    {/* Top kicker */}
                    <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-cream/30 bg-cream/10 px-4 py-1.5 backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_hsl(var(--gold))]" />
                      <span className="font-arabic text-[11px] font-bold tracking-[0.2em] text-cream">
                        {t("platformPackages.sectionKicker")}
                      </span>
                    </div>
                    {/* Bottom title */}
                    <div className="absolute inset-x-0 bottom-0 px-6 pb-6 sm:px-8 sm:pb-7">
                      <h3 className="font-arabic text-3xl font-black leading-tight text-cream drop-shadow-lg sm:text-4xl">
                        {aName}
                      </h3>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-px w-12 bg-gold/80" />
                        <span className="font-arabic text-sm font-medium italic text-gold">
                          {t("platformPackages.editorialTagline", "تجربة عرس استثنائية بعناية تكله")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnails strip */}
                  {galleryMedia.length > 1 && (
                    <div className="hide-scrollbar flex gap-2 overflow-x-auto border-t border-cream/10 bg-green/95 p-3">
                      {galleryMedia.map((m, i) => (
                        <button
                          key={m.url + i}
                          type="button"
                          onClick={() => setActiveMediaIdx(i)}
                          className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                            i === activeMediaIdx
                              ? "border-gold shadow-lg shadow-gold/30"
                              : "border-cream/10 opacity-60 hover:opacity-100"
                          }`}
                        >
                          {m.type === "image" ? (
                            <img src={m.url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full w-full place-items-center bg-black/60">
                              <Play className="h-4 w-4 text-cream" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* BODY */}
              <div className="space-y-6 p-6 sm:p-8">
                {/* Description */}
                {aDesc && (
                  <p className="font-arabic text-base leading-loose text-green/85">
                    {aDesc}
                  </p>
                )}

                {/* Includes */}
                {aIncludes.length > 0 && (
                  <div className="rounded-2xl border border-gold/20 bg-cream/60 p-6 backdrop-blur-sm">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[hsl(35_45%_40%)] to-gold shadow-md shadow-gold/30">
                        <Sparkles className="h-4 w-4 text-cream" strokeWidth={2.5} />
                      </div>
                      <h4 className="font-arabic text-lg font-bold text-green">
                        {t("platformPackages.includesTitle")}
                      </h4>
                      <div className="ms-auto h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
                    </div>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {aIncludes.map((inc, i) => (
                        <li
                          key={i}
                          className="group/item flex items-start gap-3 rounded-xl border border-transparent bg-cream/40 p-3 transition-all hover:border-gold/30 hover:bg-cream"
                        >
                          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-green to-green/80 text-cream shadow-sm">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                          <span className="font-arabic text-sm leading-relaxed text-green">
                            {inc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { icon: "✓", title: t("platformPackages.trust.quality.title", "ضمان الجودة"), sub: t("platformPackages.trust.quality.sub", "موردون معتمدون") },
                    { icon: "🛡", title: t("platformPackages.trust.payment.title", "دفع آمن"), sub: t("platformPackages.trust.payment.sub", "حماية كاملة") },
                    { icon: "★", title: t("platformPackages.trust.support.title", "دعم متواصل"), sub: t("platformPackages.trust.support.sub", "حتى يوم العرس") },
                  ].map((b, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1 rounded-xl border border-gold/15 bg-cream/40 p-3 text-center sm:p-4"
                    >
                      <span className="font-arabic text-xl text-gold">{b.icon}</span>
                      <span className="font-arabic text-xs font-bold text-green sm:text-sm">{b.title}</span>
                      <span className="font-arabic text-[10px] text-green/60 sm:text-xs">{b.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* STICKY CTA FOOTER */}
              <div className="sticky bottom-0 border-t border-gold/20 bg-gradient-to-t from-cream via-cream to-cream/95 px-6 py-5 backdrop-blur-md sm:px-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="font-arabic text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                      {t("platformPackages.from")}
                    </span>
                    <div className="flex items-baseline gap-2 font-arabic tabular-nums">
                      <span className="text-3xl font-black leading-none text-green sm:text-4xl">
                        {fmtNumber(Number(active.price))}
                      </span>
                      <span className="text-base font-bold text-gold">{t("common.currency")}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => bookPackage(active.id)}
                    className="group/cta flex w-full items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-[hsl(35_45%_40%)] to-gold px-8 py-4 font-arabic text-base font-bold text-cream shadow-xl shadow-gold/30 transition-all hover:brightness-110 hover:shadow-2xl sm:w-auto"
                  >
                    <Zap className="h-4 w-4" />
                    <span>{t("platformPackages.bookNow")}</span>
                    <Arrow className="h-4 w-4 transition-transform group-hover/cta:-translate-x-1" />
                  </button>
                </div>
              </div>
            </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </section>
  );
};
