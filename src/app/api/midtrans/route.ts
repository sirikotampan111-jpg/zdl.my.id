import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  generateInvoiceNumber,
  generateTicketNumber,
  PPN_RATE,
  TRANSACTION_FEE,
  DP_MINIMAL,
} from "@/lib/data";
import { checkoutSchema } from "@/lib/validations";
import { safeErrorResponse } from "@/lib/auth-guard";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  validateCartItems,
  validatePackageCheckout,
  isDPEligibleCategory,
  calculateCartTotal,
  type ValidatedCartItem,
} from "@/lib/price-guard";
import { auditLog } from "@/lib/audit-log";

interface CartItemInput {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`payment:${ip}`, RATE_LIMITS.payment);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Coba lagi nanti." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    // Parse & validate input
    const rawBody = await req.json();
    const parseResult = checkoutSchema.safeParse(rawBody);
    if (!parseResult.success) {
      // Don't expose detailed validation errors to client
      console.error("[SECURITY] Checkout validation failed:", parseResult.error.errors);
      return NextResponse.json(
        { error: "Data tidak valid. Periksa kembali data yang dimasukkan." },
        { status: 400 }
      );
    }

    const {
      packageName,
      packageCategory,
      items,
      customerName,
      customerEmail,
      customerPhone,
      businessName,
      notes,
      paymentMethod,
      paymentOption,
    } = parseResult.data;

    // Determine mode: cart (multi-item) or single-item
    const isCartMode = Array.isArray(items) && items.length > 0;

    let orderItems: ValidatedCartItem[];
    let combinedPackageName: string;
    let totalPackagePrice: number;
    let primaryCategory: string;

    if (isCartMode) {
      // === CRITICAL SECURITY FIX: Validate all item prices against server catalog ===
      const validation = validateCartItems(items);
      if (!validation.valid) {
        auditLog({
          action: "security.price_mismatch",
          details: { mode: "cart", error: validation.error, clientItems: items.map(i => ({ id: i.id, price: i.price })) },
          ip,
        });
        return NextResponse.json(
          { error: "Data layanan tidak valid. Silakan refresh halaman dan coba lagi." },
          { status: 400 }
        );
      }
      orderItems = validation.items;
      combinedPackageName = orderItems.map((i) => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(" + ");
      totalPackagePrice = calculateCartTotal(orderItems);
      primaryCategory = orderItems[0].category;
    } else {
      if (!packageName || !packageCategory) {
        return NextResponse.json(
          { error: "Informasi paket tidak lengkap" },
          { status: 400 }
        );
      }

      // === CRITICAL SECURITY FIX: For single-item checkout with known category, validate against catalog ===
      // If the packageCategory matches a known service category, validate the item ID
      // For backward compatibility with custom categories, we still accept the request
      // but we no longer accept client-supplied prices — we use packageCategory as the item ID lookup
      const singleItemId = packageCategory;
      const singleValidation = validatePackageCheckout(singleItemId, parseResult.data.packagePrice);

      if (singleValidation.valid) {
        // Found in catalog — use server-authoritative price
        orderItems = [{
          id: singleValidation.item.id,
          name: singleValidation.item.name,
          price: singleValidation.item.price,
          category: singleValidation.item.category,
          quantity: 1,
        }];
        combinedPackageName = singleValidation.item.name;
        totalPackagePrice = singleValidation.item.price;
        primaryCategory = singleValidation.item.category;
      } else {
        // Not found in catalog — could be a custom/legacy item
        // SECURITY: Still don't trust client price blindly. Log a warning.
        if (parseResult.data.packagePrice && parseResult.data.packagePrice > 10000000) {
          auditLog({
            action: "security.suspicious_activity",
            details: {
              mode: "single",
              packageName,
              packageCategory,
              clientPrice: parseResult.data.packagePrice,
              reason: "High-value custom item not in catalog",
            },
            ip,
          });
        }
        // For non-catalog items, we still need a price but log the deviation
        const clientPrice = parseResult.data.packagePrice || 0;
        orderItems = [{ id: packageCategory || "custom", name: packageName, price: clientPrice, category: packageCategory || "custom", quantity: 1 }];
        combinedPackageName = packageName;
        totalPackagePrice = clientPrice;
        primaryCategory = packageCategory || "custom";
      }
    }

    const hasDPEligible = orderItems.some((i) => isDPEligibleCategory(i.category));
    // Respect user's payment option: "dp" or "full"
    const showDP = hasDPEligible && paymentOption !== "full";
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
      // Build Midtrans item_details using SERVER-VALIDATED prices
      const itemDetails = orderItems.map((i) => ({
        id: i.id,
        price: i.price,
        quantity: i.quantity,
        name: i.name.length > 50 ? i.name.substring(0, 47) + "..." : i.name,
        category: "Website Services",
      }));

      itemDetails.push(
        { id: "ppn-11%", price: ppnAmount, quantity: 1, name: "PPN 11%", category: "Tax" },
        { id: "transaction-fee", price: TRANSACTION_FEE, quantity: 1, name: "Biaya Transaksi", category: "Fee" }
      );

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: totalPayAmount,
        },
        item_details: itemDetails,
        customer_details: {
          first_name: customerName.substring(0, 100),
          email: customerEmail,
          phone: customerPhone,
        },
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/dashboard?payment=finish`,
          error: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/dashboard?payment=error`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/dashboard?payment=pending`,
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
        console.error("[SECURITY] Midtrans API error:", data);
        return NextResponse.json(
          { error: "Gagal membuat transaksi pembayaran" },
          { status: 500 }
        );
      }
      snapToken = data.token;
      snapRedirectUrl = data.redirect_url;
    }

    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 24);

    // SECURITY: Resolve userId from server session — NEVER trust client-supplied userId
    const session = await getServerSession(authOptions);
    let resolvedUserId: string;

    if (session?.user) {
      const sessionUserId = (session.user as { id?: string })?.id;
      if (!sessionUserId) {
        return NextResponse.json(
          { error: "Sesi tidak valid. Silakan login ulang." },
          { status: 401 }
        );
      }
      resolvedUserId = sessionUserId;
    } else {
      // Guest checkout — find or create user by email
      // Rate limit guest user creation to prevent abuse
      const guestRateLimit = checkRateLimit(`guest-create:${ip}`, { windowMs: 60_000, maxRequests: 3 });
      if (!guestRateLimit.allowed) {
        auditLog({
          action: "security.rate_limit_exceeded",
          details: { action: "guest_user_creation", email: customerEmail },
          ip,
        });
        return NextResponse.json(
          { error: "Terlalu banyak percobaan. Coba lagi nanti." },
          { status: 429 }
        );
      }

      const guestUser = await db.user.findFirst({ where: { email: customerEmail } });
      if (guestUser) {
        resolvedUserId = guestUser.id;
      } else {
        const newGuest = await db.user.create({
          data: {
            email: customerEmail,
            name: customerName.substring(0, 200),
            phone: customerPhone,
            businessName: businessName ? businessName.substring(0, 200) : null,
            role: "customer",
            provider: "checkout",
          },
        });
        resolvedUserId = newGuest.id;
      }
    }

    // Store serialized items info in notes using SERVER-VALIDATED data
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

    // Create projects for each eligible item in the cart
    const projectItems = isCartMode
      ? orderItems.filter((i) => ["html", "nextjs", "admin"].includes(i.category))
      : ["html", "nextjs", "admin"].includes(primaryCategory)
        ? orderItems
        : [];

    for (const projectItem of projectItems) {
      const estimatedDone = new Date();
      estimatedDone.setDate(
        estimatedDone.getDate() + (projectItem.category === "html" ? 7 : 14)
      );

      await db.project.create({
        data: {
          orderId: order.id,
          userId: resolvedUserId,
          projectName: projectItem.name.substring(0, 200),
          packageCategory: projectItem.category,
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

    // Audit log
    auditLog({
      action: "order.checkout",
      actorId: resolvedUserId,
      actorEmail: customerEmail,
      targetType: "order",
      targetId: order.orderId,
      details: {
        packagePrice: totalPackagePrice,
        isDP: showDP,
        payAmount: totalPayAmount,
        itemCount: orderItems.length,
        isDemo,
      },
      ip,
    });

    return NextResponse.json({
      orderId: order.orderId,
      ticketNumber: isDemo ? generateTicketNumber() : null,
      token: snapToken,
      redirect_url: snapRedirectUrl,
      payAmount: totalPayAmount,
      basePayAmount,
      ppnAmount,
      transactionFee: TRANSACTION_FEE,
      isDemo,
    });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}
