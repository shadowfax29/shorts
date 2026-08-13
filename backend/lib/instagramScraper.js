const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Referer': 'https://www.instagram.com/',
};

/* ── Pre-compiled regexes (compiled once at module load) ─────────────────── */

const META_TAG_RE       = /<meta[^>]*>/gi;                       // iterate all <meta …>
const META_PROPERTY_RE  = /property=["']([^"']+)["']/i;          // extract property value
const META_CONTENT_RE   = /content=["']([^"']+)["']/i;           // extract content value
const VIDEO_VERSIONS_RE = /"video_versions"/;                    // locator only
const URL_MP4_RE        = /"url"\s*:\s*"(https:\\?\/\\?\/[^"]+\.mp4[^"]*)"/;
const URL_GENERIC_RE    = /"url"\s*:\s*"(https:\\?\/\\?\/[^"]+)"/;
const IMAGE_VERSIONS2_RE= /"image_versions2"/;                   // locator only
const ACCESSIBILITY_CAPTION_RE = /"accessibility_caption"\s*:\s*"([^"]{5,200})"/;
const TITLE_RE          = /"title"\s*:\s*"([^"]{5,100})"/;
const EDGE_MEDIA_CAPTION_RE = /"edge_media_to_caption":\{"edges":\[\{"node":\{"text":"((?:[^"\\]|\\.)*)"/;
const ALT_CAPTION_RE    = /"caption"\s*:\s*\{"pk"[^}]*"text"\s*:\s*"((?:[^"\\]|\\.)*)"/;
const AUDIO_CODEC_RE    = /"audio_codec"\s*:\s*"[^"]+".{0,500}"url"\s*:\s*"(https:\\?\/\\?\/[^"]+)"/s;
const HASHTAG_RE        = /#[\w\u0080-\uFFFF]+/g;
const CLEAN_URL_RE      = /\\\//g;
const CLEAN_AMP_RE      = /\\u0026/g;

function getFetchOptions() {
  return {
    headers: BASE_HEADERS,
    keepalive: true,
    signal: AbortSignal.timeout(15000),
  };
}

/**
 * Extract ALL meta tags in a single pass.
 * Replaces 5+ individual parseMeta() calls that each scanned the full HTML
 * and compiled 2 new RegExp objects dynamically.
 */
function extractMetaMap(html) {
  const meta = {};
  let m;
  META_TAG_RE.lastIndex = 0;
  while ((m = META_TAG_RE.exec(html)) !== null) {
    const tag = m[0];
    const prop = META_PROPERTY_RE.exec(tag);
    const content = META_CONTENT_RE.exec(tag);
    if (prop && content) meta[prop[1]] = content[1];
  }
  return meta;
}

function cleanUrl(raw) {
  return raw.replace(CLEAN_URL_RE, '/').replace(CLEAN_AMP_RE, '&');
}

function extractVideoVersionsUrl(html) {
  const idx = html.indexOf('"video_versions"');
  if (idx === -1) return null;
  const match = URL_MP4_RE.exec(html.slice(idx, idx + 3000));
  return match ? cleanUrl(match[1]) : null;
}

function extractThumbnail(html, meta) {
  const idx = html.indexOf('"image_versions2"');
  if (idx === -1) return meta['og:image'] || null;
  const match = URL_GENERIC_RE.exec(html.slice(idx, idx + 1000));
  return match ? cleanUrl(match[1]) : (meta['og:image'] || null);
}

function extractTitle(html, meta) {
  const m1 = ACCESSIBILITY_CAPTION_RE.exec(html);
  if (m1) return m1[1];
  const m2 = TITLE_RE.exec(html);
  if (m2) return m2[1];
  return meta['og:title'] || 'Instagram Reel';
}

function extractCaption(html, meta) {
  const m1 = EDGE_MEDIA_CAPTION_RE.exec(html);
  if (m1) return m1[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');

  const m2 = ALT_CAPTION_RE.exec(html);
  if (m2) return m2[1].replace(/\\n/g, '\n');

  return meta['og:description'] || null;
}

function extractAudioUrl(html, meta) {
  const idx = html.indexOf('"audio"');
  if (idx !== -1) {
    const match = URL_GENERIC_RE.exec(html.slice(idx, idx + 1000));
    if (match) return cleanUrl(match[1]);
  }

  const m = AUDIO_CODEC_RE.exec(html);
  if (m) return cleanUrl(m[1]);

  return meta['og:audio'] || null;
}

function extractHashtags(caption) {
  if (!caption) return [];
  const matches = caption.match(HASHTAG_RE);
  return matches ? [...new Set(matches)] : [];
}

export async function scrapeInstagramReel(url, fetchFn = globalThis.fetch) {
  const res = await fetchFn(url, getFetchOptions());
  const html = await res.text();

  /* Single-pass meta extraction — ~10× faster than the old parseMeta loop */
  const meta = extractMetaMap(html);

  const videoUrl =
    extractVideoVersionsUrl(html) ||
    meta['og:video:secure_url'] ||
    meta['og:video'];

  const caption = extractCaption(html, meta);

  if (!videoUrl) {
    throw new Error('Video unavailable or not found. The reel may be private.');
  }

  return {
    videoUrl,
    audioUrl: extractAudioUrl(html, meta),
    title: extractTitle(html, meta),
    thumbnail: extractThumbnail(html, meta),
    caption,
    hashtags: extractHashtags(caption),
  };
}