/**
 * Tiny dependency-free limiters.
 *  - rateLimit: fixed window per client IP (keeps scrapers / abuse off a small host)
 *  - Semaphore: caps concurrent CPU-heavy yt-dlp/ffmpeg jobs
 */
export function rateLimit({ windowMs = 60_000, max = 30, message = 'Too many requests. Please slow down.' } = {}) {
  const hits = new Map();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
  }, windowMs);
  timer.unref?.();

  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || now > entry.reset) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    res.setHeader('RateLimit-Remaining', Math.max(0, max - entry.count));
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.reset - now) / 1000));
      return res.status(429).json({ error: message });
    }
    next();
  };
}

export class Semaphore {
  constructor(limit) {
    this.limit = limit;
    this.active = 0;
  }
  /** Returns a release() function, or null when all slots are busy. */
  tryAcquire() {
    if (this.active >= this.limit) return null;
    this.active += 1;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.active -= 1;
    };
  }
}
