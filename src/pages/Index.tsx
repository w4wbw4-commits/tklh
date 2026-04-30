import { Navbar } from "@/components/tekillah/Navbar";
import { Hero } from "@/components/tekillah/Hero";
import { PlatformPackages } from "@/components/tekillah/PlatformPackages";
import { PlanningWizard } from "@/components/tekillah/PlanningWizard";
import { DashboardPreview } from "@/components/tekillah/DashboardPreview";
import { UpcomingFeatures } from "@/components/tekillah/UpcomingFeatures";
import { Mission } from "@/components/tekillah/Mission";
import { Footer } from "@/components/tekillah/Footer";
import { ProblemSolutionAbout } from "@/components/tekillah/ProblemSolutionAbout";
import { OccasionsSection } from "@/components/tekillah/OccasionsSection";
import { PaymentLogosStrip } from "@/components/tekillah/PaymentLogosStrip";
import { ScrollProgress } from "@/components/tekillah/ScrollProgress";
import { SketchSectionDivider } from "@/components/tekillah/SketchArt";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="تِكله | TKLH — منصة تخطيط وحجز المناسبات في السعودية"
        description="منصة سعودية فاخرة لتخطيط المناسبات وحجز القاعات والضيافة والتصوير في الرياض وجدة والدمام. باقات جاهزة أو خطّط مناسبتك بنفسك."
        canonical="/"
      />
      <ScrollProgress />
      <Navbar />
      <Hero />

      {/* Sketch divider — weaves the hero motif into every transition */}
      <div className="mx-auto -mt-6 mb-2 flex max-w-3xl items-center justify-center px-6">
        <SketchSectionDivider className="h-10 w-full opacity-80" />
      </div>

      {/* Story flow: who we are + why we're better (merged) */}
      <ProblemSolutionAbout />

      <div className="mx-auto my-2 flex max-w-3xl items-center justify-center px-6">
        <SketchSectionDivider className="h-10 w-full opacity-70" />
      </div>

      {/* Versatility strip — more than weddings */}
      <OccasionsSection />
      {/* Primary path: ready packages */}
      <PlatformPackages />
      {/* Secondary path: bespoke planning wizard */}
      <PlanningWizard />
      <DashboardPreview />
      {/* Trust strip: upcoming payment methods */}
      <PaymentLogosStrip />
      <UpcomingFeatures />

      <div className="mx-auto my-2 flex max-w-3xl items-center justify-center px-6">
        <SketchSectionDivider className="h-10 w-full opacity-70" />
      </div>

      <Mission />
      <Footer />
    </main>
  );
};

export default Index;

