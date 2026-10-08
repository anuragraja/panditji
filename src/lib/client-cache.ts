// Lightweight client-side memory cache with sessionStorage backup for ultra-fast instant page switching

const memoryCache = new Map<string, { data: unknown; expiry: number }>();

export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  // 1. Check memory cache first
  const entry = memoryCache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.data as T;
  }

  // 2. Check sessionStorage fallback
  try {
    const raw = sessionStorage.getItem(`pj_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.expiry > Date.now()) {
        memoryCache.set(key, parsed);
        return parsed.data as T;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export function setCachedData<T>(key: string, data: T, ttlMs: number = 45000): void {
  if (typeof window === "undefined") return;

  const entry = {
    data,
    expiry: Date.now() + ttlMs,
  };

  memoryCache.set(key, entry);

  try {
    sessionStorage.setItem(`pj_cache_${key}`, JSON.stringify(entry));
  } catch {
    // ignore quota errors
  }
}

export function invalidateCache(key?: string): void {
  if (typeof window === "undefined") return;

  if (key) {
    memoryCache.delete(key);
    try {
      sessionStorage.removeItem(`pj_cache_${key}`);
    } catch {
      // ignore
    }
  } else {
    memoryCache.clear();
  }
}
