import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Gift, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/tekillah/Navbar";
import { Hero } from "@/components/tekillah/Hero";
import { ScrollProgress } from "@/components/tekillah/ScrollProgress";
import { SketchSectionDivider } from "@/components/tekillah/SketchArt";
import { SEO } from "@/components/SEO";

// Dual-path CTA — replaces in-page packages/wizard sections.
// Each pathway now lives on its own dedicated route for focus & shareability.
const PathwaysCTA = () => (
  <section className="mx-auto my-12 grid w-full max-w-5xl grid-cols-1 gap-5 px-6 sm:grid-cols-2">
    <Link
      to="/planner"
      className="group relative overflow-hidden rounded-3xl border-2 border-gold p-6 text-right transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_-20px_hsl(var(--green)/0.55)]"
      style={{ background: "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--green-mid)) 100%)" }}
    >
      <span aria-hidden className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
        style={{ background: "radial-gradient(circle, hsl(var(--gold)), transparent 70%)" }} />
      <div className="relative flex items-center gap-3">
        <span className="grid h-12 w-12 flex-none place-items-center rounded-xl border border-gold/50 bg-green-mid/40 transition-transform duration-500 group-hover:rotate-6">
          <Sparkles className="h-5 w-5 text-gold" strokeWidth={2.4} />
        </span>
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold/80">المسار الذكي</div>
          <div className="font-display text-lg font-black text-gold sm:text-xl">خطّط ليلتك بنفسك</div>
          <div className="mt-0.5 text-[12.5px] text-cream/85">حدّد ميزانيتك واختر كل تفصيلة على ذوقك.</div>
        </div>
        <ArrowLeft className="h-5 w-5 text-gold transition-transform duration-500 ease-out group-hover:-translate-x-1" />
      </div>
    </Link>
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
const ProblemSolutionAbout = lazy(() =>
  import("@/components/tekillah/ProblemSolutionAbout").then((m) => ({ default: m.ProblemSolutionAbout })),
);
const OccasionsSection = lazy(() =>
  import("@/components/tekillah/OccasionsSection").then((m) => ({ default: m.OccasionsSection })),
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

      <Suspense fallback={<SectionSkeleton minHeight="80vh" />}>
        <ProblemSolutionAbout />
      </Suspense>

      <div className="mx-auto my-2 flex max-w-3xl items-center justify-center px-6">
        <SketchSectionDivider className="h-10 w-full opacity-70" />
      </div>

      <Suspense fallback={<SectionSkeleton minHeight="60vh" />}>
        <OccasionsSection />
      </Suspense>
      <PathwaysCTA />

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
