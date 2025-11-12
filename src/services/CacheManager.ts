/**
 * CacheManager - Two-tier caching with memory and persistent storage
 * 
 * Features:
 * - In-memory cache for fast access
 * - Optional localStorage persistence
 * - TTL-based expiration
 * - Pattern-based invalidation
 * - Memory leak prevention
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  persistent?: boolean; // Save to localStorage
}

export interface CacheStats {
  memorySize: number;
  persistentSize: number;
  hitRate: number;
  missRate: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  private readonly DEFAULT_TTL = 3600000; // 1 hour
  private readonly MAX_MEMORY_ENTRIES = 100; // Prevent memory bloat

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get cached data by key
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryCache = this.cache.get(key);
    if (memoryCache && !this.isExpired(memoryCache)) {
      this.hits++;
      return memoryCache.data as T;
    }

    // Check persistent storage
    try {
      const stored = localStorage.getItem(this.getPersistentKey(key));
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored);
        if (!this.isExpired(parsed)) {
          // Restore to memory cache
          this.cache.set(key, parsed);
          this.hits++;
          return parsed.data;
        } else {
          // Clean up expired entry
          localStorage.removeItem(this.getPersistentKey(key));
        }
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }

    this.misses++;
    return null;
  }

  /**
   * Set cached data with optional TTL and persistence
   */
  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.DEFAULT_TTL,
    };

    // Save to memory
    this.cache.set(key, entry);
    this.enforceMemoryLimit();

    // Save to storage if persistent
    if (options.persistent) {
      try {
        localStorage.setItem(
          this.getPersistentKey(key),
          JSON.stringify(entry)
        );
      } catch (error) {
        console.error('Cache set error:', error);
      }
    }
  }

  /**
   * Invalidate cache entries matching pattern
   */
  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    // Find matching keys in memory
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    // Delete from memory
    keysToDelete.forEach((key) => this.cache.delete(key));

    // Delete from persistent storage
    try {
      const storageKeys = Object.keys(localStorage);
      for (const storageKey of storageKeys) {
        if (storageKey.startsWith('cache:') && regex.test(storageKey)) {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
    
    try {
      const storageKeys = Object.keys(localStorage);
      storageKeys
        .filter((key) => key.startsWith('cache:'))
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const persistentKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith('cache:')
    );

    return {
      memorySize: this.cache.size,
      persistentSize: persistentKeys.length,
      hitRate: total > 0 ? this.hits / total : 0,
      missRate: total > 0 ? this.misses / total : 0,
    };
  }

  /**
   * Remove expired entries from memory and storage
   */
  cleanup(): void {
    // Clean memory cache
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // Clean persistent storage
    try {
      const storageKeys = Object.keys(localStorage);
      for (const storageKey of storageKeys) {
        if (storageKey.startsWith('cache:')) {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const entry = JSON.parse(stored);
            if (this.isExpired(entry)) {
              localStorage.removeItem(storageKey);
            }
          }
        }
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  /**
   * Check if cache entry has expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Get persistent storage key with prefix
   */
  private getPersistentKey(key: string): string {
    return `cache:${key}`;
  }

  /**
   * Enforce maximum memory cache size
   */
  private enforceMemoryLimit(): void {
    if (this.cache.size > this.MAX_MEMORY_ENTRIES) {
      // Remove oldest entries (FIFO)
      const keysToRemove = Array.from(this.cache.keys()).slice(
        0,
        this.cache.size - this.MAX_MEMORY_ENTRIES
      );
      keysToRemove.forEach((key) => this.cache.delete(key));
    }
  }

  /**
   * Load persistent cache into memory on initialization
   */
  private loadFromStorage(): void {
    try {
      const storageKeys = Object.keys(localStorage);
      for (const storageKey of storageKeys) {
        if (storageKey.startsWith('cache:')) {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const entry = JSON.parse(stored);
            if (!this.isExpired(entry)) {
              const cacheKey = storageKey.replace('cache:', '');
              this.cache.set(cacheKey, entry);
            } else {
              localStorage.removeItem(storageKey);
            }
          }
        }
      }
    } catch (error) {
      console.error('Cache load error:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Auto-cleanup every 5 minutes
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000);
