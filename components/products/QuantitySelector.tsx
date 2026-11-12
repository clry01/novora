
"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

type QuantitySelectorProps = {
  slug: string;
  price: string;
  stock: number;
};

export default function QuantitySelector({
  slug,
  price,
  stock,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, items } = useCart();

  const existingItem = items.find((item) => item.slug === slug);
  const existingQuantity = existingItem?.quantity ?? 0;

  const availableToAdd = Math.max(0, stock - existingQuantity);

  const unitPrice = Number(price.replace("S/", "").trim());
  const total = unitPrice * quantity;

  const outOfStock = stock <= 0;
  const reachedLimit = quantity >= availableToAdd;

  function handleAddToCart() {
    if (quantity > availableToAdd || availableToAdd <= 0) {
      return;
    }

    addToCart(slug, quantity);
    alert("¡Producto agregado al carrito!");
    setQuantity(1);
  }

  return (
    <div className="mt-8">
      <div className="mb-4">
        <p className="text-sm font-bold text-gray-900">
          Stock disponible:{" "}
          <span className={stock > 0 ? "text-green-600" : "text-red-600"}>
            {stock} unidades
          </span>
        </p>

        {existingQuantity > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            Ya tienes {existingQuantity}{" "}
            {existingQuantity === 1 ? "unidad" : "unidades"} en tu carrito.
          </p>
        )}
      </div>

      <p className="mb-3 text-sm font-bold text-gray-900">
        Cantidad
      </p>

      <div className="flex w-fit items-center overflow-hidden rounded-full border border-gray-200">
        <button
          type="button"
          disabled={quantity <= 1 || outOfStock}
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          className="px-5 py-3 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>

        <span className="min-w-12 text-center font-bold">
          {quantity}
        </span>

        <button
          type="button"
          disabled={outOfStock || reachedLimit}
          onClick={() =>
            setQuantity((current) => Math.min(availableToAdd, current + 1))
          }
          className="px-5 py-3 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>

      {outOfStock ? (
        <p className="mt-3 text-sm font-semibold text-red-600">
          Producto agotado.
        </p>
      ) : availableToAdd === 0 ? (
        <p className="mt-3 text-sm font-semibold text-orange-600">
          Ya alcanzaste el stock máximo de este producto en tu carrito.
        </p>
      ) : (
        <p className="mt-3 text-xs text-gray-500">
          Puedes agregar hasta {availableToAdd} unidades adicionales.
        </p>
      )}

      <div className="mt-5">
        <p className="text-sm text-gray-500">
          Total por {quantity} {quantity === 1 ? "unidad" : "unidades"}
        </p>

        <p className="mt-1 text-2xl font-black text-blue-700">
          S/ {total.toFixed(2)}
        </p>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={outOfStock || availableToAdd === 0 || quantity > availableToAdd}
        className="mt-6 w-full rounded-full bg-blue-700 px-8 py-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {outOfStock
          ? "Producto agotado"
          : availableToAdd === 0
            ? "Stock máximo alcanzado"
            : "Agregar al carrito"}
      </button>
    </div>
  );
}
