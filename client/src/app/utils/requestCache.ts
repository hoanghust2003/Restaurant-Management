/**
 * Simple in-memory cache for API responses
 * This helps reduce redundant API calls and improve performance
 */

interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number; // Expiry time in milliseconds
}

class RequestCache {
  private cache: Map<string, CacheItem> = new Map();
  private DEFAULT_EXPIRY = 30 * 1000; // 30 seconds default cache expiry

  /**
   * Get cached response for a request
   * @param key Cache key (usually request URL)
   * @returns Cached data or null if not found/expired
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item is expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Store response in cache
   * @param key Cache key (usually request URL)
   * @param data Data to cache
   * @param expiry Optional expiry time in ms (default 30s)
   */
  set(key: string, data: any, expiry: number = this.DEFAULT_EXPIRY): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry
    });
  }

  /**
   * Clear specific item from cache
   * @param key Cache key to clear
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache starting with a prefix
   * @param prefix Prefix of keys to clear
   */
  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const requestCache = new RequestCache();
