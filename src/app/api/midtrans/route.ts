import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  generateInvoiceNumber,
  PPN_RATE,
  TRANSACTION_FEE,
  DP_MINIMAL,
  allServices,
} from "@/lib/data";
import { checkRateLimit, safeParseJson, auditLog, validateBodySize } from "@/lib/rate-limit";
import type { ServiceItem } from "@/lib/data";

// ─── Server-side catalog lookup ───────────────────────────────────────────────

const serviceCatalog = new Map<string, ServiceItem>();
for (const svc of allServices) {
  serviceCatalog.set(svc.id, svc);
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const cartItemSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category: z.string().min(1).max(20),
  quantity: z.number().int().min(1).max(10),
});

const midtransBodySchema = z.object({
  // Single-item (legacy)
  packageName: z.string().max(100).optional(),
  packagePrice: z.number().positive().optional(),
  packageCategory: z.string().max(20).optional(),
  // Multi-item (cart)
  items: z.array(cartItemSchema).min(1).max(10).optional(),
  // Common
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email().max(200),
  customerPhone: z.string().min(1).max(30),
  businessName: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  paymentMethod: z.string().max(50).optional(),
  userId: z.string().max(100).optional(),
});

// ─── POST /api/midtrans ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Rate limiting — stricter for payment
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rateResult = checkRateLimit(`midtrans:${ip}`, { windowMs: 60_000, maxRequests: 5 });
    if (!rateResult.allowed) {
      auditLog("RATE_LIMIT_EXCEEDED", { ip, endpoint: "midtrans" });
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rateResult.retryAfterMs / 1000)) } }
      );
    }

    // Body size check
    const sizeError = validateBodySize(req);
    if (sizeError) return sizeError;

    // Safe JSON parse
    const { data: body, error: parseError } = await safeParseJson(req);
    if (parseError) return parseError;

    // Zod validation
    const parseResult = midtransBodySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const {
      packageName,
      packagePrice,
      packageCategory,
      items,
      customerName,
      customerEmail,
      customerPhone,
      businessName,
      notes,
      paymentMethod,
      userId,
    } = parseResult.data;

    // ─── Resolve items & validate against catalog ────────────────────────
    const isCartMode = Array.isArray(items) && items.length > 0;

    let orderItems: Array<{ id: string; name: string; price: number; category: string; quantity: number }>;
    let combinedPackageName: string;
    let totalPackagePrice: number;
    let primaryCategory: string;

    if (isCartMode) {
      // Validate each cart item against server catalog
      const validatedItems: Array<{ id: string; name: string; price: number; category: string; quantity: number }> = [];

      for (const item of items!) {
        const catalogItem = serviceCatalog.get(item.id);
        if (!catalogItem) {
          auditLog("PRICE_VALIDATION_FAILED", { itemId: item.id, clientPrice: item.price, ip });
          return NextResponse.json(
            { error: `Item "${item.id}" tidak ditemukan dalam katalog` },
            { status: 400 }
          );
        }
        // ALWAYS use server price, ignore client price
        validatedItems.push({
          id: item.id,
          name: catalogItem.name,
          price: catalogItem.price,
          category: catalogItem.category,
          quantity: item.quantity,
        });
      }

      orderItems = validatedItems;
      combinedPackageName = validatedItems.map((i) => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(" + ");
      totalPackagePrice = validatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      primaryCategory = validatedItems[0].category;
    } else {
      // Legacy single-item mode — also validate against catalog
      if (!packageName || !packagePrice) {
        return NextResponse.json(
          { error: "Missing package info" },
          { status: 400 }
        );
      }

      // For single items, we still need a catalog match
      const category = packageCategory || "custom";
      if (category === "custom") {
        // Non-catalog items are NO LONGER accepted — reject with 400
        auditLog("PRICE_VALIDATION_FAILED", { itemId: "custom-single", clientPrice: packagePrice, ip });
        return NextResponse.json(
          { error: "Item harus dari katalog layanan yang tersedia" },
          { status: 400 }
        );
      }

      // Try to find the item in catalog by category + price match
      const catalogMatch = allServices.find(
        (s) => s.category === category && s.name === packageName
      );
      if (!catalogMatch) {
        auditLog("PRICE_VALIDATION_FAILED", { itemId: `single-${packageName}`, clientPrice: packagePrice, ip });
        return NextResponse.json(
          { error: "Item tidak ditemukan dalam katalog layanan" },
          { status: 400 }
        );
      }

      orderItems = [{
        id: catalogMatch.id,
        name: catalogMatch.name,
        price: catalogMatch.price,
        category: catalogMatch.category,
        quantity: 1,
      }];
      combinedPackageName = catalogMatch.name;
      totalPackagePrice = catalogMatch.price;
      primaryCategory = catalogMatch.category;
    }

    // ─── Calculate amounts SERVER-SIDE only ──────────────────────────────
    const hasDPEligible = orderItems.some(
      (i) => i.category === "html" || i.category === "nextjs"
    );
    const showDP = hasDPEligible;
    const basePayAmount = showDP ? DP_MINIMAL : totalPackagePrice;
    const ppnAmount = Math.round(basePayAmount * PPN_RATE);
    const totalPayAmount = basePayAmount + ppnAmount + TRANSACTION_FEE;

    const orderId = generateInvoiceNumber();
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

    let snapToken: string | null = null;
    let snapRedirectUrl: string | null = null;
    let isDemo = false;

    if (!serverKey || serverKey === "SB-Mid-server-PLACEHOLDER") {
      snapToken = `mock-token-${Date.now()}`;
      snapRedirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${Date.now()}`;
      isDemo = true;
    } else {
      // Build Midtrans item_details with SERVER-VALIDATED prices
      // IMPORTANT: Midtrans requires gross_amount == sum of (price * quantity) for all items
      // In DP mode, we must adjust item prices so the sum matches the DP amount
      
      const itemDetails = orderItems.map((i) => ({
        id: i.id,
        // In DP mode: use proportional price so items sum to basePayAmount
        // In full payment mode: use actual price
        price: showDP
          ? Math.round((i.price * i.quantity / totalPackagePrice) * basePayAmount / i.quantity)
          : i.price,
        quantity: i.quantity,
        name: i.name.length > 50 ? i.name.substring(0, 47) + "..." : i.name,
        category: "Website Services",
      }));

      // Verify item total matches basePayAmount (with rounding adjustment)
      const itemTotal = itemDetails.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const roundingDiff = basePayAmount - itemTotal;
      
      itemDetails.push(
        { id: "ppn-11%", price: ppnAmount, quantity: 1, name: "PPN 11%", category: "Tax" },
        { id: "transaction-fee", price: TRANSACTION_FEE, quantity: 1, name: "Biaya Transaksi", category: "Fee" }
      );

      // If there's a rounding difference, add it to the first item or as adjustment
      if (roundingDiff !== 0 && itemDetails.length > 0) {
        itemDetails[0].price += roundingDiff;
      }

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: totalPayAmount,
        },
        item_details: itemDetails,
        customer_details: {
          first_name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id"}/dashboard?payment=finish`,
          error: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id"}/dashboard?payment=error`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id"}/dashboard?payment=pending`,
        },
      };

      const authString = Buffer.from(serverKey + ":").toString("base64");
      const apiUrl = isProduction
        ? "https://app.midtrans.com/snap/v1/transactions"
        : "https://app.sandbox.midtrans.com/snap/v1/transactions";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify(parameter),
      });

      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to create transaction", details: data },
          { status: 500 }
        );
      }
      snapToken = data.token;
      snapRedirectUrl = data.redirect_url;
    }

    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 24);

    // Resolve userId
    let resolvedUserId = userId;
    if (!resolvedUserId || resolvedUserId === "guest") {
      // Try to get from session first
      try {
        const session = await getServerSession(authOptions);
        if (session?.user) {
          const sessionUserId = (session.user as { id?: string })?.id;
          if (sessionUserId) {
            resolvedUserId = sessionUserId;
          }
        }
      } catch {
        // No session, continue with guest
      }

      if (!resolvedUserId || resolvedUserId === "guest") {
        const guestUser = await db.user.findFirst({ where: { email: customerEmail } });
        if (guestUser) {
          resolvedUserId = guestUser.id;
        } else {
          const newGuest = await db.user.create({
            data: {
              email: customerEmail,
              name: customerName,
              phone: customerPhone,
              businessName: businessName || null,
              role: "customer",
              provider: "checkout",
            },
          });
          resolvedUserId = newGuest.id;
        }
      }
    }

    // Store serialized items info in notes
    const itemsSummary = isCartMode
      ? JSON.stringify(orderItems.map((i) => ({ id: i.id, name: i.name, price: i.price, category: i.category, quantity: i.quantity })))
      : null;

    const order = await db.order.create({
      data: {
        orderId,
        userId: resolvedUserId,
        packageName: combinedPackageName,
        packageCategory: primaryCategory,
        packagePrice: totalPackagePrice,
        ppnAmount,
        transactionFee: TRANSACTION_FEE,
        payAmount: totalPayAmount,
        dpMinimal: DP_MINIMAL,
        isDP: showDP,
        customerName,
        customerEmail,
        customerPhone,
        businessName: businessName || null,
        notes: itemsSummary
          ? `${notes ? notes + "\n\n" : ""}[Cart Items] ${itemsSummary}`
          : notes || null,
        status: "pending",
        paymentMethod: paymentMethod || null,
        snapToken,
        snapRedirectUrl,
        expiredAt,
      },
    });

    // Create a single project for this order (schema has @unique on orderId)
    const projectItems = isCartMode
      ? orderItems.filter((i) => ["html", "nextjs", "admin"].includes(i.category))
      : ["html", "nextjs", "admin"].includes(primaryCategory)
        ? orderItems
        : [];

    if (projectItems.length > 0) {
      // Combine all project items into one project
      const combinedName = projectItems.map((i) => i.name).join(" + ");
      const maxCategory = projectItems.find((i) => i.category === "nextjs" || i.category === "admin")
        ? projectItems.find((i) => i.category === "nextjs" || i.category === "admin")!.category
        : projectItems[0].category;

      const estimatedDone = new Date();
      estimatedDone.setDate(
        estimatedDone.getDate() + (maxCategory === "html" ? 7 : 14)
      );

      await db.project.create({
        data: {
          orderId: order.id,
          userId: resolvedUserId,
          projectName: combinedName,
          packageCategory: maxCategory,
          status: "planning",
          progress: 10,
          estimatedDone,
          milestones: {
            create: [
              { title: "Planning & Analisis Kebutuhan", status: "in_progress" },
              { title: "Desain UI/UX", status: "pending" },
              { title: "Development & Coding", status: "pending" },
              { title: "Testing & Revisi", status: "pending" },
              { title: "Deploy & Go Live", status: "pending" },
            ],
          },
        },
      });
    }

    auditLog("PAYMENT_INIT", { orderId, userId: resolvedUserId, totalPackagePrice, totalPayAmount, ip });

    return NextResponse.json({
      orderId: order.orderId,
      token: snapToken,
      redirect_url: snapRedirectUrl,
      payAmount: totalPayAmount,
      basePayAmount,
      ppnAmount,
      transactionFee: TRANSACTION_FEE,
      isDemo,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
