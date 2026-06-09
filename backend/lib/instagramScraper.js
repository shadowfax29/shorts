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

export async function scrapeInstagramReel(url, fetchFn = globalThis.fetch) {
  const res = await fetchFn(url, { headers: HEADERS });
  const html = await res.text();

  // Try video_versions (embedded JSON) first, fall back to og:video
  const videoUrl = extractVideoVersionsUrl(html)
    || parseMeta(html, 'og:video:secure_url')
    || parseMeta(html, 'og:video');

  if (!videoUrl) throw new Error('Video unavailable or not found. The reel may be private.');

  return {
    videoUrl,
    title: extractTitle(html),
    thumbnail: extractThumbnail(html),
  };
}
