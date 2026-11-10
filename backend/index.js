/**
 * DownloadShorts API Server
 * Wraps yt-dlp via child_process — no wrapper package required.
 * Requires yt-dlp + ffmpeg (PATH, or YTDLP_PATH / FFMPEG_PATH env vars).
 *
 *   GET /api/info?url=            metadata + qualities (YouTube / Instagram / TikTok)
 *   GET /api/download?url=…       full video (YouTube: &height=720)
 *   GET /api/clip?url=&start=&end= cut a section out of a YouTube video
 *   GET /api/audio?url=           MP3
 *   GET /api/thumbnail?videoUrl=  proxied thumbnail (Instagram CDN tokens are session locked)
 */
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { spawn, spawnSync } from 'child_process';
import { existsSync, writeFileSync, createReadStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

import { friendlyError, cookieArgs, COOKIE_FILES } from './lib/helpers.js';
import { scrapeInstagramReel } from './lib/instagramScraper.js';
import { pickInstagramFromYtdlp } from './lib/instagramYtdlp.js';
import { infoCache } from './lib/cache.js';
import { createYtDlp, resolveBinary, sweepTempDirs } from './lib/ytdlp.js';
import { rateLimit, Semaphore } from './lib/rateLimit.js';
import { buildQualities, slimInfo, videoFormat, AUDIO_FORMAT } from './lib/youtube.js';
import {
  detectPlatform, normalizeUrl, parseYouTube, validateClipRange, safeFilename,
} from './lib/urls.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const CLIP_MAX_SECONDS = Number(process.env.CLIP_MAX_SECONDS) || 600;
const MAX_JOBS = Number(process.env.MAX_CONCURRENT_JOBS) || 3;

// ──────────────────────────────────────────────
// Write per-platform cookie files from env vars
// On Render set: YOUTUBE_COOKIES_B64, INSTAGRAM_COOKIES_B64, TIKTOK_COOKIES_B64
// ──────────────────────────────────────────────
const COOKIES_DIR = __dirname;
const COOKIE_ENV_MAP = {
  YOUTUBE_COOKIES_B64: COOKIE_FILES.youtube,
  INSTAGRAM_COOKIES_B64: COOKIE_FILES.instagram,
  TIKTOK_COOKIES_B64: COOKIE_FILES.tiktok,
};
for (const [envKey, filename] of Object.entries(COOKIE_ENV_MAP)) {
  if (!process.env[envKey]) continue;
  try {
    writeFileSync(join(COOKIES_DIR, filename), Buffer.from(process.env[envKey], 'base64').toString('utf-8'), 'utf-8');
    console.log(`${filename} written from ${envKey}`);
  } catch (e) {
    console.error(`Failed to write ${filename}:`, e.message);
  }
}

// ──────────────────────────────────────────────
// Binaries
// ──────────────────────────────────────────────
const wingetBase = `${process.env.LOCALAPPDATA}\\Microsoft\\WinGet\\Packages`;
const YTDLP_BIN = resolveBinary('yt-dlp', 'YTDLP_PATH', [
  `${wingetBase}\\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe\\yt-dlp.exe`,
]);
// Prefer a system ffmpeg (modern + ~3x faster); the bundled npm binary is a 2018 build.
const systemFfmpeg = spawnSync('ffmpeg', ['-version'], { windowsHide: true }).status === 0;
const FFMPEG_BIN = resolveBinary(
  systemFfmpeg || !existsSync(ffmpegInstaller.path) ? 'ffmpeg' : ffmpegInstaller.path,
  'FFMPEG_PATH',
);
console.log(`yt-dlp → ${YTDLP_BIN}`);
console.log(`ffmpeg → ${FFMPEG_BIN}`);

const ytdlp = createYtDlp({
  bin: YTDLP_BIN,
  ffmpegBin: FFMPEG_BIN,
  cookieArgsFor: (platform) => cookieArgs(platform, COOKIES_DIR),
});
const jobs = new Semaphore(MAX_JOBS);
sweepTempDirs();
setInterval(sweepTempDirs, 30 * 60 * 1000).unref();

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
app.set('trust proxy', 1);

const ALLOWED_ORIGINS = new Set([
  'https://downloadshorts.com',
  'https://www.downloadshorts.com',
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
]);
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.has(origin) || /\.vercel\.app$/.test(new URL(origin).hostname)),
  exposedHeaders: ['Content-Disposition', 'Content-Length'],
}));
app.use(compression());
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

