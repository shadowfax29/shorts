// instagramScraper.js — optimized with streaming fetch, precompiled regexes, cache, retry

const HEADERS = {
  'User-Agent':    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer':       'https://www.instagram.com/',
};

const TIMEOUT_MS  = 3000;
const MAX_RETRIES = 2;
const MAX_BYTES   = 900_000;        // stop streaming after ~900 KB
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const cache = new Map();

// ── Precompiled regexes (built once, not per-call) ────────────────────────────
const OG_VIDEO_REGEX    = /<meta[^>]+property=["']og:video:secure_url["'][^>]+content=["']([^"']+)["']|<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i;
const OG_IMAGE_REGEX    = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i;
const OG_TITLE_REGEX    = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i;
const OG_DESC_REGEX     = /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i;
const CAPTION_REGEX     = /"edge_media_to_caption":\{"edges":\[\{"node":\{"text":"((?:[^"\\]|\\.)*)"/;
const CAPTION_ALT_REGEX = /"caption"\s*:\s*\{"pk"[^}]*"text"\s*:\s*"((?:[^"\\]|\\.)*)"/;
const TITLE_JSON_REGEX  = /"title"\s*:\s*"([^"]{5,100})"/;
const ACCESS_CAPTION_REGEX = /"accessibility_caption"\s*:\s*"([^"]{5,200})"/;
const AUDIO_CODEC_REGEX = /"audio_codec"\s*:\s*"[^"]+".{0,500}"url"\s*:\s*"(https:\\?\/\\?\/[^"]+)"/s;

function cleanUrl(u) {
  return u.replace(/\\\//g, '/').replace(/\\u0026/g, '&');
}

// ── Streamed fetch with byte cap ──────────────────────────────────────────────
// When fetchFn is the real globalThis.fetch we stream and cap at MAX_BYTES.
// When fetchFn is a test mock (returns { ok, status, text() }) we fall back to
// res.text() because the mock doesn't expose a ReadableStream body.
async function fetchPartialHtml(url, signal, fetchFn) {
  const res = await fetchFn(url, { headers: HEADERS, signal });
  if (!res.ok) throw new Error(`Instagram returned ${res.status}`);

  // Test mocks return a plain object without a streaming body — use text()
  if (!res.body || typeof res.body.getReader !== 'function') {
    return res.text();
  }

  // Production path: stream and cap
  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let html  = '';
  let bytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    html  += decoder.decode(value, { stream: true });
    if (bytes >= MAX_BYTES || (html.includes('"video_versions"') && bytes >= 150_000)) {
      reader.cancel();
      break;
    }
  }
  return html;
}

// ── Extractors (all operate on the same partial html) ─────────────────────────
function extractVideoVersionsUrl(html) {
  const idx = html.indexOf('"video_versions"');
  if (idx === -1) return null;
  const chunk = html.slice(idx, idx + 3000);
  const m = chunk.match(/"url"\s*:\s*"(https:\\?\/\\?\/[^"]+\.mp4[^"]*)"/);
  return m ? cleanUrl(m[1]) : null;
}

function extractThumbnail(html) {
  const idx = html.indexOf('"image_versions2"');
  if (idx !== -1) {
    const chunk = html.slice(idx, idx + 1000);
    const m = chunk.match(/"url"\s*:\s*"(https:\\?\/\\?\/[^"]+)"/);
    if (m) return cleanUrl(m[1]);
  }
  const og = html.match(OG_IMAGE_REGEX);
  return og ? og[1] : null;
}

function extractTitle(html) {
  const cap = html.match(ACCESS_CAPTION_REGEX);
  if (cap) return cap[1];
  const t = html.match(TITLE_JSON_REGEX);
  if (t) return t[1];
  const og = html.match(OG_TITLE_REGEX);
  return og ? og[1] : 'Instagram Reel';
}

function extractCaption(html) {
  const m1 = html.match(CAPTION_REGEX);
  if (m1) return m1[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
  const m2 = html.match(CAPTION_ALT_REGEX);
  if (m2) return m2[1].replace(/\\n/g, '\n');
  const og = html.match(OG_DESC_REGEX);
  return og ? og[1] : null;
}

function extractAudioUrl(html) {
  const idx = html.indexOf('"audio"');
  if (idx !== -1) {
    const chunk = html.slice(idx, idx + 1000);
    const m = chunk.match(/"url"\s*:\s*"(https:\\?\/\\?\/[^"]+)"/);
    if (m) return cleanUrl(m[1]);
  }
  const m = html.match(AUDIO_CODEC_REGEX);
  return m ? cleanUrl(m[1]) : null;
}

function extractHashtags(caption) {
  if (!caption) return [];
  const m = caption.match(/#[\w\u0080-\uFFFF]+/g);
  return m ? [...new Set(m)] : [];
}

// ── Core scrape with timeout + retry ─────────────────────────────────────────
async function scrapeOnce(url, fetchFn) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const html = await fetchPartialHtml(url, controller.signal, fetchFn);

    const videoUrl = extractVideoVersionsUrl(html)
      || html.match(OG_VIDEO_REGEX)?.[1]
      || html.match(OG_VIDEO_REGEX)?.[2];

    if (!videoUrl) throw new Error('Video unavailable or not found. The reel may be private.');

    const caption = extractCaption(html);
    return {
      videoUrl,
      audioUrl:  extractAudioUrl(html),
      title:     extractTitle(html),
      thumbnail: extractThumbnail(html),
      caption,
      hashtags:  extractHashtags(caption),
    };
  } finally {
    clearTimeout(timer);
  }
}

// ── Public API: optional fetchFn for testability, cache + retry in production ─
//
// Signature: scrapeInstagramReel(url, fetchFn?)
//   • url      — Instagram Reel URL
//   • fetchFn  — optional, defaults to globalThis.fetch.
//                Pass a mock in tests; when provided the cache/retry logic is
//                bypassed so tests stay fast and deterministic.
//
export async function scrapeInstagramReel(url, fetchFn) {
  // ── Test path: custom fetchFn provided — skip cache and retry ────────────
  if (fetchFn) {
    return scrapeOnce(url, fetchFn);
  }

  // ── Production path: cache + retry ───────────────────────────────────────
  const realFetch = globalThis.fetch;
  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return cached.data;
  }

  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const data = await scrapeOnce(url, realFetch);
      cache.set(url, { data, time: Date.now() });
      return data;
    } catch (err) {
      lastErr = err.name === 'AbortError'
        ? new Error('Instagram request timed out.')
        : err;
      if (!/timed out|fetch failed|ECONNRESET/i.test(lastErr.message)) throw lastErr;
    }
  }
  throw lastErr;
}
