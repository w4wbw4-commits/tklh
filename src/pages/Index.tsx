import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Gift, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/tekillah/Navbar";
import { Hero } from "@/components/tekillah/Hero";
import { ScrollProgress } from "@/components/tekillah/ScrollProgress";
import { SketchSectionDivider } from "@/components/tekillah/SketchArt";
import { LazyVisible } from "@/components/tekillah/LazyVisible";
import { Preloader } from "@/components/tekillah/Preloader";
import { SEO } from "@/components/SEO";

// Dual-path CTA — replaces in-page packages/wizard sections.
// Each pathway now lives on its own dedicated route for focus & shareability.
const PathwaysCTA = () => (
  <section className="mx-auto my-12 grid w-full max-w-5xl grid-cols-1 gap-5 px-6 sm:grid-cols-2">
    <div
      role="link"
      aria-disabled="true"
      title="قريبًا"
      className="group relative cursor-not-allowed overflow-hidden rounded-3xl border-2 border-muted-foreground/20 bg-muted/40 p-6 text-right opacity-80"
    >
      <div className="relative flex items-center gap-3">
        <span className="grid h-12 w-12 flex-none place-items-center rounded-xl border border-muted-foreground/20 bg-muted/60">
          <Sparkles className="h-5 w-5 text-muted-foreground" strokeWidth={2.4} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">المسار الذكي</span>
            <span className="rounded-full bg-muted px-2 py-0.5 font-arabic text-[10px] font-bold text-muted-foreground">قَرِيبًا</span>
          </div>
          <div className="font-display text-lg font-black text-muted-foreground sm:text-xl">خطّط ليلتك بنفسك</div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground/80">حدّد ميزانيتك واختر كل تفصيلة على ذوقك.</div>
        </div>
        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
    <Link
      to="/packages"
      className="group relative overflow-hidden rounded-3xl border-2 border-green/30 bg-cream/90 p-6 text-right backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-green hover:shadow-[0_25px_60px_-20px_hsl(var(--green)/0.35)]"
    >
      <span aria-hidden className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
        style={{ background: "radial-gradient(circle, hsl(var(--green)/0.6), transparent 70%)" }} />
      <div className="relative flex items-center gap-3">
        <span className="grid h-12 w-12 flex-none place-items-center rounded-xl border border-green/30 transition-transform duration-500 group-hover:rotate-6"
          style={{ background: "linear-gradient(135deg, hsl(var(--gold)/0.25), hsl(var(--green)/0.12))" }}>
          <Gift className="h-5 w-5 text-green" strokeWidth={2.4} />
        </span>
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-green/70">جاهزة بضغطة</div>
          <div className="font-display text-lg font-black text-green sm:text-xl">اختار باقتك</div>
          <div className="mt-0.5 text-[12.5px] text-primary-deep/65">باقات منسّقة بعناية — احجز وخلّص بدقيقة.</div>
        </div>
        <ArrowLeft className="h-5 w-5 text-green transition-transform duration-500 ease-out group-hover:-translate-x-1" />
      </div>
    </Link>
  </section>
);


// Below-the-fold sections — code-split so the Hero paints fast on mobile.
// React.lazy turns each into its own chunk; Suspense renders a skeleton-height
// placeholder so the page layout doesn't jump while the chunk fetches.
//
// `lazyWithRetry` guards against stale chunk hashes after a redeploy: if the
// browser has an old index.html cached and tries to fetch a chunk that no
// longer exists, we hard-reload once so the user gets the fresh manifest.
const lazyWithRetry = <T extends { default: React.ComponentType<any> }>(
  factory: () => Promise<T>,
) =>
  lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      const reloaded = sessionStorage.getItem("chunk-reload") === "1";
      if (!reloaded) {
        sessionStorage.setItem("chunk-reload", "1");
        window.location.reload();
        // Return a never-resolving promise so Suspense keeps the fallback
        // visible until the reload actually happens.
        return new Promise<T>(() => {});
      }
      throw err;
    }
  });

