import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { generateTicketNumber } from "@/lib/data";
import { midtransWebhookSchema } from "@/lib/validations";
import { safeErrorResponse } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // Validate input with Zod
    const parseResult = midtransWebhookSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

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
    } = parseResult.data;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    // ALWAYS verify signature — reject if no server key configured
    if (!serverKey) {
      console.error("[SECURITY] Midtrans webhook called without server key configured");
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 503 }
      );
    }

    // Verify signature
    if (signature_key && status_code && gross_amount) {
      const hashInput = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const expectedSignature = crypto
        .createHash("sha512")
        .update(hashInput)
        .digest("hex");

      if (signature_key !== expectedSignature) {
        console.error(`[SECURITY] Invalid webhook signature for order: ${order_id}`);
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 403 }
        );
      }
    } else {
      // Missing required fields for signature verification
      console.error(`[SECURITY] Webhook missing signature fields for order: ${order_id}`);
      return NextResponse.json(
        { error: "Missing signature fields" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({ where: { orderId: order_id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create transaction record
    await db.transaction.create({
      data: {
        orderId: order.id,
        transactionId: transaction_id || null,
        transactionTime: transaction_time
          ? new Date(transaction_time)
          : null,
        transactionStatus: transaction_status || "unknown",
        paymentType: payment_type || null,
        grossAmount: gross_amount ? parseInt(gross_amount) : null,
        currency: currency || "IDR",
        fraudStatus: fraud_status || null,
        rawResponse: JSON.stringify(rawBody),
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

    // Generate ticket number when payment is confirmed
    const ticketNumber =
      newStatus === "paid" && !order.ticketNumber
        ? generateTicketNumber()
        : order.ticketNumber;

    // Update order status with ticket number
    await db.order.update({
      where: { orderId: order_id },
      data: {
        status: newStatus,
        paymentMethod: payment_type || order.paymentMethod,
        paymentType: payment_type || null,
        paidAt: newStatus === "paid" ? new Date() : order.paidAt,
        ticketNumber,
      },
    });

    // When payment is confirmed, update project milestones
    if (newStatus === "paid") {
      await db.project.updateMany({
        where: { orderId: order.id, status: "planning" },
        data: { status: "design", progress: 20 },
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}
