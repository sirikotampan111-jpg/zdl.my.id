import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { safeParseJson, auditLog } from "@/lib/rate-limit";

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const updateUserRoleSchema = z.object({
  id: z.string().min(1).max(50),
  role: z.enum(["customer", "admin", "super-admin"]),
});

// GET all users (super-admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        businessName: true,
        image: true,
        createdAt: true,
        _count: {
          select: { orders: true, projects: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PATCH update user role (super-admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Safe JSON parse
    const { data: body, error: parseError } = await safeParseJson(req);
    if (parseError) return parseError;

    // Zod validation
    const parseResult = updateUserRoleSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { id, role: newRole } = parseResult.data;

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data: { role: newRole },
    });

    auditLog("ADMIN_USER_UPDATE", { targetUserId: id, newRole, adminEmail: session.user?.email });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE user (super-admin only)
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

    const user = await db.user.findUnique({
      where: { id },
      include: { projects: true, orders: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cannot delete super-admin
    if (user.role === "super-admin") {
      return NextResponse.json(
        { error: "Tidak dapat menghapus super admin" },
        { status: 400 }
      );
    }

    // Delete all related data
    for (const project of user.projects) {
      await db.milestone.deleteMany({ where: { projectId: project.id } });
    }
    await db.project.deleteMany({ where: { userId: id } });

    for (const order of user.orders) {
      await db.transaction.deleteMany({ where: { orderId: order.id } });
    }
    await db.order.deleteMany({ where: { userId: id } });

    await db.user.delete({ where: { id } });

    auditLog("ADMIN_USER_UPDATE", { action: "delete", targetUserId: id, adminEmail: session.user?.email });

    return NextResponse.json({ message: "Pengguna berhasil dihapus" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
