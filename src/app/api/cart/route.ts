import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/cart — Get current user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ items: [] });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
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
    console.error("Get cart error:", error);
    return NextResponse.json({ items: [] });
  }
}

// POST /api/cart — Add item or sync entire cart
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, item, items: bulkItems } = body;

    const user = await db.user.findUnique({
      where: { email: session.user.email },
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

    if (action === "add" && item) {
      // Add single item or increment quantity
      const existing = cart.items.find((ci) => ci.itemId === item.id);
      if (existing) {
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + 1 },
        });
      } else {
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
    } else if (action === "sync" && Array.isArray(bulkItems)) {
      // Full sync: replace all items (used when merging local cart on login)
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });

      if (bulkItems.length > 0) {
        await db.cartItem.createMany({
          data: bulkItems.map((bi: { id: string; name: string; price: number; category: string; quantity: number }) => ({
            cartId: cart.id,
            itemId: bi.id,
            name: bi.name,
            price: bi.price,
            category: bi.category,
            quantity: bi.quantity,
          })),
        });
      }
    } else if (action === "remove" && item?.id) {
      // Remove single item
      const existing = cart.items.find((ci) => ci.itemId === item.id);
      if (existing) {
        await db.cartItem.delete({ where: { id: existing.id } });
      }
    } else if (action === "update" && item?.id && item?.quantity !== undefined) {
      // Update quantity
      const existing = cart.items.find((ci) => ci.itemId === item.id);
      if (existing) {
        if (item.quantity <= 0) {
          await db.cartItem.delete({ where: { id: existing.id } });
        } else {
          await db.cartItem.update({
            where: { id: existing.id },
            data: { quantity: item.quantity },
          });
        }
      }
    } else if (action === "clear") {
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
    console.error("Cart POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart — Clear entire cart
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { cart: true },
    });

    if (user?.cart) {
      await db.cartItem.deleteMany({ where: { cartId: user.cart.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
