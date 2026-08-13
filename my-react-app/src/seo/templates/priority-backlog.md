# Priority Backlog

## P1 (must-do — highest impact)

- [x] Prerender every route to static HTML so crawlers see full content without JS
      (react-snap `postbuild` + `scripts/prerender.js`)
- [x] Replace logo.png OG image with a proper 1200×630 share card (`og-image.png`)
- [x] Kill duplicate `<title>` / `<meta description>` tags (Helmet `defer={false}` +
      fallbacks removed from `index.html`)
- [x] Single source of truth for site identity: Organization + WebSite + WebApplication
      JSON-LD graph in `index.html`
- [x] Per-page structured data: FAQPage (home), ContactPage + BreadcrumbList (contact),
      BreadcrumbList (privacy + terms)
- [x] Full Open Graph + Twitter cards on every page (locale, image alt, site handle)
- [x] Shrink logo from 1.39 MB → 87 KB (CWV / page weight)
- [ ] Submit `sitemap.xml` in Google Search Console and set the requested crawl rate
- [ ] Run Rich Results Test + URL Inspection on `/`, `/contact`, `/privacy-policy`,
      `/terms-and-conditions` and fix any warnings
- [ ] Verify `og-image.png` renders correctly in Facebook Sharing Debugger and
      Twitter Card Validator

## P2 (should-do — meaningful upside)

- [ ] Publish dedicated landing pages per high-intent keyword
      (`/instagram-reel-video-downloader`, `/instagram-reel-audio-downloader`,
      `/download-reels-without-watermark`) and link them from the footer
- [ ] Add a small guides/FAQ content hub (how-to articles) to build topical authority
- [ ] Lazy-load below-the-fold imagery and add explicit `width`/`height` on thumbnails
- [ ] Serve thumbnails through a cache/CDN with immutable cache headers
- [ ] Add `lastmod` automation so the sitemap stays fresh
- [ ] Add a real `404.html` route (not the landing page) with helpful links

## P3 (nice-to-have — monitor & iterate)

- [ ] Validate all JSON-LD with https://validator.schema.org weekly
- [ ] Track keyword positions weekly (see weekly-growth-dashboard.md) and adjust copy
- [ ] Consider `hreflang` variants for non-English markets once traffic justifies it
- [ ] Add a PWA manifest + service worker for installability signals
- [ ] Set up scheduled PageSpeed Insights / Lighthouse Core Web Vitals monitoring
