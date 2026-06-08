import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Setup initial super-admin user
export async function POST(req: NextRequest) {
  try {
    // Check if any super-admin exists
    const existingAdmin = await db.user.findFirst({
      where: { role: "super-admin" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Super admin sudah ada" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        name: name || "Super Admin",
        password: hashedPassword,
        role: "super-admin",
        provider: "credentials",
      },
    });

    return NextResponse.json({
      message: "Super admin berhasil dibuat",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// GET - seed demo data
export async function GET() {
  try {
    // Check if demo data already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: "super-admin" },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Demo data sudah ada", admin: { email: existingAdmin.email } });
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);

    // Create super admin
    const admin = await db.user.create({
      data: {
        email: "admin@zdl.com",
        name: "ZDL Admin",
        password: hashedPassword,
        role: "super-admin",
        provider: "credentials",
        phone: "081234567890",
        businessName: "Zheng Digital Lab",
      },
    });

    // Create demo customer
    const customerPassword = await bcrypt.hash("customer123", 12);
    const customer = await db.user.create({
      data: {
        email: "customer@demo.com",
        name: "Budi Santoso",
        password: customerPassword,
        role: "customer",
        provider: "credentials",
        phone: "081298765432",
        businessName: "Toko Sejahtera",
      },
    });

    // Create demo orders
    const order1 = await db.order.create({
      data: {
        orderId: "ZDL-20240101-0001",
        userId: customer.id,
        packageName: "Landing Page Next.js",
        packageCategory: "nextjs",
        packagePrice: 1500000,
        ppnAmount: 165000,
        transactionFee: 4000,
        payAmount: 1669000,
        dpMinimal: 500000,
        isDP: true,
        customerName: customer.name!,
        customerEmail: customer.email,
        customerPhone: customer.phone!,
        businessName: customer.businessName,
        status: "paid",
        paidAt: new Date(),
      },
    });

    const order2 = await db.order.create({
      data: {
        orderId: "ZDL-20240102-0002",
        userId: customer.id,
        packageName: "Website HTML 3 Halaman",
        packageCategory: "html",
        packagePrice: 1200000,
        ppnAmount: 132000,
        transactionFee: 4000,
        payAmount: 1336000,
        dpMinimal: 500000,
        isDP: false,
        customerName: customer.name!,
        customerEmail: customer.email,
        customerPhone: customer.phone!,
        businessName: customer.businessName,
        status: "pending",
      },
    });

    // Create demo projects
    await db.project.create({
      data: {
        orderId: order1.id,
        userId: customer.id,
        projectName: "Toko Sejahtera Landing Page",
        packageCategory: "nextjs",
        status: "development",
        progress: 45,
        notes: "Sedang dalam tahap pengembangan frontend",
        startedAt: new Date("2024-01-05"),
        estimatedDone: new Date("2024-02-05"),
        milestones: {
          create: [
            { title: "Diskusi kebutuhan klien", status: "completed", completedAt: new Date("2024-01-06") },
            { title: "Wireframe & layout", status: "completed", completedAt: new Date("2024-01-10") },
            { title: "Desain UI homepage", status: "completed", completedAt: new Date("2024-01-15") },
            { title: "Development frontend", status: "in_progress" },
            { title: "Integrasi konten", status: "pending" },
            { title: "Testing & QA", status: "pending" },
          ],
        },
      },
    });

    return NextResponse.json({
      message: "Demo data berhasil dibuat!",
      credentials: {
        admin: { email: "admin@zdl.com", password: "admin123" },
        customer: { email: "customer@demo.com", password: "customer123" },
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
