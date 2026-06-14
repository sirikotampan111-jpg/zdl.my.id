import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ProxyRequest } from "next";
import { getToken } from "next-auth/jwt";

// ─── Blocked attack paths ─────────────────────────────────────────────────────

const BLOCKED_PATHS = [
  // Version control
  "/.git",
  "/.svn",
  "/.hg",
  "/.bzr",
  // WordPress (common attack vector)
  "/wp-admin",
  "/wp-content",
  "/wp-includes",
  "/wp-login",
  "/wp-config",
  "/xmlrpc.php",
  "/wordpress",
  // PHP / common CMS
  "/phpmyadmin",
  "/adminer",
  "/cgi-bin",
  "/.env",
  "/.env.local",
  "/.env.production",
  "/config.php",
  "/database.yml",
  // Spring Boot / Java
  "/actuator",
  "/actuator/health",
  "/actuator/env",
  "/jolokia",
  // Server info
  "/server-status",
  "/server-info",
  "/.htaccess",
  "/.htpasswd",
  "/nginx.conf",
  "/web.config",
  // Misc
  "/.DS_Store",
  "/Thumbs.db",
  "/elmah.axd",
  "/trace.axd",
];

// ─── Allowed HTTP methods per route pattern ───────────────────────────────────

const API_METHOD_RULES: Array<{ pattern: RegExp; methods: string[] }> = [
  { pattern: /^\/api\/orders$/, methods: ["GET", "POST"] },
  { pattern: /^\/api\/midtrans$/, methods: ["POST"] },
  { pattern: /^\/api\/webhook\/midtrans$/, methods: ["POST"] },
  { pattern: /^\/api\/chat$/, methods: ["POST"] },
  { pattern: /^\/api\/admin\/setup$/, methods: ["GET", "POST"] },
  { pattern: /^\/api\/admin\/super\/orders$/, methods: ["GET", "PATCH", "DELETE"] },
  { pattern: /^\/api\/admin\/super\/users$/, methods: ["GET", "PATCH", "DELETE"] },
  { pattern: /^\/api\/admin\/super\/projects$/, methods: ["GET", "PATCH", "DELETE"] },
];

// ─── Max body size (must match rate-limit.ts) ────────────────────────────────

const MAX_CONTENT_LENGTH = 1024 * 1024; // 1MB

// ─── Proxy ────────────────────────────────────────────────────────────────

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // ─── Block attack paths ───────────────────────────────────────────────
  for (const blocked of BLOCKED_PATHS) {
    if (pathname.toLowerCase().startsWith(blocked)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // ─── API route protections ────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    // HTTP method validation for API routes
    for (const rule of API_METHOD_RULES) {
      if (rule.pattern.test(pathname)) {
        if (!rule.methods.includes(method)) {
          return NextResponse.json(
            { error: "Method not allowed" },
            { status: 405, headers: { Allow: rule.methods.join(", ") } }
          );
        }
        break;
      }
    }

    // Content-Length pre-validation for mutation requests
    if (method === "POST" || method === "PATCH" || method === "PUT") {
      const contentLength = req.headers.get("content-length");
      if (contentLength) {
        const length = parseInt(contentLength, 10);
        if (!isNaN(length) && length > MAX_CONTENT_LENGTH) {
          return NextResponse.json(
            { error: "Payload terlalu besar (maks 1MB)" },
            { status: 413 }
          );
        }
      }

      // Enforce Content-Type for mutation requests
      const contentType = req.headers.get("content-type");
      if (contentType && !contentType.includes("application/json") && !contentType.includes("multipart/form-data")) {
        return NextResponse.json(
          { error: "Content-Type harus application/json" },
          { status: 415 }
        );
      }
    }

    // Security response headers for API routes
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  // ─── Protect dashboard routes ─────────────────────────────────────────
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

  // ─── Protect admin API routes (exclude setup route) ───────────────────
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

  return NextResponse.next();
}

export const config = {
  matches: [
    "/dashboard/:path*",
    "/api/:path*",
    // Block attack paths explicitly
    "/.git/:path*",
    "/.env",
    "/.env.local",
    "/wp-admin/:path*",
    "/wp-content/:path*",
    "/xmlrpc.php",
    "/phpmyadmin/:path*",
    "/cgi-bin/:path*",
    "/actuator/:path*",
  ],
};
