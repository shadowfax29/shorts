/**
 * Simple in-memory cache with lazy expiration.
 */
export class SimpleCache {
  constructor(ttlMs = 10 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  /**
   * Get an item from the cache. Returns null if not found or expired.
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set an item in the cache.
   */
  set(key, value, customTtl = this.ttl) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + customTtl,
    });
  }

  /**
   * Delete an item from the cache.
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Manually remove all expired items to free memory.
   */
  clearExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Returns the current size of the cache (including expired items).
   */
  get size() {
    return this.cache.size;
  }
}

export const infoCache = new SimpleCache(10 * 60 * 1000); // 10 minutes default TTL
