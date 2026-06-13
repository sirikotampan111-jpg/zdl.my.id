import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cartActionSchema } from "@/lib/validations";
import { requireAuth, safeErrorResponse } from "@/lib/auth-guard";
import { checkRateLimit, getClientIp, RATE_LIMITS, validateBodySize } from "@/lib/rate-limit";
import { validateServiceItem } from "@/lib/price-guard";
import { auditLog } from "@/lib/audit-log";

// GET /api/cart — Get current user's cart
export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ items: [] });
    }

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      include: {
        cart: {
          include: { items: true },
        },
      },
    });

    if (!user?.cart) {
      return NextResponse.json({ items: [] });
    }

    const items = user.cart.items.map((item) => ({
      id: item.itemId,
      name: item.name,
      price: item.price,
      category: item.category,
      quantity: item.quantity,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}

// POST /api/cart — Add item or sync entire cart
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`cart:${ip}:${auth.userId}`, RATE_LIMITS.cart);
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
    const parseResult = cartActionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      // Don't expose detailed validation errors to client
      console.error("[SECURITY] Cart validation failed:", parseResult.error.issues);
      return NextResponse.json(
        { error: "Data tidak valid" },
        { status: 400 }
      );
    }

    const body = parseResult.data;

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      include: { cart: { include: { items: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure cart exists
    let cart = user.cart;
    if (!cart) {
      cart = await db.cart.create({
        data: { userId: user.id },
        include: { items: true },
      });
    }

    if (body.action === "add") {
      const item = body.item;

      // === CRITICAL SECURITY FIX: Validate item price against server catalog ===
      const validation = validateServiceItem(item.id, item.price, item.name, item.category);
      if (!validation.valid) {
        auditLog({
          action: "security.price_mismatch",
          actorId: auth.userId,
          actorRole: auth.role,
          details: { action: "cart.add", itemId: item.id, clientPrice: item.price, error: validation.error },
          ip,
        });
        return NextResponse.json(
          { error: "Layanan tidak ditemukan. Silakan refresh halaman." },
          { status: 400 }
        );
      }

      const existing = cart.items.find((ci) => ci.itemId === item.id);
      if (existing) {
        if (existing.quantity >= 10) {
          return NextResponse.json(
            { error: "Maksimal 10 item per produk" },
            { status: 400 }
          );
        }
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + 1 },
        });
      } else {
        if (cart.items.length >= 10) {
          return NextResponse.json(
            { error: "Maksimal 10 produk dalam keranjang" },
            { status: 400 }
          );
        }
        // Store SERVER-VALIDATED price, name, and category — never trust client values
        await db.cartItem.create({
          data: {
            cartId: cart.id,
            itemId: validation.item.id,
            name: validation.item.name,
            price: validation.item.price,
            category: validation.item.category,
            quantity: 1,
          },
        });
      }

      auditLog({
        action: "cart.add",
        actorId: auth.userId,
        targetType: "cart",
        targetId: item.id,
        details: { itemName: validation.item.name, serverPrice: validation.item.price },
        ip,
      });
    } else if (body.action === "sync") {
      const bulkItems = body.items;

      // === CRITICAL SECURITY FIX: Validate all items against server catalog ===
      const validatedItems: Array<{
        id: string;
        name: string;
        price: number;
        category: string;
        quantity: number;
      }> = [];

      for (const bi of bulkItems) {
        const validation = validateServiceItem(bi.id, bi.price, bi.name, bi.category);
        if (!validation.valid) {
          auditLog({
            action: "security.price_mismatch",
            actorId: auth.userId,
            actorRole: auth.role,
            details: { action: "cart.sync", itemId: bi.id, clientPrice: bi.price, error: validation.error },
            ip,
          });
          return NextResponse.json(
            { error: "Layanan tidak ditemukan. Silakan refresh halaman." },
            { status: 400 }
          );
        }
        validatedItems.push({
          id: validation.item.id,
          name: validation.item.name,
          price: validation.item.price,
          category: validation.item.category,
          quantity: bi.quantity,
        });
      }

      await db.cartItem.deleteMany({ where: { cartId: cart.id } });

      if (validatedItems.length > 0) {
        await db.cartItem.createMany({
          data: validatedItems.map((bi) => ({
            cartId: cart.id,
            itemId: bi.id,
            name: bi.name,
            price: bi.price,
            category: bi.category,
            quantity: bi.quantity,
          })),
        });
      }

      auditLog({
        action: "cart.sync",
        actorId: auth.userId,
        targetType: "cart",
        details: { itemCount: validatedItems.length },
        ip,
      });
    } else if (body.action === "remove") {
      const existing = cart.items.find((ci) => ci.itemId === body.item.id);
      if (existing) {
        await db.cartItem.delete({ where: { id: existing.id } });
      }

      auditLog({
        action: "cart.remove",
        actorId: auth.userId,
        targetType: "cart",
        targetId: body.item.id,
        ip,
      });
    } else if (body.action === "update") {
      const existing = cart.items.find((ci) => ci.itemId === body.item.id);
      if (existing) {
        if (body.item.quantity <= 0) {
          await db.cartItem.delete({ where: { id: existing.id } });
        } else {
          await db.cartItem.update({
            where: { id: existing.id },
            data: { quantity: body.item.quantity },
          });
        }
      }
    } else if (body.action === "clear") {
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });

      auditLog({
        action: "cart.clear",
        actorId: auth.userId,
        targetType: "cart",
        ip,
      });
    }

    // Return updated cart
    const updatedCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });

    const returnItems = (updatedCart?.items || []).map((ci) => ({
      id: ci.itemId,
      name: ci.name,
      price: ci.price,
      category: ci.category,
      quantity: ci.quantity,
    }));

    return NextResponse.json({ items: returnItems });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}

// DELETE /api/cart — Clear entire cart
export async function DELETE() {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      include: { cart: true },
    });

    if (user?.cart) {
      await db.cartItem.deleteMany({ where: { cartId: user.cart.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}
