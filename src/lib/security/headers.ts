/**
 * OSTAAD PLATFORM — SECURITY HEADERS CONFIGURATION
 * Hardened HTTP Headers for XSS, Clickjacking, MIME sniffing, and Transport Security
 */

export const SECURITY_HEADERS = [
  // Prevent clickjacking by forbidding embedding in frames/iframes
  {
    key: "X-Frame-Options",
    value: "DENY"
  },
  // Prevent browsers from MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  // Strict Referrer Policy
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  // Restrict unneeded browser permissions
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  },
  // Enforce HTTPS HSTS for 2 years with subdomains and preload
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  },
  // Enable browser XSS filtering
  {
    key: "X-XSS-Protection",
    value: "1; mode=block"
  },
  // DNS Prefetch Control
  {
    key: "X-DNS-Prefetch-Control",
    value: "on"
  }
];

export function applySecurityHeaders(headers: Headers): void {
  for (const { key, value } of SECURITY_HEADERS) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }
}
