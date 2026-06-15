import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ConferencesPage() {
  const url = "https://tklh.sa/conferences";
  return (
    <main dir="rtl" className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>إدارة وتنسيق مؤتمرات بالسعودية — تكله tklh.sa</title>
        <meta
          name="description"
          content="تكله (tklh.sa) لإدارة وتنسيق المؤتمرات وورش العمل والفعاليات المؤسسية في المملكة العربية السعودية: تخطيط، تسجيل، ضيافة، صوتيات، وبث مباشر."
        />
        <meta name="keywords" content="إدارة وتنسيق مؤتمرات, تنظيم مؤتمرات, إدارة مؤتمرات الرياض, مؤتمرات السعودية, ورش عمل, فعاليات مؤسسية, تكله, tklh" />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content="إدارة وتنسيق مؤتمرات بالسعودية — تكله" />
        <meta property="og:description" content="إدارة وتنظيم المؤتمرات وورش العمل والفعاليات المؤسسية في المملكة." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "إدارة وتنسيق مؤتمرات",
          "name": "إدارة وتنسيق المؤتمرات",
          "url": url,
          "areaServed": { "@type": "Country", "name": "Saudi Arabia" },
          "provider": { "@type": "Organization", "name": "تكله | TKLH", "url": "https://tklh.sa/" },
          "description": "إدارة وتنظيم وتنسيق المؤتمرات وورش العمل والفعاليات المؤسسية في المملكة العربية السعودية."
        })}</script>
      </Helmet>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">إدارة وتنسيق مؤتمرات بالسعودية</h1>
        <p className="text-lg text-muted-foreground mb-8">
          تكله شريكك الموثوق لإدارة وتنسيق المؤتمرات الكبرى وورش العمل والفعاليات المؤسسية في الرياض وجدة والدمام
          والمدن الرئيسية بالمملكة.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-3">خدمات إدارة المؤتمرات</h2>
        <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
          <li>تخطيط شامل للمؤتمر وإدارة جدول الجلسات.</li>
          <li>تسجيل الحضور وإدارة الدعوات والشارات.</li>
          <li>أنظمة صوت وإضاءة وعرض احترافية.</li>
          <li>بث مباشر وترجمة فورية.</li>
          <li>ضيافة المؤتمرات وكوفي بريك.</li>
          <li>تصوير وتغطية إعلامية كاملة.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-3">لماذا تكله لتنسيق مؤتمرك؟</h2>
        <p className="text-muted-foreground mb-6">
          منسقو مؤتمرات معتمدون، عقود واضحة، ودفعات محفوظة في حساب ضمان — لتركّز فقط على نجاح فعاليتك.
        </p>

        <Button asChild size="lg"><Link to="/">اطلب عرض إدارة مؤتمر</Link></Button>
      </section>
    </main>
  );
}
