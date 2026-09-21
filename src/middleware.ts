import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { containsMaliciousPayload, sanitizeQueryParam } from "@/lib/security/sanitize";
import { applySecurityHeaders } from "@/lib/security/headers";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  const hostname = request.headers.get("host") || "";
  const clientIp = getClientIp(request.headers);

  // 1. Skip static assets, Next.js internals, and image optimization
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/brand")
  ) {
    return NextResponse.next();
  }

  // 2. INPUT QUERY SANITIZATION & EXPLOIT DETECTION
  // Check all query parameters for XSS, script injection, path traversal, or SQL injection payloads
  let hasMaliciousParam = false;
  let needsQuerySanitization = false;
  const sanitizedParams = new URLSearchParams();

  for (const [key, value] of url.searchParams.entries()) {
    if (containsMaliciousPayload(key) || containsMaliciousPayload(value)) {
      hasMaliciousParam = true;
      break;
    }

    const cleanKey = sanitizeQueryParam(key);
    const cleanValue = sanitizeQueryParam(value);

    if (cleanKey !== key || cleanValue !== value) {
      needsQuerySanitization = true;
    }

    if (cleanKey) {
      sanitizedParams.append(cleanKey, cleanValue);
    }
  }

  // Block requests carrying known exploit payloads
  if (hasMaliciousParam) {
    const blockedResponse = new NextResponse(
      JSON.stringify({
        error: "Bad Request",
        message: "Request contains illegal or potentially malicious query characters.",
        code: "INVALID_QUERY_PARAMETERS",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
    applySecurityHeaders(blockedResponse.headers);
    return blockedResponse;
  }

  // Redirect to sanitized URL if query parameters had unsafe characters stripped
  if (needsQuerySanitization) {
    const cleanUrl = new URL(pathname, request.url);
    cleanUrl.search = sanitizedParams.toString();
    const redirectResponse = NextResponse.redirect(cleanUrl);
    applySecurityHeaders(redirectResponse.headers);
    return redirectResponse;
  }

  // 3. RATE LIMITING (REQUESTS PER MINUTE)
  // Determine rate limit tier based on route sensitivity
  const isAuthOrAdmin =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/admin-login");

  const tier = isAuthOrAdmin ? "auth" : "public";
  const rateLimit = checkRateLimit(clientIp, tier);

  if (!rateLimit.success) {
    const rateLimitResponse = new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Maximum ${rateLimit.limit} requests per minute allowed.`,
        retryAfter: rateLimit.retryAfterSeconds,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetTime),
        },
      }
    );
    applySecurityHeaders(rateLimitResponse.headers);
    return rateLimitResponse;
  }

  // 4. SUBDOMAIN ROUTING (ostaad.shop and test hosts)
  const isCustomSubdomain =
    hostname.includes("ostaad.shop") || hostname.includes("localhost");

  let response: NextResponse;

  if (isCustomSubdomain) {
    const subdomain = hostname.split(".")[0]?.toLowerCase();

    if (subdomain === "login" && pathname === "/") {
      response = NextResponse.rewrite(new URL("/login", request.url));
    } else if (subdomain === "admin" && pathname === "/") {
      response = NextResponse.rewrite(new URL("/admin", request.url));
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  // 5. ATTACH RATE LIMIT METADATA & SECURITY HEADERS
  response.headers.set("X-RateLimit-Limit", String(rateLimit.limit));
  response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
  response.headers.set("X-RateLimit-Reset", String(rateLimit.resetTime));
  applySecurityHeaders(response.headers);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files & asset extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)).*)",
  ],
};
