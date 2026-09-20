import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Skip static files, api routes, and next internals
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle subdomain routing for ostaad.shop and local test hosts (e.g. admin.localhost:3000)
  const isCustomSubdomain =
    hostname.includes("ostaad.shop") || hostname.includes("localhost");

  if (isCustomSubdomain) {
    // Extract subdomain
    const subdomain = hostname.split(".")[0]?.toLowerCase();

    if (subdomain === "login" && url.pathname === "/") {
      return NextResponse.rewrite(new URL("/login", request.url));
    }

    if (subdomain === "admin" && url.pathname === "/") {
      return NextResponse.rewrite(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images & assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)).*)",
  ],
};
