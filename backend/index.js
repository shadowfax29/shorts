/**
 * StreamSnap API Server
 * Wraps yt-dlp via child_process — no wrapper package required.
 * Requires yt-dlp + ffmpeg on PATH.
 */
import express from 'express';
import cors    from 'cors';
import { spawn } from 'child_process';
import { existsSync } from 'fs';

const app  = express();
const PORT = 3001;

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

const YTDLP_BIN  = resolveBin('yt-dlp');
const FFMPEG_BIN = resolveBin('ffmpeg');

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
function ytDlpJson(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP_BIN, [...args, '--ffmpeg-location', FFMPEG_BIN], { windowsHide: true });
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
function ytDlpStream(args, res) {
  const proc = spawn(YTDLP_BIN, [...args, '--ffmpeg-location', FFMPEG_BIN], { windowsHide: true });
  proc.stdout.pipe(res);
  proc.stderr.on('data', d => process.stderr.write(d));
  proc.on('error', e => {
    console.error('[stream error]', e.message);
    if (!res.headersSent) res.status(500).json({ error: 'Download failed.' });
    else if (!res.writableEnded) res.end();
  });
  return proc;
}

/** Map yt-dlp error text → user-friendly message */
function friendlyError(msg) {
  if (msg.includes('not installed'))              return { status: 503, error: msg };
  if (msg.includes('Private video') || msg.includes('login required') || msg.includes('This video is private'))
    return { status: 403, error: 'This video is private and cannot be downloaded.' };
  if (msg.includes('not available') || msg.includes('removed') || msg.includes('does not exist') || msg.includes('404'))
    return { status: 404, error: 'Video not found or has been removed.' };
  if (msg.includes('Unsupported URL'))            return { status: 400, error: 'That URL format is not supported.' };
  if (msg.includes('blocked') || msg.includes('unavailable in your country'))
    return { status: 403, error: 'This video is not available in this region.' };
  return { status: 500, error: 'Failed to fetch video info. The video may be unavailable.' };
}

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
    const raw  = await ytDlpJson([ url, '--dump-json', '--no-playlist', '--no-warnings' ]);
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
    res.status(status).json({ error });
  }
});

// ──────────────────────────────────────────────
// GET /api/download?url=…&platform=…&formatId=…
// Streams video directly to the browser
// ──────────────────────────────────────────────
app.get('/api/download', (req, res) => {
  const { url, platform, formatId } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required.' });

  // Format selector:
  // YouTube → merge chosen video stream with best audio
  // TikTok / Instagram → best single-file mp4 (no watermark for TikTok via format selector)
  let format;
  if (platform === 'youtube' && formatId) {
    format = `${formatId}+bestaudio[ext=m4a]/${formatId}+bestaudio/best`;
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
    res
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
    const raw  = await ytDlpJson([ videoUrl, '--dump-json', '--no-playlist', '--no-warnings', '--skip-download' ]);
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
  console.log(`StreamSnap API → http://localhost:${PORT}`);
  console.log('Requires yt-dlp + ffmpeg on PATH.');
});
