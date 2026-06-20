"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useStore } from "@/store/use-store";

function CartSync() {
  const { status } = useSession();
  const prevStatus = useRef(status);
  const mergeLocalCartToServer = useStore((s) => s.mergeLocalCartToServer);
  const loadCartFromServer = useStore((s) => s.loadCartFromServer);

  useEffect(() => {
    if (status === "authenticated" && prevStatus.current !== "authenticated") {
      // User just logged in — merge local cart to server
      mergeLocalCartToServer();
    } else if (status === "unauthenticated") {
      // User logged out — load from localStorage (already done by store init)
    }
    prevStatus.current = status;
  }, [status, mergeLocalCartToServer, loadCartFromServer]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartSync />
      {children}
    </SessionProvider>
  );
}
