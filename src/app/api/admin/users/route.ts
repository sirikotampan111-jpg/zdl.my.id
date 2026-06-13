import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, safeErrorResponse } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        businessName: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}
