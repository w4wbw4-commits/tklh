import { Navbar } from "@/components/tekillah/Navbar";
import { Hero } from "@/components/tekillah/Hero";
import { Features } from "@/components/tekillah/Features";
import { PlanningWizard } from "@/components/tekillah/PlanningWizard";
import { DashboardPreview } from "@/components/tekillah/DashboardPreview";
import { Footer } from "@/components/tekillah/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <PlanningWizard />
      <DashboardPreview />
      <Footer />
    </main>
  );
};

export default Index;
