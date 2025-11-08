interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  keys(): string[];
}

// LocalStorage adapter
class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage full or unavailable:', e);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silent fail
    }
  }

  clear(): void {
    try {
      // Only clear our cache keys, not everything
      const keys = this.keys();
      keys.forEach(key => this.removeItem(key));
    } catch {
      // Silent fail
    }
  }

  keys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('lighterdash-cache:')) {
          keys.push(key);
        }
      }
      return keys;
    } catch {
      return [];
    }
  }
}

// In-memory fallback adapter
class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  keys(): string[] {
    return Array.from(this.storage.keys());
  }
}

class CacheManager {
  private storage: StorageAdapter;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default
  private staleWhileRevalidate = true;
  private prefix = 'lighterdash-cache:';

  constructor() {
    // Try to use localStorage, fallback to memory
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      this.storage = new LocalStorageAdapter();
      console.log('Using localStorage for persistent caching');
    } catch {
      this.storage = new MemoryStorageAdapter();
      console.log('Using in-memory cache (localStorage unavailable)');
    }

    // Clean up expired entries on init
    this.cleanupExpired();
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
    };

    try {
      this.storage.setItem(this.getKey(key), JSON.stringify(entry));
    } catch (e) {
      console.error('Failed to cache data:', e);
    }
  }

  get<T>(key: string, staleOk = false): T | null {
    try {
      const stored = this.storage.getItem(this.getKey(key));
      if (!stored) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(stored);
      const now = Date.now();

      // Check if expired
      if (now > entry.expiresAt) {
        if (staleOk && this.staleWhileRevalidate) {
          // Return stale data but mark for revalidation
          console.log(`Cache STALE (returning anyway): ${key}`);
          return entry.data;
        }
        this.storage.removeItem(this.getKey(key));
        return null;
      }

      return entry.data;
    } catch (e) {
      console.error('Failed to retrieve cache:', e);
      return null;
    }
  }

  has(key: string): boolean {
    try {
      const stored = this.storage.getItem(this.getKey(key));
      if (!stored) {
        return false;
      }

      const entry: CacheEntry<any> = JSON.parse(stored);
      if (Date.now() > entry.expiresAt) {
        this.storage.removeItem(this.getKey(key));
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  invalidate(key: string): void {
    this.storage.removeItem(this.getKey(key));
  }

  invalidatePattern(pattern: RegExp): void {
    const keys = this.storage.keys();
    keys
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.slice(this.prefix.length))
      .filter(key => pattern.test(key))
      .forEach(key => this.invalidate(key));
  }

  clear(): void {
    this.storage.clear();
  }

  private cleanupExpired(): void {
    const keys = this.storage.keys();
    const now = Date.now();

    keys.forEach(key => {
      if (!key.startsWith(this.prefix)) return;
      
      try {
        const stored = this.storage.getItem(key);
        if (!stored) return;

        const entry: CacheEntry<any> = JSON.parse(stored);
        if (now > entry.expiresAt) {
          this.storage.removeItem(key);
        }
      } catch {
        // Remove corrupted entries
        this.storage.removeItem(key);
      }
    });
  }

  getStats() {
    const keys = this.storage.keys();
    const entries = keys
      .filter(key => key.startsWith(this.prefix))
      .map(key => {
        try {
          const stored = this.storage.getItem(key);
          if (!stored) return null;

          const entry: CacheEntry<any> = JSON.parse(stored);
          return {
            key: key.slice(this.prefix.length),
            age: Date.now() - entry.timestamp,
            ttl: entry.expiresAt - Date.now(),
            size: stored.length,
          };
        } catch {
          return null;
        }
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    return {
      size: entries.length,
      totalBytes: entries.reduce((sum, e) => sum + e.size, 0),
      entries,
    };
  }
}

export const cacheManager = new CacheManager();

// Stale-while-revalidate cached fetch
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    staleWhileRevalidate?: boolean;
  }
): Promise<T> {
  const { ttl, staleWhileRevalidate = true } = options || {};

  // Check cache first
  const cached = cacheManager.get<T>(key, staleWhileRevalidate);
  
  if (cached !== null) {
    const isStale = !cacheManager.has(key);
    
    if (isStale && staleWhileRevalidate) {
      // Return stale data immediately, revalidate in background
      console.log(`Cache STALE-REVALIDATE: ${key}`);
      fetcher()
        .then(data => cacheManager.set(key, data, ttl))
        .catch(err => console.error('Background revalidation failed:', err));
    } else {
      console.log(`Cache HIT: ${key}`);
    }
    
    return cached;
  }

  console.log(`Cache MISS: ${key}`);
  // Fetch and cache
  const data = await fetcher();
  cacheManager.set(key, data, ttl);
  return data;
}
