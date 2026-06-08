import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      transaction_id,
      transaction_status,
      transaction_time,
      payment_type,
      gross_amount,
      currency,
      fraud_status,
      signature_key,
      status_code,
    } = body;

    const serverKey =
      process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-PLACEHOLDER";

    // Verify signature
    const hashInput = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(hashInput)
      .digest("hex");

    if (
      serverKey !== "SB-Mid-server-PLACEHOLDER" &&
      signature_key !== expectedSignature
    ) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    const order = await db.order.findUnique({ where: { orderId: order_id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create transaction record
    await db.transaction.create({
      data: {
        orderId: order.orderId,
        transactionId: transaction_id || null,
        transactionTime: transaction_time
          ? new Date(transaction_time)
          : null,
        transactionStatus: transaction_status || "unknown",
        paymentType: payment_type || null,
        grossAmount: gross_amount ? parseInt(gross_amount) : null,
        currency: currency || "IDR",
        fraudStatus: fraud_status || null,
        signatureKey: signature_key || null,
        rawResponse: JSON.stringify(body),
      },
    });

    // Determine new order status
    let newStatus = order.status;
    switch (transaction_status) {
      case "capture":
        if (fraud_status === "accept") newStatus = "paid";
        break;
      case "settlement":
        newStatus = "paid";
        break;
      case "pending":
        newStatus = "pending";
        break;
      case "deny":
        newStatus = "failed";
        break;
      case "expire":
      case "cancel":
        newStatus = "expired";
        break;
      case "refund":
      case "partial_refund":
        newStatus = "refunded";
        break;
    }

    // Update order status
    await db.order.update({
      where: { orderId: order_id },
      data: {
        status: newStatus,
        paymentMethod: payment_type || order.paymentMethod,
        paymentType: payment_type || null,
        paidAt: newStatus === "paid" ? new Date() : order.paidAt,
      },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
