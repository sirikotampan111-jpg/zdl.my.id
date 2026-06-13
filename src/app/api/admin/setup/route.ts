import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setupSchema } from "@/lib/validations";
import { requireSuperAdmin, safeErrorResponse } from "@/lib/auth-guard";

// POST — Create initial super-admin (ONLY works if no super-admin exists)
// CRITICAL: This route requires super-admin auth if any admin already exists
export async function POST(req: NextRequest) {
  try {
    // Check if any super-admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: "super-admin" },
    });

    if (existingAdmin) {
      // If admin exists, require super-admin auth to create another
      const auth = await requireSuperAdmin();
      if (!auth.authorized) {
        return NextResponse.json(
          { error: "Super admin sudah ada. Hanya super-admin yang bisa menambah admin baru." },
          { status: 403 }
        );
      }
    }

    const rawBody = await req.json();

    // Validate with Zod
    const parseResult = setupSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }

    const { name, email, password } = parseResult.data;

    // Check if email already used
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "super-admin",
        provider: "credentials",
      },
    });

    // NEVER return password in response
    return NextResponse.json({
      message: "Super admin berhasil dibuat",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}

// GET — Seed demo data (DISABLED in production)
export async function GET() {
  // Block this endpoint — demo seeding is a development-only feature
  // In production, use the Google login + SUPER_ADMIN_EMAILS env var
  return NextResponse.json(
    { error: "Endpoint ini dinonaktifkan. Gunakan Google login untuk akses admin." },
    { status: 403 }
  );
}