const infoLimiter = rateLimit({ windowMs: 60_000, max: 40 });
const heavyLimiter = rateLimit({
  windowMs: 60_000, max: 15, message: 'Too many downloads in a minute. Please wait a moment and try again.',
});

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Request coalescing: deduplicate in-flight fetches for the same URL
const inflight = new Map();
function coalesce(key, fetcher) {
  const existing = inflight.get(key);
  if (existing) return existing;
  const p = fetcher().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

function sendError(res, err) {
  const { status, error } = friendlyError(err.message);
  const body = { error };
  if (process.env.NODE_ENV !== 'production') body.detail = err.message;
  if (!res.headersSent) res.status(status).json(body);
}

function setDownloadHeaders(res, filename, contentType) {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
}

/** AbortController that fires when the client goes away before we finished. */
function abortOnDisconnect(res) {
  const ac = new AbortController();
  res.on('close', () => { if (!res.writableFinished) ac.abort(); });
  return ac;
}

/** Quick validation shared by every endpoint that takes ?url= */
function requireSupportedUrl(req, res) {
  const raw = String(req.query.url || '').trim();
  if (!raw) { res.status(400).json({ error: 'URL is required.' }); return null; }
  const platform = detectPlatform(raw);
  if (!platform) {
    res.status(400).json({ error: 'Unsupported platform. Paste a YouTube or Instagram Reels URL.' });
    return null;
  }
  return { url: normalizeUrl(raw), platform };
}

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────
async function fetchInstagram(url) {
  let data;
  // The HTML scraper is OFF by default: tested against a real public post it
  // returned a *different* creator's video (Instagram's JS shell embeds
  // unrelated media), i.e. fast but wrong. Opt in with IG_HTML_SCRAPER=1 only
  // if you have verified it for your traffic.
  if (process.env.IG_HTML_SCRAPER === '1') {
    try {
      data = await scrapeInstagramReel(url.replace('www.instagram.com', 'm.instagram.com'));
    } catch (scrapeErr) {
      console.log(`[instagram] HTML scrape failed (${scrapeErr.message}) → yt-dlp`);
    }
  }
  if (!data) {
    const raw = await ytdlp.json(
      [url, '--dump-json', '--playlist-items', '1', '--skip-download'],
      'instagram',
      { timeoutMs: 45_000 },
    );
    data = pickInstagramFromYtdlp(JSON.parse(raw.split('\n')[0]));
  }
  return {
    platform: 'instagram',
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration ?? null,
    uploader: data.uploader ?? null,
    qualities: [],
    caption: data.caption,
    hashtags: data.hashtags,
    // internal (stripped before reaching the browser)
    videoUrl: data.videoUrl,
    audioUrl: data.audioUrl,
  };
}

async function fetchGeneric(url, platform) {
  const raw = await ytdlp.json(
    [url, '--dump-single-json', '--no-playlist', '--skip-download'],
    platform,
    { timeoutMs: 60_000 },
  );
  const meta = JSON.parse(raw);
  const yt = platform === 'youtube' ? parseYouTube(url) : null;
  return {
    platform,
    title: meta.title || 'Untitled',
    thumbnail: meta.thumbnail || null,
    duration: meta.duration || null,
    uploader: meta.uploader || meta.channel || null,
    qualities: platform === 'youtube' ? buildQualities(meta.formats) : [],
    videoId: yt?.id ?? null,
    isShort: Boolean(yt?.isShort) || (platform === 'youtube' && meta.duration > 0 && meta.duration <= 60),
    rawInfo: JSON.stringify(slimInfo(meta)),
  };
}

async function getInfo(url, platform, { force = false } = {}) {
  if (!force) {
    const hit = infoCache.get(url);
    if (hit) return hit;
  }
  const data = await coalesce(`${platform}:${url}`, () =>
    platform === 'instagram' ? fetchInstagram(url) : fetchGeneric(url, platform),
  );
  infoCache.set(url, data);
  return data;
}

const publicInfo = ({ rawInfo, videoUrl, audioUrl, ...rest }) => rest;

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'online', service: 'DownloadShorts API' }));

