import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── POST /api/admin/force-upgrade ─────────────────────────────────────────
// Allows upgrading a user to super-admin using NEXTAUTH_SECRET as authorization.
// This is a one-time setup tool for when OAuth is not working yet.
//
// Usage: POST /api/admin/force-upgrade
// Body: { "email": "user@example.com", "secret": "your-nextauth-secret" }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, secret } = body;

    // Verify authorization using NEXTAUTH_SECRET
    const expectedSecret = process.env.NEXTAUTH_SECRET;
    if (!expectedSecret) {
      return NextResponse.json(
        { error: "NEXTAUTH_SECRET tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: "Secret tidak valid" },
        { status: 403 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email harus diisi" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find or create the user
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Upgrade existing user to super-admin
      const updated = await db.user.update({
        where: { id: existingUser.id },
        data: { role: "super-admin" },
      });

      console.log(`[FORCE-UPGRADE] User ${normalizedEmail} upgraded to super-admin`);

      return NextResponse.json({
        message: "User berhasil di-upgrade ke super-admin",
        user: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          role: updated.role,
        },
      });
    } else {
      // Create new super-admin user (without password - for Google login)
      const newUser = await db.user.create({
        data: {
          email: normalizedEmail,
          name: normalizedEmail.split("@")[0],
          role: "super-admin",
          provider: "google",
        },
      });

      console.log(`[FORCE-UPGRADE] New super-admin user created: ${normalizedEmail}`);

      return NextResponse.json({
        message: "User super-admin baru berhasil dibuat. Login dengan Google untuk melengkapi profil.",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    }
  } catch (error) {
    console.error("[FORCE-UPGRADE] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
