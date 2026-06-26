type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Returns true if the request should be blocked.
 * @param key      Unique key (e.g. "login:192.168.1.1")
 * @param limit    Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > limit) return true;
  return false;
}
