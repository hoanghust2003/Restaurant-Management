/**
 * Simple in-memory cache for API responses
 * This helps reduce redundant API calls and improve performance
 */

interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number; // Expiry time in milliseconds
  lastAccessed: number; // For LRU tracking
  priority: number; // Higher number = higher priority
}

class RequestCache {
  private cache: Map<string, CacheItem> = new Map();
  private DEFAULT_EXPIRY = 30 * 1000; // 30 seconds default cache expiry
  private MAX_CACHE_SIZE = 100; // Maximum number of items to keep in cache
  private DEFAULT_PRIORITY = 1; // Default priority level
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
    
    // Update last accessed time for LRU tracking
    item.lastAccessed = Date.now();
    
    return item.data;
  }
  
  /**
   * Evicts the least recently used items when cache is full
   * Items with higher priority are less likely to be evicted
   */
  private evictLRU(): void {
    if (this.cache.size === 0) return;
    
    // Find least recently used item, considering priority
    let lruKey: string | null = null;
    let lowestScore = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      // Score is a combination of last access time and priority
      // Higher priority items get a "boost" to keep them in cache longer
      const score = item.lastAccessed + (item.priority * 10000);
      
      if (score < lowestScore) {
        lowestScore = score;
        lruKey = key;
      }
    }
    
    // Remove the LRU item
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
  /**
   * Store response in cache
   * @param key Cache key (usually request URL)
   * @param data Data to cache
   * @param expiry Optional expiry time in ms (default 30s)
   * @param priority Optional priority level (default 1)
   */
  set(key: string, data: any, expiry: number = this.DEFAULT_EXPIRY, priority: number = this.DEFAULT_PRIORITY): void {
    // Enforce cache size limit - remove least recently used items if needed
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLRU();
    }
    
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + expiry,
      lastAccessed: now,
      priority
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
