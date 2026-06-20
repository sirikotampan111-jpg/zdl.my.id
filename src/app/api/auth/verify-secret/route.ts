import { NextResponse } from "next/server";

// ─── GET /api/auth/verify-secret ──────────────────────────────────────────
// Verifies the Google Client Secret by actually testing it against Google.
// This is the definitive test to find out why OAuth fails.

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const nextauthSecret = process.env.NEXTAUTH_SECRET || "";

  const issues: string[] = [];

  // Check Client Secret for hidden characters
  if (!clientSecret) {
    issues.push("❌ GOOGLE_CLIENT_SECRET is EMPTY");
  } else {
    if (clientSecret.includes("\n")) {
      issues.push("❌ Client Secret contains NEWLINE - must be one line!");
    }
    if (clientSecret.includes("\r")) {
      issues.push("❌ Client Secret contains CARRIAGE RETURN - must be one line!");
    }
    if (clientSecret.includes(" ")) {
      issues.push("❌ Client Secret contains SPACE - remove all spaces!");
    }
    if (clientSecret.startsWith('"') || clientSecret.endsWith('"')) {
      issues.push("❌ Client Secret has double quotes - remove them!");
    }
    if (clientSecret.startsWith("'") || clientSecret.endsWith("'")) {
      issues.push("❌ Client Secret has single quotes - remove them!");
    }
    if (!clientSecret.startsWith("GOCSPX-")) {
      issues.push("⚠️ Client Secret doesn't start with GOCSPX- - might be wrong");
    }
    if (clientSecret.length < 30) {
      issues.push(`⚠️ Client Secret is only ${clientSecret.length} chars - might be truncated`);
    }
  }

  // The REAL test: try Google's token endpoint
  // With a dummy code, Google will return specific errors:
  // - "invalid_grant" = credentials are correct, code is just fake ✅
  // - "invalid_client" = Client ID or Secret is WRONG ❌
  let tokenTestResult = "not_tested";
  if (clientId && clientSecret) {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: "4/dummy-test-code-for-verification",
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: "https://www.zds.asia/api/auth/callback/google",
          grant_type: "authorization_code",
        }),
      });

      const data = await response.json();

      if (data.error === "invalid_grant") {
        tokenTestResult = "✅ Credentials VALID! (invalid_grant is expected - the code is fake)";
      } else if (data.error === "invalid_client") {
        tokenTestResult = "❌ INVALID CLIENT! Client ID or Client Secret is WRONG";
        issues.push("❌ Google says Client ID/Secret combination is INVALID (invalid_client)");
      } else if (data.error === "redirect_uri_mismatch") {
        tokenTestResult = "❌ REDIRECT URI MISMATCH during token exchange!";
        issues.push("❌ redirect_uri_mismatch - the redirect URI used doesn't match Google Console");
      } else {
        tokenTestResult = `Google response: error="${data.error}" desc="${data.error_description || "none"}"`;
      }
    } catch (error) {
      tokenTestResult = `❌ Cannot reach Google: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  return NextResponse.json({
    clientSecret: {
      length: clientSecret.length,
      startsWithGOCSPX: clientSecret.startsWith("GOCSPX-"),
      hasNewline: clientSecret.includes("\n"),
      hasCarriageReturn: clientSecret.includes("\r"),
      hasSpaces: clientSecret.includes(" "),
      hasQuotes: clientSecret.startsWith('"') || clientSecret.startsWith("'") || clientSecret.endsWith('"') || clientSecret.endsWith("'"),
      preview: clientSecret ? `${clientSecret.substring(0, 7)}...${clientSecret.substring(clientSecret.length - 3)}` : "(empty)",
    },
    tokenTest: tokenTestResult,
    issues: issues.length > 0 ? issues : ["✅ No issues found - credentials appear valid"],
  });
}
