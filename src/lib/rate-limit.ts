// ========== In-Memory Rate Limiter ==========
// For production with multiple instances, use Redis-based rate limiting.
// This in-memory approach works for single-instance Vercel deployments.

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests per window */
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/** Check rate limit for a given key (e.g., IP address or user ID) */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    store.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    };
  }

  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/** Extract client IP from request headers */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

// Preset rate limit configurations
export const RATE_LIMITS = {
  /** Chat API: 20 messages per minute */
  chat: { windowMs: 60_000, maxRequests: 20 },
  /** Checkout/payment: 5 requests per minute */
  payment: { windowMs: 60_000, maxRequests: 5 },
  /** General API: 60 requests per minute */
  api: { windowMs: 60_000, maxRequests: 60 },
  /** Auth endpoints: 10 requests per minute */
  auth: { windowMs: 60_000, maxRequests: 10 },
  /** Admin endpoints: 30 requests per minute */
  admin: { windowMs: 60_000, maxRequests: 30 },
  /** Cart operations: 30 requests per minute */
  cart: { windowMs: 60_000, maxRequests: 30 },
} as const;
