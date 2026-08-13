import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const COOKIE_FILES = {
  youtube: 'cookies.txt',
  instagram: 'instagram_cookies.txt',
  tiktok: 'tiktok_cookies.txt',
};

/* Static lookup — avoids re-evaluating strings on every error call */
const ERROR_PATTERNS = [
  { test: /Sign in to confirm|bot/i, status: 503, error: 'YouTube is requesting verification. Please try again in a moment.' },
  { test: /rate-limit|login required|cookies/i, status: 503, error: 'Instagram login required. Authentication cookies needed.' },
  { test: /not installed/i, status: 503, error: null }, // passthrough
  { test: /private/i, status: 403, error: 'This video is private and cannot be downloaded.' },
  { test: /not available|removed|does not exist|404/i, status: 404, error: 'Video not found or has been removed.' },
  { test: /Unsupported URL/i, status: 400, error: 'That URL format is not supported.' },
  { test: /blocked|unavailable in your country/i, status: 403, error: 'This video is not available in this region.' },
];

export function friendlyError(msg) {
  for (const p of ERROR_PATTERNS) {
    if (p.test.test(msg)) {
      return { status: p.status, error: p.error ?? msg };
    }
  }
  return { status: 500, error: 'Failed to fetch video info. The video may be unavailable.' };
}

export function cookieArgs(platform, cookiesDir = __dirname) {
  const filename = COOKIE_FILES[platform];
  if (!filename) return [];

  const path = join(cookiesDir, filename);
  if (existsSync(path)) {
    return ['--cookies', path];
  }

  if (platform === 'youtube' && process.env.YT_COOKIES_BROWSER) {
    return ['--cookies-from-browser', process.env.YT_COOKIES_BROWSER];
  }

  return [];
}