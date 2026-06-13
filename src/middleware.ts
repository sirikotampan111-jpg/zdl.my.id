import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
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

  // Protect admin API routes (exclude setup route)
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

  // SECURITY: Block common attack paths
  const blockedPaths = [
    "/.env",
    "/.env.local",
    "/.env.production",
    "/.git",
    "/.git/config",
    "/wp-admin",
    "/wp-login",
    "/phpmyadmin",
    "/admin.php",
    "/config.php",
    "/.htaccess",
    "/web.config",
  ];

  for (const blocked of blockedPaths) {
    if (pathname.toLowerCase().startsWith(blocked)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // SECURITY: Validate Content-Type for state-changing API requests
  // This provides basic CSRF protection — browsers won't send cross-origin
  // JSON requests without CORS preflight, but we add an extra check
  if (
    pathname.startsWith("/api/") &&
    (req.method === "POST" || req.method === "PATCH" || req.method === "PUT" || req.method === "DELETE")
  ) {
    const contentType = req.headers.get("content-type") || "";

    // Allow form submissions for NextAuth callbacks
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/:path*",
    "/.env",
    "/.env.local",
    "/.git/:path*",
    "/wp-admin/:path*",
    "/phpmyadmin/:path*",
  ],
};
