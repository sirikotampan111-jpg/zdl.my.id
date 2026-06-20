import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, safeErrorResponse } from "@/lib/auth-guard";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const projects = await db.project.findMany({
      where: { userId: auth.userId },
      include: {
        milestones: { orderBy: { createdAt: "asc" } },
        order: {
          select: {
            orderId: true,
            packageName: true,
            packagePrice: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}
