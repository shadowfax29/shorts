/**
 * YouTube-specific helpers: quality list, slimmed info JSON and format selectors.
 */

const MAX_QUALITIES = 8;

/** Unique heights (>=144p) with the best-fps variant, tallest first. */
export function buildQualities(formats) {
  if (!Array.isArray(formats)) return [];
  const byHeight = new Map();
  for (const f of formats) {
    if (!f.vcodec || f.vcodec === 'none' || !f.height || f.height < 144) continue;
    if (f.format_note === 'storyboard' || f.ext === 'mhtml') continue;
    const prev = byHeight.get(f.height);
    const score = (f.fps || 0) * 1e6 + (f.tbr || 0);
    if (!prev || score > prev.score) byHeight.set(f.height, { f, score });
  }
  return [...byHeight.values()]
    .sort((a, b) => b.f.height - a.f.height)
    .slice(0, MAX_QUALITIES)
    .map(({ f }) => ({
      formatId: f.format_id,
      label: `${f.height}p`,
      height: f.height,
      fps: f.fps || null,
      ext: 'mp4',
      filesize: f.filesize || f.filesize_approx || null,
    }));
}

/**
 * Cached `--load-info-json` payloads can be several MB (storyboards, captions,
 * heatmaps). Drop what a download never needs so the cache stays small.
 */
export function slimInfo(meta) {
  const slim = { ...meta };
  delete slim.automatic_captions;
  delete slim.subtitles;
  delete slim.heatmap;
  delete slim.chapters;
  delete slim.thumbnails;
  delete slim.description;
  if (Array.isArray(slim.formats)) {
    slim.formats = slim.formats.filter((f) => f.format_note !== 'storyboard' && f.ext !== 'mhtml');
  }
  return slim;
}

const clampHeight = (h) => {
  const n = Number.parseInt(h, 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 144), 4320) : 720;
};

/**
 * Prefers H.264/AAC so the merged MP4 plays everywhere (iOS, WhatsApp, editors),
 * then falls back to whatever is best at or below the requested height.
 */
export function videoFormat(height) {
  const h = clampHeight(height);
  return [
    `bv*[height<=${h}][vcodec^=avc1]+ba[ext=m4a]`,
    `b[height<=${h}][ext=mp4]`,
    `bv*[height<=${h}]+ba`,
    `b[height<=${h}]`,
    'b',
  ].join('/');
}

export const AUDIO_FORMAT = 'ba[ext=m4a]/ba/b';
