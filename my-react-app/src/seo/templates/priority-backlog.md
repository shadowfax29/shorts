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

- [x] Publish dedicated landing pages per high-intent keyword (6 pages, see `src/seo/pages.js`),
      linked from nav, footer and a "More free tools" block on every page
- [ ] Add a small guides/FAQ content hub (how-to articles) to build topical authority
- [ ] Lazy-load below-the-fold imagery and add explicit `width`/`height` on thumbnails
- [ ] Serve thumbnails through a cache/CDN with immutable cache headers
- [x] `lastmod` automation: sitemap is generated from `pages.js` on every build
- [x] Real not-found page (noindex) with links to every tool

## P3 (nice-to-have — monitor & iterate)

- [ ] Validate all JSON-LD with https://validator.schema.org weekly
- [ ] Track keyword positions weekly (see weekly-growth-dashboard.md) and adjust copy
- [ ] Consider `hreflang` variants for non-English markets once traffic justifies it
- [ ] Add a PWA manifest + service worker for installability signals
- [ ] Set up scheduled PageSpeed Insights / Lighthouse Core Web Vitals monitoring
