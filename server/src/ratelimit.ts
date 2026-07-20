// In-memory per-IP limiter. Correct for a single instance (apphosting.yaml pins
// maxInstances low); swap the Map for Firestore/Redis if you ever scale out.

export interface RateLimiterOptions {
  /** Answer-turns allowed per IP per window. */
  turnBudget: number;
  /** Window length in ms. */
  windowMs: number;
  /** Request cap per IP per rolling minute. */
  requestsPerMinute: number;
  /** Injectable clock (for tests). */
  now?: () => number;
}

interface Bucket {
  turns: number;
  windowStart: number;
  reqTimes: number[];
}

export interface RateLimiter {
  checkRequest(ip: string): { ok: boolean; retryAfterMs?: number };
  turnsRemaining(ip: string): number;
  consumeTurn(ip: string): boolean;
}

export function createRateLimiter(opts: RateLimiterOptions): RateLimiter {
  const now = opts.now ?? (() => Date.now());
  const buckets = new Map<string, Bucket>();

  function bucket(ip: string): Bucket {
    const t = now();
    let b = buckets.get(ip);
    if (!b || t - b.windowStart >= opts.windowMs) {
      b = { turns: 0, windowStart: t, reqTimes: [] };
      buckets.set(ip, b);
    }
    return b;
  }

  return {
    checkRequest(ip) {
      const b = bucket(ip);
      const t = now();
      b.reqTimes = b.reqTimes.filter((x) => t - x < 60_000);
      if (b.reqTimes.length >= opts.requestsPerMinute) {
        return { ok: false, retryAfterMs: 60_000 };
      }
      b.reqTimes.push(t);
      return { ok: true };
    },

    turnsRemaining(ip) {
      return Math.max(0, opts.turnBudget - bucket(ip).turns);
    },

    consumeTurn(ip) {
      const b = bucket(ip);
      if (b.turns >= opts.turnBudget) return false;
      b.turns += 1;
      return true;
    },
  };
}
