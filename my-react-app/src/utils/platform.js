export function detectPlatform(url) {
  if (!url) return null;
  try {
    const h = new URL(url).hostname.replace('www.', '');
    if (h.includes('youtube.com') || h.includes('youtu.be')) return 'youtube';
    if (h.includes('tiktok.com'))    return 'tiktok';
    if (h.includes('instagram.com')) return 'instagram';
    return null;
  } catch {
    return null;
  }
}
