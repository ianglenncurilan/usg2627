// Production-grade Egress Protection Cache
// Combines In-Memory Cache + SessionStorage persistence to minimize Supabase API calls & egress bandwidth
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const memoryCache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL default for high-traffic egress protection

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();

  // 1. Check in-memory map cache first
  const memCached = memoryCache.get(key);
  if (memCached && now - memCached.timestamp < ttlMs) {
    return memCached.data;
  }

  // 2. Check browser sessionStorage cache second (persists across page reloads/tab navigation)
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const stored = sessionStorage.getItem(`usg_cache_${key}`);
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored);
        if (parsed && now - parsed.timestamp < ttlMs) {
          memoryCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }

  // 3. Fetch fresh data from Supabase PostgREST
  try {
    const freshData = await fetcher();
    if (freshData !== null && freshData !== undefined) {
      const entry: CacheEntry<T> = { data: freshData, timestamp: now };
      memoryCache.set(key, entry);

      if (typeof window !== "undefined" && window.sessionStorage) {
        try {
          sessionStorage.setItem(`usg_cache_${key}`, JSON.stringify(entry));
        } catch {
          // Ignore storage quota errors
        }
      }
    }
    return freshData;
  } catch (err) {
    // 4. In case of network error/rate limit, fallback gracefully to existing stale cache
    const staleMem = memoryCache.get(key);
    if (staleMem?.data) return staleMem.data;

    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        const stored = sessionStorage.getItem(`usg_cache_${key}`);
        if (stored) {
          const parsed: CacheEntry<T> = JSON.parse(stored);
          if (parsed?.data) return parsed.data;
        }
      } catch {}
    }
    throw err;
  }
}

export function invalidateCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    memoryCache.clear();
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith("usg_cache_")) keysToRemove.push(k);
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      } catch {}
    }
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      memoryCache.delete(key);
    }
  }

  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && (k === `usg_cache_${keyPrefix}` || k.startsWith(`usg_cache_${keyPrefix}`))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {}
  }
}
