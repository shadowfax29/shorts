const HEADERS = {
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

function parseMeta(html, property) {
  const match = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'));
  return match ? match[1] : null;
}

function extractVideoVersionsUrl(html) {
  const idx = html.indexOf('"video_versions"');
  if (idx === -1) return null;
  const chunk = html.slice(idx, idx + 3000);
  const urlMatch = chunk.match(/"url"\s*:\s*"(https:\\?\/\\?\/[^"]+\.mp4[^"]*)"/);
  if (!urlMatch) return null;
  return urlMatch[1].replace(/\\\//g, '/').replace(/\\u0026/g, '&');
}

function extractThumbnail(html) {
  const idx = html.indexOf('"image_versions2"');
  if (idx === -1) return parseMeta(html, 'og:image');
  const chunk = html.slice(idx, idx + 1000);
  const urlMatch = chunk.match(/"url"\s*:\s*"(https:\\?\/\\?\/[^"]+)"/);
  if (!urlMatch) return parseMeta(html, 'og:image');
  return urlMatch[1].replace(/\\\//g, '/').replace(/\\u0026/g, '&');
}

function extractTitle(html) {
  // Try structured caption text first
  const captionMatch = html.match(/"accessibility_caption"\s*:\s*"([^"]{5,200})"/);
  if (captionMatch) return captionMatch[1];
  const titleMatch = html.match(/"title"\s*:\s*"([^"]{5,100})"/);
  if (titleMatch) return titleMatch[1];
  return parseMeta(html, 'og:title') || 'Instagram Reel';
}
// Add these to instagramScraper.js

function extractCaption(html) {
  // Method 1: edge_media_to_caption (embedded JSON)
  const captionMatch = html.match(/"edge_media_to_caption":\{"edges":\[\{"node":\{"text":"((?:[^"\\]|\\.)*)"/);
  if (captionMatch) return captionMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');

  // Method 2: "caption" field in video JSON
  const altMatch = html.match(/"caption"\s*:\s*\{"pk"[^}]*"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (altMatch) return altMatch[1].replace(/\\n/g, '\n');

  // Method 3: og:description fallback
  return parseMeta(html, 'og:description') || null;
}

function extractAudioUrl(html) {
  // Method 1: audio field in video JSON (separate audio track)
  const idx = html.indexOf('"audio"');
  if (idx !== -1) {
    const chunk = html.slice(idx, idx + 1000);
    const urlMatch = chunk.match(/"url"\s*:\s*"(https:\\?\/\\?\/[^"]+)"/);
    if (urlMatch) return urlMatch[1].replace(/\\\//g, '/').replace(/\\u0026/g, '&');
  }

  // Method 2: audio_codec present → extract from video_versions audio stream url
  const audioMatch = html.match(/"audio_codec"\s*:\s*"[^"]+".{0,500}"url"\s*:\s*"(https:\\?\/\\?\/[^"]+)"/s);
  if (audioMatch) return audioMatch[1].replace(/\\\//g, '/').replace(/\\u0026/g, '&');

  // Method 3: og:audio meta tag (rare but exists on some posts)
  return parseMeta(html, 'og:audio') || null;
}

function extractHashtags(caption) {
  if (!caption) return [];
  const matches = caption.match(/#[\w\u0080-\uFFFF]+/g);
  return matches ? [...new Set(matches)] : [];   // deduplicated
}

export async function scrapeInstagramReel(url, fetchFn = globalThis.fetch) {
  const res = await fetchFn(url, { headers: HEADERS });
  const html = await res.text();

  const videoUrl = extractVideoVersionsUrl(html)
    || parseMeta(html, 'og:video:secure_url')
    || parseMeta(html, 'og:video');
  const caption = extractCaption(html);

  if (!videoUrl) throw new Error('Video unavailable or not found. The reel may be private.');

  return {
    videoUrl,
    audioUrl: extractAudioUrl(html),   // null if not found / already muxed
    title: extractTitle(html),
    thumbnail: extractThumbnail(html),
    caption,
    hashtags: extractHashtags(caption),
  };
}


