import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSuperAdmin, safeErrorResponse } from "@/lib/auth-guard";
import { adminUpdateUserSchema, adminDeleteSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS, validateBodySize } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit-log";

// GET all users (super-admin only)
export async function GET(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Rate limiting
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`admin-users:${ip}`, RATE_LIMITS.admin);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Terlalu banyak request" }, { status: 429 });
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
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}

// PATCH update user role (super-admin only)
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const rawBodyText = await req.text();

    // SECURITY: Validate body size before parsing
    if (!validateBodySize(rawBodyText)) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = JSON.parse(rawBodyText);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // Validate with Zod
    const parseResult = adminUpdateUserSchema.safeParse(rawBody);
    if (!parseResult.success) {
      console.error("[SECURITY] User update validation failed:", parseResult.error.issues);
      return NextResponse.json(
        { error: "Data tidak valid" },
        { status: 400 }
      );
    }

    const { id, role: newRole } = parseResult.data;

    // Prevent self-demotion
    if (id === auth.userId && newRole !== "super-admin") {
      return NextResponse.json(
        { error: "Tidak dapat mengubah role akun sendiri" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Only update role — no mass assignment
    const user = await db.user.update({
      where: { id },
      data: { role: newRole },
    });

    // Audit log
    const ip = getClientIp(req);
    auditLog({
      action: "admin.user.role_update",
      actorId: auth.userId,
      actorRole: auth.role,
      targetType: "user",
      targetId: id,
      details: { oldRole: existingUser.role, newRole },
      ip,
    });

    // Don't return password
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}

// DELETE user (super-admin only)
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

    // Cannot delete self
    if (parseResult.data.id === auth.userId) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: parseResult.data.id },
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
    await db.project.deleteMany({ where: { userId: parseResult.data.id } });

    for (const order of user.orders) {
      await db.transaction.deleteMany({ where: { orderId: order.id } });
    }
    await db.order.deleteMany({ where: { userId: parseResult.data.id } });

    await db.user.delete({ where: { id: parseResult.data.id } });

    // Audit log
    const ip = getClientIp(req);
    auditLog({
      action: "admin.user.delete",
      actorId: auth.userId,
      actorRole: auth.role,
      targetType: "user",
      targetId: parseResult.data.id,
      details: { email: user.email, name: user.name, oldRole: user.role },
      ip,
    });

    return NextResponse.json({ message: "Pengguna berhasil dihapus" });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}
