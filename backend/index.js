/**
 * DownloadShorts API Server
 * Wraps yt-dlp via child_process — no wrapper package required.
 * Requires yt-dlp + ffmpeg on PATH.
 */
import express from 'express';
import cors    from 'cors';
import { spawn } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { friendlyError, cookieArgs, COOKIE_FILES } from './lib/helpers.js';
import { scrapeInstagramReel } from './lib/instagramScraper.js';
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import os from "os";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const __dirname = dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3001;

// ──────────────────────────────────────────────
// Write per-platform cookie files from env vars
// On Render set: YOUTUBE_COOKIES_B64, INSTAGRAM_COOKIES_B64, TIKTOK_COOKIES_B64
// ──────────────────────────────────────────────
const COOKIES_DIR = __dirname;

const COOKIE_ENV_MAP = {
  YOUTUBE_COOKIES_B64:   COOKIE_FILES.youtube,
  INSTAGRAM_COOKIES_B64: COOKIE_FILES.instagram,
  TIKTOK_COOKIES_B64:    COOKIE_FILES.tiktok,
};



for (const [envKey, filename] of Object.entries(COOKIE_ENV_MAP)) {
  if (process.env[envKey]) {
    try {
      const decoded = Buffer.from(process.env[envKey], 'base64').toString('utf-8');
      writeFileSync(join(COOKIES_DIR, filename), decoded, 'utf-8');
      console.log(`${filename} written from ${envKey}`);
    } catch (e) {
      console.error(`Failed to write ${filename}:`, e.message);
    }
  }
}

// Resolve yt-dlp binary
// On Linux/Docker (Render, Railway, etc.) it's on PATH at /usr/local/bin/yt-dlp
// On Windows dev machine, winget installs to a non-PATH location — find it manually
function resolveBin(name) {
  // On Linux, binaries are on PATH — use directly
  if (process.platform !== 'win32') return name;

  const wingetBase = `${process.env.LOCALAPPDATA}\\Microsoft\\WinGet\\Packages`;
  const candidates = {
    'yt-dlp': [
      `${wingetBase}\\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe\\yt-dlp.exe`,
    ],
    'ffmpeg': [
      `${wingetBase}\\yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-N-124716-g054dffd133-win64-gpl\\bin\\ffmpeg.exe`,
      `${wingetBase}\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe`,
    ],
  };

  for (const c of candidates[name] ?? []) {
    if (existsSync(c)) {
      console.log(`Resolved ${name} → ${c}`);
      return c;
    }
  }
  console.log(`${name} not found in winget paths, falling back to PATH`);
  return name;
}

// const YTDLP_BIN  = resolveBin('yt-dlp');
// const FFMPEG_BIN = resolveBin('ffmpeg');
const YTDLP_BIN =
  process.platform === "win32"
    ? resolveBin("yt-dlp")
    : "/usr/local/bin/yt-dlp";

const FFMPEG_BIN =
  process.platform === "win32"
    ? resolveBin("ffmpeg")
    : "/usr/bin/ffmpeg";
console.log(`yt-dlp  → ${YTDLP_BIN}`);
console.log(`ffmpeg  → ${FFMPEG_BIN}`);

app.use(cors({
  origin: (origin, cb) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:4173',
    ];
    // Allow any Vercel deployment URL + any custom domain
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      cb(null, true);
    } else {
      cb(null, true); // open for now — restrict to your domain in production
    }
  }
}));
app.use(express.json());

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function detectPlatform(url) {
  try {
    const h = new URL(url).hostname.replace('www.', '');
    if (h.includes('youtube.com') || h.includes('youtu.be')) return 'youtube';
    if (h.includes('tiktok.com'))    return 'tiktok';
    if (h.includes('instagram.com')) return 'instagram';
    return null;
  } catch { return null; }
}

/** Run yt-dlp and collect stdout as a string. Rejects on non-zero exit. */
function ytDlpJson(args, platform) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP_BIN, [...args, ...cookieArgs(platform, COOKIES_DIR), '--ffmpeg-location', FFMPEG_BIN], { windowsHide: true });
    let out = '', err = '';
    proc.stdout.on('data', d => (out += d));
    proc.stderr.on('data', d => (err += d));
    proc.on('close', code => code === 0 ? resolve(out.trim()) : reject(new Error(err.trim() || `yt-dlp exit ${code}`)));
    proc.on('error', e => reject(new Error(
      e.code === 'ENOENT'
        ? `yt-dlp binary not found at: ${YTDLP_BIN}`
        : e.message
    )));
  });
}

