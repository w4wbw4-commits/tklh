import { lazy, Suspense } from "react";
import { Navbar } from "@/components/tekillah/Navbar";
import { Hero } from "@/components/tekillah/Hero";
import { ScrollProgress } from "@/components/tekillah/ScrollProgress";
import { SketchSectionDivider } from "@/components/tekillah/SketchArt";
import { SEO } from "@/components/SEO";

// Below-the-fold sections — code-split so the Hero paints fast on mobile.
// React.lazy turns each into its own chunk; Suspense renders a skeleton-height
// placeholder so the page layout doesn't jump while the chunk fetches.
const ProblemSolutionAbout = lazy(() =>
  import("@/components/tekillah/ProblemSolutionAbout").then((m) => ({ default: m.ProblemSolutionAbout })),
);
const OccasionsSection = lazy(() =>
  import("@/components/tekillah/OccasionsSection").then((m) => ({ default: m.OccasionsSection })),
);
const PlatformPackages = lazy(() =>
  import("@/components/tekillah/PlatformPackages").then((m) => ({ default: m.PlatformPackages })),
);
const PlanningWizard = lazy(() =>
  import("@/components/tekillah/PlanningWizard").then((m) => ({ default: m.PlanningWizard })),
);
const DashboardPreview = lazy(() =>
  import("@/components/tekillah/DashboardPreview").then((m) => ({ default: m.DashboardPreview })),
);
const PaymentLogosStrip = lazy(() =>
  import("@/components/tekillah/PaymentLogosStrip").then((m) => ({ default: m.PaymentLogosStrip })),
);
const UpcomingFeatures = lazy(() =>
  import("@/components/tekillah/UpcomingFeatures").then((m) => ({ default: m.UpcomingFeatures })),
);
const Mission = lazy(() =>
  import("@/components/tekillah/Mission").then((m) => ({ default: m.Mission })),
);
const Footer = lazy(() =>
  import("@/components/tekillah/Footer").then((m) => ({ default: m.Footer })),
);

// Reserves vertical space so lazy-loaded sections don't cause layout shift.
const SectionSkeleton = ({ minHeight = "60vh" }: { minHeight?: string }) => (
  <div style={{ minHeight }} aria-hidden />
);

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="تِكله | TKLH — منصة تخطيط وحجز المناسبات في السعودية"
        description="منصة سعودية فاخرة لتخطيط المناسبات وحجز القاعات والضيافة والتصوير في الرياض وجدة والدمام. باقات جاهزة أو خطط مناسبتك بنفسك."
        canonical="/"
      />
      <ScrollProgress />
      <Navbar />
      <Hero />

      {/* Sketch divider — weaves the hero motif into every transition */}
      <div className="mx-auto -mt-6 mb-2 flex max-w-3xl items-center justify-center px-6">
        <SketchSectionDivider className="h-10 w-full opacity-80" />
      </div>

      <Suspense fallback={<SectionSkeleton minHeight="80vh" />}>
        <ProblemSolutionAbout />
      </Suspense>

      <div className="mx-auto my-2 flex max-w-3xl items-center justify-center px-6">
        <SketchSectionDivider className="h-10 w-full opacity-70" />
      </div>

      <Suspense fallback={<SectionSkeleton minHeight="60vh" />}>
        <OccasionsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton minHeight="80vh" />}>
        <PlatformPackages />
      </Suspense>
      <Suspense fallback={<SectionSkeleton minHeight="100vh" />}>
        <PlanningWizard />
      </Suspense>
      <Suspense fallback={<SectionSkeleton minHeight="60vh" />}>
        <DashboardPreview />
      </Suspense>
      <Suspense fallback={<SectionSkeleton minHeight="20vh" />}>
        <PaymentLogosStrip />
      </Suspense>
      <Suspense fallback={<SectionSkeleton minHeight="50vh" />}>
        <UpcomingFeatures />
      </Suspense>

      <div className="mx-auto my-2 flex max-w-3xl items-center justify-center px-6">
        <SketchSectionDivider className="h-10 w-full opacity-70" />
      </div>

      <Suspense fallback={<SectionSkeleton minHeight="40vh" />}>
        <Mission />
      </Suspense>
      <Suspense fallback={<SectionSkeleton minHeight="30vh" />}>
        <Footer />
      </Suspense>
    </main>
  );
};

export default Index;
