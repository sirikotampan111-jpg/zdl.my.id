import { NextResponse } from "next/server";

// ─── GET /api/auth/debug ────────────────────────────────────────────────────
// Diagnostic endpoint to help troubleshoot OAuth configuration issues.
// Only shows whether variables are set, never exposes actual secrets.

// Force correct NEXTAUTH_URL before any checks
const rawNextauthUrl = process.env.NEXTAUTH_URL || "";
const CORRECT_URL = "https://www.zds.asia";

// Apply same override logic as auth.ts
if (
  !rawNextauthUrl ||
  rawNextauthUrl.includes("vercel.app") ||
  rawNextauthUrl.endsWith("/") ||
  rawNextauthUrl === "https://zds.asia" ||
  rawNextauthUrl === "http://zds.asia"
) {
  process.env.NEXTAUTH_URL = CORRECT_URL;
}

export async function GET() {
  const nextauthUrl = process.env.NEXTAUTH_URL || "(not set)";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "(not set)";
  const hasGoogleClientId = !!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.length > 10;
  const hasGoogleClientSecret = !!process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET.length > 10;
  const hasNextauthSecret = !!process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length > 5;
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS || "(not set - using hardcoded fallback)";
  const nodeEnv = process.env.NODE_ENV || "(not set)";

  const baseUrl = nextauthUrl !== "(not set)"
    ? nextauthUrl.replace(/\/+$/, "")
    : CORRECT_URL;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  // Check for common issues
  const issues: string[] = [];

  if (!hasGoogleClientId) {
    issues.push("GOOGLE_CLIENT_ID tidak dikonfigurasi. Set di Vercel Environment Variables.");
  }
  if (!hasGoogleClientSecret) {
    issues.push("GOOGLE_CLIENT_SECRET tidak dikonfigurasi. Set di Vercel Environment Variables.");
  }
  if (!hasNextauthSecret) {
    issues.push("NEXTAUTH_SECRET tidak dikonfigurasi.");
  }
  if (nextauthUrl.includes("vercel.app")) {
    issues.push(`NEXTAUTH_URL menggunakan domain Vercel. Harus menggunakan custom domain (${CORRECT_URL}).`);
  }
  if (nextauthUrl.startsWith("http://") && nodeEnv === "production") {
    issues.push("NEXTAUTH_URL menggunakan HTTP di production. Harus HTTPS.");
  }
  if (nextauthUrl.endsWith("/")) {
    issues.push("NEXTAUTH_URL memiliki trailing slash.");
  }
  if (nextauthUrl === "https://zds.asia" || nextauthUrl === "http://zds.asia") {
    issues.push(`NEXTAUTH_URL = ${nextauthUrl} (tanpa www). Vercel mengarahkan ke www.zds.asia. Harus ${CORRECT_URL}.`);
  }

  const expectedRedirectUris = [
    "https://www.zds.asia/api/auth/callback/google",
    "https://zds.asia/api/auth/callback/google",
  ];
  const redirectMatch = expectedRedirectUris.includes(redirectUri);

  if (!redirectMatch) {
    issues.push(`Redirect URI tidak cocok! NextAuth mengirim: "${redirectUri}". Tambahkan URI ini ke Google Cloud Console.`);
  }

  return NextResponse.json({
    status: issues.length === 0 ? "OK" : "ISSUES_FOUND",
    environment: nodeEnv,
    urls: {
      nextauthUrl,
      siteUrl,
      redirectUri,
      correctUrl: CORRECT_URL,
      expectedRedirectUris,
      redirectMatch,
    },
    credentials: {
      googleClientId: hasGoogleClientId ? "(configured)" : "(MISSING)",
      googleClientSecret: hasGoogleClientSecret ? "(configured)" : "(MISSING)",
      nextauthSecret: hasNextauthSecret ? "(configured)" : "(MISSING)",
    },
    superAdmin: {
      envVar: superAdminEmails,
      hardcoded: "sirikotampan111@gmail.com",
    },
    issues: issues.length > 0 ? issues : ["Semua konfigurasi OK!"],
    actionRequired: {
      step1_googleConsole: `Di Google Cloud Console → OAuth 2.0 Client ID → Authorized redirect URIs, pastikan ada:\n  1. https://www.zds.asia/api/auth/callback/google\n  2. https://zds.asia/api/auth/callback/google`,
      step2_vercelEnv: `Di Vercel → Settings → Environment Variables, set:\n  - NEXTAUTH_URL=https://www.zds.asia\n  - NEXT_PUBLIC_SITE_URL=https://www.zds.asia`,
      step3_ifStillFails: `Jika masih gagal, cek Vercel Function Logs untuk error detail. Debug mode sudah diaktifkan.`,
    },
  });
}