/** Spawn yt-dlp and pipe stdout to res. Returns the child process. */
function ytDlpStream(args, res, platform) {
  const proc = spawn(YTDLP_BIN, [...args, ...cookieArgs(platform, COOKIES_DIR), '--ffmpeg-location', FFMPEG_BIN], { windowsHide: true });
  proc.stdout.pipe(res);
  proc.stderr.on('data', d => process.stderr.write(d));
  proc.on('error', e => {
    console.error('[stream error]', e.message);
    if (!res.headersSent) res.status(500).json({ error: 'Download failed.' });
    else if (!res.writableEnded) res.end();
  });
  return proc;
}


app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "DownloadShorts API"
  });
});

// ──────────────────────────────────────────────
// GET /api/health — verify yt-dlp is reachable
// ──────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const version = await ytDlpJson(['--version']);
    res.json({ ok: true, ytdlp: version.trim(), platform: process.platform });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});


app.get('/api/debug', async (req, res) => {
  try {
    const version = await ytDlpJson(['--version']);

    res.json({
      success: true,
      platform: process.platform,
      nodeVersion: process.version,
      ytdlpVersion: version,
      ytdlpPath: YTDLP_BIN,
      ffmpegPath: FFMPEG_BIN,
      path: process.env.PATH,
      cookiesPresent: existsSync(COOKIES_PATH),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      ytdlpPath: YTDLP_BIN,
      ffmpegPath: FFMPEG_BIN,
      path: process.env.PATH,
    });
  }
});


