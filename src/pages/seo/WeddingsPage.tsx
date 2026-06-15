import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function WeddingsPage() {
  const url = "https://tklh.sa/weddings";
  return (
    <main dir="rtl" className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>تنسيق زواج وأعراس بالسعودية — تكله tklh.sa</title>
        <meta
          name="description"
          content="منصة تكله (tklh.sa) لتنسيق حفلات الزواج والأعراس في الرياض وجدة والدمام: كوش، قاعات، ضيافة، تصوير، ودعوات بأفضل الأسعار. احجز باقتك الآن."
        />
        <meta name="keywords" content="تنسيق زواج, تنسيق أعراس, منسق زواج, كوش زواج, قاعات أفراح, حفلات زواج الرياض, تنسيق زفاف جدة, تكله, tklh" />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content="تنسيق زواج وأعراس بالسعودية — تكله" />
        <meta property="og:description" content="منصة تكله لتنسيق حفلات الزواج: كوش، قاعات، ضيافة، تصوير، ودعوات." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "تنسيق زواج",
          "name": "تنسيق حفلات الزواج والأعراس",
          "url": url,
          "areaServed": { "@type": "Country", "name": "Saudi Arabia" },
          "provider": { "@type": "Organization", "name": "تكله | TKLH", "url": "https://tklh.sa/" },
          "description": "تنسيق حفلات الزواج والأعراس في الرياض وجدة والدمام عبر منصة تكله: كوش، قاعات، ضيافة، تصوير، ودعوات."
        })}</script>
      </Helmet>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">تنسيق زواج وأعراس بالسعودية</h1>
        <p className="text-lg text-muted-foreground mb-8">
          تكله — المنصة السعودية الأولى لتنسيق حفلات الزواج والأعراس. اختر القاعة، الكوشة، الضيافة، التصوير،
          والمنسق المعتمد بضغطة واحدة في الرياض وجدة والدمام.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-3">خدمات تنسيق الزواج عبر تكله</h2>
        <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
          <li>تصميم وتركيب كوش الزواج بأحدث الموديلات.</li>
          <li>حجز قاعات الأفراح المعتمدة في كل المدن السعودية.</li>
          <li>ضيافة وقهوجية وضيافة عربية فاخرة.</li>
          <li>تصوير فوتوغرافي وفيديو احترافي للأعراس.</li>
          <li>تنسيق دعوات إلكترونية وبطاقات مطبوعة.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-3">لماذا منسق زواج من تكله؟</h2>
        <p className="text-muted-foreground mb-6">
          كل منسقي الحفلات في تكله موثّقون، الأسعار شفافة، والمدفوعات محفوظة في حساب ضمان حتى إتمام الحفل بنجاح.
        </p>

        <Button asChild size="lg"><Link to="/">ابدأ تنسيق حفل زواجك الآن</Link></Button>
      </section>
    </main>
  );
}
