import { NextResponse } from "next/server";

// ─── GET /api/auth/test-oauth ───────────────────────────────────────────────
// Tests if the Google OAuth token exchange can work by verifying the
// configuration that NextAuth uses. Does NOT make actual Google API calls.

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Check NEXTAUTH_URL consistency
  const nextauthUrl = process.env.NEXTAUTH_URL;
  results.nextauthUrl = nextauthUrl || "(not set)";
  results.nextauthUrlCorrect = nextauthUrl === "https://www.zdl.my.id";

  // 2. Check Google OAuth credentials
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  results.googleClientId = clientId ? `${clientId.substring(0, 10)}...(${clientId.length} chars)` : "(MISSING)";
  results.googleClientSecret = clientSecret ? `(${clientSecret.length} chars)` : "(MISSING)";

  // Common issue: Client ID ends with wrong domain
  if (clientId) {
    results.clientIdFormat = clientId.includes(".apps.googleusercontent.com")
      ? "✅ Correct format"
      : "⚠️ Does not end with .apps.googleusercontent.com - might be wrong";
  }

  // 3. Check NEXTAUTH_SECRET
  const secret = process.env.NEXTAUTH_SECRET;
  results.nextauthSecret = secret ? `(${secret.length} chars)` : "(MISSING)";
  results.secretWarning = secret && secret.length < 32
    ? "⚠️ Secret is short - might cause encryption issues"
    : "OK";

  // 4. Check redirect URI that would be sent to Google
  const baseUrl = (nextauthUrl || "https://www.zdl.my.id").replace(/\/+$/, "");
  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  results.redirectUri = redirectUri;
  results.redirectUriNote = "This MUST match the Authorized redirect URIs in Google Cloud Console";

  // 5. Check if DB is accessible
  try {
    const { db } = await import("@/lib/db");
    const userCount = await db.user.count();
    results.dbConnection = `✅ OK (${userCount} users)`;
  } catch (error) {
    results.dbConnection = `❌ FAILED: ${error instanceof Error ? error.message : String(error)}`;
  }

  // 6. Try to simulate what NextAuth does during OAuth callback
  // The token exchange sends a POST to https://oauth2.googleapis.com/token with:
  // - code (from Google)
  // - client_id
  // - client_secret
  // - redirect_uri
  // - grant_type=authorization_code
  results.tokenEndpoint = "https://oauth2.googleapis.com/token";
  results.tokenExchangeNote = "If this endpoint is unreachable from Vercel, OAuth will fail with OAuthCallback error";

  // 7. Most common causes of OAuthCallback error
  results.commonCauses = [
    "1. redirect_uri mismatch between authorization and token exchange",
    "2. GOOGLE_CLIENT_SECRET is wrong or has extra spaces",
    "3. GOOGLE_CLIENT_ID doesn't match the one in Google Cloud Console",
    "4. DB connection fails during signIn callback (would prevent user creation)",
    "5. NEXTAUTH_SECRET differs between serverless function instances",
  ];

  return NextResponse.json(results, { status: 200 });
}
