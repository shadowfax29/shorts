/**
 * URL helpers: platform detection, canonicalisation (better cache hit-rate and
 * safer downstream calls) and clip time-range validation.
 */

const YT_ID_RE = /^[\w-]{11}$/;
const IG_CODE_RE = /^[\w-]{5,}$/;

export function detectPlatform(url) {
  try {
    const h = new URL(url).hostname.replace(/^(www|m)\./, '');
    if (h === 'youtube.com' || h.endsWith('.youtube.com') || h === 'youtu.be') return 'youtube';
    if (h === 'tiktok.com' || h.endsWith('.tiktok.com')) return 'tiktok';
    if (h === 'instagram.com' || h.endsWith('.instagram.com')) return 'instagram';
    return null;
  } catch {
    return null;
  }
}

/** Returns { id, isShort } or null when the URL is not a single YouTube video. */
export function parseYouTube(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  const host = u.hostname.replace(/^(www|m|music)\./, '');
  const parts = u.pathname.split('/').filter(Boolean);

  let id = null;
  let isShort = false;
  if (host === 'youtu.be') {
    id = parts[0];
  } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
    if (parts[0] === 'watch') id = u.searchParams.get('v');
    else if (['shorts', 'embed', 'live', 'v'].includes(parts[0])) {
      id = parts[1];
      isShort = parts[0] === 'shorts';
    }
  }
  return id && YT_ID_RE.test(id) ? { id, isShort } : null;
}

/** Returns { code, kind } or null for Instagram post/reel/tv URLs. */
export function parseInstagram(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  const parts = u.pathname.split('/').filter(Boolean);
  // /reel/CODE, /reels/CODE, /p/CODE, /tv/CODE, and /<user>/reel/CODE
  const i = parts.findIndex((p) => ['reel', 'reels', 'p', 'tv'].includes(p));
  if (i === -1 || !parts[i + 1] || !IG_CODE_RE.test(parts[i + 1])) return null;
  return { code: parts[i + 1], kind: parts[i] === 'reels' ? 'reel' : parts[i] };
}

/**
 * Canonical form of a supported URL. Strips tracking params (igsh, si, feature…)
 * so the same video always maps to the same cache key. Unknown shapes are
 * returned trimmed, untouched.
 */
export function normalizeUrl(url) {
  const trimmed = String(url || '').trim();
  const platform = detectPlatform(trimmed);
  if (platform === 'youtube') {
    const yt = parseYouTube(trimmed);
    if (yt) return `https://www.youtube.com/watch?v=${yt.id}`;
  }
  if (platform === 'instagram') {
    const ig = parseInstagram(trimmed);
    if (ig) return `https://www.instagram.com/${ig.kind}/${ig.code}/`;
  }
  return trimmed;
}

/** Accepts seconds (number / "90") or "mm:ss" / "hh:mm:ss". Returns seconds or NaN. */
export function parseTimestamp(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const s = String(value ?? '').trim();
  if (!s) return NaN;
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
  if (!/^\d+(:\d{1,2}){1,2}(\.\d+)?$/.test(s)) return NaN;
  return s.split(':').reduce((acc, p) => acc * 60 + Number(p), 0);
}

export function validateClipRange(start, end, { duration = null, maxSeconds = 600 } = {}) {
  const s = parseTimestamp(start);
  const e = parseTimestamp(end);
  if (Number.isNaN(s) || Number.isNaN(e)) return { error: 'Enter a valid start and end time.' };
  if (s < 0) return { error: 'Start time cannot be negative.' };
  if (e <= s) return { error: 'End time must be after the start time.' };
  if (duration && s >= duration) return { error: 'Start time is beyond the end of the video.' };
  const clampedEnd = duration ? Math.min(e, duration) : e;
  if (clampedEnd - s > maxSeconds) {
    return { error: `Clips can be at most ${Math.floor(maxSeconds / 60)} minutes long.` };
  }
  return { start: s, end: clampedEnd };
}

/** Safe, ASCII-only download filename (RFC 6266 friendly). */
export function safeFilename(title, ext, fallback = 'video') {
  const base = String(title || fallback)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .toLowerCase()
    .slice(0, 60)
    .replace(/^-+|-+$/g, '');
  return `${base || fallback}.${ext}`;
}
