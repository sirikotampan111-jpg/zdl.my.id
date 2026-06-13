import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, safeErrorResponse, canAccessResource } from "@/lib/auth-guard";
import { orderCreateSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { generateInvoiceNumber } from "@/lib/data";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const orders = await db.order.findMany({
      where: { userId: auth.userId },
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
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Rate limiting
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`order:${ip}:${auth.userId}`, RATE_LIMITS.payment);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Coba lagi nanti." },
        { status: 429 }
      );
    }

    const rawBody = await req.json();

    // Validate with Zod
    const parseResult = orderCreateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }

    const body = parseResult.data;

    // SECURITY: Use crypto-safe invoice number (not Math.random)
    const orderId = generateInvoiceNumber();

    const order = await db.order.create({
      data: {
        orderId,
        userId: auth.userId!,
        packageName: body.packageName,
        packageCategory: body.packageCategory,
        packagePrice: body.packagePrice,
        ppnAmount: body.ppnAmount || 0,
        transactionFee: body.transactionFee || 0,
        payAmount: body.payAmount || body.packagePrice,
        dpMinimal: body.dpMinimal || 0,
        isDP: body.isDP || false,
        customerName: body.customerName || (auth.session?.user?.name as string) || "",
        customerEmail: body.customerEmail || (auth.session?.user?.email as string) || "",
        customerPhone: body.customerPhone || "",
        businessName: body.businessName || null,
        notes: body.notes || null,
        status: "pending",
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}
