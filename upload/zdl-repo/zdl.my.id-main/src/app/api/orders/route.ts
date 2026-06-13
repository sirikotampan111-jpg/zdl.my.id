import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, safeErrorResponse, canAccessResource } from "@/lib/auth-guard";
import { orderCreateSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS, validateBodySize } from "@/lib/rate-limit";
import { generateInvoiceNumber, PPN_RATE, TRANSACTION_FEE, DP_MINIMAL } from "@/lib/data";
import { validateServiceItem, isDPEligibleCategory } from "@/lib/price-guard";
import { auditLog, securityLog } from "@/lib/audit-log";

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
    const parseResult = orderCreateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      console.error("[SECURITY] Order create validation failed:", parseResult.error.issues);
      return NextResponse.json(
        { error: "Data tidak valid" },
        { status: 400 }
      );
    }

    const body = parseResult.data;

    // === CRITICAL SECURITY FIX: Validate prices against server-side catalog ===
    // Never trust client-supplied prices — resolve from authoritative catalog
    const priceValidation = validateServiceItem(body.packageCategory, body.packagePrice, body.packageName, body.packageCategory);
    if (!priceValidation.valid) {
      // Item not found in catalog — log and reject
      securityLog("security.price_mismatch", {
        action: "order.create",
        itemId: body.packageCategory,
        clientPrice: body.packagePrice,
        clientName: body.packageName,
        error: priceValidation.error,
      }, { actorId: auth.userId, ip });

      return NextResponse.json(
        { error: "Layanan tidak ditemukan dalam katalog. Silakan refresh halaman." },
        { status: 400 }
      );
    }

    // Use server-authoritative price and name
    const serverPrice = priceValidation.item.price;
    const serverName = priceValidation.item.name;
    const serverCategory = priceValidation.item.category;

    // Calculate all amounts server-side — never trust client calculations
    const isDP = body.isDP && isDPEligibleCategory(serverCategory);
    const basePayAmount = isDP ? DP_MINIMAL : serverPrice;
    const ppnAmount = Math.round(basePayAmount * PPN_RATE);
    const payAmount = basePayAmount + ppnAmount + TRANSACTION_FEE;

    // SECURITY: Use crypto-safe invoice number (not Math.random)
    const orderId = generateInvoiceNumber();

    const order = await db.order.create({
      data: {
        orderId,
        userId: auth.userId!,
        packageName: serverName,
        packageCategory: serverCategory,
        packagePrice: serverPrice,
        ppnAmount,
        transactionFee: TRANSACTION_FEE,
        payAmount,
        dpMinimal: isDP ? DP_MINIMAL : 0,
        isDP,
        customerName: body.customerName || ((auth.session as { user?: { name?: string } } | null)?.user?.name as string) || "",
        customerEmail: body.customerEmail || ((auth.session as { user?: { email?: string } } | null)?.user?.email as string) || "",
        customerPhone: body.customerPhone || "",
        businessName: body.businessName || null,
        notes: body.notes || null,
        status: "pending",
      },
    });

    // Audit log
    auditLog({
      action: "order.create",
      actorId: auth.userId,
      actorRole: auth.role,
      targetType: "order",
      targetId: order.orderId,
      details: {
        packagePrice: serverPrice,
        isDP,
        payAmount,
        clientPriceWas: body.packagePrice,
        priceCorrected: body.packagePrice !== serverPrice,
      },
      ip,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}
