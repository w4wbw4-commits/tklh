// ---------------------------------------------------------------------------
// Fast-Track Package Detail step
// ---------------------------------------------------------------------------
// Shown immediately after a user picks a ready-made package in StepBudget.
// Bypasses the manual vendor selection — Tekillah curates the lineup later.
// Displays:
//   • Visual gallery of services included in the package
//   • Itemised list of inclusions (from the i18n catalog)
//   • Fixed price (English numerals + SAR suffix)
//   • Confirm & Book CTA — fires the `onConfirm` callback that ultimately
//     creates the event with a [PACKAGE_BOOKING] tag and routes to dashboard.
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronLeft, ChevronRight, Loader2, Play, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtNumber } from "@/i18n/format";
import type { PackageSelection } from "@/lib/pendingPlan";

// ---------------------------------------------------------------------------
// Curated gallery — fallback for built-in tiers that have no media field.
// Admin packages bring their own `media[]` from the database.
// ---------------------------------------------------------------------------
const GALLERY: Record<string, string[]> = {
  classic: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1280&q=70",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1280&q=70",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1280&q=70",
    "https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=1280&q=70",
  ],
  premium: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1280&q=75",
    "https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1280&q=75",
    "https://images.unsplash.com/photo-1529636798458-92182e662485?w=1280&q=75",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1280&q=75",
    "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1280&q=75",
  ],
  royal: [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1280&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1280&q=80",
    "https://images.unsplash.com/photo-1525772764200-be829a350797?w=1280&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1280&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1280&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1280&q=80",
  ],
};

interface MediaItem { url: string; type: "image" | "video" }

interface Props {
  selection: PackageSelection;
  onConfirm: () => void;
  submitting: boolean;
  /** Allow user to bail back to StepBudget to pick a different package. */
  onChangePackage: () => void;
}

export const StepPackageDetail = ({ selection, onConfirm, submitting, onChangePackage }: Props) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const cur = t("common.currency");

  // Inclusions: prefer the inline list (admin packages), fall back to the
  // i18n catalog for built-in curated tiers.
  const includes = useMemo<string[]>(() => {
    if (selection.includes && selection.includes.length > 0) return selection.includes;
    if (selection.includesKey) {
      const raw = t(selection.includesKey, { returnObjects: true });
      return Array.isArray(raw) ? (raw as string[]) : [];
    }
    return [];
  }, [t, selection.includes, selection.includesKey]);

  // Media gallery: admin packages bring their own image/video list; curated
  // tiers fall back to the hard-coded Unsplash gallery.
  const gallery = useMemo<MediaItem[]>(() => {
    if (selection.media && selection.media.length > 0) return selection.media;
    const fallback = GALLERY[selection.key] ?? GALLERY.classic;
    return fallback.map((url) => ({ url, type: "image" as const }));
  }, [selection.media, selection.key]);

  const [active, setActive] = useState(0);
  const next = () => setActive((i) => (i + 1) % gallery.length);
  const prev = () => setActive((i) => (i - 1 + gallery.length) % gallery.length);

  // Mirror direction for arrows so the affordance feels native in RTL.
  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <motion.div
      key="step-package-detail"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 sm:p-10"
    >
      {/* Fast Track ribbon — reinforces that we're skipping vendor selection */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
        <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
        <span className="font-arabic">{t("wizard.packageDetail.fastTrack")}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-arabic text-2xl font-semibold text-foreground sm:text-3xl">
            {selection.name}
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/70">
            {t("wizard.packageDetail.subtitle")}
          </p>
        </div>
        <div className="text-end">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/55">
            {t("wizard.packageDetail.fixedPrice")}
          </div>
          <div className="mt-1 font-arabic text-3xl font-semibold text-foreground tabular-nums">
            {fmtNumber(selection.price)}
            <span className="ms-1 text-sm font-normal text-foreground/60">{cur}</span>
          </div>
        </div>
      </div>

      {/* Visual gallery */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-secondary/40 shadow-card">
        <div className="relative aspect-[16/9] w-full bg-secondary">
          {gallery.map((src, i) => (
            <motion.img
              key={src}
              src={src}
              alt={`${selection.name} — ${i + 1}`}
              loading="lazy"
              initial={false}
              animate={{ opacity: i === active ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          ))}

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label={t("wizard.vendors.prevMedia")}
                className="absolute start-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-soft backdrop-blur transition hover:bg-background"
              >
                <PrevIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label={t("wizard.vendors.nextMedia")}
                className="absolute end-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-soft backdrop-blur transition hover:bg-background"
              >
                <NextIcon className="h-4 w-4" />
              </button>

              <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === active ? "w-6 bg-primary" : "w-1.5 bg-background/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        <div className="hide-scrollbar flex gap-2 overflow-x-auto p-3">
          {gallery.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition ${
                i === active ? "border-primary ring-2 ring-primary/40" : "border-border opacity-80 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Inclusions */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          {t("wizard.packageDetail.includesTitle")}
          <span className="ms-auto rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground/70 tabular-nums">
            {fmtNumber(includes.length)} {t("wizard.packageDetail.itemsCountSuffix")}
          </span>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {includes.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/85">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="font-arabic leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* What happens next — sets expectations for the curated flow */}
      <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/80 sm:p-5">
        <span className="font-arabic font-semibold text-foreground">
          {t("wizard.packageDetail.nextStepsTitle")}
        </span>
        <p className="mt-1 font-arabic">{t("wizard.packageDetail.nextStepsBody")}</p>
      </div>

      {/* Sticky action row */}
      <div className="mt-7 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={onChangePackage}
          disabled={submitting}
          className="rounded-full text-foreground"
        >
          {t("wizard.packageDetail.changePackage")}
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
        >
          {submitting ? (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="me-2 h-4 w-4" />
          )}
          {t("wizard.packageDetail.confirmAndBook")}
        </Button>
      </div>
    </motion.div>
  );
};
