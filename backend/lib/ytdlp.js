/**
 * yt-dlp process runner.
 *
 *  - json():   run yt-dlp, return stdout (metadata, version…)
 *  - toFile(): download/merge/cut into a private temp dir and return the file.
 *              Merging two streams (video+audio) or cutting a section needs a
 *              seekable output, so piping to stdout is not an option.
 */
import { spawn } from 'child_process';
import { mkdtemp, readdir, rm, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const TMP_PREFIX = 'ds-job-';

const BASE_ARGS = [
  '--no-config',
  '--no-cache-dir',
  '--no-warnings',
  '--quiet',
  '--socket-timeout', '15',
  '--extractor-retries', '2',
  '--retries', '3',
  '--fragment-retries', '3',
  '--concurrent-fragments', '4',
];

export function createYtDlp({ bin, ffmpegBin, cookieArgsFor }) {
  const buildArgs = (args, platform) => [
    ...BASE_ARGS,
    // yt-dlp needs a real path here; a bare name makes it think ffmpeg is missing
    // (so it silently skips merging). With a bare name we rely on PATH instead.
    ...(ffmpegBin && /[\\/]/.test(ffmpegBin) ? ['--ffmpeg-location', ffmpegBin] : []),
    ...(cookieArgsFor ? cookieArgsFor(platform) : []),
    ...args,
  ];

  function run(args, platform, { signal, timeoutMs = 90_000, stdin } = {}) {
    return new Promise((resolve, reject) => {
      const proc = spawn(bin, buildArgs(args, platform), { windowsHide: true });
      let out = '';
      let err = '';
      let settled = false;

      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        fn(value);
      };
      const onAbort = () => {
        proc.kill('SIGKILL');
        finish(reject, new Error('Cancelled'));
      };
      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        finish(reject, new Error('Timed out while processing the video.'));
      }, timeoutMs);

      if (signal) {
        if (signal.aborted) return onAbort();
        signal.addEventListener('abort', onAbort, { once: true });
      }

      proc.stdout.on('data', (d) => (out += d));
      proc.stderr.on('data', (d) => (err += d));
      proc.on('error', (e) =>
        finish(reject, new Error(e.code === 'ENOENT' ? `yt-dlp binary not found at: ${bin}` : e.message))
      );
      proc.on('close', (code) =>
        code === 0 ? finish(resolve, out.trim()) : finish(reject, new Error(err.trim() || `yt-dlp exit ${code}`))
      );

      if (stdin != null) {
        proc.stdin.on('error', () => {});
        proc.stdin.end(stdin);
      }
    });
  }

  /**
   * Download into a temp dir. Returns { file, size, cleanup }. Callers MUST call
   * cleanup() (typically on response close) – it is also called on failure.
   */
  async function toFile(args, platform, opts = {}) {
    const dir = await mkdtemp(join(tmpdir(), TMP_PREFIX));
    const cleanup = () => rm(dir, { recursive: true, force: true }).catch(() => {});
    try {
      await run([...args, '-o', join(dir, 'out.%(ext)s')], platform, { timeoutMs: 8 * 60_000, ...opts });
      // Final output is exactly out.<ext>. Per-format leftovers (out.f134.mp4) mean a merge
      // failed - never hand those to a user (they would be video-only or audio-only).
      const files = (await readdir(dir)).filter((f) => /^out\.[a-z0-9]+$/i.test(f));
      if (!files.length) throw new Error('Could not produce the final file (merge failed). Is ffmpeg installed?');
      const file = join(dir, files[0]);
      const { size } = await stat(file);
      return { file, size, cleanup };
    } catch (e) {
      await cleanup();
      throw e;
    }
  }

  return { json: run, toFile, bin };
}

/** Remove job dirs left behind by crashes/restarts (older than maxAgeMs). */
export async function sweepTempDirs(maxAgeMs = 60 * 60 * 1000) {
  try {
    const base = tmpdir();
    for (const name of await readdir(base)) {
      if (!name.startsWith(TMP_PREFIX)) continue;
      const p = join(base, name);
      const { mtimeMs } = await stat(p);
      if (Date.now() - mtimeMs > maxAgeMs) await rm(p, { recursive: true, force: true });
    }
  } catch {
    /* best effort */
  }
}

export function resolveBinary(name, envVar, windowsCandidates = []) {
  if (process.env[envVar]) return process.env[envVar];
  if (process.platform === 'win32') {
    for (const c of windowsCandidates) if (c && existsSync(c)) return c;
  }
  return name; // rely on PATH (Docker puts yt-dlp in /usr/local/bin, ffmpeg in /usr/bin)
}
