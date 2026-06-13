import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, requireSuperAdmin, safeErrorResponse } from "@/lib/auth-guard";
import { adminUpdateOrderSchema, adminDeleteSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// GET all orders (admin)
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Rate limiting
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`admin-orders:${ip}`, RATE_LIMITS.admin);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Terlalu banyak request" }, { status: 429 });
    }

    const orders = await db.order.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        transactions: true,
        project: {
          select: { id: true, status: true, progress: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}

// PATCH update order status
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const rawBody = await req.json();

    // Validate with Zod — prevents mass assignment
    const parseResult = adminUpdateOrderSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }

    const { id, status } = parseResult.data;

    const existingOrder = await db.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Only allow specific fields to be updated — no mass assignment
    const updateData: { status: string; paidAt?: Date } = { status };

    if (status === "paid" && !existingOrder.paidAt) {
      updateData.paidAt = new Date();
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ order });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}

// DELETE order (super-admin only)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validate
    const parseResult = adminDeleteSchema.safeParse({ id });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "ID tidak valid" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id: parseResult.data.id },
      include: { project: true, transactions: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete in correct order
    if (order.project) {
      await db.milestone.deleteMany({ where: { projectId: order.project.id } });
      await db.project.delete({ where: { id: order.project.id } });
    }
    await db.transaction.deleteMany({ where: { orderId: parseResult.data.id } });
    await db.order.delete({ where: { id: parseResult.data.id } });

    return NextResponse.json({ message: "Pesanan berhasil dihapus" });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}
