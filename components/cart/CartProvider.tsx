
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type CartItem = {
  slug: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (slug: string, quantity: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Recuperar el carrito guardado
  useEffect(() => {
    const savedCart = localStorage.getItem("vibra-cart");

    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem("vibra-cart");
      }
    }

    setLoaded(true);
  }, []);

  // Guardar los cambios del carrito
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("vibra-cart", JSON.stringify(items));
    }
  }, [items, loaded]);

  function addToCart(slug: string, quantity: number) {
    setItems((current) => {
      const existing = current.find((item) => item.slug === slug);

      if (existing) {
        return current.map((item) =>
          item.slug === slug
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...current, { slug, quantity }];
    });
  }

  function updateQuantity(slug: string, quantity: number) {
    setItems((current) =>
      current.map((item) =>
        item.slug === slug
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  }

  function removeFromCart(slug: string) {
    setItems((current) =>
      current.filter((item) => item.slug !== slug)
    );
  }

  // Vaciar completamente el carrito
  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe utilizarse dentro de CartProvider");
  }

  return context;
}
