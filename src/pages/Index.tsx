import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Gift, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/tekillah/Navbar";
import { Hero } from "@/components/tekillah/Hero";
import { ScrollProgress } from "@/components/tekillah/ScrollProgress";
import { SketchSectionDivider } from "@/components/tekillah/SketchArt";
import { LazyVisible } from "@/components/tekillah/LazyVisible";
import { Preloader } from "@/components/tekillah/Preloader";
import { SEO } from "@/components/SEO";



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
