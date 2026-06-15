import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  const url = "https://tklh.sa/events";
  return (
    <main dir="rtl" className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>تنسيق حفلات ومناسبات بالسعودية — تكله tklh.sa</title>
        <meta
          name="description"
          content="تكله (tklh.sa) لتنسيق الحفلات والمناسبات الخاصة: تخرج، أعياد ميلاد، حفلات شركات، استقبال مواليد، وفعاليات ترفيهية في الرياض وجدة والدمام."
        />
        <meta name="keywords" content="تنسيق حفلات, منسق حفلات الرياض, حفلات تخرج, أعياد ميلاد, تنظيم مناسبات, تكله, tklh" />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content="تنسيق حفلات ومناسبات بالسعودية — تكله" />
        <meta property="og:description" content="تنسيق حفلات التخرج وأعياد الميلاد والمناسبات في الرياض وجدة والدمام." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "تنسيق حفلات",
          "name": "تنسيق حفلات ومناسبات",
          "url": url,
          "areaServed": { "@type": "Country", "name": "Saudi Arabia" },
          "provider": { "@type": "Organization", "name": "تكله | TKLH", "url": "https://tklh.sa/" },
          "description": "تنسيق حفلات التخرج، أعياد الميلاد، والمناسبات الخاصة بالكامل عبر تكله."
        })}</script>
      </Helmet>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">تنسيق حفلات ومناسبات بالسعودية</h1>
        <p className="text-lg text-muted-foreground mb-8">
          من حفلات التخرج وأعياد الميلاد إلى الفعاليات المؤسسية واستقبال المواليد — تكله يجمع لك أفضل منسقي الحفلات
          في الرياض وجدة والدمام في مكان واحد.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-3">ما الذي يقدمه منسقو تكله؟</h2>
        <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
          <li>تخطيط كامل للمناسبة من الفكرة حتى التنفيذ.</li>
          <li>تنسيق الديكور، الإضاءة، والصوتيات.</li>
          <li>تنسيق الضيافة والبوفيهات والكيك.</li>
          <li>تصوير وتغطية كاملة للمناسبة.</li>
          <li>إدارة الدعوات والاستقبال والبروتوكول.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-3">احجز منسق حفلتك بضغطة واحدة</h2>
        <p className="text-muted-foreground mb-6">
          قارن الأسعار، اطلع على التقييمات، واحجز المنسق الأنسب لمناسبتك — كل ذلك بأمان عبر حساب الضمان.
        </p>

        <Button asChild size="lg"><Link to="/">ابدأ تنسيق حفلتك الآن</Link></Button>
      </section>
    </main>
  );
}
