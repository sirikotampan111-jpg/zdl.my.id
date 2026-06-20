import { create } from "zustand";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface StoreState {
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Cart
  cart: CartItem[];
  cartHydrated: boolean;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  setCart: (items: CartItem[]) => void;
  hydrateCartFromServer: (items: CartItem[]) => void;
  mergeLocalCartToServer: () => Promise<void>;
  loadCartFromServer: () => Promise<void>;
}

function loadLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("zds-cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("zds-cart", JSON.stringify(cart));
  } catch {
    // ignore
  }
}

export const useStore = create<StoreState>((set, get) => ({
  currentPage: "home",
  setCurrentPage: (page: string) => set({ currentPage: page }),

  // Cart
  cart: [],
  cartHydrated: false,

  setCart: (items: CartItem[]) => {
    saveLocalCart(items);
    set({ cart: items, cartHydrated: true });
  },

  hydrateCartFromServer: (items: CartItem[]) => {
    // Server cart takes priority
    saveLocalCart(items);
    set({ cart: items, cartHydrated: true });
  },

  mergeLocalCartToServer: async () => {
    // Merge local cart into server cart on login
    const localCart = loadLocalCart();
    if (localCart.length === 0) {
      // Just load from server
      await get().loadCartFromServer();
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync", items: localCart }),
      });
      if (res.ok) {
        const data = await res.json();
        // Server returns validated items with correct prices
        saveLocalCart(data.items);
        set({ cart: data.items, cartHydrated: true });
      }
    } catch {
      // Fallback: keep local cart
      set({ cart: localCart, cartHydrated: true });
    }
  },

  loadCartFromServer: async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        saveLocalCart(items);
        set({ cart: items, cartHydrated: true });
      } else {
        // Not logged in, use local
        set({ cart: loadLocalCart(), cartHydrated: true });
      }
    } catch {
      set({ cart: loadLocalCart(), cartHydrated: true });
    }
  },

  addToCart: (item) => {
    const { cart } = get();
    const existing = cart.find((c) => c.id === item.id);
    let newCart: CartItem[];
    if (existing) {
      newCart = cart.map((c) =>
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      );
    } else {
      newCart = [...cart, { ...item, quantity: 1 }];
    }
    saveLocalCart(newCart);
    set({ cart: newCart });

    // Sync to server in background — server returns validated prices
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", item }),
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        // Refresh local cart with server-validated prices
        if (data?.items) {
          saveLocalCart(data.items);
          set({ cart: data.items });
        }
      })
      .catch(() => {});
  },

  removeFromCart: (id) => {
    const newCart = get().cart.filter((c) => c.id !== id);
    saveLocalCart(newCart);
    set({ cart: newCart });

    // Sync to server in background
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", item: { id } }),
    }).catch(() => {});
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id);
      return;
    }
    const newCart = get().cart.map((c) =>
      c.id === id ? { ...c, quantity } : c
    );
    saveLocalCart(newCart);
    set({ cart: newCart });

    // Sync to server in background
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", item: { id, quantity } }),
    }).catch(() => {});
  },

  clearCart: () => {
    saveLocalCart([]);
    set({ cart: [] });

    // Sync to server in background
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear" }),
    }).catch(() => {});
  },

  getCartTotal: () => {
    return get().cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },

  getCartCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

// Hydrate cart from localStorage on client
if (typeof window !== "undefined") {
  const savedCart = loadLocalCart();
  if (savedCart.length > 0) {
    useStore.setState({ cart: savedCart });
  }
}