app.get('/api/health', async (req, res) => {
  try {
    const version = await ytdlp.json(['--version'], null, { timeoutMs: 10_000 });
    res.json({ ok: true, ytdlp: version, platform: process.platform, activeJobs: jobs.active });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.get('/api/info', infoLimiter, async (req, res) => {
  const target = requireSupportedUrl(req, res);
  if (!target) return;
  try {
    const info = await getInfo(target.url, target.platform, { force: req.query.force === 'true' });
    res.setHeader('Cache-Control', 'no-store');
    res.json(publicInfo(info));
  } catch (err) {
    console.error('[/api/info]', err.message);
    sendError(res, err);
  }
});

/** Stream a finished temp file to the client, then delete it. */
function sendTempFile(res, { file, size, cleanup }, filename, contentType) {
  setDownloadHeaders(res, filename, contentType);
  res.setHeader('Content-Length', size);
  const stream = createReadStream(file);
  res.on('close', () => { stream.destroy(); cleanup(); });
  stream.on('error', () => res.destroy());
  stream.pipe(res);
}

/** Run a yt-dlp job (CPU/bandwidth heavy) behind the concurrency cap. */
async function runFileJob(req, res, { url, args, platform, cachedInfo, filename, contentType }) {
  const release = jobs.tryAcquire();
  if (!release) {
    res.setHeader('Retry-After', '10');
    return res.status(503).json({ error: 'Our servers are busy right now. Please try again in a few seconds.' });
  }
  const ac = abortOnDisconnect(res);
  try {
    let result;
    try {
      result = cachedInfo
        ? await ytdlp.toFile(['--load-info-json', '-', ...args], platform, { signal: ac.signal, stdin: cachedInfo })
        : null;
    } catch (e) {
      if (ac.signal.aborted) return;
      console.warn('[job] cached-info run failed, retrying from URL:', e.message.slice(0, 200));
    }
    result ??= await ytdlp.toFile([url, ...args], platform, { signal: ac.signal });
    release();
    if (ac.signal.aborted) return result.cleanup();
    sendTempFile(res, result, filename, contentType);
  } catch (err) {
    if (ac.signal.aborted) return;
    console.error('[job]', err.message.slice(0, 300));
    sendError(res, err);
  } finally {
    release(); // idempotent
  }
}

// Instagram: proxy-stream the CDN file (no CPU, supports resume via Range)
async function proxyStream(req, res, upstreamUrl, filename) {
  const ac = abortOnDisconnect(res);
  const headers = { 'User-Agent': BROWSER_UA, Referer: 'https://www.instagram.com/' };
  if (req.headers.range) headers.Range = req.headers.range;

  const upstream = await fetch(upstreamUrl, { headers, signal: ac.signal });
  if (!upstream.ok && upstream.status !== 206) {
    return res.status(502).json({ error: 'Failed to fetch video from Instagram. Please try again.' });
  }
  res.status(upstream.status);
  setDownloadHeaders(res, filename, upstream.headers.get('content-type') || 'video/mp4');
  for (const h of ['content-length', 'content-range', 'accept-ranges']) {
    const v = upstream.headers.get(h);
    if (v) res.setHeader(h, v);
  }
  const body = Readable.fromWeb(upstream.body);
  body.on('error', () => res.destroy());
  body.pipe(res);
}

app.get('/api/download', heavyLimiter, async (req, res) => {
  const target = requireSupportedUrl(req, res);
  if (!target) return;
  const { url, platform } = target;

  try {
    const info = await getInfo(url, platform);
    const filename = safeFilename(req.query.title || info.title, 'mp4');

    if (platform === 'instagram') {
      if (info.videoUrl) return await proxyStream(req, res, info.videoUrl, filename);
      // No progressive file (DASH only) → merge with yt-dlp
      return await runFileJob(req, res, {
        url, args: ['-f', 'bv*+ba/b', '--merge-output-format', 'mp4', '--playlist-items', '1'],
        platform, filename, contentType: 'video/mp4',
      });
    }

    const format = platform === 'youtube'
      ? videoFormat(req.query.height)
      : 'b[format_id*=no_watermark]/b[ext=mp4]/b';

    await runFileJob(req, res, {
      url,
      args: ['-f', format, '--merge-output-format', 'mp4', '--no-playlist'],
      platform,
      cachedInfo: info.rawInfo,
      filename,
      contentType: 'video/mp4',
    });
  } catch (err) {
    console.error('[/api/download]', err.message.slice(0, 300));
    sendError(res, err);
  }
});

// ──────────────────────────────────────────────
// GET /api/clip?url=…&start=30&end=90&height=720
// Cuts a section out of a YouTube video (works for Shorts and long videos).
// ──────────────────────────────────────────────
app.get('/api/clip', heavyLimiter, async (req, res) => {
  const target = requireSupportedUrl(req, res);
  if (!target) return;
  if (target.platform !== 'youtube') {
    return res.status(400).json({ error: 'Clipping is only available for YouTube videos.' });
  }

  try {
    const info = await getInfo(target.url, 'youtube');
    const range = validateClipRange(req.query.start, req.query.end, {
      duration: info.duration, maxSeconds: CLIP_MAX_SECONDS,
    });
    if (range.error) return res.status(400).json({ error: range.error });

    const length = range.end - range.start;
    const args = [
      '-f', videoFormat(req.query.height),
      '--merge-output-format', 'mp4',
      '--no-playlist',
      '--download-sections', `*${range.start}-${range.end}`,
      // Frame-accurate cuts for short clips; long clips snap to keyframes (much faster)
      ...(length <= 180 ? ['--force-keyframes-at-cuts'] : []),
    ];
    const base = safeFilename(req.query.title || info.title, 'mp4').replace(/\.mp4$/, '');
    await runFileJob(req, res, {
      url: target.url, args, platform: 'youtube', cachedInfo: info.rawInfo,
      filename: `${base}-clip-${Math.round(range.start)}s-${Math.round(range.end)}s.mp4`,
      contentType: 'video/mp4',
    });
  } catch (err) {
    console.error('[/api/clip]', err.message.slice(0, 300));
    sendError(res, err);
  }
});

// ──────────────────────────────────────────────
// GET /api/audio?url=…   → MP3
// ──────────────────────────────────────────────
const CDN_HOST_RE = /(^|\.)(cdninstagram\.com|fbcdn\.net)$/;

app.get('/api/audio', heavyLimiter, async (req, res) => {
  const target = requireSupportedUrl(req, res);
  if (!target) return;
  const { url, platform } = target;

  try {
    const info = await getInfo(url, platform);
    const filename = safeFilename(req.query.title || info.title, 'mp3', 'audio');

    // Instagram with a direct CDN file: stream through ffmpeg, no temp file.
    let cdn = null;
    try { cdn = info.videoUrl ? new URL(info.videoUrl) : null; } catch { /* ignore */ }
    if (platform === 'instagram' && cdn && cdn.protocol === 'https:' && CDN_HOST_RE.test(cdn.hostname)) {
      const release = jobs.tryAcquire();
      if (!release) return res.status(503).json({ error: 'Our servers are busy right now. Please try again in a few seconds.' });
      setDownloadHeaders(res, filename, 'audio/mpeg');
      const ff = spawn(FFMPEG_BIN, [
        '-hide_banner', '-loglevel', 'error', '-i', cdn.href,
        '-vn', '-c:a', 'libmp3lame', '-q:a', '2', '-f', 'mp3', 'pipe:1',
      ], { windowsHide: true });
      ff.stdout.pipe(res);
      ff.stderr.on('data', (d) => console.error('[ffmpeg]', String(d).trim()));
      ff.on('error', () => res.destroy());
      ff.on('close', () => { release(); if (!res.writableEnded) res.end(); });
      res.on('close', () => ff.kill('SIGKILL'));
      return;
    }

    await runFileJob(req, res, {
      url,
      args: ['-f', AUDIO_FORMAT, '-x', '--audio-format', 'mp3', '--audio-quality', '2', '--no-playlist'],
      platform,
      cachedInfo: platform === 'instagram' ? null : info.rawInfo,
      filename, contentType: 'audio/mpeg',
    });
  } catch (err) {
    console.error('[/api/audio]', err.message.slice(0, 300));
    sendError(res, err);
  }
});

// ──────────────────────────────────────────────
// GET /api/thumbnail?videoUrl=<page url>
// Instagram CDN tokens are session-locked and expire fast, so we proxy.
// ──────────────────────────────────────────────
app.get('/api/thumbnail', infoLimiter, async (req, res) => {
  const raw = String(req.query.videoUrl || '').trim();
  const platform = detectPlatform(raw);
  if (!platform) return res.status(400).end();

  try {
    const url = normalizeUrl(raw);
    const info = await getInfo(url, platform);
    const thumb = info.thumbnail;
    if (!thumb || !/^https:\/\//.test(thumb)) return res.status(404).end();

    const img = await fetch(thumb, {
      headers: { 'User-Agent': BROWSER_UA, Referer: 'https://www.instagram.com/' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!img.ok) return res.status(502).end();
    res.setHeader('Content-Type', img.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.end(Buffer.from(await img.arrayBuffer()));
  } catch (err) {
    console.error('[thumbnail]', err.message);
    res.status(502).end();
  }
});

app.listen(PORT, () => {
  console.log(`DownloadShorts API → http://localhost:${PORT}`);
});
