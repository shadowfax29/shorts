/**
 * Maps yt-dlp's Instagram JSON onto the same shape the HTML scraper returns.
 *
 * Instagram now serves a JS-only shell to plain HTTP clients, so the HTML
 * scraper often finds nothing. yt-dlp (optionally with cookies) is the
 * reliable fallback. It exposes:
 *   - progressive formats (video+audio in one file; codecs reported as unknown)
 *   - DASH video-only / audio-only formats (need a merge)
 * We prefer a progressive file because it can be proxy-streamed with zero CPU.
 */
const HASHTAG_RE = /#[\w\u0080-￿]+/g;

function isProgressive(f) {
  const unknown = (c) => c === undefined || c === null || c === 'unknown';
  if (!f.url || f.ext !== 'mp4' || !/^https?/.test(f.protocol || 'https')) return false;
  if (String(f.format_id).startsWith('dash-')) return false;
  if (f.vcodec === 'none' || f.acodec === 'none') return false;
  return unknown(f.vcodec) || unknown(f.acodec) || (f.vcodec && f.acodec);
}

export function pickInstagramFromYtdlp(meta) {
  const formats = Array.isArray(meta.formats) ? meta.formats : [];
  // yt-dlp sorts worst → best, so the last progressive entry is the best one.
  const progressive = formats.filter(isProgressive);
  const best = progressive.some((f) => f.height)
    ? [...progressive].sort((a, b) => (b.height || 0) - (a.height || 0))[0]
    : progressive[progressive.length - 1];

  const caption = meta.description || null;
  const audio = formats.find((f) => String(f.format_id).startsWith('dash-') && f.vcodec === 'none');

  return {
    videoUrl: best?.url || meta.url || null,
    audioUrl: audio?.url || null,
    title: meta.title || 'Instagram Reel',
    thumbnail: meta.thumbnail || null,
    duration: meta.duration || null,
    uploader: meta.uploader || meta.channel || null,
    caption,
    hashtags: caption ? [...new Set(caption.match(HASHTAG_RE) || [])] : [],
  };
}
