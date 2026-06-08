import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  generateInvoiceNumber,
  PPN_RATE,
  TRANSACTION_FEE,
  DP_MINIMAL,
} from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      packageName,
      packagePrice,
      packageCategory,
      customerName,
      customerEmail,
      customerPhone,
      businessName,
      notes,
      userId,
    } = body;

    if (!packageName || !packagePrice || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const showDP = packageCategory === "html" || packageCategory === "nextjs";
    const basePayAmount = showDP ? DP_MINIMAL : packagePrice;
    const ppnAmount = Math.round(basePayAmount * PPN_RATE);
    const totalPayAmount = basePayAmount + ppnAmount + TRANSACTION_FEE;

    const orderId = generateInvoiceNumber();
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

    let snapToken: string | null = null;
    let snapRedirectUrl: string | null = null;
    let isDemo = false;

    if (!serverKey || serverKey === "SB-Mid-server-PLACEHOLDER") {
      snapToken = `mock-token-${Date.now()}`;
      snapRedirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${Date.now()}`;
      isDemo = true;
    } else {
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: totalPayAmount,
        },
        item_details: [
          {
            id: packageCategory,
            price: basePayAmount,
            quantity: 1,
            name: packageName,
            category: "Website Services",
          },
          {
            id: "ppn-11%",
            price: ppnAmount,
            quantity: 1,
            name: "PPN 11%",
            category: "Tax",
          },
          {
            id: "transaction-fee",
            price: TRANSACTION_FEE,
            quantity: 1,
            name: "Biaya Transaksi",
            category: "Fee",
          },
        ],
        customer_details: {
          first_name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_SITE_URL || "https://zdl.web.id"}/dashboard?payment=finish`,
          error: `${process.env.NEXT_PUBLIC_SITE_URL || "https://zdl.web.id"}/dashboard?payment=error`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL || "https://zdl.web.id"}/dashboard?payment=pending`,
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

    const order = await db.order.create({
      data: {
        orderId,
        userId: userId || "guest",
        packageName,
        packageCategory,
        packagePrice,
        ppnAmount,
        transactionFee: TRANSACTION_FEE,
        payAmount: totalPayAmount,
        dpMinimal: DP_MINIMAL,
        isDP: showDP,
        customerName,
        customerEmail,
        customerPhone,
        businessName: businessName || null,
        notes: notes || null,
        status: "pending",
        snapToken,
        snapRedirectUrl,
        expiredAt,
      },
    });

    if (["html", "nextjs", "admin", "bundle"].includes(packageCategory)) {
      const estimatedDone = new Date();
      estimatedDone.setDate(
        estimatedDone.getDate() +
          (packageCategory === "html"
            ? 7
            : packageCategory === "bundle"
              ? 21
              : 14)
      );

      await db.project.create({
        data: {
          orderId: order.orderId,
          userId: userId || "guest",
          projectName: packageName,
          packageCategory,
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
