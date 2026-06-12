import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  generateInvoiceNumber,
  PPN_RATE,
  TRANSACTION_FEE,
  DP_MINIMAL,
} from "@/lib/data";

interface CartItemInput {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      // Single-item (legacy)
      packageName,
      packagePrice,
      packageCategory,
      // Multi-item (cart)
      items,
      // Common
      customerName,
      customerEmail,
      customerPhone,
      businessName,
      notes,
      paymentMethod,
      userId,
    } = body;

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Determine mode: cart (multi-item) or single-item
    const isCartMode = Array.isArray(items) && items.length > 0;

    let orderItems: CartItemInput[];
    let combinedPackageName: string;
    let totalPackagePrice: number;
    let primaryCategory: string;

    if (isCartMode) {
      orderItems = items;
      combinedPackageName = items.map((i: CartItemInput) => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(" + ");
      totalPackagePrice = items.reduce((sum: number, i: CartItemInput) => sum + i.price * i.quantity, 0);
      // Primary category = first item's category (for DP logic)
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
          first_name: customerName,
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

    // Resolve userId: if not provided or invalid, find or create a guest user
    let resolvedUserId = userId;
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
          projectName: projectItem.name,
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
