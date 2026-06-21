import { lazy, Suspense } from "react";
import { Navbar } from "@/components/tekillah/Navbar";
import { ScrollProgress } from "@/components/tekillah/ScrollProgress";
import { SEO } from "@/components/SEO";

const PlanningWizard = lazy(() =>
  import("@/components/tekillah/PlanningWizard").then((m) => ({ default: m.PlanningWizard })),
);
const Footer = lazy(() =>
  import("@/components/tekillah/Footer").then((m) => ({ default: m.Footer })),
);

const Planner = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="خطط ليلتك بنفسك — معالج تِكله الذكي"
        description="خطط ليلة عمرك في ٤ خطوات: تفاصيل المناسبة، الخدمات، الرؤية، والميزانية. منصة تِكله الذكية تجمع كل احتياجاتك في مكان واحد."
        canonical="https://tklh.sa/planner"
      />
      <ScrollProgress />
      <Navbar />
      <div className="h-24" aria-hidden />
      <Suspense fallback={<div style={{ minHeight: "100vh" }} aria-hidden />}>
        <PlanningWizard />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: "30vh" }} aria-hidden />}>
        <Footer />
      </Suspense>
    </main>
  );
};

export default Planner;