const ProblemSolutionAbout = lazyWithRetry(() =>
  import("@/components/tekillah/ProblemSolutionAbout").then((m) => ({ default: m.ProblemSolutionAbout })),
);
const OccasionsSection = lazyWithRetry(() =>
  import("@/components/tekillah/OccasionsSection").then((m) => ({ default: m.OccasionsSection })),
);
const DashboardPreview = lazyWithRetry(() =>
  import("@/components/tekillah/DashboardPreview").then((m) => ({ default: m.DashboardPreview })),
);
const PaymentLogosStrip = lazyWithRetry(() =>
  import("@/components/tekillah/PaymentLogosStrip").then((m) => ({ default: m.PaymentLogosStrip })),
);
const UpcomingFeatures = lazyWithRetry(() =>
  import("@/components/tekillah/UpcomingFeatures").then((m) => ({ default: m.UpcomingFeatures })),
);
const Mission = lazyWithRetry(() =>
  import("@/components/tekillah/Mission").then((m) => ({ default: m.Mission })),
);
const Footer = lazyWithRetry(() =>
  import("@/components/tekillah/Footer").then((m) => ({ default: m.Footer })),
);


// Reserves vertical space so lazy-loaded sections don't cause layout shift.
const SectionSkeleton = ({ minHeight = "40vh" }: { minHeight?: string }) => (
  <div style={{ minHeight }} className="mx-auto flex w-full max-w-5xl items-center justify-center px-6 py-10" aria-label="جارٍ التحميل">
    <div className="h-full w-full animate-pulse rounded-3xl bg-muted/40" style={{ minHeight }} />
  </div>
);

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Preloader />
      <SEO
        title="تكله tklh — تنسيق حفلات وزواج وإدارة مؤتمرات بالسعودية"
        description="تكله (tklh.sa) منصة سعودية لتنسيق الحفلات وتنسيق الزواج وإدارة وتنسيق المؤتمرات وحجز القاعات والضيافة والتصوير في الرياض وجدة والدمام."
        canonical="https://tklh.sa/"
      />
      <ScrollProgress />
      <Navbar />
      <Hero />

      {/* Sketch divider — weaves the hero motif into every transition */}
      <div className="mx-auto -mt-6 mb-2 flex max-w-3xl items-center justify-center px-6">
        <SketchSectionDivider className="h-10 w-full opacity-80" />
      </div>

      <LazyVisible minHeight="50vh" fallback={<SectionSkeleton minHeight="50vh" />}>
        <Suspense fallback={<SectionSkeleton minHeight="50vh" />}>
          <ProblemSolutionAbout />
        </Suspense>
      </LazyVisible>

      <div className="mx-auto my-2 flex max-w-3xl items-center justify-center px-6">
        <SketchSectionDivider className="h-10 w-full opacity-70" />
      </div>

      <LazyVisible minHeight="60vh" fallback={<SectionSkeleton minHeight="60vh" />}>
        <Suspense fallback={<SectionSkeleton minHeight="60vh" />}>
          <OccasionsSection />
        </Suspense>
      </LazyVisible>
      <PathwaysCTA />

      <LazyVisible minHeight="60vh" fallback={<SectionSkeleton minHeight="60vh" />}>
        <Suspense fallback={<SectionSkeleton minHeight="60vh" />}>
          <DashboardPreview />
        </Suspense>
      </LazyVisible>
      <LazyVisible minHeight="20vh" fallback={<SectionSkeleton minHeight="20vh" />}>
        <Suspense fallback={<SectionSkeleton minHeight="20vh" />}>
          <PaymentLogosStrip />
        </Suspense>
      </LazyVisible>
      <LazyVisible minHeight="50vh" fallback={<SectionSkeleton minHeight="50vh" />}>
        <Suspense fallback={<SectionSkeleton minHeight="50vh" />}>
          <UpcomingFeatures />
        </Suspense>
      </LazyVisible>

      <div className="mx-auto my-2 flex max-w-3xl items-center justify-center px-6">
        <SketchSectionDivider className="h-10 w-full opacity-70" />
      </div>

      <LazyVisible minHeight="40vh" fallback={<SectionSkeleton minHeight="40vh" />}>
        <Suspense fallback={<SectionSkeleton minHeight="40vh" />}>
          <Mission />
        </Suspense>
      </LazyVisible>
      <LazyVisible minHeight="30vh" fallback={<SectionSkeleton minHeight="30vh" />}>
        <Suspense fallback={<SectionSkeleton minHeight="30vh" />}>
          <Footer />
        </Suspense>
      </LazyVisible>
    </main>
  );
};

export default Index;
