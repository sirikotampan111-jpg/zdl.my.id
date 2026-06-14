/**
 * In-memory rate limiter and body size validation utilities.
 *
 * - IP-based sliding window rate limiting
 * - Memory-bounded (auto-evicts oldest entries when cap exceeded)
 * - Body size validation (1MB max by default)
 */

import { NextResponse } from "next/server";

export const MAX_BODY_SIZE = 1024 * 1024; // 1MB

// ─── Rate Limiter ──────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_ENTRIES = 10_000; // memory bound

function evictOldest() {
  // Remove 20% of oldest entries when capacity is reached
  const toDelete = Math.ceil(MAX_ENTRIES * 0.2);
  const keys = Array.from(rateLimitMap.keys());
  for (let i = 0; i < toDelete && i < keys.length; i++) {
    rateLimitMap.delete(keys[i]);
  }
}

export interface RateLimitOptions {
  windowMs?: number;   // time window in milliseconds (default: 60_000 = 1 min)
  maxRequests?: number; // max requests per window (default: 30)
}

const DEFAULT_OPTIONS: Required<RateLimitOptions> = {
  windowMs: 60_000,
  maxRequests: 30,
};

/**
 * Check if a given key (usually IP) has exceeded the rate limit.
 * Returns `{ allowed: true }` or `{ allowed: false, retryAfterMs }`.
 */
export function checkRateLimit(
  key: string,
  opts?: RateLimitOptions
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const { windowMs, maxRequests } = { ...DEFAULT_OPTIONS, ...opts };
  const now = Date.now();

  if (rateLimitMap.size >= MAX_ENTRIES) {
    evictOldest();
  }

  const entry = rateLimitMap.get(key);

  if (!entry || now >= entry.resetAt) {
    // New window
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  return { allowed: true };
}

// ─── Body Size Validation ─────────────────────────────────────────────────────

/**
 * Validate the Content-Length of an incoming request.
 * Returns an error response if the body is too large, or null if OK.
 */
export function validateBodySize(req: Request): NextResponse | null {
  const contentLength = req.headers.get("content-length");
  if (contentLength) {
    const length = parseInt(contentLength, 10);
    if (!isNaN(length) && length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Payload terlalu besar (maks 1MB)" },
        { status: 413 }
      );
    }
  }
  return null;
}

/**
 * Safely parse JSON from a request with body size enforcement.
 * Returns `{ data, error }` — if error is set, data is null and vice versa.
 */
export async function safeParseJson<T = unknown>(req: Request): Promise<
  | { data: T; error: null }
  | { data: null; error: NextResponse }
> {
  // Check content-length first
  const sizeError = validateBodySize(req);
  if (sizeError) {
    return { data: null, error: sizeError };
  }

  try {
    const text = await req.text();

    // Double-check actual body size
    if (text.length > MAX_BODY_SIZE) {
      return {
        data: null,
        error: NextResponse.json(
          { error: "Payload terlalu besar (maks 1MB)" },
          { status: 413 }
        ),
      };
    }

    const data = JSON.parse(text) as T;
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: NextResponse.json(
        { error: "Format JSON tidak valid" },
        { status: 400 }
      ),
    };
  }
}

// ─── Audit Logger ──────────────────────────────────────────────────────────────

export type AuditAction =
  | "ORDER_CREATE"
  | "PAYMENT_INIT"
  | "PAYMENT_WEBHOOK"
  | "ADMIN_ORDER_UPDATE"
  | "ADMIN_USER_UPDATE"
  | "ADMIN_PROJECT_UPDATE"
  | "ADMIN_SETUP"
  | "RATE_LIMIT_EXCEEDED"
  | "PRICE_VALIDATION_FAILED"
  | "SIGNATURE_INVALID";

export function auditLog(action: AuditAction, details: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  console.log(`[AUDIT] ${timestamp} ${action}`, JSON.stringify(details));
}
