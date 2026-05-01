import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_URL = "https://tklh.sa";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Per-page SEO with Open Graph, Twitter, canonical, and optional JSON-LD.
 * Title is auto-suffixed with the brand. Keep titles < 60 chars and
 * descriptions < 160 chars for best SERP rendering.
 */
export const SEO = ({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  noindex = false,
  type = "website",
  jsonLd,
}: SEOProps) => {
  const fullTitle = title.includes("TKLH") ? title : `${title} | TKLH تِكله`;
  const url = canonical ? (canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}`) : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
