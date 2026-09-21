/**
 * OSTAAD PLATFORM — SLIDING WINDOW RATE LIMITER
 * Protects against Brute-force, DDoS, Credential Stuffing & Request Flooding
 */

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory store for rate limiting by IP and route tier
const ipRequestMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  const cutoff = now - windowMs;

  for (const [key, record] of ipRequestMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
    if (record.timestamps.length === 0) {
      ipRequestMap.delete(key);
    }
  }
}

export interface RateLimitConfig {
  limit: number; // Max requests allowed
  windowMs: number; // Time window in milliseconds (e.g., 60,000 for 1 minute)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Timestamp when window resets
  retryAfterSeconds: number;
}

export const RATE_LIMIT_TIERS: Record<string, RateLimitConfig> = {
  // Sensitive auth and administrative endpoints (brute-force protection)
  auth: {
    limit: 30, // 30 requests per minute
    windowMs: 60 * 1000
  },
  // Form submission / API operations
  api: {
    limit: 45, // 45 requests per minute
    windowMs: 60 * 1000
  },
  // Standard public page browsing
  public: {
    limit: 120, // 120 requests per minute
    windowMs: 60 * 1000
  }
};

/**
 * Checks and increments the rate limit counter for a given client identifier and tier.
 */
export function checkRateLimit(
  identifier: string,
  tier: keyof typeof RATE_LIMIT_TIERS = "public"
): RateLimitResult {
  const config = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.public;
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const key = `${tier}:${identifier}`;

  cleanupExpiredRecords(config.windowMs);

  let record = ipRequestMap.get(key);
  if (!record) {
    record = { timestamps: [] };
    ipRequestMap.set(key, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  const currentCount = record.timestamps.length;
  const oldestTimestamp = record.timestamps[0] || now;
  const resetTime = oldestTimestamp + config.windowMs;
  const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));

  if (currentCount >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime,
      retryAfterSeconds
    };
  }

  // Record this request
  record.timestamps.push(now);

  return {
    success: true,
    limit: config.limit,
    remaining: Math.max(0, config.limit - record.timestamps.length),
    resetTime,
    retryAfterSeconds: 0
  };
}

/**
 * Extracts the real client IP from incoming request headers
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}
