import { NextResponse } from "next/server";

// DISABLED — This app uses Google-only authentication
// Registration via email/password is no longer supported
export async function POST() {
  return NextResponse.json(
    { error: "Registrasi via email/password dinonaktifkan. Silakan login dengan Google." },
    { status: 403 }
  );
}
