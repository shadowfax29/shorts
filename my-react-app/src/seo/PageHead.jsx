import { Helmet } from 'react-helmet-async';
import { SITE, canonicalFor } from './seo-config.js';
import { buildPageSchema } from './schema.js';

/** Full <head> for an indexable page: title, description, canonical, OG, Twitter, JSON-LD. */
export default function PageHead({ page }) {
  const url = canonicalFor(page.path);
  return (
    <Helmet>
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={page.title} />
      <meta property="og:description" content={page.description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:image" content={SITE.ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={SITE.ogImageAlt} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE.twitterHandle} />
      <meta name="twitter:title" content={page.title} />
      <meta name="twitter:description" content={page.description} />
      <meta name="twitter:image" content={SITE.ogImage} />
      <meta name="twitter:image:alt" content={SITE.ogImageAlt} />
      <script type="application/ld+json">{buildPageSchema(page)}</script>
    </Helmet>
  );
}
