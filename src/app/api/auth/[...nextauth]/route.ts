// ─── NEXTAUTH_URL FIX ─────────────────────────────────────────────────────────
// MUST be set BEFORE importing NextAuth.
// Vercel redirects zdl.my.id → www.zdl.my.id (307), so the NEXTAUTH_URL
// must match the actual domain users end up on.
// If NEXTAUTH_URL is set to the non-www version, OAuth state verification
// fails because the state cookie is generated on www.zdl.my.id but NextAuth
// tries to verify it using zdl.my.id.
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

// Also fix NEXT_PUBLIC_SITE_URL for consistency
if (
  !process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL === "https://zdl.my.id" ||
  process.env.NEXT_PUBLIC_SITE_URL === "http://zdl.my.id"
) {
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.zdl.my.id";
}

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
