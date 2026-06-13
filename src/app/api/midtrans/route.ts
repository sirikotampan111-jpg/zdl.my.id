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
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.errors.map((e) => e.message) },
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
      paymentOption,
      userId,
    } = parseResult.data;

    // Determine mode: cart (multi-item) or single-item
    const isCartMode = Array.isArray(items) && items.length > 0;

    let orderItems: CartItemInput[];
    let combinedPackageName: string;
    let totalPackagePrice: number;
    let primaryCategory: string;

    if (isCartMode) {
      orderItems = items;
      combinedPackageName = items.map((i) => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(" + ");
      totalPackagePrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      primaryCategory = items[0].category;
    } else {
      if (!packageName || !packagePrice) {
        return NextResponse.json(
          { error: "Missing package info" },
          { status: 400 }
        );
      }
      orderItems = [{ id: packageCategory || "custom", name: packageName, price: packagePrice, category: packageCategory || "custom", quantity: 1 }];
      combinedPackageName = packageName;
      totalPackagePrice = packagePrice;
      primaryCategory = packageCategory || "custom";
    }

    const hasDPEligible = orderItems.some(
      (i) => i.category === "html" || i.category === "nextjs"
    );
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
      // Build Midtrans item_details
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
    // If the user is authenticated, we ALWAYS use the session userId to prevent spoofing
    const session = await getServerSession(authOptions);
    let resolvedUserId: string;

    if (session?.user) {
      // Authenticated user — use session ID, ignore client-supplied userId
      const sessionUserId = (session.user as { id?: string })?.id;
      if (!sessionUserId) {
        return NextResponse.json(
          { error: "Sesi tidak valid. Silakan login ulang." },
          { status: 401 }
        );
      }
      resolvedUserId = sessionUserId;
    } else {
      // Guest checkout — find or create user by email only (no userId from client)
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
