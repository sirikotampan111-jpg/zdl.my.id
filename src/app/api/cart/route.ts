import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cartActionSchema } from "@/lib/validations";
import { requireAuth, safeErrorResponse } from "@/lib/auth-guard";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

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

    const rawBody = await req.json();

    // Validate with Zod
    const parseResult = cartActionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.errors.map((e) => e.message) },
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
        await db.cartItem.create({
          data: {
            cartId: cart.id,
            itemId: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            quantity: 1,
          },
        });
      }
    } else if (body.action === "sync") {
      const bulkItems = body.items;
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });

      if (bulkItems.length > 0) {
        await db.cartItem.createMany({
          data: bulkItems.map((bi) => ({
            cartId: cart.id,
            itemId: bi.id,
            name: bi.name,
            price: bi.price,
            category: bi.category,
            quantity: bi.quantity,
          })),
        });
      }
    } else if (body.action === "remove") {
      const existing = cart.items.find((ci) => ci.itemId === body.item.id);
      if (existing) {
        await db.cartItem.delete({ where: { id: existing.id } });
      }
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
