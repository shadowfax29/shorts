/** 75 → "1:15", 3725 → "1:02:05" */
export function formatTimestamp(totalSeconds) {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

/** "75" | "1:15" | "1:02:05" → seconds, or NaN when invalid. */
export function parseTimestamp(value) {
  const s = String(value ?? '').trim();
  if (!s) return NaN;
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
  if (!/^\d+(:\d{1,2}){1,2}$/.test(s)) return NaN;
  return s.split(':').reduce((acc, p) => acc * 60 + Number(p), 0);
}

/** Split [0, duration] into consecutive parts of `partSeconds` (last part may be shorter). */
export function splitIntoParts(duration, partSeconds) {
  const parts = [];
  if (!duration || !partSeconds) return parts;
  for (let start = 0; start < duration; start += partSeconds) {
    const end = Math.min(start + partSeconds, duration);
    if (end - start >= 1) parts.push({ start, end });
  }
  return parts;
}
