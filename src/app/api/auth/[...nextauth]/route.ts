// ─── NEXTAUTH_URL FIX ─────────────────────────────────────────────────────────
// MUST be set BEFORE importing NextAuth.
// Vercel redirects zds.asia → www.zds.asia (307), so the NEXTAUTH_URL
// must match the actual domain users end up on.
const rawUrl = process.env.NEXTAUTH_URL || "";
if (
  !rawUrl ||
  rawUrl.includes("vercel.app") ||
  rawUrl.endsWith("/") ||
  rawUrl === "https://zds.asia" ||
  rawUrl === "http://zds.asia"
) {
  process.env.NEXTAUTH_URL = "https://www.zds.asia";
}

if (
  !process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL === "https://zds.asia" ||
  process.env.NEXT_PUBLIC_SITE_URL === "http://zds.asia"
) {
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.zds.asia";
}

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
