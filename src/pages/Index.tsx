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
      {/* Story flow: who we are + why we're better (merged) */}
      <ProblemSolutionAbout />
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
      <Mission />
      <Footer />
    </main>
  );
};

export default Index;

