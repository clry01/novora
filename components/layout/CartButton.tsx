"use client";

import { useCart } from "@/components/cart/CartProvider";

export default function CartButton() {
  const { items } = useCart();

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <a
      href="/cart"
      aria-label={`Mi carrito, ${cartCount} productos`}
      className="relative rounded-full bg-[#172A3A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-700/25 active:translate-y-0"
    >
      Mi carrito

      {cartCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-blue-600 px-1.5 text-xs font-bold text-white shadow-md animate-pulse">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </a>
  );
}