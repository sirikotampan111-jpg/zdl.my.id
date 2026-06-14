import { NextResponse } from "next/server";

// ─── GET /api/auth/debug ────────────────────────────────────────────────────
// Diagnostic endpoint to help troubleshoot OAuth configuration issues.
// Only shows whether variables are set, never exposes actual secrets.

export async function GET() {
  const nextauthUrl = process.env.NEXTAUTH_URL || "(not set)";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "(not set)";
  const hasGoogleClientId = !!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.length > 10;
  const hasGoogleClientSecret = !!process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET.length > 10;
  const hasNextauthSecret = !!process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length > 5;
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS || "(not set - using hardcoded fallback)";
  const nodeEnv = process.env.NODE_ENV || "(not set)";

  // Calculate the redirect URI that NextAuth will use
  // IMPORTANT: Vercel redirects zdl.my.id → www.zdl.my.id, so the real domain is www.zdl.my.id
  const baseUrl = nextauthUrl !== "(not set)"
    ? nextauthUrl.replace(/\/+$/, "")
    : siteUrl !== "(not set)"
      ? siteUrl.replace(/\/+$/, "")
      : "https://www.zdl.my.id";
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
    issues.push(`NEXTAUTH_URL menggunakan domain Vercel (${nextauthUrl}). Harus menggunakan custom domain (https://www.zdl.my.id).`);
  }
  if (nextauthUrl.startsWith("http://") && nodeEnv === "production") {
    issues.push("NEXTAUTH_URL menggunakan HTTP di production. Harus HTTPS.");
  }
  if (nextauthUrl.endsWith("/")) {
    issues.push("NEXTAUTH_URL memiliki trailing slash. Ini bisa menyebabkan redirect_uri_mismatch.");
  }

  // Check redirect URI match - both with and without www
  const expectedRedirectUris = [
    "https://www.zdl.my.id/api/auth/callback/google",
    "https://zdl.my.id/api/auth/callback/google",
  ];
  const redirectMatch = expectedRedirectUris.includes(redirectUri);

  if (!redirectMatch) {
    issues.push(`Redirect URI tidak cocok! NextAuth mengirim: "${redirectUri}". Tambahkan URI ini ke Google Cloud Console.`);
  }

  // Check if NEXTAUTH_URL is using non-www when Vercel redirects to www
  if (nextauthUrl === "https://zdl.my.id") {
    issues.push("Vercel mengarahkan zdl.my.id ke www.zdl.my.id. NEXTAUTH_URL harus https://www.zdl.my.id, bukan https://zdl.my.id.");
  }

  return NextResponse.json({
    status: issues.length === 0 ? "OK" : "ISSUES_FOUND",
    environment: nodeEnv,
    urls: {
      nextauthUrl,
      siteUrl,
      redirectUri,
      expectedRedirectUris,
      redirectMatch,
      note: "Vercel mengarahkan zdl.my.id ke www.zdl.my.id (307 redirect). Pastikan Google Cloud Console memiliki KEDUA redirect URI.",
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
    actionRequired: {
      googleCloudConsole: "Tambahkan KEDUA redirect URI di Google Cloud Console OAuth 2.0 Client ID:\n1. https://www.zdl.my.id/api/auth/callback/google\n2. https://zdl.my.id/api/auth/callback/google",
      vercelEnvVars: "Pastikan di Vercel Environment Variables:\n- NEXTAUTH_URL=https://www.zdl.my.id\n- NEXT_PUBLIC_SITE_URL=https://www.zdl.my.id",
      superAdmin: "Jika Google login belum bisa, gunakan POST /api/admin/force-upgrade dengan body { email, secret } dimana secret = NEXTAUTH_SECRET.",
    },
  });
}
