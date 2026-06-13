import { NextResponse } from "next/server";

export async function GET() {
  // Don't expose server info
  return NextResponse.json({ status: "ok" });
}
