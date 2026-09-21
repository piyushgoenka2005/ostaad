/**
 * OSTAAD PLATFORM — INPUT SANITIZATION & SECURITY UTILITIES
 * Enterprise-grade sanitization against XSS, Injection, and Malicious payloads
 */

// Characters and patterns dangerous for XSS & injection
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;"
};

// Patterns matching malicious payloads
const SCRIPT_INJECTION_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const JAVASCRIPT_PROTOCOL_REGEX = /javascript\s*:/gi;
const ON_EVENT_REGEX = /\bon\w+\s*=/gi;
const DATA_PROTOCOL_REGEX = /data:(?:text\/html|application\/javascript)/gi;
const PATH_TRAVERSAL_REGEX = /(?:\.\.\/|\.\.\\)/g;

/**
 * Strips HTML tags and script payloads from a string
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(SCRIPT_INJECTION_REGEX, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

/**
 * Escapes dangerous HTML entities to neutralize XSS attacks
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/[&<>"'`/]/g, (match) => HTML_ENTITIES[match] || match);
}

/**
 * Sanitizes a general string input: removes scripts, javascript protocols, and excessive whitespace
 */
export function sanitizeString(input: unknown, maxLength: number = 2000): string {
  if (input === null || input === undefined) return "";
  const str = String(input);
  
  return str
    .replace(SCRIPT_INJECTION_REGEX, "")
    .replace(JAVASCRIPT_PROTOCOL_REGEX, "")
    .replace(ON_EVENT_REGEX, "")
    .replace(DATA_PROTOCOL_REGEX, "")
    .replace(PATH_TRAVERSAL_REGEX, "")
    .slice(0, maxLength)
    .trim();
}

/**
 * Sanitizes and validates an email address
 */
export function sanitizeEmail(email: unknown): string {
  if (!email || typeof email !== "string") return "";
  const cleaned = email.trim().toLowerCase().slice(0, 254);
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(cleaned) ? cleaned : "";
}

/**
 * Sanitizes a phone number to standard international/domestic format
 */
export function sanitizePhone(phone: unknown): string {
  if (!phone || typeof phone !== "string") return "";
  // Keep only digits, plus, parentheses, spaces, and hyphens
  return phone.replace(/[^0-9+\-()\s]/g, "").slice(0, 25).trim();
}

/**
 * Sanitizes numeric input with optional bounding (min/max)
 */
export function sanitizeNumber(
  value: unknown,
  min: number = -Infinity,
  max: number = Infinity,
  defaultValue: number = 0
): number {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitizes search / query strings (for URL query params like ?cat=, ?q=, ?search=)
 */
export function sanitizeQueryParam(param: unknown, maxLength: number = 100): string {
  if (!param || typeof param !== "string") return "";
  return param
    .replace(/[<>"'`;{}]/g, "")
    .replace(PATH_TRAVERSAL_REGEX, "")
    .replace(JAVASCRIPT_PROTOCOL_REGEX, "")
    .slice(0, maxLength)
    .trim();
}

/**
 * Checks if a string contains known malicious exploit patterns
 */
export function containsMaliciousPayload(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /eval\(/i,
    /document\.cookie/i,
    /union\s+select/i,
    /exec\s*\(/i,
    /;\s*drop\s+table/i,
    /\.\.\//
  ];

  return dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Deep sanitizes all string fields in an object (e.g. form body or JSON payload)
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = sanitizeString(key, 60);
    if (typeof value === "string") {
      result[cleanKey] = sanitizeString(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[cleanKey] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[cleanKey] = value.map((item) =>
        typeof item === "string"
          ? sanitizeString(item)
          : typeof item === "object" && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : item
      );
    } else {
      result[cleanKey] = value;
    }
  }

  return result as T;
}
