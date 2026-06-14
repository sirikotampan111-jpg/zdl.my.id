// ─── NEXTAUTH_URL FIX ─────────────────────────────────────────────────────────
// MUST be set BEFORE importing NextAuth.
// Vercel redirects zdl.my.id → www.zdl.my.id (307), so the NEXTAUTH_URL
// must match the actual domain users end up on.
const rawUrl = process.env.NEXTAUTH_URL || "";
if (
  !rawUrl ||
  rawUrl.includes("vercel.app") ||
  rawUrl.endsWith("/") ||
  rawUrl === "https://zdl.my.id" ||
  rawUrl === "http://zdl.my.id"
) {
  process.env.NEXTAUTH_URL = "https://www.zdl.my.id";
}

if (
  !process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL === "https://zdl.my.id" ||
  process.env.NEXT_PUBLIC_SITE_URL === "http://zdl.my.id"
) {
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.zdl.my.id";
}

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

// Custom handler that wraps NextAuth with detailed error logging
async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const method = req.method;

  // Log all auth requests for debugging
  console.log(`[NEXTAUTH] ${method} ${pathname}`);

  // Extra logging for OAuth callback
  if (pathname.includes("/callback/google")) {
    console.log(`[NEXTAUTH] Google OAuth callback received`);
    console.log(`[NEXTAUTH] NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
    console.log(`[NEXTAUTH] Has GOOGLE_CLIENT_ID: ${!!process.env.GOOGLE_CLIENT_ID}`);
    console.log(`[NEXTAUTH] Has GOOGLE_CLIENT_SECRET: ${!!process.env.GOOGLE_CLIENT_SECRET}`);
    console.log(`[NEXTAUTH] Has NEXTAUTH_SECRET: ${!!process.env.NEXTAUTH_SECRET}`);
  }

  try {
    const result = await NextAuth(authOptions)(req, {} as never);

    // Log if redirecting to error page
    if (result.status === 302 || result.status === 307) {
      const location = result.headers.get("location") || "";
      if (location.includes("error=")) {
        const errorParam = new URL(location).searchParams.get("error");
        console.error(`[NEXTAUTH] ❌ Auth error: ${errorParam}`);
        console.error(`[NEXTAUTH] Redirecting to: ${location}`);
      } else if (location.includes("/dashboard") || location.includes("callbackUrl")) {
        console.log(`[NEXTAUTH] ✅ Auth success, redirecting to: ${location}`);
      }
    }

    return result;
  } catch (error) {
    console.error(`[NEXTAUTH] ❌ Unhandled error in auth handler:`, error);
    // Re-throw to let NextAuth handle it
    throw error;
  }
}

export { handler as GET, handler as POST };
