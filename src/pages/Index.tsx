import { Navbar } from "@/components/tekillah/Navbar";
import { Hero } from "@/components/tekillah/Hero";
import { Story } from "@/components/tekillah/Story";
import { Features } from "@/components/tekillah/Features";
import { PlatformPackages } from "@/components/tekillah/PlatformPackages";
import { PlanningWizard } from "@/components/tekillah/PlanningWizard";
import { DashboardPreview } from "@/components/tekillah/DashboardPreview";
import { UpcomingFeatures } from "@/components/tekillah/UpcomingFeatures";
import { Footer } from "@/components/tekillah/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Story />
      <Features />
      <PlatformPackages />
      <PlanningWizard />
      <DashboardPreview />
      <UpcomingFeatures />
      <Footer />
    </main>
  );
};

export default Index;
