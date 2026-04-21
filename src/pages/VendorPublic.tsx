import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, MapPin, Phone, ShieldCheck, ArrowLeft, Star, Sparkles, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/tekillah/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReviewsList } from "@/components/tekillah/reviews/ReviewsList";
import { VendorRatingBadge } from "@/components/tekillah/reviews/VendorRatingBadge";
import { CATEGORY_LABELS, type VendorRow, type PackageRow } from "@/components/tekillah/vendor/types";
import { fmtNumber } from "@/i18n/format";

/** Build a Google Maps embed URL from a user-pasted maps link or fallback to a query. */
const toEmbedSrc = (url: string | null, fallbackQuery: string): string => {
  if (!url) return `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
  // If the URL already contains output=embed return it. Otherwise wrap as q=URL.
  if (url.includes("output=embed")) return url;
  return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
};

const VendorPublic = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: v } = await supabase.from("vendors").select("*").eq("id", id).maybeSingle();
      setVendor(v as VendorRow | null);
      if (v) {
        const { data: pkgs } = await supabase.from("packages")
          .select("*").eq("vendor_id", id).eq("active", true).eq("approval_status", "approved")
          .order("price", { ascending: true });
        setPackages((pkgs ?? []) as unknown as PackageRow[]);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-soft">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-soft p-6 text-center">
        <div>
          <Building2 className="mx-auto h-10 w-10 text-foreground/40" />
          <h1 className="mt-4 font-arabic text-xl font-semibold text-foreground">المزوّد غير متاح</h1>
          <p className="mt-2 text-sm text-foreground/60">قد يكون الملف قيد المراجعة أو غير موجود.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/"><ArrowLeft className="me-1 h-4 w-4" /> العودة للرئيسية</Link>
          </Button>
        </div>
      </div>
    );
  }

  const mapSrc = toEmbedSrc(vendor.google_maps_url, `${vendor.business_name} ${vendor.city ?? ""}`);
  const portfolioCover = vendor.portfolio_urls?.[0];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link to="/"><ArrowLeft className="me-1 h-4 w-4" /> {t("common.main")}</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        {portfolioCover ? (
          <div className="absolute inset-0">
            <img src={portfolioCover} alt={vendor.business_name} className="h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-soft" />
        )}
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-primary/15 text-primary">{CATEGORY_LABELS[vendor.category]}</Badge>
              {vendor.verified && (
                <Badge className="rounded-full bg-emerald-500/15 text-emerald-700">
                  <ShieldCheck className="me-1 h-3 w-3" /> موثّق
                </Badge>
              )}
              <VendorRatingBadge vendorId={vendor.id} />
            </div>
            <h1 className="mt-4 font-arabic text-3xl font-semibold text-foreground sm:text-5xl">
              {vendor.business_name}
            </h1>
            {vendor.bio && (
              <p className="mt-3 max-w-3xl text-foreground/75 sm:text-lg">{vendor.bio}</p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-foreground/70">
              {vendor.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" /> {vendor.city}
                </span>
              )}
              {vendor.phone && (
                <a href={`tel:${vendor.phone}`} className="inline-flex items-center gap-1.5 text-foreground hover:text-primary" dir="ltr">
                  <Phone className="h-4 w-4 text-primary" /> {vendor.phone}
                </a>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                يبدأ من {fmtNumber(Number(vendor.starting_price))} {t("common.currency")}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 sm:py-12">
        {/* Gallery */}
        {vendor.portfolio_urls?.length > 0 && (
          <section>
            <h2 className="font-arabic text-2xl font-semibold text-foreground">معرض الأعمال</h2>
            <p className="mt-1 text-sm text-foreground/65">لقطات من حفلات سابقة أنجزها المزوّد.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {vendor.portfolio_urls.slice(0, 5).map((url, i) => (
                <motion.a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                >
                  <img src={url} alt={`portfolio-${i}`} loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </motion.a>
              ))}
            </div>
          </section>
        )}

        {/* Packages */}
        {packages.length > 0 && (
          <section>
            <h2 className="font-arabic text-2xl font-semibold text-foreground">الباقات المتاحة</h2>
            <p className="mt-1 text-sm text-foreground/65">اختر الباقة المناسبة لمناسبتك.</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-arabic text-base font-semibold text-foreground">{p.name}</div>
                      <Badge variant="secondary" className="mt-1 text-[10px]">{p.tier}</Badge>
                    </div>
                    <div className="text-end">
                      <div className="font-arabic text-lg font-semibold text-primary">{fmtNumber(Number(p.price))}</div>
                      <div className="text-[10px] text-foreground/55">{t("common.currency")}</div>
                    </div>
                  </div>
                  {p.description && <p className="mt-2 text-xs text-foreground/70">{p.description}</p>}
                  {p.includes?.length > 0 && (
                    <ul className="mt-3 space-y-1 text-xs text-foreground/75">
                      {p.includes.slice(0, 5).map((inc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Star className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Map */}
        <section>
          <h2 className="font-arabic text-2xl font-semibold text-foreground">الموقع على الخريطة</h2>
          <p className="mt-1 text-sm text-foreground/65">للوصول السريع لموقع المزوّد.</p>
          <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <iframe
              title={`${vendor.business_name} location`}
              src={mapSrc}
              className="h-[380px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {vendor.google_maps_url && (
            <a href={vendor.google_maps_url} target="_blank" rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <MapPin className="h-3.5 w-3.5" /> فتح في Google Maps
            </a>
          )}
        </section>

        {/* Reviews */}
        <section>
          <h2 className="font-arabic text-2xl font-semibold text-foreground">تقييمات العملاء</h2>
          <p className="mt-1 text-sm text-foreground/65">آراء حقيقية من عملاء سابقين.</p>
          <div className="mt-4">
            <ReviewsList vendorId={vendor.id} />
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center sm:p-10">
          <h3 className="font-arabic text-xl font-semibold text-foreground sm:text-2xl">جاهز لحجز {vendor.business_name}؟</h3>
          <p className="mt-2 text-sm text-foreground/70">ابدأ تخطيط مناسبتك من خلال تكلّة وأكمل الحجز بأمان.</p>
          <Button asChild className="mt-5 rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90">
            <Link to="/dashboard">ابدأ الحجز الآن</Link>
          </Button>
        </section>
      </main>
    </div>
  );
};

export default VendorPublic;
