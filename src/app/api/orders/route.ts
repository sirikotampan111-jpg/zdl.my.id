import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { allServices, PPN_RATE, TRANSACTION_FEE, DP_MINIMAL } from "@/lib/data";
import { checkRateLimit, safeParseJson, auditLog, validateBodySize } from "@/lib/rate-limit";
import type { ServiceItem } from "@/lib/data";

// ─── Server-side price validation ────────────────────────────────────────────

const serviceCatalog = new Map<string, ServiceItem>();
for (const svc of allServices) {
  serviceCatalog.set(svc.id, svc);
}

function validateServiceItem(itemId: string, clientPrice: number): {
  valid: boolean;
  serverPrice?: number;
  itemName?: string;
  category?: string;
} {
  const catalogItem = serviceCatalog.get(itemId);
  if (!catalogItem) {
    return { valid: false };
  }
  return {
    valid: true,
    serverPrice: catalogItem.price,
    itemName: catalogItem.name,
    category: catalogItem.category,
  };
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const orderItemSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category: z.string().min(1).max(20),
  quantity: z.number().int().min(1).max(10),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(10),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email().max(200),
  customerPhone: z.string().min(1).max(30),
  businessName: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  paymentMethod: z.string().max(50).optional(),
  isDP: z.boolean().optional(),
});

// ─── GET /api/orders ──────────────────────────────────────────────────────────

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

// ─── POST /api/orders ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rateResult = checkRateLimit(`order:${ip}`, { windowMs: 60_000, maxRequests: 10 });
    if (!rateResult.allowed) {
      auditLog("RATE_LIMIT_EXCEEDED", { ip, endpoint: "orders" });
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rateResult.retryAfterMs / 1000)) } }
      );
    }

    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Body size check
    const sizeError = validateBodySize(req);
    if (sizeError) return sizeError;

    // Safe JSON parse
    const { data: body, error: parseError } = await safeParseJson(req);
    if (parseError) return parseError;

    // Zod validation
    const parseResult = createOrderSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { items, customerName, customerEmail, customerPhone, businessName, notes, paymentMethod } = parseResult.data;

    // ─── Server-side price validation ────────────────────────────────────
    let totalPackagePrice = 0;
    const validatedItems: Array<{ id: string; name: string; price: number; category: string; quantity: number }> = [];

    for (const item of items) {
      const validation = validateServiceItem(item.id, item.price);
      if (!validation.valid || validation.serverPrice === undefined) {
        auditLog("PRICE_VALIDATION_FAILED", { itemId: item.id, clientPrice: item.price, userId });
        return NextResponse.json(
          { error: `Item "${item.id}" tidak ditemukan dalam katalog` },
          { status: 400 }
        );
      }
      // Use SERVER price, ignore client price
      validatedItems.push({
        id: item.id,
        name: validation.itemName || item.name,
        price: validation.serverPrice,
        category: validation.category || item.category,
        quantity: item.quantity,
      });
      totalPackagePrice += validation.serverPrice * item.quantity;
    }

    // Calculate amounts server-side
    const hasDPEligible = validatedItems.some(
      (i) => i.category === "html" || i.category === "nextjs"
    );
    const showDP = hasDPEligible;
    const basePayAmount = showDP ? DP_MINIMAL : totalPackagePrice;
    const ppnAmount = Math.round(basePayAmount * PPN_RATE);
    const payAmount = basePayAmount + ppnAmount + TRANSACTION_FEE;

    // Generate order ID
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const orderId = `ZDS-${year}${month}${day}-${random}`;

    const order = await db.order.create({
      data: {
        orderId,
        userId,
        packageName: validatedItems.map((i) => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(" + "),
        packageCategory: validatedItems[0].category,
        packagePrice: totalPackagePrice,
        ppnAmount,
        transactionFee: TRANSACTION_FEE,
        payAmount,
        dpMinimal: DP_MINIMAL,
        isDP: showDP,
        customerName: customerName || session.user.name || "",
        customerEmail: customerEmail || session.user.email || "",
        customerPhone,
        businessName: businessName || null,
        notes: notes || null,
        status: "pending",
        paymentMethod: paymentMethod || null,
      },
    });

    auditLog("ORDER_CREATE", { orderId, userId, totalPackagePrice, payAmount });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
