import { lazy, Suspense } from "react";
import { Navbar } from "@/components/tekillah/Navbar";
import { ScrollProgress } from "@/components/tekillah/ScrollProgress";
import { SEO } from "@/components/SEO";

const PlatformPackages = lazy(() =>
  import("@/components/tekillah/PlatformPackages").then((m) => ({ default: m.PlatformPackages })),
);
const Footer = lazy(() =>
  import("@/components/tekillah/Footer").then((m) => ({ default: m.Footer })),
);

const Packages = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="باقات تِكله — اختر باقتك واحجز بضغطة"
        description="باقات منسّقة من فريق تِكله بأسعار واضحة وضمان أكيد. اختر الباقة المناسبة لمناسبتك واحجز فوراً."
        canonical="https://tklh.sa/packages"
      />
      <ScrollProgress />
      <Navbar />
      <div className="h-24" aria-hidden />
      <Suspense fallback={<div style={{ minHeight: "80vh" }} aria-hidden />}>
        <PlatformPackages />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: "30vh" }} aria-hidden />}>
        <Footer />
      </Suspense>
    </main>
  );
};

export default Packages;
