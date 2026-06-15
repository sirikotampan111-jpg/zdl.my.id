"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useStore } from "@/store/use-store";

/**
 * CartSync — Syncs client-side cart (localStorage) to server-side cart (DB)
 * whenever the user signs in. This ensures the cart is persisted across devices
 * and available in the admin dashboard.
 */
export function CartSync() {
  const { data: session, status } = useSession();
  const { cart, clearCart, addToCart } = useStore();
  const hasSynced = useRef(false);
  const lastSyncedUserId = useRef<string | null>(null);

  useEffect(() => {
    // Only sync when authenticated and we have a user ID
    if (status !== "authenticated" || !session?.user) return;

    const userId = (session.user as { id?: string })?.id;
    if (!userId) return;

    // Skip if already synced for this user
    if (hasSynced.current && lastSyncedUserId.current === userId) return;

    const syncCart = async () => {
      try {
        // Get current client cart
        const clientCart = useStore.getState().cart;

        if (clientCart.length > 0) {
          // Sync client cart items to server
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "sync",
              items: clientCart.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.category,
                quantity: item.quantity,
              })),
            }),
          });

          if (res.ok) {
            const data = await res.json();
            // Replace client cart with server-validated cart (prices are server-verified)
            if (data.items && Array.isArray(data.items)) {
              useStore.setState({ cart: data.items });
              // Also update localStorage
              try {
                localStorage.setItem("zdl-cart", JSON.stringify(data.items));
              } catch {
                // ignore
              }
            }
            console.log("[CartSync] Cart synced to server successfully");
          } else {
            console.error("[CartSync] Failed to sync cart:", await res.text());
          }
        } else {
          // Client cart is empty — try loading server cart
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            if (data.items && data.items.length > 0) {
              useStore.setState({ cart: data.items });
              try {
                localStorage.setItem("zdl-cart", JSON.stringify(data.items));
              } catch {
                // ignore
              }
              console.log("[CartSync] Loaded server cart to client");
            }
          }
        }

        hasSynced.current = true;
        lastSyncedUserId.current = userId;
      } catch (error) {
        console.error("[CartSync] Error:", error);
      }
    };

    syncCart();
  }, [status, session]);

  return null; // This component renders nothing
}
