# Weekly Growth Dashboard

Review every Monday. Owner: SEO lead. Source: GSC + GA4 + PageSpeed Insights.

## North Star
- **Downloads per week** (MP4 + MP3 events in GTM/GA4)
- Target: week-over-week growth ≥ 10% while holding page views flat or higher

## Activation
- **Paste → successful video fetch rate** = fetches / paste-button clicks
- Track in GA4: `click_paste`, `fetch_success`, `fetch_error`
- Target: fetch success ≥ 85% (any backend/API failures are a ranking blocker)

## Conversion
- **Fetch → download rate** = downloads / successful fetches
- **Audio extract rate** = mp3 extracts / successful fetches
- Target: download rate ≥ 40%; push recovery on the result page if below

## Retention
- **Returning-user ratio** and **repeat-downloads per user** (GA4)
- **Bounce rate on landing** — target ≤ 45% (pre-rendered content should help)
- Watch: time on page for how-it-works/FAQ sections (engagement signal)

## GEO Citability (AI / LLM visibility)
- Share of answers from ChatGPT/Perplexity/Google AI Overviews that cite
  downloadshorts.com when asked "how do I download an Instagram Reel without watermark?"
- Action if absent: enrich FAQ + how-to copy, keep structured data valid, publish
  authoritative how-to pages (P2 backlog)

## SEO Visibility
- **GSC clicks & impressions** (queries: "instagram reel downloader",
  "download instagram reels", "instagram reel audio download", "download reels without watermark")
- **Average position** — target top 3 for primary, top 10 for secondary
- **Indexed pages / submitted pages** via sitemap coverage report (expect 4/4)
- **Core Web Vitals** (field): LCP < 2.5s, CLS < 0.1, INP < 200ms
- **Pages/URLs crawled** — confirm Googlebot is consuming pre-rendered HTML
  (check "Discovered - currently not indexed" is empty)
