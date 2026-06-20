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
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("zds-cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
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
    saveCart(newCart);
    set({ cart: newCart });
  },

  removeFromCart: (id) => {
    const newCart = get().cart.filter((c) => c.id !== id);
    saveCart(newCart);
    set({ cart: newCart });
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id);
      return;
    }
    const newCart = get().cart.map((c) =>
      c.id === id ? { ...c, quantity } : c
    );
    saveCart(newCart);
    set({ cart: newCart });
  },

  clearCart: () => {
    saveCart([]);
    set({ cart: [] });
  },

  getCartTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getCartCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

// Hydrate cart from localStorage on client
if (typeof window !== "undefined") {
  const savedCart = loadCart();
  if (savedCart.length > 0) {
    useStore.setState({ cart: savedCart });
  }
}
