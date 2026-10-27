/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * Sufficient for a single-instance deployment (one Vercel function instance
 * keeps its own counter). For strict multi-instance limiting, swap the store
 * for a shared one (e.g. Upstash Redis) — the interface stays the same.
 */

type Bucket = { count: number; resetAt: number };

const stores = new Map<string, Map<string, Bucket>>();

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

export function rateLimit(options: {
  namespace: string;
  key: string;
  limit: number;
  windowSeconds: number;
}): RateLimitResult {
  const { namespace, key, limit, windowSeconds } = options;
  const now = Date.now();

  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }

  // Opportunistic cleanup to bound memory.
  if (store.size > 10_000) {
    for (const [k, v] of store) {
      if (v.resetAt <= now) store.delete(k);
    }
  }

  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, remaining: limit - 1 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  return { ok: true, remaining: limit - bucket.count };
}
