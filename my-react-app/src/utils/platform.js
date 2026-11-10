export function detectPlatform(url) {
  if (!url) return null;
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

/**
 * True only when the URL points at a single video/reel (not a bare domain,
 * profile, channel or playlist). Used to decide when to auto-fetch.
 */
export function isVideoUrl(url) {
  const platform = detectPlatform(url);
  if (!platform) return false;
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (platform === 'youtube') {
      const host = u.hostname.replace(/^(www|m)\./, '');
      if (host === 'youtu.be') return /^[\w-]{11}$/.test(parts[0] || '');
      if (parts[0] === 'watch') return /^[\w-]{11}$/.test(u.searchParams.get('v') || '');
      return ['shorts', 'embed', 'live', 'v'].includes(parts[0]) && /^[\w-]{11}$/.test(parts[1] || '');
    }
    if (platform === 'instagram') {
      const i = parts.findIndex((p) => ['reel', 'reels', 'p', 'tv'].includes(p));
      return i !== -1 && Boolean(parts[i + 1]);
    }
    return parts.length > 0;
  } catch {
    return false;
  }
}
