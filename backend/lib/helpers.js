import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const COOKIE_FILES = {
  youtube:   'cookies.txt',
  instagram: 'instagram_cookies.txt',
  tiktok:    'tiktok_cookies.txt',
};

export function friendlyError(msg) {
  if (msg.includes('Sign in to confirm') || msg.includes('bot'))
    return { status: 503, error: 'YouTube is requesting verification. Please try again in a moment.' };
  if (msg.includes('rate-limit') || msg.includes('login required') || msg.includes('cookies'))
    return { status: 503, error: 'Instagram login required. Authentication cookies needed.' };
  if (msg.includes('not installed'))
    return { status: 503, error: msg };
  if (msg.includes('private'))
    return { status: 403, error: 'This video is private and cannot be downloaded.' };
  if (msg.includes('not available') || msg.includes('removed') || msg.includes('does not exist') || msg.includes('404'))
    return { status: 404, error: 'Video not found or has been removed.' };
  if (msg.includes('Unsupported URL'))
    return { status: 400, error: 'That URL format is not supported.' };
  if (msg.includes('blocked') || msg.includes('unavailable in your country'))
    return { status: 403, error: 'This video is not available in this region.' };
  return { status: 500, error: 'Failed to fetch video info. The video may be unavailable.' };
}

export function cookieArgs(platform, cookiesDir = __dirname) {
  const filename = COOKIE_FILES[platform];
  if (!filename) return [];
  const path = join(cookiesDir, filename);
  return existsSync(path) ? ['--cookies', path] : [];
}
