import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setupSchema } from "@/lib/validations";
import { requireSuperAdmin, safeErrorResponse } from "@/lib/auth-guard";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit-log";

// POST — Create initial super-admin (ONLY works if no super-admin exists)
// CRITICAL: This route requires super-admin auth if any admin already exists
// SECURITY FIX: Uses $transaction to prevent race condition (TOCTOU) when
// two concurrent requests try to create the first super-admin
export async function POST(req: NextRequest) {
  try {
    // Rate limiting — strict for admin setup
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`admin-setup:${ip}`, { windowMs: 60_000, maxRequests: 3 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Coba lagi nanti." },
        { status: 429 }
      );
    }

    const rawBody = await req.json();

    // Validate with Zod
    const parseResult = setupSchema.safeParse(rawBody);
    if (!parseResult.success) {
      console.error("[SECURITY] Setup validation failed:", parseResult.error.errors);
      return NextResponse.json(
        { error: "Data tidak valid" },
        { status: 400 }
      );
    }

    const { name, email, password } = parseResult.data;

    // SECURITY FIX: Use transaction to prevent race condition
    // Check if ANY super-admin exists AND create if not — atomically
    const result = await db.$transaction(async (tx) => {
      const existingAdmin = await tx.user.findFirst({
        where: { role: "super-admin" },
      });

      if (existingAdmin) {
        // If admin exists, require super-admin auth to create another
        return { needsAuth: true as const };
      }

      // Check if email already used
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        return { emailTaken: true as const };
      }

      // Create super-admin within the transaction
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: "super-admin",
          provider: "credentials",
        },
      });

      return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    });

    if ("needsAuth" in result && result.needsAuth) {
      const auth = await requireSuperAdmin();
      if (!auth.authorized) {
        return NextResponse.json(
          { error: "Super admin sudah ada. Hanya super-admin yang bisa menambah admin baru." },
          { status: 403 }
        );
      }
      // If we get here, the user is a super-admin — proceed to create another admin
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

      auditLog({
        action: "admin.setup.create",
        actorId: auth.userId,
        actorRole: auth.role,
        targetType: "user",
        targetId: user.id,
        details: { email: user.email, name: user.name },
        ip,
      });

      return NextResponse.json({
        message: "Super admin berhasil dibuat",
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    }

    if ("emailTaken" in result && result.emailTaken) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    if ("user" in result && result.user) {
      auditLog({
        action: "admin.setup.create",
        targetType: "user",
        targetId: result.user.id,
        details: { email: result.user.email, name: result.user.name, isFirstAdmin: true },
        ip,
      });

      return NextResponse.json({
        message: "Super admin berhasil dibuat",
        user: result.user,
      });
    }

    // Fallback — should never reach here
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}

// GET — Seed demo data (DISABLED in production)
export async function GET() {
  return NextResponse.json(
    { error: "Endpoint ini dinonaktifkan. Gunakan Google login untuk akses admin." },
    { status: 403 }
  );
}
