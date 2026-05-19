/**
 * Simple in-memory rate limiter.
 * Uses a sliding window — stores timestamps of each request per IP.
 * Not shared across serverless function instances, but sufficient for
 * Vercel's single-region deployment to block runaway abuse.
 */

const store = new Map<string, number[]>();

/**
 * Returns true if the request is allowed, false if rate limited.
 * @param key   IP address or other identifier
 * @param limit Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (store.get(key) ?? []).filter(t => t > windowStart);

  if (timestamps.length >= limit) return false;

  timestamps.push(now);
  store.set(key, timestamps);

  // Probabilistic cleanup: avoid unbounded growth
  if (Math.random() < 0.02) {
    for (const [k, times] of store.entries()) {
      if (times.length === 0 || times[times.length - 1] < windowStart) {
        store.delete(k);
      }
    }
  }

  return true;
}

/**
 * Extracts the real client IP from a Next.js request.
 * Takes the leftmost non-private IP from X-Forwarded-For as a best effort.
 * Note: X-Forwarded-For can be spoofed unless the hosting platform strips it.
 * Vercel prepends its own verified IP, so the rightmost entry is most trusted;
 * for simplicity we use the whole header as a fingerprint key.
 */
export function getClientIP(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',').map(s => s.trim()).join(',');
  return 'unknown';
}
