import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ========== Security Configuration ==========

/** Maximum allowed request body size for API routes (1MB) */
const MAX_API_BODY_SIZE = 1024 * 1024;

/** Blocked paths that are common attack vectors */
const BLOCKED_PATHS = [
  "/.env",
  "/.env.local",
  "/.env.production",
  "/.env.development",
  "/.git",
  "/.git/config",
  "/.git/HEAD",
  "/.svn",
  "/.hg",
  "/wp-admin",
  "/wp-login",
  "/wp-content",
  "/wp-includes",
  "/phpmyadmin",
  "/admin.php",
  "/config.php",
  "/.htaccess",
  "/web.config",
  "/xmlrpc.php",
  "/cgi-bin",
  "/actuator",
  "/.DS_Store",
  "/Thumbs.db",
  "/server-status",
  "/server-info",
];

/** Allowed HTTP methods for API routes */
const ALLOWED_API_METHODS = ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // ========== 1. Block common attack paths ==========
  const lowerPath = pathname.toLowerCase();
  for (const blocked of BLOCKED_PATHS) {
    if (lowerPath.startsWith(blocked)) {
      // Log the attempt for monitoring
      console.warn(`[SECURITY] Blocked path access: ${method} ${pathname} from ${req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"}`);
      return new NextResponse(null, { status: 404 });
    }
  }

  // ========== 2. Validate HTTP methods for API routes ==========
  if (pathname.startsWith("/api/") && !ALLOWED_API_METHODS.includes(method)) {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  // ========== 3. Protect dashboard routes ==========
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ========== 4. Protect admin API routes (exclude setup route) ==========
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/setup")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = token.role as string;
    if (role !== "admin" && role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (pathname.startsWith("/api/admin/super") && role !== "super-admin") {
      return NextResponse.json(
        { error: "Forbidden - Hanya Super Admin" },
        { status: 403 }
      );
    }
  }

  // ========== 5. Validate Content-Type for state-changing API requests ==========
  // This provides CSRF protection — browsers won't send cross-origin
  // JSON requests without CORS preflight, but we add an extra check
  if (
    pathname.startsWith("/api/") &&
    (method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE")
  ) {
    const contentType = req.headers.get("content-type") || "";

    // Allow form submissions for NextAuth callbacks and webhook
    if (
      pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/api/webhook/")
    ) {
      return NextResponse.next();
    }

    // Require JSON content type for all other API mutations
    // This prevents CSRF via form submissions (browsers auto-send form Content-Type)
    if (!contentType.includes("application/json") && contentType !== "") {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }
  }

  // ========== 6. Request body size validation for API routes ==========
  // Enforce a maximum request body size to prevent denial-of-service attacks
  // via oversized payloads. The Content-Length header is checked as a
  // pre-flight validation — actual body parsing in route handlers should
  // also enforce limits.
  if (
    pathname.startsWith("/api/") &&
    (method === "POST" || method === "PATCH" || method === "PUT") &&
    !pathname.startsWith("/api/auth/") &&
    !pathname.startsWith("/api/webhook/")
  ) {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_API_BODY_SIZE) {
      console.warn(`[SECURITY] Oversized request rejected: ${method} ${pathname} content-length=${contentLength}`);
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }
  }

  // ========== 7. Add security response headers for API responses ==========
  const response = NextResponse.next();

  // Add cache-control for API responses — prevent sensitive data caching
  if (pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    // Prevent API responses from being embedded in other sites
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/:path*",
    "/.env",
    "/.env.local",
    "/.env.production",
    "/.git/:path*",
    "/wp-admin/:path*",
    "/phpmyadmin/:path*",
    "/.svn/:path*",
    "/.hg/:path*",
  ],
};
