import { Navbar } from "@/components/tekillah/Navbar";
import { Hero } from "@/components/tekillah/Hero";
import { Story } from "@/components/tekillah/Story";
import { Features } from "@/components/tekillah/Features";
import { PlatformPackages } from "@/components/tekillah/PlatformPackages";
import { PlanningWizard } from "@/components/tekillah/PlanningWizard";
import { DashboardPreview } from "@/components/tekillah/DashboardPreview";
import { UpcomingFeatures } from "@/components/tekillah/UpcomingFeatures";
import { Mission } from "@/components/tekillah/Mission";
import { Footer } from "@/components/tekillah/Footer";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="تِكله | TKLH — منصة تخطيط وحجز المناسبات في السعودية"
        description="منصة سعودية فاخرة لتخطيط المناسبات وحجز القاعات والضيافة والتصوير في الرياض وجدة والدمام. باقات جاهزة أو خطّط مناسبتك بنفسك."
        canonical="/"
      />
      <Navbar />
      <Hero />
      {/* Primary path: ready packages first to grab attention */}
      <PlatformPackages />
      {/* Secondary path: bespoke planning sits directly under the packages */}
      <PlanningWizard />
      <Story />
      <Features />
      <DashboardPreview />
      <UpcomingFeatures />
      <Footer />
    </main>
  );
};

export default Index;