app.get('/api/test-youtube', async (req, res) => {
  try {
    const result = await ytDlpJson([
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      '--dump-json',
      '--no-playlist',
      '--no-warnings'
    ]);

    const meta = JSON.parse(result);

    res.json({
      success: true,
      title: meta.title,
      uploader: meta.uploader,
      duration: meta.duration,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get('/api/formats', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      error: 'url query parameter required'
    });
  }

  try {
    const result = await ytDlpJson([
      url,
      '--list-formats',
      '--no-playlist'
    ]);

    res.type('text/plain').send(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ──────────────────────────────────────────────
// GET /api/info?url=…
// ──────────────────────────────────────────────
app.get('/api/info', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required.' });

  const platform = detectPlatform(url);
  if (!platform) return res.status(400).json({
    error: 'Unsupported platform. Paste a YouTube, TikTok, or Instagram Reels URL.',
  });

  try {
    // Instagram: scrape page directly — no yt-dlp, no cookies needed for public reels
if (platform === 'instagram') {
  const { videoUrl, audioUrl, title, thumbnail, caption, hashtags } =
    await scrapeInstagramReel(url);
  return res.json({
    platform, title, thumbnail,
    duration: null, uploader: null, qualities: [],
    videoUrl, audioUrl, caption, hashtags,
  });
}

    const raw  = await ytDlpJson([ url, '--dump-json', '--no-playlist', '--no-warnings' ], platform);
    const meta = JSON.parse(raw);

    // Build quality list for YouTube only
    let qualities = [];
    if (platform === 'youtube' && Array.isArray(meta.formats)) {
      const seen = new Set();
      qualities = meta.formats
        .filter(f => f.vcodec && f.vcodec !== 'none' && f.height >= 360)
        .sort((a, b) => b.height - a.height)
        .reduce((acc, f) => {
          const label = `${f.height}p`;
          if (!seen.has(label)) {
            seen.add(label);
            acc.push({
              formatId: f.format_id,
              label,
              height:   f.height,
              fps:      f.fps   || null,
              ext:      f.ext   || 'mp4',
              filesize: f.filesize || f.filesize_approx || null,
            });
          }
          return acc;
        }, [])
        .slice(0, 8);
    }

    res.json({
      platform,
      title:     meta.title     || 'Untitled',
      thumbnail: meta.thumbnail || null,
      duration:  meta.duration  || null,
      uploader:  meta.uploader  || meta.channel || null,
      qualities,
    });
  } catch (err) {
    console.error('[/api/info]', err.message);
    const { status, error } = friendlyError(err.message);
    // In development expose the raw error for debugging
    const body = { error };
    if (process.env.NODE_ENV !== 'production') body.detail = err.message;
    res.status(status).json(body);
  }
});


app.get("/api/audio", async (req, res) => {
  const { videoUrl } = req.query;

  if (!videoUrl) {
    return res.status(400).json({
      error: "videoUrl is required"
    });
  }

  const output = join(os.tmpdir(), `${Date.now()}.mp3`);

  ffmpeg(videoUrl)
    .noVideo()
    .audioCodec("libmp3lame")
    .format("mp3")
    .save(output)
    .on("end", () => {
      res.download(output, "audio.mp3", () => {
        fs.unlinkSync(output);
      });
    })
    .on("error", (err) => {
      console.error(err);
      res.status(500).json({
        error: "Audio extraction failed"
      });
    });
});

// ──────────────────────────────────────────────
// GET /api/download?url=…&platform=…&formatId=…
// Streams video directly to the browser
// ──────────────────────────────────────────────
app.get('/api/download', async (req, res) => {
  const { url, platform, formatId } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required.' });

  // Instagram: scrape CDN URL and proxy-stream it
  if (platform === 'instagram') {
    try {
      const { videoUrl } = await scrapeInstagramReel(url);
      const upstream = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/',
        },
      });
      if (!upstream.ok) return res.status(502).json({ error: 'Failed to fetch video from Instagram CDN.' });
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename="reel.mp4"');
      const ct = upstream.headers.get('content-length');
      if (ct) res.setHeader('Content-Length', ct);
      upstream.body.pipeTo(new WritableStream({ write(chunk) { res.write(chunk); }, close() { res.end(); } }));
    } catch (err) {
      console.error('[/api/download instagram]', err.message);
      res.status(503).json({ error: err.message });
    }
    return;
  }

  // Format selector:
  // YouTube → merge chosen video stream with best audio
  // TikTok / Instagram → best single-file mp4 (no watermark for TikTok via format selector)
  let format;
  if (platform === 'youtube' && formatId) {
    // format = `${formatId}+bestaudio[ext=m4a]/${formatId}+bestaudio/best`;
    format = `bestvideo[height<=${req.query.height || 720}]+bestaudio/best`;
  } else if (platform === 'tiktok') {
    // prefer non-watermarked format (format id often contains 'nowatermark' or is play_addr)
    format = 'best[format_id*=no_watermark]/best[ext=mp4]/best';
  } else {
    format = 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best';
  }

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');

  const proc = ytDlpStream(
    [ url, '-f', format, '--merge-output-format', 'mp4', '--no-playlist', '-o', '-' ],
    res,
    platform
  );

  proc.on('close', (code) => {
    if (code !== 0 && !res.writableEnded) res.end();
  });

  // Kill yt-dlp if client disconnects mid-stream
  req.on('close', () => proc.kill('SIGTERM'));
});

// ──────────────────────────────────────────────
// GET /api/thumbnail?videoUrl=…
// Re-fetches a fresh thumbnail URL via yt-dlp and streams it to the browser.
// Needed for Instagram whose CDN tokens are session-locked and expire fast.
// ──────────────────────────────────────────────
app.get('/api/thumbnail', async (req, res) => {
  const { videoUrl } = req.query;
  if (!videoUrl) return res.status(400).end();

  try {
    // Ask yt-dlp for just the thumbnail URL (fast — no format resolution)
    const raw  = await ytDlpJson([ videoUrl, '--dump-json', '--no-playlist', '--no-warnings', '--skip-download' ], detectPlatform(videoUrl));
    const meta = JSON.parse(raw);
    const thumbUrl = meta.thumbnail;
    if (!thumbUrl) return res.status(404).end();

    // Fetch the fresh URL server-side and stream it back
    const imgRes = await fetch(thumbUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer':    'https://www.instagram.com/',
      },
    });

    if (!imgRes.ok) return res.status(imgRes.status).end();

    res.setHeader('Content-Type', imgRes.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'no-cache');
    const buf = await imgRes.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    console.error('[thumbnail]', err.message);
    res.status(502).end();
  }
});

// ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`DownloadShorts API → http://localhost:${PORT}`);
  console.log('Requires yt-dlp + ffmpeg on PATH.');
});
