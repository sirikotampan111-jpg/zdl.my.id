import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: { userId },
      include: {
        transactions: true,
        project: {
          select: { id: true, status: true, progress: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      packageName,
      packageCategory,
      packagePrice,
      ppnAmount,
      transactionFee,
      payAmount,
      dpMinimal,
      isDP,
      customerName,
      customerEmail,
      customerPhone,
      businessName,
      notes,
    } = body;

    if (!packageName || !packagePrice) {
      return NextResponse.json(
        { error: "Data pesanan tidak lengkap" },
        { status: 400 }
      );
    }

    // Generate order ID
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const orderId = `ZDL-${year}${month}${day}-${random}`;

    const order = await db.order.create({
      data: {
        orderId,
        userId,
        packageName,
        packageCategory: packageCategory || "html",
        packagePrice: Number(packagePrice),
        ppnAmount: Number(ppnAmount) || 0,
        transactionFee: Number(transactionFee) || 0,
        payAmount: Number(payAmount) || Number(packagePrice),
        dpMinimal: Number(dpMinimal) || 0,
        isDP: isDP || false,
        customerName: customerName || session.user.name || "",
        customerEmail: customerEmail || session.user.email || "",
        customerPhone: customerPhone || "",
        businessName: businessName || null,
        notes: notes || null,
        status: "pending",
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
