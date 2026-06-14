import { NextResponse } from "next/server";

// ─── GET /api/midtrans/check ───────────────────────────────────────────────
// Checks Midtrans configuration status without exposing secrets

export async function GET() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

  const issues: string[] = [];

  if (!serverKey) {
    issues.push("❌ MIDTRANS_SERVER_KEY tidak dikonfigurasi");
  } else if (serverKey.length < 20) {
    issues.push(`⚠️ MIDTRANS_SERVER_KEY terlalu pendek (${serverKey.length} chars) - mungkin salah`);
  }

  if (!clientKey) {
    issues.push("❌ NEXT_PUBLIC_MIDTRANS_CLIENT_KEY tidak dikonfigurasi");
  } else if (clientKey.length < 10) {
    issues.push(`⚠️ NEXT_PUBLIC_MIDTRANS_CLIENT_KEY terlalu pendek (${clientKey.length} chars) - mungkin salah`);
  }

  // Validate format
  if (serverKey && !serverKey.startsWith("SB-Mid-server-") && !serverKey.startsWith("Mid-server-")) {
    issues.push("⚠️ MIDTRANS_SERVER_KEY format tidak dikenali - harus dimulai dengan SB-Mid-server- (sandbox) atau Mid-server- (production)");
  }

  if (clientKey && !clientKey.startsWith("SB-Mid-client-") && !clientKey.startsWith("Mid-client-")) {
    issues.push("⚠️ NEXT_PUBLIC_MIDTRANS_CLIENT_KEY format tidak dikenali - harus dimulai dengan SB-Mid-client- (sandbox) atau Mid-client- (production)");
  }

  // Check if sandbox vs production mismatch
  const serverIsSandbox = serverKey.startsWith("SB-Mid-server-");
  const clientIsSandbox = clientKey.startsWith("SB-Mid-client-");

  if (serverKey && clientKey && serverIsSandbox !== clientIsSandbox) {
    issues.push("❌ Server Key dan Client Key tidak sejenis! Keduanya harus sandbox atau production");
  }

  if (isProduction && serverIsSandbox) {
    issues.push("⚠️ IS_PRODUCTION=true tapi Server Key masih sandbox (SB-Mid-server-)");
  }

  // Test API reachability
  let apiReachable = "not_tested";
  if (serverKey) {
    try {
      const apiUrl = isProduction
        ? "https://app.midtrans.com/snap/v1/transactions"
        : "https://app.sandbox.midtrans.com/snap/v1/transactions";

      const authString = Buffer.from(serverKey + ":").toString("base64");
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify({
          transaction_details: { order_id: `test-${Date.now()}`, gross_amount: 10000 },
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        apiReachable = "❌ Server Key DITOLAK (401 Unauthorized) - key salah";
        issues.push("❌ Midtrans API menolak Server Key - periksa kembali");
      } else if (data.token) {
        apiReachable = "✅ Midtrans API MERESPON dengan token - konfigurasi VALID!";
      } else if (data.error_message) {
        if (data.error_message.includes("already exists") || data.error_message.includes("duplicate")) {
          apiReachable = "✅ Midtrans API bisa diakses (duplicate order_id - expected)";
        } else {
          apiReachable = `⚠️ API response: ${data.error_message}`;
        }
      } else {
        apiReachable = `Response: ${JSON.stringify(data).substring(0, 200)}`;
      }
    } catch (error) {
      apiReachable = `❌ Tidak bisa mencapai Midtrans API: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  return NextResponse.json({
    environment: isProduction ? "PRODUCTION" : "SANDBOX",
    serverKey: {
      configured: !!serverKey,
      length: serverKey.length,
      isSandbox: serverIsSandbox,
      preview: serverKey ? `${serverKey.substring(0, 14)}...` : "(empty)",
    },
    clientKey: {
      configured: !!clientKey,
      length: clientKey.length,
      isSandbox: clientIsSandbox,
      preview: clientKey ? `${clientKey.substring(0, 14)}...` : "(empty)",
    },
    apiTest: apiReachable,
    issues: issues.length > 0 ? issues : ["✅ Semua konfigurasi Midtrans OK!"],
    instructions: {
      sandbox: "Untuk testing, gunakan key dari https://dashboard.sandbox.midtrans.com → Settings → Access Keys",
      production: "Untuk production, gunakan key dari https://dashboard.midtrans.com → Settings → Access Keys",
      format: "Server Key: SB-Mid-server-xxxxx (sandbox) atau Mid-server-xxxxx (production)",
    },
  });
}
