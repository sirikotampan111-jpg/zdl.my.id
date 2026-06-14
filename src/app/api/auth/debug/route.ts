import { NextResponse } from "next/server";

// ─── GET /api/auth/debug ────────────────────────────────────────────────────
// Diagnostic endpoint to help troubleshoot OAuth configuration issues.
// Only shows whether variables are set, never exposes actual secrets.

export async function GET() {
  // Only allow in production for debugging (not a security risk since no secrets are exposed)
  const nextauthUrl = process.env.NEXTAUTH_URL || "(not set)";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "(not set)";
  const hasGoogleClientId = !!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.length > 10;
  const hasGoogleClientSecret = !!process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET.length > 10;
  const hasNextauthSecret = !!process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length > 5;
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS || "(not set - using hardcoded fallback)";
  const nodeEnv = process.env.NODE_ENV || "(not set)";

  // Calculate the redirect URI that NextAuth will use
  const baseUrl = nextauthUrl !== "(not set)"
    ? nextauthUrl.replace(/\/+$/, "")
    : siteUrl !== "(not set)"
      ? siteUrl.replace(/\/+$/, "")
      : "https://zdl.my.id";
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
    issues.push("NEXTAUTH_SECRET tidak dikonfigurasi. Generate dengan: openssl rand -base64 32");
  }
  if (nextauthUrl.includes("vercel.app")) {
    issues.push(`NEXTAUTH_URL menggunakan domain Vercel (${nextauthUrl}). Harus menggunakan custom domain (https://zdl.my.id) agar redirect URI cocok dengan Google Cloud Console.`);
  }
  if (nextauthUrl.startsWith("http://") && nodeEnv === "production") {
    issues.push("NEXTAUTH_URL menggunakan HTTP di production. Harus HTTPS.");
  }
  if (nextauthUrl.endsWith("/")) {
    issues.push("NEXTAUTH_URL memiliki trailing slash. Ini bisa menyebabkan redirect_uri_mismatch.");
  }

  // Check redirect URI match
  const expectedRedirectUri = "https://zdl.my.id/api/auth/callback/google";
  const redirectMatch = redirectUri === expectedRedirectUri;
  if (!redirectMatch) {
    issues.push(`Redirect URI tidak cocok! NextAuth mengirim: "${redirectUri}", tapi Google Cloud Console mengharapkan: "${expectedRedirectUri}"`);
  }

  return NextResponse.json({
    status: issues.length === 0 ? "OK" : "ISSUES_FOUND",
    environment: nodeEnv,
    urls: {
      nextauthUrl,
      siteUrl,
      redirectUri,
      expectedRedirectUri,
      redirectMatch,
    },
    credentials: {
      googleClientId: hasGoogleClientId ? "(configured)" : "(MISSING)",
      googleClientSecret: hasGoogleClientSecret ? "(configured)" : "(MISSING)",
      nextauthSecret: hasNextauthSecret ? "(configured)" : "(MISSING)",
    },
    superAdmin: {
      envVar: superAdminEmails,
      note: "Jika env var tidak set, fallback ke: sirikotampan111@gmail.com",
    },
    issues: issues.length > 0 ? issues : ["Tidak ada masalah ditemukan dalam konfigurasi."],
    fixInstructions: {
      redirect_uri_mismatch: `Pastikan Google Cloud Console OAuth 2.0 Client ID memiliki authorized redirect URI: "${expectedRedirectUri}". Juga pastikan NEXTAUTH_URL di Vercel = "https://zdl.my.id" (tanpa trailing slash).`,
      superAdminAccess: "Jika Google login belum bisa, gunakan POST /api/admin/force-upgrade dengan body { email, secret } dimana secret = NEXTAUTH_SECRET.",
    },
  });
}
