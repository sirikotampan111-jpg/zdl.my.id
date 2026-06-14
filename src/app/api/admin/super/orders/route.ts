import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { safeParseJson, auditLog } from "@/lib/rate-limit";

// Helper to check admin access
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin" && role !== "super-admin") return null;
  return session;
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const updateOrderSchema = z.object({
  id: z.string().min(1).max(50),
  status: z.enum(["pending", "paid", "failed", "expired", "refunded", "completed", "cancelled"]),
});

// GET all orders (admin)
export async function GET() {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    console.error("Admin get orders error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PATCH update order status
export async function PATCH(req: NextRequest) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safe JSON parse
    const { data: body, error: parseError } = await safeParseJson(req);
    if (parseError) return parseError;

    // Zod validation
    const parseResult = updateOrderSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.issues },
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

    const updateData: Record<string, unknown> = { status };

    // If status is paid, set paidAt
    if (status === "paid" && !existingOrder.paidAt) {
      updateData.paidAt = new Date();
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
    });

    auditLog("ADMIN_ORDER_UPDATE", { orderId: id, status, adminEmail: session.user?.email });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Admin update order error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE order (super-admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID harus diisi" },
        { status: 400 }
      );
    }

    // Delete related data first
    const order = await db.order.findUnique({
      where: { id },
      include: { project: true, transactions: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete project milestones if project exists
    if (order.project) {
      await db.milestone.deleteMany({ where: { projectId: order.project.id } });
      await db.project.delete({ where: { id: order.project.id } });
    }

    // Delete transactions
    await db.transaction.deleteMany({ where: { orderId: id } });

    // Delete order
    await db.order.delete({ where: { id } });

    auditLog("ADMIN_ORDER_UPDATE", { action: "delete", orderId: id, adminEmail: session.user?.email });

    return NextResponse.json({ message: "Pesanan berhasil dihapus" });
  } catch (error) {
    console.error("Admin delete order error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
