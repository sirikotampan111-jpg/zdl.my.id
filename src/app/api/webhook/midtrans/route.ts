import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { safeParseJson, auditLog } from "@/lib/rate-limit";

interface MidtransWebhookBody {
  order_id: string;
  transaction_id?: string;
  transaction_status: string;
  transaction_time?: string;
  payment_type?: string;
  gross_amount?: string;
  currency?: string;
  fraud_status?: string;
  signature_key?: string;
  status_code?: string;
}

// ─── POST /api/webhook/midtrans ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Safe JSON parse with body size check
    const { data: body, error: parseError } = await safeParseJson<MidtransWebhookBody>(req);
    if (parseError) return parseError;

    if (!body) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
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
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    // ─── Signature verification ──────────────────────────────────────────
    // If no server key or placeholder, REJECT the webhook entirely (no bypass)
    if (!serverKey || serverKey === "SB-Mid-server-PLACEHOLDER") {
      // In demo/dev mode without real key, log and reject
      console.warn("[WEBHOOK] Rejected: No valid Midtrans server key configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 503 }
      );
    }

    const hashInput = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(hashInput)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      auditLog("SIGNATURE_INVALID", { order_id, transaction_id, ip: req.headers.get("x-forwarded-for") });
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    // ─── Order existence check ───────────────────────────────────────────
    const order = await db.order.findUnique({ where: { orderId: order_id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ─── Idempotency: check for duplicate transaction ────────────────────
    if (transaction_id) {
      const existingTx = await db.transaction.findFirst({
        where: { transactionId: transaction_id },
      });
      if (existingTx) {
        // Already processed this webhook — idempotent response
        return NextResponse.json({ status: "ok", note: "duplicate_ignored" });
      }
    }

    // ─── Create transaction record ───────────────────────────────────────
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
        // DO NOT store signature_key in DB — it's a secret
        rawResponse: JSON.stringify({
          ...body,
          signature_key: undefined, // strip signature key before storing
        } as Record<string, unknown>),
      },
    });

    // ─── Determine new order status ──────────────────────────────────────
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

    // ─── Update order status ─────────────────────────────────────────────
    await db.order.update({
      where: { orderId: order_id },
      data: {
        status: newStatus,
        paymentMethod: payment_type || order.paymentMethod,
        paymentType: payment_type || null,
        paidAt: newStatus === "paid" ? new Date() : order.paidAt,
      },
    });

    auditLog("PAYMENT_WEBHOOK", { order_id, transaction_id, transaction_status, newStatus });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
