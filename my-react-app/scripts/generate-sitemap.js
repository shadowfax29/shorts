/**
 * Generates public/sitemap.xml from src/seo/pages.js so a new landing page can
 * never be forgotten in the sitemap, and <lastmod> is always the build date.
 * Runs automatically before `vite build` (see "prebuild" in package.json).
 */
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES } from '../src/seo/pages.js';
import { SITE, canonicalFor } from '../src/seo/seo-config.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const today = new Date().toISOString().slice(0, 10);

const staticPages = [
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-and-conditions', changefreq: 'yearly', priority: '0.3' },
];

const entries = [
  ...PAGES.map((p) => ({
    loc: canonicalFor(p.path),
    changefreq: p.path === '/' ? 'weekly' : 'monthly',
    priority: p.path === '/' ? '1.0' : '0.9',
    image: p.path === '/' ? { loc: SITE.ogImage, title: p.title } : null,
  })),
  ...staticPages.map((p) => ({ loc: canonicalFor(p.path), changefreq: p.changefreq, priority: p.priority })),
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map(
    (e) => `  <url>
    <loc>${esc(e.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>${
      e.image
        ? `
    <image:image>
      <image:loc>${esc(e.image.loc)}</image:loc>
      <image:title>${esc(e.image.title)}</image:title>
    </image:image>`
        : ''
    }
  </url>`,
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(root, 'public', 'sitemap.xml'), xml);
console.log(`[sitemap] ${entries.length} URLs written (lastmod ${today})`);
